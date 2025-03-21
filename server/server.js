const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const promptSchema = new mongoose.Schema({
  content: String,
});

const contributionSchema = new mongoose.Schema({
  name: String,
  question: String,
  answer: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Prompt = mongoose.model('Prompt', promptSchema);
const Contribution = mongoose.model('Contribution', contributionSchema);

app.get('/prompt', async (req, res) => {
  const latestPrompt = await Prompt.findOne().sort({ _id: -1 });
  res.json({ prompt: latestPrompt ? latestPrompt.content : "" });
});

app.post('/update-prompt', async (req, res) => {
  const { content } = req.body;
  await Prompt.deleteMany({});
  const newPrompt = new Prompt({ content });
  await newPrompt.save();
  res.json({ message: "Prompt updated successfully" });
});

app.delete('/clear-prompt', async (req, res) => {
  await Prompt.deleteMany({});
  res.json({ message: "Prompt cleared" });
});

app.post('/contributions', async (req, res) => {
  try {
    const { name, question, answer } = req.body;
    const contribution = new Contribution({
      name,
      question,
      answer
    });
    await contribution.save();
    res.status(201).json({ 
      message: "Thank you for your contribution! It will be reviewed by an admin.",
      contribution
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting contribution", error });
  }
});

app.get('/contributions', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    const contributions = await Contribution.find(query).sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contributions", error });
  }
});

app.patch('/contributions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const contribution = await Contribution.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }
    
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: "Error updating contribution", error });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));