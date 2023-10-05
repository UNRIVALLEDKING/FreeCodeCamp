const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const userSchema = new Schema({
  username: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const exerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Exercise = mongoose.model("Exercise", exerciseSchema);

app.get("/api/users", async (req, res) => {
  const allUsers = await User.find({}).select({ username: 1, _id: 1 });
  res.json(allUsers);
});

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const user = new User({ username });
  const data = await user.save();
  console.log("data", data);
  res.json({ username: data.username, _id: data._id });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const user = await User.findById(userId);
  if (!user) {
    res.json({ error: "User not found" });
    return;
  } else {
    const exercise = new Exercise({
      user_id: userId,
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });
    const exerciseData = await exercise.save();
    res.json({
      username: user.username,
      description,
      duration: parseInt(duration),
      date: exerciseData.date.toDateString(),
      _id: userId,
    });
  }
});
app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  const user = await User.findById(userId);
  if (!user) {
    res.json({ error: "User not found" });
    return;
  }
  let query = Exercise.find({ user_id: userId });
  if (from) {
    query = query.where("date").gte(new Date(from));
  }
  if (to) {
    query = query.where("date").lte(new Date(to));
  }
  if (limit) {
    query = query.limit(parseInt(limit));
  }
  const exercises = await query.exec();
  const log = exercises.map((exercise) => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  }));
  res.json({
    username: user.username,
    count: exercises.length,
    _id: userId,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
