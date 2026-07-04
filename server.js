import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ========================= 🧠 MONGODB CONNECT ========================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

/* ========================= 📦 MODELS ========================= */
const gameSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
});

const movieSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  status: {
    type: String,
    default: "watchlist",
  },
});

const Game = mongoose.model("Game", gameSchema);
const Movie = mongoose.model("Movie", movieSchema);

/* ========================= ❤️ PING ========================= */
app.get("/ping", (req, res) => {
  res.send("ok");
});

/* ========================= 🎮 GAMES ROUTES ========================= */
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

/* ========================= 🎬 MOVIES ROUTES ========================= */
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

/* ========================= 🔁 PATCH STATUS ========================= */
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

/* ========================= 🚀 SERVER START ========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
