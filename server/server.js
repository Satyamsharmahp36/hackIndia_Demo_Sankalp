const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const axios = require('axios');

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
  userPrompt: { type: String, default: 'You Have to give precise answers to the questions' },
  mobileNo: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  geminiApiKey: { type: String, required: true },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  prompt: { type: String, default: '' },
  dailyTasks: {
    content: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now }
  },
  contributions: [{
    name: String,
    question: String,
    answer: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  tasks: [{
    uniqueTaskId: { type: String, required: true }, 
    taskQuestion: { type: String, required: true },
    taskDescription: { type: String, default: 'Task request' },
    status: { type: String, enum: ['pending', 'inprogress', 'completed', 'cancelled'], default: 'inprogress' },
    presentUserData: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);



function generateUniqueTaskId() {
  const now = new Date();
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
  const year = now.getFullYear();
  
  return `${seconds}${minutes}${hours}${day}${month}${year}`;
}

app.get('/user-prompt/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ userPrompt: user.userPrompt || "" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user prompt", error: error.message });
  }
});

app.post('/update-user-prompt', async (req, res) => {
  try {
    const { content, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userPrompt = content;
    await user.save();

    res.json({ message: "User prompt updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user prompt", error: error.message });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, mobileNo, username, password, geminiApiKey } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: "Email or username already exists" });

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      name, 
      email, 
      mobileNo, 
      username, 
      password: hashedPassword, 
      geminiApiKey 
    });
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
    if (!user) return res.status(400).json({ message: "Invalid username or password" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });
    
    res.json({ message: "Login successful", userId: user._id, plan: user.plan });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

app.post('/verify-password', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    
    let isMatch = false;

    if(password==user.password){
      isMatch= true;
    }
    
    if (isMatch) {
      return res.status(200).json({ verified: true });
    } else {
      return res.status(400).json({ verified: false, message: "Incorrect password" });
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ message: "Error verifying password", error: error.message });
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

app.get('/daily-tasks/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json({ 
      content: user.dailyTasks.content || "",
      lastUpdated: user.dailyTasks.lastUpdated 
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily tasks", error: error.message });
  }
});

app.post('/update-daily-tasks', async (req, res) => {
  try {
    const { content, username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.dailyTasks = {
      content,
      lastUpdated: new Date()
    };
    
    await user.save();

    res.json({ 
      message: "Daily tasks updated successfully",
      dailyTasks: user.dailyTasks
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating daily tasks", error: error.message });
  }
});

app.post('/contributions', async (req, res) => {
  try {
    const { name, question, answer, username } = req.body;
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

app.post('/find-task-by-question', async (req, res) => {
  try {
    const { userId, taskQuestion, uniqueTaskId } = req.body;
    
    if (!userId || (!taskQuestion && !uniqueTaskId)) {
      return res.status(400).json({ message: "User ID and either task question or uniqueTaskId are required" });
    }
    
    const user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
        let task;
    if (uniqueTaskId) {
      task = user.tasks.find(task => task.uniqueTaskId === uniqueTaskId);
    } else {
      task = user.tasks.find(task => task.taskQuestion === taskQuestion);
    }
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json({ 
      message: "Task found", 
      task 
    });
  } catch (error) {
    res.status(500).json({ message: "Error finding task", error: error.message });
  }
});

app.post('/create-task', async (req, res) => {
  try {
    const { userId, taskQuestion, taskDescription, status, presentUserData , uniqueTaskId } = req.body;
    
    if (!userId || !taskQuestion) {
      return res.status(400).json({ message: "User ID and task question are required" });
    }

    const user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const taskId = uniqueTaskId || generateUniqueTaskId();


    
    const newTask = {
      uniqueTaskId: taskId,
      taskQuestion,
      taskDescription: taskDescription || 'Task request',
      status: status || 'inprogress',
      presentUserData,
      createdAt: new Date()
    };
    
    user.tasks.push(newTask);
    await user.save();
    
    
    res.status(201).json({ 
      message: "Task created successfully", 
      task: {
        id: user.tasks[user.tasks.length - 1]._id,
        uniqueTaskId,
        ...newTask
      } 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});

app.get('/tasks/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user.tasks.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

app.patch('/tasks', async (req, res) => {
  try {
    const { status, userId, uniqueTaskId } = req.body;
    
    if (!status || !userId) {
      return res.status(400).json({ message: "Task status and User ID are required" });
    }
    
    const user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    let taskIndex = -1;
    
    if (uniqueTaskId) {
      taskIndex = user.tasks.findIndex(task => task.uniqueTaskId === uniqueTaskId);
    }
    
    if (taskIndex === -1) {
      const taskId = req.params.taskId;
      taskIndex = user.tasks.findIndex(task => task._id.toString() === taskId);
    }
    
    if (taskIndex === -1) {
      const taskFromRequest = req.body.taskQuestion;
      if (taskFromRequest) {
        taskIndex = user.tasks.findIndex(task => task.taskQuestion === taskFromRequest);
      }
    }
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    user.tasks[taskIndex].status = status;
    await user.save();
    
    res.json({ 
      message: "Task status updated successfully", 
      task: user.tasks[taskIndex] 
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Error updating task status", error: error.message });
  }
});

app.delete('/tasks/:taskId', async (req, res) => {
  try {
    const { userId, uniqueTaskId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const user = await User.findOne({ username: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    let taskIndex = -1;
    
    if (uniqueTaskId) {
      taskIndex = user.tasks.findIndex(task => task.uniqueTaskId === uniqueTaskId);
    }
    
    if (taskIndex === -1) {
      taskIndex = user.tasks.findIndex(task => task._id.toString() === req.params.taskId);
    }
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    user.tasks.splice(taskIndex, 1);
    await user.save();
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});

app.get('/verify-user/:identifier', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.identifier });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ 
      user: { 
        _id: user._id, 
        name: user.name, 
        username: user.username,
        email: user.email,
        mobileNo: user.mobileNo,
        geminiApiKey: user.geminiApiKey, 
        plan: user.plan, 
        prompt: user.prompt,
        dailyTasks: user.dailyTasks, 
        contributions: user.contributions,
        tasks: user.tasks,
        password: user.password,
        userPrompt:user.userPrompt
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PING_SERVICE_URL = process.env.PING_SERVICE_URL;

const pingSecondaryService = async () => {
  try {
    const response = await axios.get(PING_SERVICE_URL);
    console.log(`Pinged secondary service at ${new Date().toISOString()} - Response: ${response.status}`);
  } catch (error) {
    console.error(`Error pinging secondary service: ${error.message}`);
  }
};

app.listen(5000, () => {
  console.log('Server running on port 5000');
  
  setInterval(pingSecondaryService, 10 * 60 * 1000);
});