const express=require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {listingSchema}=require("../schema.js");
const ExpressError=require("../utils/ExpressError.js")
const Listing=require("../models/listing.js")
const mongoose = require("mongoose");
const {isLoggedIn,isAdmin}=require("../middleware.js");
const upload = require("../multer");
const validateListing=(req,res,next)=>{
     let {error}=listingSchema.validate(req.body);
   
   if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
   }else {
    next();
   }
}

/*const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    req.flash("error", "Only admin allowed!");
    return res.redirect("/listings");
  }
  next();
};*/

//index rout

router.get("/", wrapAsync(async (req, res) => {
  let { search, location, price, type } = req.query;
  let query = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }
  if (price) {
    query.price = { $lte: price };
  }
  if (type) {
    query.type = type;
  }

  const allListings = await Listing.find(query);

  res.render("listings/index.ejs", { allListings });
}));

//show rout
router.get("/new",isLoggedIn,((req,res)=>{
    
    res.render("listings/new.ejs");
}))

router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
  const listing = await Listing.findById(id)
  .populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  })
  .populate("owner");
  
   if(!listing){
    req.flash("error","Does Not Exist");
   return res.redirect("/listings");
   }
   res.render("listings/show.ejs",{listing});
}))

//create rout

router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{
   /* if(!req.body.listing){
        throw new ExpressError(400,"send valid data ")
    }*/
  
    const newListing= new Listing(req.body.listing);
        if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }
    //console.log(req.user);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    
}));

//edit rout

router.get("/:id/edit",isLoggedIn,isAdmin,wrapAsync(async(req,res,next)=>{
     let {id}=req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, "Invalid ID"));
    }
   const listing=await Listing.findById(id);
   if(!listing){
    req.flash("error","Does Not Exist");
   return res.redirect("/listings");
   }
   res.render("listings/edit",{listing});
}) )

//update rout

router.put("/:id",isLoggedIn,isAdmin,validateListing,wrapAsync(async(req,res)=>{
     /* if(!req.body.listing){
        throw new ExpressError(400,"send valid data ")
    }*/
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
     if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
      await listing.save();
    }
    req.flash("success","Updated Successfully!");
    res.redirect(`/listings/${id}`);
}));

// delete rout

router.delete("/:id",isLoggedIn,isAdmin,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Booking Deleted!");
    res.redirect("/listings");
}));

module.exports=router;