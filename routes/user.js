const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport=require("passport");
const ExpressError = require("../utils/ExpressError");
const { saveRedirectUrl } = require("../middleware.js");

// Signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// Login form
router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/signup",wrapAsync(async(req,res,next)=>{
   try{
    let {username,email,password}=req.body;
    const newUser= new User({
        email,
        username
    });
    const registerUser=await User.register(newUser,password);
    console.log(registerUser);
    req.login(registerUser,(err)=>{
        if(err){
            return next(err);
        } 
    req.flash("success","Welcome");
    //await newUser.save();
    res.redirect("/");
    });
    
   } catch(e){
    req.flash("error",e.message);
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