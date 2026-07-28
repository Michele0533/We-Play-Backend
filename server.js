import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🧠 MONGODB CONNECT
========================= */

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));


/* =========================
   📦 MODELS
========================= */


/* 🎮 GAME */

const gameSchema = new mongoose.Schema({

  id: Number,

  name: String,

  image: String

});


const Game = mongoose.model(
  "Game",
  gameSchema
);



/* 🎬 MOVIE */

const movieSchema = new mongoose.Schema({

  id: Number,

  name: String,

  image: String,

  status:{
    type:String,
    default:"watchlist"
  }

});


const Movie = mongoose.model(
  "Movie",
  movieSchema
);




/* 📖 DIARY */

const diarySchema = new mongoose.Schema({

  author:{
    type:String,
    required:true
  },


  text:{
    type:String,
    required:true
  },


  createdAt:{
    type:Date,
    default:Date.now
  }

});


const Diary = mongoose.model(
  "Diary",
  diarySchema
);



/* =========================
   ❤️ PING
========================= */

app.get("/ping",(req,res)=>{

  res.send("ok");

});



/* =========================
   🎮 GAME ROUTES
========================= */


// Alle Games

app.get("/api/games", async(req,res)=>{

  const games = await Game.find();

  res.json(games);

});



// Game hinzufügen

app.post("/api/games", async(req,res)=>{

  const game = new Game(req.body);

  await game.save();

  res.json(game);

});



// Game löschen

app.delete("/api/games/:id", async(req,res)=>{


  await Game.deleteOne({
    id:req.params.id
  });


  res.json({
    message:"deleted"
  });


});



/* =========================
   🎬 MOVIE ROUTES
========================= */


// Alle Movies

app.get("/api/movies", async(req,res)=>{


const movies = await Movie.find();


res.json(movies);


});




// Movie hinzufügen

app.post("/api/movies", async(req,res)=>{


const movie = new Movie(req.body);


await movie.save();


res.json(movie);


});




// Movie löschen

app.delete("/api/movies/:id", async(req,res)=>{


await Movie.deleteOne({

id:req.params.id

});


res.json({

message:"deleted"

});


});




// Movie Status ändern

app.patch("/api/movies/:id", async(req,res)=>{


try{


const updated =
await Movie.findOneAndUpdate(

{
id:Number(req.params.id)
},


{
$set:{
status:req.body.status
}
},


{
new:true
}

);



res.json(updated);



}catch(err){


res.status(500).json({

error:"update failed"

});


}


});




/* =========================
   📖 DIARY ROUTES
========================= */


// Alle Tagebucheinträge

app.get("/api/diary", async(req,res)=>{


try{


const entries =
await Diary
.find()
.sort({
createdAt:-1
});


res.json(entries);



}catch(err){


res.status(500).json({

error:"Diary loading failed"

});


}


});




// Neuer Tagebucheintrag

app.post("/api/diary", async(req,res)=>{


try{


const entry = new Diary({

author:req.body.author,

text:req.body.text

});



await entry.save();



res.json(entry);



}catch(err){


res.status(500).json({

error:"Diary save failed"

});


}


});




// Tagebucheintrag löschen

app.delete("/api/diary/:id", async(req,res)=>{


try{


await Diary.findByIdAndDelete(
req.params.id
);



res.json({

message:"deleted"

});



}catch(err){


res.status(500).json({

error:"Delete failed"

});


}


});



/* =========================
   🚀 SERVER START
========================= */


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

console.log(
`🚀 Server läuft auf Port ${PORT}`
);

});
