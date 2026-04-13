const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const Listing = require("./models/listing.js");
const { listingSchema } = require("./schema.js");
require("dotenv").config();
const userRouter = require("./routes/user.js");
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const User=require("./models/user.js");
main()
    .then(()=>{
        console.log("coneected to db");
    })
    .catch((err)=>{
        console.log(err)
    });


async function main(){
      await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")))

const validateListing=(req,res,next)=>{
     let {error}=listingSchema.validate(req.body);
   
   if( error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
   }else {
    next();
   }
}

const sessionOption={
    secret  :"mysupersecretcode",
    resave: false,
    saveUninitialized :true,
    cookie:{
        expires:Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly:true,
    },
}

app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate( )));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser = req.user;  
    next();
})

/*
app.get("/demouser",async(req,res)=>{
    let fakeUser=new User({
        email: "ayush@gmail.com",
        username :"ayush"
    });

   let registeruser=await User.register(fakeUser,"helloworld");
   res.send(registeruser);
})*/

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//home rout

app.get("/", async (req, res) => {
     console.log("HOME ROUTE HIT"); 
    const allListings = await Listing.find({});
    res.render("listings/home.ejs", { allListings });
});

app.get("/terms", (req, res) => {
    res.render("listings/terms");
});


const bookingRoutes = require("./routes/booking");
app.use("/bookings", bookingRoutes);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    res.status(statusCode).render("listings/error.ejs",{message});
    //res.status(statusCode).send(message);
})


app.listen(8000,()=>{
    console.log("server is running on port 8000");
});