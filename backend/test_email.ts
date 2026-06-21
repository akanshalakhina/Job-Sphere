import { sendTransactionalEmail } from "./src/lib/email";

async function runEmailTest() {
  console.log("Starting email test...");
  
  // Use a fallback to the support email or a generic one if no admin email is set
  const toEmail = process.env.ADMIN_EMAIL || process.env.SUPPORT_EMAIL || "test@example.com";
  
  console.log(`Attempting to send test email to: ${toEmail}`);
  
  const result = await sendTransactionalEmail({
    to: toEmail,
    subject: "JobSphere - SMTP Configuration Test",
    html: "<h1>SMTP Test Successful</h1><p>This is a test email from the JobSphere backend to verify that the Gmail SMTP fallback configuration is working correctly.</p>",
    text: "SMTP Test Successful. This is a test email from the JobSphere backend to verify that the Gmail SMTP fallback configuration is working correctly."
  });

  if (result.sent) {
    console.log(`✅ Success! Email sent via provider: ${result.provider}`);
    if (result.id) console.log(`   Message ID: ${result.id}`);
  } else {
    console.log(`❌ Failed to send email via provider: ${result.provider}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }
  
  process.exit(result.sent ? 0 : 1);
}

runEmailTest();
