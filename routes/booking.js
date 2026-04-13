const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware.js");
const sendEmail = require("../utils/email");
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

  req.flash("success", "Car booked successfully ");
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
 
 const booking= await Booking.findByIdAndUpdate(req.params.id, {
    status: "approved"
  }).populate("user")
  .populate("car");

  const user=booking.user;
  console.log(user);
   const x= await sendEmail(
  user.email,
  "Booking Approved ",
  `
  Booking Approved

Hello ${user.username},

Your car booking has been approved by admin.

Car: ${booking.car.title}
From: ${booking.fromDate.toDateString()}
To: ${booking.toDate.toDateString()}
Total Price: ₹${booking.totalPrice}

We wish you a safe and happy journey!

Thank you for choosing RentEase
  `
);
 console.log(x);
  console.log("Email send");

  req.flash("success", "Booking Approved ");
  res.redirect("/bookings/admin");
});

router.post("/:id/reject", isLoggedIn, isAdmin, async (req, res) => {

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  )
  .populate("user")
  .populate("car");

  const user = booking.user;

  await sendEmail(
    user.email,
    "Booking Rejected",
    `
    Booking Rejected

    Hello ${user.username},

    We regret to inform you that your car booking has been rejected by admin.

    Car: ${booking.car.title}
    From: ${booking.fromDate.toDateString()}
    To: ${booking.toDate.toDateString()}
    Total Price: ₹${booking.totalPrice}

    If you have any questions, feel free to contact us.

    Thank you for choosing RentEase
    `
  );

  console.log("Rejection email sent");

  req.flash("success", "Booking Rejected");
  res.redirect("/bookings/admin");
});


module.exports = router;