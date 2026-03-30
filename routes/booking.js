const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware.js");

console.log("Booking routes loaded");
// form
router.get("/new/:id", isLoggedIn, async (req, res) => {
  const car = await Listing.findById(req.params.id);
  res.render("bookings/new", { car });
});

const { isAdmin } = require("../middleware");
router.get("/admin/dashboard", isLoggedIn, isAdmin, async (req, res) => {
  const total = await Booking.countDocuments();
  const pending = await Booking.countDocuments({ status: "pending" });
  const approved = await Booking.countDocuments({ status: "approved" });
  const rejected = await Booking.countDocuments({ status: "rejected" });

  res.render("bookings/dashboard", {
    total,
    pending,
    approved,
    rejected
  });
});

// create booking
router.post("/:id", isLoggedIn, async (req, res) => {
  const { fromDate, toDate } = req.body;

  const car = await Listing.findById(req.params.id);

  const days =
    (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);

  const totalPrice = days * car.price;

  const booking = new Booking({
    car: car._id,
    user: req.user._id,
    fromDate,
    toDate,
    totalPrice
  });

  await booking.save();

  req.flash("success", "Car booked successfully 🚗");
  res.redirect("/bookings/my");
});

// user bookings
router.get("/my", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("car");
  res.render("bookings/my", { bookings });
});


router.get("/admin", isLoggedIn, isAdmin, async (req, res) => {
  const bookings = await Booking.find({})
    .populate("car")
    .populate("user");

  res.render("bookings/admin", { bookings });
});

router.post("/:id/approve", isLoggedIn, isAdmin, async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, {
    status: "approved"
  });

  req.flash("success", "Booking Approved ");
  res.redirect("/bookings/admin");
});

router.post("/:id/reject", isLoggedIn, isAdmin, async (req, res) => {
  await Booking.findByIdAndUpdate(req.params.id, {
    status: "rejected"
  });

  req.flash("success", "Booking Rejected ");
  res.redirect("/bookings/admin");
});



module.exports = router;