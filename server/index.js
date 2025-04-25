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
console.log('Attempting to connect to MongoDB Atlas...');

// Use the connection string directly provided by the user
const MONGODB_URI = 'mongodb+srv://Rettey:Adhu1447@cluster0.spr2o17.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Set connection options
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  // Disable DNS SRV lookup
  directConnection: true
};

// Try to connect to MongoDB
mongoose.connect(MONGODB_URI, connectionOptions)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Falling back to mock database...');
    
    // Create mock data as fallback
    const mockEmployees = [
      { id: '1', name: 'John Doe', email: 'john@example.com', department: 'Engineering', salary: 85000 },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', salary: 75000 },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', department: 'HR', salary: 65000 }
    ];

    // Mock DB interface as fallback
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
    
    console.log('Mock database initialized as fallback');
  });

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
