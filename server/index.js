require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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
console.log('Connecting to MongoDB Atlas...');

// Use environment variables for connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jjoy2024:<db_password>@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=jjoyHR';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    console.log('Ready to serve employee data with salary and cityIsland fields');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Unable to connect to MongoDB Atlas. Please check your connection string and network settings.');
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const leaveRoutes = require('./routes/leaves');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaverequests', leaveRoutes);

// Create a router for static files
const staticRouter = express.Router();

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  
  // Serve static files
  staticRouter.use(express.static(clientBuildPath));
  
  // Serve index.html for any non-API routes
  staticRouter.get('/', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
  
  // Mount the static router after API routes
  app.use('/', staticRouter);
} else {
  // Handle 404 routes in development
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
