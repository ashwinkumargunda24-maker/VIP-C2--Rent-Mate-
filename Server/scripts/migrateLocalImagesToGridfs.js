const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = require("../config/connect");
const Property = require("../models/PropertySchema");
const { getGridFSBucket } = require("../config/gridfs");

dotenv.config();

const looksAlreadyCloudBacked = (imagePath) =>
  !imagePath ||
  imagePath.startsWith("api/files/") ||
  imagePath.startsWith("http://") ||
  imagePath.startsWith("https://");

const resolveLocalPath = (imagePath) => {
  const normalized = imagePath.replace(/\\/g, "/");
  if (normalized.startsWith("uploads/")) {
    return path.join(__dirname, "..", normalized);
  }
  if (normalized.startsWith("/uploads/")) {
    return path.join(__dirname, "..", normalized.slice(1));
  }
  return path.join(__dirname, "..", "uploads", path.basename(normalized));
};

const contentTypeByExt = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
};

const uploadFileToGridFs = (localFilePath) =>
  new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const filename = `${Date.now()}-${path.basename(localFilePath).replace(/\s+/g, "_")}`;
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentTypeByExt(localFilePath),
      metadata: { migratedFrom: localFilePath },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));

    fs.createReadStream(localFilePath).pipe(uploadStream);
  });

const run = async () => {
  try {
    await connectDB();

    const candidates = await Property.find({
      image: { $exists: true, $nin: ["", null] },
    });

    const toMigrate = candidates.filter((p) => !looksAlreadyCloudBacked(p.image));

    if (toMigrate.length === 0) {
      console.log("No local image paths found to migrate.");
      return;
    }

    let migrated = 0;
    let missing = 0;
    let failed = 0;

    for (const property of toMigrate) {
      const localPath = resolveLocalPath(property.image);

      if (!fs.existsSync(localPath)) {
        console.log(`Missing file for property ${property._id}: ${localPath}`);
        missing += 1;
        continue;
      }

      try {
        const fileId = await uploadFileToGridFs(localPath);
        property.image = `api/files/${fileId}`;
        await property.save();
        migrated += 1;
        console.log(`Migrated property ${property._id} -> api/files/${fileId}`);
      } catch (error) {
        failed += 1;
        console.log(`Failed migrating property ${property._id}: ${error.message}`);
      }
    }

    console.log(
      `Migration complete. Migrated: ${migrated}, Missing files: ${missing}, Failed: ${failed}, Total candidates: ${toMigrate.length}`
    );
  } catch (error) {
    console.log(`Migration script error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
