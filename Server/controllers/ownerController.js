const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");

const addProperty = async (req, res) => {
  try {
    const imagePath = req.file
      ? req.file.path.replace(/\\/g, "/")
      : "";

    const newProperty = new Property({
      title: req.body.title,
      address: req.body.address,
      city: req.body.city,
      price: req.body.price,
      owner: req.body.owner,
      propertyType: req.body.propertyType,
      description: req.body.description,
      image: imagePath,
    });

    await newProperty.save();

    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerProperties = async (req, res) => {
  try {
    const { ownerId } = req.query;
    const filter = ownerId ? { owner: ownerId } : {};

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    const properties = await Property.find({ owner: ownerId });
    const propertyIds = properties.map((p) => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate("user", "name email phone")
      .populate("property", "title address city price propertyType")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { ownerId, status } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const booking = await Booking.findById(req.params.id).populate({
      path: "property",
      populate: { path: "owner", select: "_id" },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const propertyOwnerId =
      booking.property?.owner?._id?.toString() ||
      booking.property?.owner?.toString();

    if (!propertyOwnerId || propertyOwnerId !== ownerId.toString()) {
      return res.status(403).json({ message: "You can only manage bookings for your own properties" });
    }

    booking.status = status;
    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate("user", "name email phone role")
      .populate("property", "title address city price");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNegotiation = async (req, res) => {
  try {
    const { ownerId, action } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    if (!["Accept", "Reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be Accept or Reject" });
    }

    const booking = await Booking.findById(req.params.id).populate({
      path: "property",
      populate: { path: "owner", select: "_id" },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const propertyOwnerId =
      booking.property?.owner?._id?.toString() ||
      booking.property?.owner?.toString();

    if (!propertyOwnerId || propertyOwnerId !== ownerId.toString()) {
      return res.status(403).json({ message: "You can only manage bookings for your own properties" });
    }

    if (booking.negotiationStatus !== "Pending") {
      return res.status(400).json({ message: "No pending negotiation for this booking" });
    }

    if (action === "Accept") {
      booking.negotiationStatus = "Accepted";
      booking.agreedPrice = booking.proposedPrice;
      booking.status = "Approved";
    } else {
      booking.negotiationStatus = "Rejected";
      booking.status = "Rejected";
    }

    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate("user", "name email phone role")
      .populate("property", "title address city price propertyType");

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProperty,
  getOwnerProperties,
  getOwnerBookings,
  updateProperty,
  deleteProperty,
  updateBookingStatus,
  updateNegotiation,
};
