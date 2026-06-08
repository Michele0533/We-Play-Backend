import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   MONGODB CONNECT
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

/* =========================
   SCHEMA
========================= */
const movieSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,

  // 🔥 WICHTIG: dein Board-System
  status: {
    type: String,
    enum: ["watchlist", "seen", "rewatch"],
    default: "watchlist"
  }
});

const Movie = mongoose.model("Movie", movieSchema);

/* =========================
   PING
========================= */
app.get("/ping", (req, res) => {
  res.send("ok");
});

/* =========================
   GET ALL MOVIES
========================= */
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

/* =========================
   ADD MOVIE
========================= */
app.post("/api/movies", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: "Failed to create movie" });
  }
});

/* =========================
   DELETE MOVIE
========================= */
app.delete("/api/movies/:id", async (req, res) => {
  try {
    await Movie.deleteOne({ id: req.params.id });
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete movie" });
  }
});

/* =========================
   🔁 UPDATE STATUS (WICHTIG FÜR DEIN BOARD)
========================= */
app.patch("/api/movies/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // safety check
    const allowed = ["watchlist", "seen", "rewatch"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await Movie.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});
