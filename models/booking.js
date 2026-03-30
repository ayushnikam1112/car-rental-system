const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fromDate: Date,
  toDate: Date,
  totalPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now()
  },
  status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
}
});

module.exports = mongoose.model("Booking", bookingSchema);