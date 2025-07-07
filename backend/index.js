const express = require('express');
const mongoose = require('mongoose');
const { Validator } = require('node-input-validator');
const cors = require('cors');

const app = express();
app.use(express.json());

const MONGO_URI = "mongodb+srv://samanuesam:samanue123@cluster0.jkqgpvi.mongodb.net/todos?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors({
  origin: 'https://capsitech-task5.vercel.app',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

const validateTodo = async (req, res, next) => {
  const v = new Validator(req.body, {
    title: 'required|string|minLength:3',
    completed: 'boolean'
  });

  const matched = await v.check();
  if (!matched) return res.status(422).json({ errors: v.errors });

  next();
};


app.post('/api/todos', validateTodo, async (req, res) => {
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});


app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});


app.put('/api/todos/:id', validateTodo, async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});


app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log(' MongoDB connected');
  app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
}).catch(err => console.error('MongoDB connection error:', err));
