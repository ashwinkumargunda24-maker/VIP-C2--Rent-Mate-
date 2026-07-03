const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const connectDB = require("./config/connect");
const { getGridFSBucket } = require("./config/gridfs");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Routes
const userRoutes = require("./routes/userRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/users", userRoutes);
app.use("/api/owners", ownerRoutes);
app.use("/api/admin", adminRoutes);

// Backward compatibility for older locally stored images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/files/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid file id" });
    }

    const fileId = new mongoose.Types.ObjectId(id);
    const bucket = getGridFSBucket();
    const files = await mongoose.connection.db
      .collection("propertyImages.files")
      .find({ _id: fileId })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    if (files[0].contentType) {
      res.set("Content-Type", files[0].contentType);
    }

    const readStream = bucket.openDownloadStream(fileId);
    readStream.on("error", () => res.status(404).json({ message: "File not found" }));
    readStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("House Rent Management API Running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});