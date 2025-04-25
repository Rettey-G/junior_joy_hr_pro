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

// MOCK DATABASE FOR DEMONSTRATION
// This bypasses MongoDB connection issues in cloud environments
console.log('Setting up mock database for demonstration');

// Create mock data
const mockEmployees = [
  { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering', salary: 85000 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', salary: 75000 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'HR', salary: 65000 }
];

// Mock DB interface
const mockDB = {
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

// Make mockDB available globally
global.db = mockDB;

console.log('Mock database initialized successfully');

// For real MongoDB connection (commented out due to DNS issues)
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB Atlas'))
//   .catch((err) => console.error('MongoDB connection error:', err));

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
