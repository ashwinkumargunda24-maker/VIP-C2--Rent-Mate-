const { normalizePhone } = require("./otpUtils");

let twilioClient = null;

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null;
  }

  const twilio = require("twilio");
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
};

const formatSmsPhone = (phone) => {
  const digits = normalizePhone(phone);
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
};

const sendOtpSms = async (phone, otp) => {
  const client = getTwilioClient();
  const to = formatSmsPhone(phone);

  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[DEV] OTP SMS to ${to}: ${otp}`);
    return { devMode: true };
  }

  await client.messages.create({
    body: `Your RentMate registration OTP is ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });

  return { devMode: false };
};

module.exports = { sendOtpSms };
