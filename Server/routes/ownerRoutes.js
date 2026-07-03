const express = require("express");
const router = express.Router();

const upload = require("../uploads/upload");
const ownerController = require("../controllers/ownerController");

router.post("/property", upload.single("image"), ownerController.addProperty);
router.get("/properties", ownerController.getOwnerProperties);
router.get("/bookings", ownerController.getOwnerBookings);
router.put("/booking/:id", ownerController.updateBookingStatus);
router.put("/booking/:id/negotiation", ownerController.updateNegotiation);
router.put("/property/:id", upload.single("image"), ownerController.updateProperty);
router.delete("/property/:id", ownerController.deleteProperty);

module.exports = router;
