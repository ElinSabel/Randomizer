import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// CONNECTION TO DB //
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// MODELS //
const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

const WinnerSchema = new mongoose.Schema({
  name: String,
  date: { type: Date, default: Date.now }
});

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
const Winner = mongoose.model("Winner", WinnerSchema);

// ROUTES //
app.get("/restaurants", async (req, res) => {
  const list = await Restaurant.find();
  res.json(list);
});

app.post("/restaurants", async (req, res) => {
  const newR = await Restaurant.create({ name: req.body.name });
  res.json(newR);
});

app.delete("/restaurants", async (req, res) => {
  await Restaurant.deleteMany({});
  res.json({ success: true });
});

app.get("/winners", async (req, res) => {
  const list = await Winner.find().sort({ date: -1 });
  res.json(list);
});

app.post("/winners", async (req, res) => {
  await Winner.create({ name: req.body.name });
  res.json({ success: true });
});

app.delete("/restaurants/:id", async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete restaurant" });
  }
});

// EXPORT FOR VERCEL, LISTEN FOR LOCAL //
export default app;