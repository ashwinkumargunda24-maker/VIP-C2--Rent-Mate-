const bcrypt = require("bcryptjs");
const User = require("../models/UserSchema");
const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");

const signup = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "admin" ? "user" : role || "user";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole,
    });

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
  signup,
  login,
  getProperties,
  bookProperty,
  getMyBookings,
  forgotPassword,
};
