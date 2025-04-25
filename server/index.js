require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Use a simple MongoDB Atlas connection string without SRV lookup
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/junior_joy_hr?retryWrites=true&w=majority';

// Set DNS lookup options to avoid SRV issues
const connectionOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4  // Force IPv4
};

// Connect with options
mongoose.connect(process.env.DB_URI || process.env.MONGODB_URI || MONGODB_URI, connectionOptions)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));

// Basic route
app.get('/', (req, res) => {
  res.send('Junior Joy HR Pro API is running.');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
