const express=require("express");
const router=express.Router();
const User=require("../models/user");
 const passport = require("passport");


router.get("/register",(req,res)=>{
    res.render("auth/signup");
})

router.post("/register",async(req,res)=>{
    try{
        const {username,password,email}=req.body;
    const user=new User({username,email})
   const newUser= await User.register(user,password);
   req.login(newUser, function(err) {
    if (err) { return next(err); }
    // req.flash("success",`Welcome  ${req.user.username}`)
    return res.redirect('/homePage' );
  });
    }
    catch(e){
        res.redirect("/register")
    }
    
})

router.get("/login",(req,res)=>{
    res.render("auth/login")
})

router.post('/login',
    passport.authenticate('local',{
       
        // successRedirect:'/',
        failureRedirect:'/login',
        failureFlash:true
    }),async(req,res)=>{
        // req.flash('success',`Welcome back again ${req.user.username}`)
        let redirectUrl= "/homePage";
        res.redirect(redirectUrl)

    }
)


router.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
        res.redirect("/")
    });
  });

module.exports=router