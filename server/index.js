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

// Database Setup
console.log('Setting up database...');

// Use mock database for demonstration
// This avoids MongoDB connection issues in cloud environments
console.log('Using mock database for demonstration');

// Create mock data
const mockEmployees = [
  { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering', salary: 85000 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', salary: 75000 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'HR', salary: 65000 },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', department: 'Finance', salary: 78000 },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', department: 'Operations', salary: 62000 }
];

// Mock DB interface
global.db = {
  employees: mockEmployees,
  findEmployee: (id) => mockEmployees.find(emp => emp.id === id),
  addEmployee: (employee) => {
    const newEmployee = { ...employee, id: Date.now().toString() };
    mockEmployees.push(newEmployee);
    return newEmployee;
  },
  updateEmployee: (id, data) => {
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees[index] = { ...mockEmployees[index], ...data };
      return mockEmployees[index];
    }
    return null;
  },
  deleteEmployee: (id) => {
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      const deleted = mockEmployees[index];
      mockEmployees.splice(index, 1);
      return deleted;
    }
    return null;
  }
};

console.log('Mock database initialized successfully');

// NOTE: MongoDB connection is disabled to avoid DNS and connection issues
// If you want to use MongoDB in the future, uncomment and configure this:
/*
mongoose.connect('mongodb+srv://username:password@cluster.mongodb.net/dbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));
*/

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
