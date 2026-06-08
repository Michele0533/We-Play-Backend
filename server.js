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
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

/* =========================
 📦 MODELS (FIX: STATUS HINZUGEFÜGT)
========================= */
const gameSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  status: {
    type: String,
    enum: ["watchlist", "seen", "rewatch"],
    default: "watchlist"
  }
});

const movieSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  status: {
    type: String,
    enum: ["watchlist", "seen", "rewatch"],
    default: "watchlist"
  }
});

const Game = mongoose.model("Game", gameSchema);
const Movie = mongoose.model("Movie", movieSchema);

/* =========================
 ❤️ PING
========================= */
app.get("/ping", (req, res) => {
  res.send("ok");
});

/* =========================
 🎮 GAMES ROUTES (UNVERÄNDERT)
========================= */
app.get("/api/games", async (req, res) => {
  const games = await Game.find();
  res.json(games);
});

app.post("/api/games", async (req, res) => {
  const newGame = new Game(req.body);
  await newGame.save();
  res.json(newGame);
});

app.delete("/api/games/:id", async (req, res) => {
  await Game.deleteOne({ id: req.params.id });
  res.json({ message: "deleted" });
});

/* 🔥 NEU: GAME STATUS UPDATE */
app.patch("/api/games/:id/status", async (req, res) => {
  const { status } = req.body;

  const updated = await Game.findOneAndUpdate(
    { id: req.params.id },
    { status },
    { new: true }
  );

  res.json(updated);
});

/* =========================
 🎬 MOVIES ROUTES (UNVERÄNDERT)
========================= */
app.get("/api/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.post("/api/movies", async (req, res) => {
  const newMovie = new Movie(req.body);
  await newMovie.save();
  res.json(newMovie);
});

app.delete("/api/movies/:id", async (req, res) => {
  await Movie.deleteOne({ id: req.params.id });
  res.json({ message: "deleted" });
});

/* 🔥 NEU: MOVIE STATUS UPDATE (FÜR DEINE 3 LEISTEN) */
app.patch("/api/movies/:id/status", async (req, res) => {
  const { status } = req.body;

  const allowed = ["watchlist", "seen", "rewatch"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "invalid status" });
  }

  const updated = await Movie.findOneAndUpdate(
    { id: req.params.id },
    { status },
    { new: true }
  );

  res.json(updated);
});

/* =========================
 🚀 SERVER START (FIXED LOG)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
