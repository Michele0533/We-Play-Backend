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
 🧠 MONGO
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
 ❤️ PING
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

app.patch("/api/movies/:id", async (req, res) => {
  const updated = await Movie.findOneAndUpdate(
    { id: Number(req.params.id) },
    { $set: { status: req.body.status } },
    { new: true }
  );

  res.json(updated);
});

/* =========================
 🎮 GENSHIN (ENKA ONLY)
========================= */

const ENKA_BASE = "https://enka.network/api/uid";
const AMBR_BANNER = "https://api.ambr.top/v2/en/gacha";

/* =========================
 👤 PLAYER + BEST CHARACTER
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
    res.status(500).json({
      error: "Enka failed",
      details: err.message,
    });
  }
});

/* =========================
 🏆 BEST CHARACTER (FIXED REPLACEMENT FOR AKASHA)
========================= */
app.get("/api/genshin/player/:uid/rankings", async (req, res) => {
  try {
    const response = await fetch(`${ENKA_BASE}/${req.params.uid}`);
    const data = await response.json();

    const characters = data.avatarInfoList || [];

    if (characters.length === 0) {
      return res.json({
        uid: req.params.uid,
        bestCharacter: null,
        message: "No characters found",
      });
    }

    // simple "best" logic = highest level
    let best = characters[0];

    for (const c of characters) {
      const lvlA = c.avatarLevel || 0;
      const lvlB = best.avatarLevel || 0;

      if (lvlA > lvlB) best = c;
    }

    res.json({
      uid: req.params.uid,
      bestCharacter: {
        name: best.avatarName || best.name,
        level: best.avatarLevel,
        artifacts: best.equipList || [],
        weapon: best.weapon || null,
        constellations: best.talentIdList || [],
      },
    });
  } catch (err) {
    res.status(500).json({
      error: "Enka failed",
      details: err.message,
    });
  }
});

/* =========================
 🎉 BANNERS
========================= */
app.get("/api/genshin/banners/current", async (req, res) => {
  try {
    const response = await fetch(AMBR_BANNER);
    const data = await response.json();

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

    res.json(JSON.parse(fs.readFileSync(filePath, "utf-8")));
  } catch (err) {
    res.status(500).json({ error: "Build error" });
  }
});

/* =========================
 🚀 START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
