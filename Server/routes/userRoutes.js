const express = require("express");
const router = express.Router();

const {
  sendRegistrationOtp,
  signup,
  login,
  getProperties,
  bookProperty,
  getMyBookings,
  forgotPassword,
} = require("../controllers/userController");

router.post("/send-registration-otp", sendRegistrationOtp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/properties", getProperties);
router.get("/my-bookings", getMyBookings);
router.post("/book-property", bookProperty);

router.get("/test", (req, res) => {
  res.send("User Route Working");
});

module.exports = router;
