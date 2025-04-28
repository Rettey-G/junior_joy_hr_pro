# Junior Joy HR Pro

A comprehensive HR Management System built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- Employee Management
- Leave Management
- Payroll System
- Training Management
- Time & Attendance
- Organization Chart
- Analytics Dashboard
- Role-based Access Control

## Deployment Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Rettey-G/junior_joy_hr_pro.git
   cd junior_joy_hr_pro
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=your_frontend_url
   ```

3. Install dependencies and build:
   ```bash
   npm run deploy
   ```

4. Initialize the database with default data:
   ```bash
   npm run init-db
   ```

5. Access the application:
   - Development: http://localhost:3000
   - Production: Your deployed URL

## Default Login Credentials

1. Admin User:
   - Username: admin
   - Password: Admin@123

2. HR User:
   - Username: hr
   - Password: Hr@123

3. Employee User:
   - Username: employee
   - Password: Employee@123

## Development

1. Run in development mode:
   ```bash
   npm run dev
   ```

2. Start server only:
   ```bash
   npm run server
   ```

3. Start client only:
   ```bash
   npm run client
   ```

## Tech Stack

- Frontend: React, Material-UI
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Authentication: JWT
- State Management: React Context
- Real-time Updates: Socket.io

## License

MIT License



Username: admin
Password: Admin@123
Role: admin

Username: admin2
Password: Admin2@123