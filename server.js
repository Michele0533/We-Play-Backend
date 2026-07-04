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
 🎮 GAMES + MOVIES (UNCHANGED)
========================= */
app.get("/api/games", async (req, res) => res.json(await Game.find()));
app.post("/api/games", async (req, res) => res.json(await new Game(req.body).save()));
app.delete("/api/games/:id", async (req, res) => {
  await Game.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

app.get("/api/movies", async (req, res) => res.json(await Movie.find()));
app.post("/api/movies", async (req, res) => res.json(await new Movie(req.body).save()));
app.delete("/api/movies/:id", async (req, res) => {
  await Movie.deleteOne({ id: req.params.id });
  res.json({ ok: true });
});

/* =========================
 🎮 GENSHIN
========================= */

const ENKA_BASE = "https://enka.network/api/uid";
const AMBR_BANNER = "https://api.ambr.top/v2/en/gacha";

/* =========================
 👤 PLAYER (RAW DATA)
========================= */
app.get("/api/genshin/player/:uid", async (req, res) => {
  try {
    const response = await fetch(`${ENKA_BASE}/${req.params.uid}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    const text = await response.text();

    if (text.trim().startsWith("<")) {
      return res.status(500).json({
        error: "Enka returned HTML",
      });
    }

    const data = JSON.parse(text);

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
 🏆 BEST CHARACTER (NEW CLEAN ROUTE)
========================= */
app.get("/api/genshin/player/:uid/best", async (req, res) => {
  try {
    const response = await fetch(`${ENKA_BASE}/${req.params.uid}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    const text = await response.text();

    if (text.trim().startsWith("<")) {
      return res.json({
        error: "Enka blocked or HTML response",
      });
    }

    const data = JSON.parse(text);
    const characters = data.avatarInfoList || [];

    if (!characters.length) {
      return res.json({ bestCharacter: null });
    }

    let best = characters[0];

    for (const c of characters) {
      if ((c.avatarLevel || 0) > (best.avatarLevel || 0)) {
        best = c;
      }
    }

    res.json({
      bestCharacter: {
        name: best.avatarName || best.name,
        level: best.avatarLevel,
        weapon: best.weapon || null,
        artifacts: best.equipList || [],
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
 🚀 START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
