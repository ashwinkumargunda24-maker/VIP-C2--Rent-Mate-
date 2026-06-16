const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");

dotenv.config();

const removeSaleProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const saleProperties = await Property.find({ listingType: "Sale" }).select("_id title");
    const salePropertyIds = saleProperties.map((p) => p._id);

    if (salePropertyIds.length === 0) {
      console.log("No Sale properties found.");
      await mongoose.disconnect();
      return;
    }

    console.log(`Found ${salePropertyIds.length} Sale propert${salePropertyIds.length === 1 ? "y" : "ies"}:`);
    saleProperties.forEach((p) => console.log(`  - ${p.title} (${p._id})`));

    const bookingResult = await Booking.deleteMany({ property: { $in: salePropertyIds } });
    const propertyResult = await Property.deleteMany({ _id: { $in: salePropertyIds } });

    console.log(`Deleted ${bookingResult.deletedCount} related booking(s).`);
    console.log(`Deleted ${propertyResult.deletedCount} Sale propert${propertyResult.deletedCount === 1 ? "y" : "ies"}.`);
  } catch (error) {
    console.error("Cleanup failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

removeSaleProperties();
