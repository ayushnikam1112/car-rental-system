const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const ExpressError = require("../utils/ExpressError");
const { saveRedirectUrl } = require("../middleware.js");

// Signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs", { otpSent: false , userData: {}});
});

// Login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

const sendEmail = require("../utils/email");

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
let { username, email, password, otp, phone, phoneVerified } = req.body;

        if (!phoneVerified) {
            req.flash("error", "Please verify your phone first");
            return res.redirect("/signup");
        }

        // 🔹 STEP 1: Send OTP
        if (!otp) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000);

            req.session.otp = generatedOtp;
            req.session.userData = { username, email, password, phone };
            await sendEmail(
                email,
                "Your OTP",
                `Your OTP is ${generatedOtp}`
            );
        console.log(generatedOtp);
            return res.render("users/signup", { otpSent: true ,userData: req.session.userData  });
        }

        // 🔹 STEP 2: Verify OTP
        if (otp == req.session.otp) {

            const data = req.session.userData; 

            const newUser = new User({
                email: data.email,
                username: data.username,
                phone: data.phone
            });

            const registerUser = await User.register(newUser, data.password);

            req.login(registerUser, async (err) => {
                if (err) return next(err);

                req.flash("success", "Signup Successful");

                await sendEmail(
                    data.email,
                    "Welcome!",
                    "Thanks for signing up"
                );

                // clear session
                req.session.otp = null;
                req.session.userData = null;

                res.redirect("/");
            });

        } else {
            req.flash("error", "Invalid OTP ");
            res.render("users/signup", { otpSent: true, userData: req.session.userData }); 
        }

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));


router.post("/login",saveRedirectUrl,
    passport.authenticate("local",{ failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
       req.flash("success","Welcome Back");
     let redirectUrl = res.locals.redirectUrl || "/";
    delete req.session.redirectUrl;   // optional but recommended
    res.redirect(redirectUrl);
                                                                     /* let {email,password}=req.params;
                                                                        await Listing.findById(email);
                                                                        await Review.findByIdAndDelete(reviewId);

                                                                res.redirect(`/listings/${id}`); */
    })
router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","logout successfull");
        res.redirect("/");
    })
})

module.exports = router;