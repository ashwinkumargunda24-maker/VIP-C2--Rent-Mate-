const mongoose = require("mongoose");

const getGridFSBucket = () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection is not ready");
  }

  return new mongoose.mongo.GridFSBucket(db, {
    bucketName: "propertyImages",
  });
};

module.exports = { getGridFSBucket };
