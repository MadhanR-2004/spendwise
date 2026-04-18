import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("Email sending skipped because SMTP variables are not set");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Spendwise" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error: unknown) {
    console.error("Failed to send email", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    throw new Error(message);
  }
}
