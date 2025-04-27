# Junior Joy HR Pro

A comprehensive HR management system built with React and Node.js, featuring:

- Employee Management
- User Authentication & Authorization
- Organization Chart
- Payroll Management
- Leave Management
- Training Management
- Time & Attendance Tracking
- Reports Generation

## Tech Stack

- Frontend: React, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd junior_joy_hr_pro
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers:
```bash
# Start backend server
cd server
npm start

# Start frontend development server
cd ../client
npm start
```

## Features

- **User Management**: Role-based access control with admin and user roles
- **Employee Management**: Complete CRUD operations for employee records
- **Organization Chart**: Visual representation of company hierarchy
- **Payroll**: Salary management and payment tracking
- **Leave Management**: Leave request and approval system
- **Training**: Employee training program management
- **Reports**: Generate and export various HR reports

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
