const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllProperties,
  getAllBookings,
  updateBookingStatus,
} = require("../controllers/adminController");

router.get("/users", getAllUsers);
router.get("/properties", getAllProperties);
router.get("/bookings", getAllBookings);
router.put("/booking/:id", updateBookingStatus);

module.exports = router;