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

  // Basic stats
  const total = await Booking.countDocuments();
  const pending = await Booking.countDocuments({ status: "pending" });
  const approved = await Booking.countDocuments({ status: "approved" });
  const rejected = await Booking.countDocuments({ status: "rejected" });

 
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyBookings = await Booking.countDocuments({
    createdAt: { $gte: oneWeekAgo }
  });

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const monthlyBookings = await Booking.countDocuments({
    createdAt: { $gte: oneMonthAgo }
  });

  const revenueData = await Booking.find({ status: "approved" });

  let totalRevenue = 0;
  revenueData.forEach(b => {
    totalRevenue += b.totalPrice || 0;
  });


  const recentBookings = await Booking.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user")
    .populate("car");

    const User = require("../models/user");
const Listing = require("../models/listing");

const totalUsers = await User.countDocuments();
const totalCars = await Listing.countDocuments();
const bookingTrends = await Booking.aggregate([
  {
    $group: {
      _id: { $dayOfMonth: "$createdAt" },
      count: { $sum: 1 }
    }
  },
  { $sort: { "_id": 1 } }
]);
const revenueTrends = await Booking.aggregate([
  {
    $match: { status: "approved" } // only approved bookings
  },
  {
    $group: {
      _id: { $dayOfMonth: "$createdAt" },
      revenue: { $sum: "$totalPrice" }
    }
  },
  { $sort: { "_id": 1 } }
]);
  res.render("bookings/dashboard", {
    total,
    pending,
    approved,
    rejected,
    weeklyBookings,
    monthlyBookings,
    totalRevenue,
    recentBookings,
    totalUsers,
    totalCars,
    bookingTrends,
    revenueTrends
  });
});

// create booking
router.post("/:id", isLoggedIn, async (req, res) => {
  const { fromDate, toDate } = req.body;

  const car = await Listing.findById(req.params.id);

     const existingBooking = await Booking.findOne({
    car:  car._id,
    $or: [
      {
        fromDate: { $lte: toDate },
        toDate: { $gte: fromDate }
      }
    ]
  });

  if (existingBooking) {
    req.flash("error", "Car already booked for selected dates");
    return   res.redirect("/bookings/my");

  }
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