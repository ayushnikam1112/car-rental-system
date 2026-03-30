const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing.js");

// Connect DB
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// Seed function
const initDB = async () => {
  try {
    await Listing.deleteMany({});
    console.log("Old data deleted");
    initData.data=initData.data.map((obj)=>({...obj,owner:"69c58c967d930090d3638e34"}))
    await Listing.insertMany(initData.data);
    console.log("New car data inserted");

    mongoose.connection.close(); // close connection
  } catch (err) {
    console.log(err);
  }
};

// Proper execution order
main()
  .then(() => {
    console.log("Connected to DB");
    return initDB();   //  run AFTER connection
  })
  .catch((err) => {
    console.log(" DB Error:", err);
  });