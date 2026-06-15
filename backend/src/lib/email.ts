import nodemailer from "nodemailer";

export interface TransactionalEmail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  sent: boolean;
  provider: "resend" | "smtp" | "gmail" | "disabled";
  id?: string;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER || GMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || GMAIL_PASS;
const SMTP_FROM_EMAIL = GMAIL_USER ? `JobSphere <${GMAIL_USER}>` : "JobSphere <noreply@jobsphere.ai>";
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_FROM_EMAIL;

export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || "support@jobsphere.ai";

const stripHtml = (html: string): string =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const canUseSmtp = Boolean((SMTP_HOST || (GMAIL_USER && GMAIL_PASS)) && SMTP_USER && SMTP_PASS);

const sendViaSmtp = async (email: TransactionalEmail): Promise<EmailResult> => {
  const isGmail = Boolean(!SMTP_HOST && GMAIL_USER && GMAIL_PASS);
  const provider = isGmail ? "gmail" : "smtp";
  const smtpUser = SMTP_USER;
  const smtpPass = SMTP_PASS;

  if (!canUseSmtp || !smtpUser || !smtpPass) {
    return { sent: false, provider: "disabled" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST || "smtp.gmail.com",
      port: SMTP_PORT || 465,
      secure: SMTP_PORT ? SMTP_PORT === 465 : true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const result = await transporter.sendMail({
      from: FROM_EMAIL,
      to: Array.isArray(email.to) ? email.to.join(", ") : email.to,
      subject: email.subject,
      html: email.html,
      text: email.text || stripHtml(email.html),
      replyTo: email.replyTo,
    });

    return { sent: true, provider, id: result.messageId };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown SMTP email error";
    console.error(`[Email] ${provider.toUpperCase()} failed:`, error);
    return { sent: false, provider, error };
  }
};

export const sendTransactionalEmail = async (
  email: TransactionalEmail,
): Promise<EmailResult> => {
  if (!RESEND_API_KEY && !canUseSmtp) {
    console.info(
      `[Email] No email provider configured; skipped "${email.subject}" to ${String(email.to)}`,
    );
    return { sent: false, provider: "disabled" };
  }

  if (!RESEND_API_KEY) {
    return sendViaSmtp(email);
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text || stripHtml(email.html),
        reply_to: email.replyTo,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      const error = data.message || data.error || `Resend API error ${response.status}`;
      console.error("[Email] Resend failed:", error);
      return { sent: false, provider: "resend", error };
    }

    return { sent: true, provider: "resend", id: data.id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown email error";
    console.error("[Email] Send failed:", error);
    return { sent: false, provider: "resend", error };
  }
};
