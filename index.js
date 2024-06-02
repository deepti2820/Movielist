if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}

const express=require("express");
const app=express();
const ejsMate=require("ejs-mate");
const methodOverride=require("method-override");
const path=require("path");
const mongoose = require('mongoose');
const session=require("express-session");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user")
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore=require('connect-mongo')
const helmet=require("helmet");
const PlayList=require("./models/playlist");
const {isLoggedIn}=require("./middleware.js")
//routes

const authRouter=require("./routes/auth");
const movieRouter=require("./routes/movies.js")


const dbUrl=process.env.dbUrl || "mongodb+srv://deeptisinghal2003:HwKBB5JLzzEzo18c@movielist.i7guy2f.mongodb.net/?retryWrites=true&w=majority&appName=Movielist";
mongoose.connect(dbUrl)
.then(()=>{
    console.log("DB Connected");
})
.catch((err)=>{
    console.log(err);
})

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride('_method'));

mongoose.set('strictQuery', true);



const secret=process.env.SECRET || "weneedsomebettersecret"

const store =MongoStore.create({
    secret:secret,
    mongoUrl:dbUrl,
    touchAfter:24*60*60,
})


const sessionConfig={
    store,
    name:"session",
    secret:secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1*7*24*60*60*1000,
        maxAge:1*7*24*60*60*1000,
    }
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    next();
});


app.get("/",(req,res)=>{
    res.render("home");
});



app.use(authRouter);

app.use(movieRouter)



app.listen(3000,()=>{
    console.log("server is running on port 3000");
})
