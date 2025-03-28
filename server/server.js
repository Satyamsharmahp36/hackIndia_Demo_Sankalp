const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  geminiApiKey: { type: String, required: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  prompt: { type: String, default: '' },
  contributions: [{
    name: String,
    question: String,
    answer: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const { name, email, mobileNo, username, password, geminiApiKey } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "Email or username already exists" });

    const newUser = new User({ name, email, mobileNo, username, password, geminiApiKey });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid username or password" });
    res.json({ message: "Login successful", userId: user._id, plan: user.plan });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

app.get('/prompt/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ prompt: user.prompt || "" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching prompt", error: error.message });
  }
});

app.post('/update-prompt', async (req, res) => {
  try {
    const { content, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user by username instead of _id
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.prompt = content;
    await user.save();

    res.json({ message: "Prompt updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating prompt", error: error.message });
  }
});

app.post('/contributions', async (req, res) => {
  try {
    const { name, question, answer, username } = req.body;
    console.log(username)
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const contribution = { name, question, answer, status: 'pending', createdAt: new Date() };
    user.contributions.push(contribution);
    await user.save();
    res.status(201).json({ message: "Contribution submitted successfully", contribution });
  } catch (error) {
    res.status(500).json({ message: "Error submitting contribution", error: error.message });
  }
});

app.get('/contributions/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.contributions.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    res.status(500).json({ message: "Error fetching contributions", error: error.message });
  }
});

app.patch('/contributions/:contributionId', async (req, res) => {
  try {
    const { status, username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const contribution = user.contributions.id(req.params.contributionId);
    if (!contribution) return res.status(404).json({ message: "Contribution not found" });

    contribution.status = status;
    await user.save();
    res.json({ message: "Contribution status updated successfully", contribution });
  } catch (error) {
    res.status(500).json({ message: "Error updating contribution status", error: error.message });
  }
});

app.get('/verify-user/:identifier', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.identifier });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: { _id: user._id, name: user.name, username: user.username, geminiApiKey: user.geminiApiKey, plan: user.plan, prompt: user.prompt, contributions: user.contributions,password : user.password } });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error: error.message });
  }
});

// app.get('/temp', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.identifier });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json({ user: { _id: user._id, name: user.name, username: user.username, geminiApiKey: user.geminiApiKey, plan: user.plan, prompt: user.prompt, contributions: user.contributions,password : user.password } });
//   } catch (error) {
//     res.status(500).json({ message: "Error verifying user", error: error.message });
//   }
// });

app.listen(5000, () => console.log('Server running on port 5000'));
