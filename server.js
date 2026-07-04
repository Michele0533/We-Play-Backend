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
 🧠 MONGO DB
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
 ❤️ BASIC
========================= */
app.get("/ping", (req, res) => {
  res.send("ok");
});

/* =========================
 🎮 GAMES
========================= */
app.get("/api/games", async (req, res) => {
  res.json(await Game.find());
});

app.post("/api/games", async (req, res) => {
  const g = new Game(req.body);
  await g.save();
  res.json(g);
});

app.delete("/api/games/:id", async (req, res) => {
  await Game.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

/* =========================
 🎬 MOVIES
========================= */
app.get("/api/movies", async (req, res) => {
  res.json(await Movie.find());
});

app.post("/api/movies", async (req, res) => {
  const m = new Movie(req.body);
  await m.save();
  res.json(m);
});

app.delete("/api/movies/:id", async (req, res) => {
  await Movie.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

/* =========================
 🎮 GENSHIN API
========================= */

const ENKA_BASE = "https://enka.network/api/uid";
const AKASHA_BASE = "https://akasha.cv/api";
const AMBR_BANNER = "https://api.ambr.top/v2/en/gacha";

/* =========================
 🔁 SIMPLE RETRY FETCH
========================= */
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      });

      if (res.ok) return await res.json();
    } catch (e) {}

    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error("Request failed after retries");
}

/* =========================
 👤 ENKA PLAYER
========================= */
app.get("/api/genshin/player/:uid", async (req, res) => {
  try {
    const data = await fetchWithRetry(`${ENKA_BASE}/${req.params.uid}`);

    res.json({
      uid: req.params.uid,
      characters: data.avatarInfoList || [],
    });
  } catch (err) {
    res.status(500).json({
      error: "Enka failed",
      details: err.message,
    });
  }
});

/* =========================
 🏆 AKASHA RANKINGS (FIXED)
========================= */
app.get("/api/genshin/player/:uid/rankings", async (req, res) => {
  try {
    const url = `${AKASHA_BASE}/profile/${req.params.uid}`;

    const data = await fetchWithRetry(url);

    res.json({
      uid: req.params.uid,
      rankings: data,
    });
  } catch (err) {
    res.json({
      uid: req.params.uid,
      rankings: {
        error: true,
        message: "Akasha failed or blocked",
        details: err.message,
      },
    });
  }
});

/* =========================
 🎉 BANNERS
========================= */
app.get("/api/genshin/banners/current", async (req, res) => {
  try {
    const data = await fetchWithRetry(AMBR_BANNER);

    res.json({
      banners: data.data || data,
    });
  } catch (err) {
    res.status(500).json({
      error: "Banner failed",
      details: err.message,
    });
  }
});

/* =========================
 📖 BUILDS
========================= */
app.get("/api/genshin/builds/:character", (req, res) => {
  try {
    const filePath = path.resolve(
      `./data/builds/${req.params.character.toLowerCase()}.json`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Build not found" });
    }

    res.json(JSON.parse(fs.readFileSync(filePath, "utf-8")));
  } catch (err) {
    res.status(500).json({ error: "Build error" });
  }
});

/* =========================
 🚀 START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
