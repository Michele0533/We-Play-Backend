import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DB CONNECT
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

/* =========================
   MOVIE MODEL
========================= */
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

const Movie = mongoose.model("Movie", movieSchema);

/* =========================
   ROUTES
========================= */

// GET ALL
app.get("/api/movies", async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

// CREATE
app.post("/api/movies", async (req, res) => {
  const movie = new Movie(req.body);
  await movie.save();
  res.json(movie);
});

// DELETE
app.delete("/api/movies/:id", async (req, res) => {
  await Movie.deleteOne({ id: req.params.id });
  res.json({ message: "deleted" });
});

// UPDATE STATUS
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
   SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Server läuft auf Port 3000");
});
