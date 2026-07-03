const bcrypt = require("bcryptjs");
const User = require("../models/UserSchema");
const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");
const RegistrationOtp = require("../models/RegistrationOtpSchema");
const { sendOtpEmail } = require("../utils/mailService");
const { sendOtpSms } = require("../utils/smsService");
const {
  normalizePhone,
  generateOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiry,
  getBlockUntil,
  isBlocked,
  blockRemainingMinutes,
  MAX_RESENDS,
  RESEND_BLOCK_MINUTES,
} = require("../utils/otpUtils");

const sendRegistrationOtp = async (req, res) => {
  try {
    const { email, phone, name, isResend } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ message: "Email and phone are required" });
    }

    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 10) {
      return res.status(400).json({ message: "Please enter a valid phone number" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email.toLowerCase()
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    let otpRecord = await RegistrationOtp.findOne({ phone: normalizedPhone });

    if (isBlocked(otpRecord)) {
      const mins = blockRemainingMinutes(otpRecord.blockedUntil);
      return res.status(429).json({
        message: `Too many resend attempts. Try again in ${mins} minute(s).`,
        blockedUntil: otpRecord.blockedUntil,
        resendsRemaining: 0,
      });
    }

    if (isResend) {
      if (!otpRecord) {
        return res.status(400).json({ message: "Request an OTP first before resending." });
      }

      if (otpRecord.resendCount >= MAX_RESENDS) {
        otpRecord.blockedUntil = getBlockUntil();
        await otpRecord.save();
        return res.status(429).json({
          message: `Maximum resend limit reached. Try again in ${RESEND_BLOCK_MINUTES} minutes.`,
          blockedUntil: otpRecord.blockedUntil,
          resendsRemaining: 0,
        });
      }

      otpRecord.resendCount += 1;
    } else if (otpRecord) {
      otpRecord.resendCount = 0;
      otpRecord.blockedUntil = null;
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry();

    if (otpRecord) {
      otpRecord.email = email.toLowerCase();
      otpRecord.otpHash = otpHash;
      otpRecord.expiresAt = expiresAt;
      if (!isResend) {
        otpRecord.resendCount = 0;
        otpRecord.blockedUntil = null;
      }
      await otpRecord.save();
    } else {
      otpRecord = await RegistrationOtp.create({
        phone: normalizedPhone,
        email: email.toLowerCase(),
        otpHash,
        expiresAt,
        resendCount: 0,
      });
    }

    await Promise.all([
      sendOtpEmail(email.toLowerCase(), otp, name),
      sendOtpSms(normalizedPhone, otp),
    ]);

    const resendsRemaining = Math.max(0, MAX_RESENDS - otpRecord.resendCount);

    res.status(200).json({
      message: isResend
        ? "OTP resent to your email and phone."
        : "OTP sent to your email and phone.",
      resendsRemaining,
      expiresInMinutes: 10,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role, otp } = req.body;

    if (!name || !email || !password || !phone || !otp) {
      return res.status(400).json({ message: "All fields including OTP are required" });
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    const otpRecord = await RegistrationOtp.findOne({ phone: normalizedPhone });

    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP found. Please request an OTP first." });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (otpRecord.email !== normalizedEmail) {
      return res.status(400).json({ message: "Email does not match the OTP request." });
    }

    const otpValid = await verifyOtp(String(otp).trim(), otpRecord.otpHash);
    if (!otpValid) {
      return res.status(400).json({ message: "Invalid OTP. Please try again." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "admin" ? "user" : role || "user";

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      role: userRole,
    });

    await RegistrationOtp.deleteOne({ phone: normalizedPhone });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    const legacyMatch = user.password === password;

    if (!isMatch && !legacyMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name email phone");
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookProperty = async (req, res) => {
  try {
    const { user, property, visitDate, visitTime, proposedPrice } = req.body;

    if (!user || !property || !visitDate || !visitTime) {
      return res.status(400).json({ message: "Property, visit date, and visit time are required" });
    }

    const parsedVisitDate = new Date(visitDate);
    if (isNaN(parsedVisitDate.getTime())) {
      return res.status(400).json({ message: "Invalid visit date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedVisitDate < today) {
      return res.status(400).json({ message: "Visit date must be today or in the future" });
    }

    const propertyDoc = await Property.findById(property);
    if (!propertyDoc) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (propertyDoc.owner?.toString() === user.toString()) {
      return res.status(400).json({ message: "You cannot schedule a visit for your own property." });
    }

    const listedPrice = propertyDoc.price;
    const parsedProposed = proposedPrice ? Number(proposedPrice) : null;

    if (parsedProposed !== null && (isNaN(parsedProposed) || parsedProposed <= 0)) {
      return res.status(400).json({ message: "Proposed price must be a valid positive number" });
    }

    const hasNegotiation =
      parsedProposed !== null && parsedProposed !== listedPrice;

    const booking = await Booking.create({
      user,
      property,
      visitDate: parsedVisitDate,
      visitTime,
      status: "Pending",
      listedPrice,
      proposedPrice: hasNegotiation ? parsedProposed : listedPrice,
      negotiationStatus: hasNegotiation ? "Pending" : "None",
    });

    const populated = await Booking.findById(booking._id)
      .populate("property", "title address city price propertyType")
      .populate("user", "name email phone");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate("property", "title address city price propertyType")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    res.status(200).json({
      message: "If an account exists, password reset instructions have been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendRegistrationOtp,
  signup,
  login,
  getProperties,
  bookProperty,
  getMyBookings,
  forgotPassword,
};
