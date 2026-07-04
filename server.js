import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

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
const gameSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
});

const movieSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  status: { type: String, default: "watchlist" },
});

const Game = mongoose.model("Game", gameSchema);
const Movie = mongoose.model("Movie", movieSchema);

/* =========================
 ❤️ BASIC ROUTES
========================= */
app.get("/ping", (req, res) => {
  res.send("ok");
});

/* =========================
 🎮 GAMES ROUTES
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

/* =========================
 🎬 MOVIES ROUTES
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

app.patch("/api/movies/:id", async (req, res) => {
  try {
    const updated = await Movie.findOneAndUpdate(
      { id: Number(req.params.id) },
      { $set: { status: req.body.status } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "update failed" });
  }
});

/* =========================
 🎮 GENSHIN CONSTANTS
========================= */
const ENKA_BASE = "https://enka.network/api/uid";
const AKASHA_BASE = "https://akasha.cv/api";
const AMBR_BANNER_URL = "https://api.ambr.top/v2/en/gacha";

/* =========================
 👤 PLAYER (ENKA)
========================= */
app.get("/api/genshin/player/:uid", async (req, res) => {
  try {
    const response = await fetch(`${ENKA_BASE}/${req.params.uid}`);
    const data = await response.json();

    res.json({
      uid: req.params.uid,
      characters: data.avatarInfoList || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Enka fetch failed" });
  }
});

/* =========================
 🏆 AKASHA RANKINGS
========================= */
app.get("/api/genshin/player/:uid/rankings", async (req, res) => {
  try {
    const response = await fetch(`${AKASHA_BASE}/profile/${req.params.uid}`);
    const data = await response.json();

    res.json({
      uid: req.params.uid,
      rankings: data,
    });
  } catch (err) {
    res.status(500).json({ error: "Akasha fetch failed" });
  }
});

/* =========================
 🎉 CURRENT BANNERS
========================= */
app.get("/api/genshin/banners/current", async (req, res) => {
  try {
    const response = await fetch(AMBR_BANNER_URL);
    const data = await response.json();

    res.json({
      banners: data.data || data,
    });
  } catch (err) {
    res.status(500).json({ error: "Banner fetch failed" });
  }
});

/* =========================
 📖 BUILDS (LOCAL JSON)
========================= */
app.get("/api/genshin/builds/:character", (req, res) => {
  try {
    const filePath = path.resolve(
      `./data/builds/${req.params.character.toLowerCase()}.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Build not found" });
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Build load failed" });
  }
});

/* =========================
 🚀 SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
