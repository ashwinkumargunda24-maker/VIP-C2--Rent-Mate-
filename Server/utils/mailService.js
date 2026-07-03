const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
};

const sendOtpEmail = async (email, otp, name) => {
  const mailer = getTransporter();

  if (!mailer) {
    console.log(`[DEV] OTP email to ${email}: ${otp}`);
    return { devMode: true };
  }

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "RentMate — Your Registration OTP",
    text: `Hello${name ? ` ${name}` : ""},\n\nYour RentMate registration OTP is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <p>Hello${name ? ` ${name}` : ""},</p>
      <p>Your <strong>RentMate</strong> registration OTP is:</p>
      <h2 style="letter-spacing:4px;">${otp}</h2>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });

  return { devMode: false };
};

module.exports = { sendOtpEmail };
