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
const PlayList=require("./models/playlist")
//routes

const authRouter=require("./routes/auth");



const dbUrl=process.env.dbUrl;
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

app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
);
app.use(
    helmet({
      contentSecurityPolicy: false,
      xDownloadOptions: false,
    }),
);  
const secret=process.env.SECRET

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


app.get("/homePage",async (req,res)=>{
    const user=await User.findById(req.user._id);
    const action=await user.populate('action')
    const horror=await user.populate('horror')
    const fantasy=await user.populate('fantasy')
    const use=await user.populate('drama')
    const comedy=await user.populate('comedy')
    res.render("homePage",{use})
})

app.get('/search', async (req, res) => {
    const query = req.query.movie;
    const movies=await  fetch(`http://www.omdbapi.com/?s=${query}&page=1&apikey=869b5be3`)
    .then((res)=>res.json())
    .then((data)=>{
      return data
    })
    const moviesSearch=movies.Search
    res.render("movies",{moviesSearch});
});

app.post("/movie/:id",async(req,res)=>{
    const {id}=req.params;
    const movie=await fetch(`http://www.omdbapi.com/?i=${id}&page=2&apikey=869b5be3`)
    .then((res)=>res.json())
    .then((data)=>{
      return data
    })
    const playList=new PlayList({ name: movie.Title,image:movie.Poster,year:movie.Year });
    const genre =movie.Genre;
    const user=await User.findById(req.user._id)
    if(genre.indexOf('Action')>=0){
        user.action.push(playList);
    }else if(genre.indexOf('Drama')>=0){
        user.drama.push(playList);
    }else if(genre.indexOf('Horror')>=0){
        user.horror.push(playList);
    }else if(genre.indexOf('Comedy')>=0){
        user.comedy.push(playList);
    }else{
        user.fantasy.push(playList);
    }
    await playList.save();
    await user.save();
    
    res.redirect("/homePage");
})

app.get("/:movie/playlist",async (req,res)=>{
    const {movie}=req.params;
    const user=await User.findById(req.user._id);
    const movies=await user.populate(movie)
    console.log(movies)
    res.render("playlist.ejs",{movies,movie});
})

app.delete("/:uid/:type/:id",async(req,res)=>{
    const {uid,type,id}=req.params;    
    async function removePlaylistFromUser(userId, playlistId, genre) {
        try {
          let update = {};
          update[genre] = playlistId;
          await User.findByIdAndUpdate(userId, {
            $pull: update
          });
      
          console.log("Playlist removed successfully");
          await PlayList.findByIdAndDelete(playlistId);

        } catch (err) {
          console.error("Error removing playlist:", err);
        }
      }
      
      removePlaylistFromUser(uid, id, type);
      res.redirect("/homePage")

})
app.use(authRouter);





app.listen(3000,()=>{
    console.log("server is running on port 3000");
})