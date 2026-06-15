import { Router } from "express";
import { isDBConnected } from "../lib/mongodb";
import { sendTransactionalEmail, SUPPORT_EMAIL } from "../lib/email";
import { ContactMessage } from "../models/ContactMessage";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber";

const router = Router();

const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);

router.post("/contact", async (req, res) => {
  const { name, email, message, type, companyName, sourcingNeeds } = req.body as {
    name?: string;
    email?: string;
    message?: string;
    type?: "support" | "business";
    companyName?: string;
    sourcingNeeds?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Name, email, and message are required" });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }

  const safeType = type === "business" ? "business" : "support";
  const subject =
    safeType === "business"
      ? `Business sourcing inquiry from ${name}`
      : `Support ticket from ${name}`;
  const supportHtml = `
    <h2>${subject}</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ""}
    ${sourcingNeeds ? `<p><strong>Sourcing needs:</strong> ${sourcingNeeds}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br />")}</p>
  `;

  const supportSend = await sendTransactionalEmail({
    to: SUPPORT_EMAIL,
    subject,
    html: supportHtml,
    replyTo: email,
  });

  const confirmationSend = await sendTransactionalEmail({
    to: email,
    subject: "We received your JobSphere message",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for contacting JobSphere. We received your ${safeType === "business" ? "business inquiry" : "support ticket"} and will get back to you soon.</p>
      <p><strong>Your message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `,
  });

  let recordId = "";
  if (isDBConnected()) {
    const record = await ContactMessage.create({
      type: safeType,
      name,
      email,
      message,
      companyName: companyName || "",
      sourcingNeeds: sourcingNeeds || "",
      emailStatus: {
        provider: supportSend.provider,
        sent: supportSend.sent && confirmationSend.sent,
        id: [supportSend.id, confirmationSend.id].filter(Boolean).join(","),
        error: supportSend.error || confirmationSend.error || "",
      },
    });
    recordId = record._id.toString();
  }

  res.status(202).json({
    success: true,
    id: recordId || undefined,
    emailSent: supportSend.sent && confirmationSend.sent,
    provider: supportSend.provider,
  });
});

router.post("/newsletter/subscribe", async (req, res) => {
  const { email, source } = req.body as { email?: string; source?: string };

  if (!email?.trim() || !isValidEmail(email)) {
    res.status(400).json({ error: "A valid email address is required" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailResult = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: "Welcome to the JobSphere newsletter",
    html: `
      <p>You are subscribed to JobSphere updates.</p>
      <p>We will send curated roles, hackathon invites, and resume analyzer improvements to this address.</p>
    `,
  });

  let recordId = "";
  if (isDBConnected()) {
    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          source: source || "footer",
          status: "subscribed",
          emailStatus: {
            provider: emailResult.provider,
            sent: emailResult.sent,
            id: emailResult.id || "",
            error: emailResult.error || "",
          },
        },
      },
      { upsert: true, new: true },
    );
    recordId = subscriber._id.toString();
  }

  res.status(202).json({
    success: true,
    id: recordId || undefined,
    emailSent: emailResult.sent,
    provider: emailResult.provider,
  });
});

export default router;
