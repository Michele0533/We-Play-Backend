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
.then(()=>{
    console.log("✅ MongoDB connected");
})
.catch((err)=>{
    console.log("❌ MongoDB error:",err);
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

    type:{
        type:String,
        default:"movie"
    },


    image:String,


    status:{
        type:String,
        default:"watchlist"
    },


    episodes:[
        {

            season:Number,

            episode:Number,

            watched:{
                type:Boolean,
                default:false
            }

        }
    ],


    lastSeason:{
        type:Number,
        default:1
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


app.get("/api/games",async(req,res)=>{


    const games =
    await Game.find();


    res.json(games);

});





app.post("/api/games",async(req,res)=>{


    const game =
    new Game(req.body);


    await game.save();


    res.json(game);

});





app.delete("/api/games/:id",async(req,res)=>{


    await Game.deleteOne({

        id:Number(req.params.id)

    });


    res.json({

        message:"deleted"

    });

});









/* =========================
   🎬 MOVIE ROUTES
========================= */



// LOAD MOVIES
app.get("/api/movies",async(req,res)=>{


try{


    const movies =
    await Movie.find();



    // alte Daten reparieren
    const fixedMovies = movies.map(movie=>{


        return {

            id:movie.id,

            name:movie.name,

            image:movie.image,


            type:
            movie.type ?? "movie",


            status:
            movie.status ?? "watchlist",


            episodes:
            movie.episodes ?? [],


            lastSeason:
            movie.lastSeason ?? 1

        }


    });



    res.json(fixedMovies);


}
catch(err){

    res.status(500).json({

        error:"Movies loading failed"

    });

}


});







// ADD MOVIE
app.post("/api/movies",async(req,res)=>{


try{


    const exists =
    await Movie.findOne({

        id:req.body.id

    });



    if(exists){

        return res.json(exists);

    }




    const movie =
    new Movie({

        id:req.body.id,

        name:req.body.name,


        type:
        req.body.type ?? "movie",


        image:req.body.image,


        status:
        req.body.status ?? "watchlist",


        episodes:[],


        lastSeason:1

    });



    await movie.save();



    res.json(movie);


}
catch(err){


    res.status(500).json({

        error:err.message

    });


}


});







// DELETE MOVIE
app.delete("/api/movies/:id",async(req,res)=>{


    await Movie.deleteOne({

        id:Number(req.params.id)

    });


    res.json({

        message:"deleted"

    });


});









// STATUS UPDATE

app.patch("/api/movies/:id",async(req,res)=>{


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



}
catch(err){


res.status(500).json({

error:"update failed"

});


}


});









/* =========================
   📺 EPISODEN
========================= */


app.patch("/api/movies/:id/episodes",async(req,res)=>{


try{


const {
season,
episode,
watched
}=req.body;




const movie =
await Movie.findOne({

id:Number(req.params.id)

});




if(!movie){

return res.status(404).json({

error:"Movie not found"

});

}




const existing =
movie.episodes.find(e=>

e.season===season &&

e.episode===episode

);




if(existing){

existing.watched = watched;

}
else{


movie.episodes.push({

season,

episode,

watched

});


}




await movie.save();



res.json(movie);



}
catch(err){

res.status(500).json({

error:err.message

});


}


});









/* =========================
   📌 LETZTE STAFFEL
========================= */


app.patch("/api/movies/:id/season",async(req,res)=>{


try{


const movie =
await Movie.findOne({

id:Number(req.params.id)

});



if(!movie){

return res.status(404).json({

error:"Movie not found"

});

}



movie.lastSeason =
req.body.lastSeason;



await movie.save();



res.json(movie);



}
catch(err){

res.status(500).json({

error:err.message

});


}


});









/* =========================
   📖 DIARY
========================= */


app.get("/api/diary",async(req,res)=>{


const entries =
await Diary
.find()
.sort({

createdAt:-1

});


res.json(entries);


});





app.post("/api/diary",async(req,res)=>{


const entry =
new Diary({

author:req.body.author,

text:req.body.text

});


await entry.save();


res.json(entry);


});





app.delete("/api/diary/:id",async(req,res)=>{


await Diary.findByIdAndDelete(

req.params.id

);


res.json({

message:"deleted"

});


});









/* =========================
   START
========================= */


const PORT =
process.env.PORT || 3000;



app.listen(PORT,()=>{


console.log(

`🚀 Server läuft auf Port ${PORT}`

);


});
