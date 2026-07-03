const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");
const { isValidGoogleMapsLink } = require("../utils/validation");
const { getGridFSBucket } = require("../config/gridfs");
const mongoose = require("mongoose");

const uploadImageToGridFS = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const bucket = getGridFSBucket();
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalname: file.originalname,
      },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(`api/files/${uploadStream.id.toString()}`));
    uploadStream.end(file.buffer);
  });

const deleteImageFromGridFS = async (imagePath) => {
  if (!imagePath || !imagePath.startsWith("api/files/")) return;

  const fileId = imagePath.replace("api/files/", "");
  if (!mongoose.Types.ObjectId.isValid(fileId)) return;

  try {
    const bucket = getGridFSBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch {
    // Ignore missing file cleanup errors.
  }
};

const addProperty = async (req, res) => {
  try {
    const mapLink = req.body.mapLink?.trim() || "";

    if (mapLink && !isValidGoogleMapsLink(mapLink)) {
      return res.status(400).json({
        message: "Please provide a valid Google Maps link (https://maps.google.com or https://maps.app.goo.gl)",
      });
    }

    const imagePath = await uploadImageToGridFS(req.file);

    const newProperty = new Property({
      title: req.body.title,
      address: req.body.address,
      city: req.body.city,
      price: req.body.price,
      owner: req.body.owner,
      propertyType: req.body.propertyType,
      description: req.body.description,
      image: imagePath,
      mapLink: mapLink || undefined,
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
    const { ownerId, title, address, city, price, propertyType, description, mapLink } = req.body;

    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner?.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }

    const trimmedMapLink = (mapLink || "").trim();
    if (trimmedMapLink && !isValidGoogleMapsLink(trimmedMapLink)) {
      return res.status(400).json({
        message: "Please provide a valid Google Maps link (https://maps.google.com or https://maps.app.goo.gl)",
      });
    }

    if (req.file) {
      const newImagePath = await uploadImageToGridFS(req.file);
      await deleteImageFromGridFS(property.image);
      property.image = newImagePath;
    }

    property.title = title ?? property.title;
    property.address = address ?? property.address;
    property.city = city ?? property.city;
    property.price = price ?? property.price;
    property.propertyType = propertyType ?? property.propertyType;
    property.description = description ?? property.description;
    property.mapLink = trimmedMapLink || undefined;

    await property.save();

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

    await deleteImageFromGridFS(property.image);

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
