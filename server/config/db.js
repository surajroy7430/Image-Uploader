const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
    return true
  } catch (error) {
    console.error("DB Connection failed");
    return false;
  }
};

module.exports = connectToDB;
