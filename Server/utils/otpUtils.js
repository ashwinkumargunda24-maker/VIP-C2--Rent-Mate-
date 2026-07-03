const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_RESENDS = 2;
const RESEND_BLOCK_MINUTES = 15;

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

const generateOtp = () =>
  String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");

const hashOtp = async (otp) => bcrypt.hash(otp, 10);

const verifyOtp = async (otp, otpHash) => bcrypt.compare(otp, otpHash);

const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

const getBlockUntil = () => new Date(Date.now() + RESEND_BLOCK_MINUTES * 60 * 1000);

const isBlocked = (record) => record?.blockedUntil && record.blockedUntil > new Date();

const blockRemainingMinutes = (blockedUntil) =>
  Math.max(1, Math.ceil((blockedUntil - new Date()) / 60000));

module.exports = {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  MAX_RESENDS,
  RESEND_BLOCK_MINUTES,
  normalizePhone,
  generateOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiry,
  getBlockUntil,
  isBlocked,
  blockRemainingMinutes,
};
