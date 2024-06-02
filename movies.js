const express=require("express");
const router=express.Router();
const User=require("../models/user");

 const PlayList=require("../models/playlist");
const {isLoggedIn}=require("../middleware.js")

router.get("/homePage",isLoggedIn,async (req,res)=>{
    const user=await User.findById(req.user._id);
    const action=await user.populate('action')
    const horror=await user.populate('horror')
    const fantasy=await user.populate('fantasy')
    const use=await user.populate('drama')
    const comedy=await user.populate('comedy')
    res.render("homePage",{use})
})

router.get('/search', async (req, res) => {
    const query = req.query.movie;
    const movies=await  fetch(`http://www.omdbapi.com/?s=${query}&page=1&apikey=869b5be3`)
    .then((res)=>res.json())
    .then((data)=>{
      return data
    })
    const moviesSearch=movies.Search
    res.render("movies",{moviesSearch});
});

router.post("/movie/:id",isLoggedIn,async(req,res)=>{
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
    }else if(genre.indexOf('Horror')>=0){
        user.horror.push(playList);
    }else if(genre.indexOf('Drama')>=0){
        user.drama.push(playList);
    }else if(genre.indexOf('Comedy')>=0){
        user.comedy.push(playList);
    }else{
        user.fantasy.push(playList);
    }
    await playList.save();
    await user.save();
    
    res.redirect("/homePage");
})

router.get("/:name/:id/details",async(req,res)=>{
    const {id}=req.params;
    const movie=await fetch(`http://www.omdbapi.com/?i=${id}&page=1&apikey=869b5be3`)
    .then((res)=>res.json())
    .then((data)=>{
      return data
    })
    res.render("movieDetails",{movie});
})

router.get("/:movie/playlist",async (req,res)=>{
    const {movie}=req.params;
    const user=await User.findById(req.user._id);
    const movies=await user.populate(movie)
    console.log(movies)
    res.render("playlist.ejs",{movies,movie});
})

router.delete("/:uid/:type/:id",async(req,res)=>{
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

    module.exports=router