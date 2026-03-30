const express=require("express");
const router =express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const {reviewSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js")
const Review=require("../models/review.js")
const Listing = require("../models/listing.js");
const {isLoggedIn,isAdmin}=require("../middleware.js");

const validateListing=(req,res,next)=>{
     let {error}=listingSchema.validate(req.body);
   
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
   }else {
    next();
   }
}

//reviews

router.post("/",isLoggedIn,async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newReview =new Review(req.body.review);
    newReview.author = req.user._id; 
    listing.reviews.push(newReview._id);
    await newReview.save();
    req.flash("success","New Review Created!");
    await listing.save();
    
    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
    //res.send("new review saved");
});

router.delete("/:reviewId", isLoggedIn, async (req, res) => {
  let { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }

  if (!req.user.isAdmin &&(!review.author || !review.author.equals(req.user._id))
  ) {
    req.flash("error", "You are not allowed to delete this review");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
});
module.exports=router;