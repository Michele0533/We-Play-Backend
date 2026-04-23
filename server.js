import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   🔌 MONGODB VERBINDUNG
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

/* =========================
   📦 MODELS
========================= */
const gameSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String
});

const movieSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String
});

const Game = mongoose.model("Game", gameSchema);
const Movie = mongoose.model("Movie", movieSchema);

/* =========================
   🎮 GAMES ROUTES
========================= */

// GET all games
app.get("/api/games", async (req, res) => {
  const games = await Game.find();
  res.json(games);
});

// POST game
app.post("/api/games", async (req, res) => {
  const newGame = new Game(req.body);
  await newGame.save();
  res.json(newGame);
});

// DELETE game
app.delete("/api/games/:id", async (req, res) => {
  await Game.deleteOne({ id: req.params.id });
  res.json({ message: "deleted" });
});

/* =========================
   🎬 MOVIES ROUTES
========================= */

// GET all movies
app.get("/api/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

// POST movie
app.post("/api/movies", async (req, res) => {
  const newMovie = new Movie(req.body);
  await newMovie.save();
  res.json(newMovie);
});

// DELETE movie
app.delete("/api/movies/:id", async (req, res) => {
  await Movie.deleteOne({ id: req.params.id });
  res.json({ message: "deleted" });
});

/* =========================
   🚀 SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});