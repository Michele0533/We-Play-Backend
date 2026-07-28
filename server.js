import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();


/* =========================
   MIDDLEWARE
========================= */

app.use(cors());
app.use(express.json());



/* =========================
   MONGODB
========================= */

mongoose
.connect(process.env.MONGO_URL)
.then(() => {
    console.log("✅ MongoDB connected");
})
.catch((err)=>{
    console.log("❌ MongoDB error:", err);
});



/* =========================
   MODELS
========================= */


/* 🎮 GAMES */

const gameSchema = new mongoose.Schema({

    id:Number,
    name:String,
    image:String

});


const Game = mongoose.model(
    "Game",
    gameSchema
);




/* 🎬 MOVIES */

const movieSchema = new mongoose.Schema({

    id:Number,
    name:String,
    image:String,

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
   TEST
========================= */

app.get("/ping",(req,res)=>{

    res.send("ok");

});




/* =========================
   🎮 GAME ROUTES
========================= */


app.get("/api/games", async(req,res)=>{

    const games = await Game.find();

    res.json(games);

});



app.post("/api/games", async(req,res)=>{

    const game = new Game(req.body);

    await game.save();

    res.json(game);

});



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


app.get("/api/movies", async(req,res)=>{

    const movies = await Movie.find();

    res.json(movies);

});




app.post("/api/movies", async(req,res)=>{

    const movie = new Movie(req.body);

    await movie.save();

    res.json(movie);

});




app.delete("/api/movies/:id", async(req,res)=>{


    await Movie.deleteOne({

        id:req.params.id

    });


    res.json({

        message:"deleted"

    });


});




app.patch("/api/movies/:id", async(req,res)=>{


try{


const movie =
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


res.json(movie);


}catch(err){


res.status(500).json({

error:"update failed"

});


}


});






/* =========================
   📖 DIARY ROUTES
========================= */


// Alle Einträge

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





// Neuer Eintrag

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






// Löschen

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

error:"delete failed"

});


}


});






/* =========================
   START SERVER
========================= */


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

console.log(
`🚀 Server läuft auf Port ${PORT}`
);

});
