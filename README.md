# Junior Joy HR Pro

Cloud-based HR Management System

## Happy Teams, Smarter HR

Junior Joy HR Pro is a comprehensive cloud-based HR management solution designed to streamline human resource operations with a modern, user-friendly interface and powerful features.

![Junior Joy HR Pro](https://i.imgur.com/f9jt0DB.png)

## 🚀 Live Demo

- Frontend: [https://junior-joy-hr-pro.netlify.app](https://junior-joy-hr-pro.netlify.app)
- Backend: [https://junior-joy-hr-pro.onrender.com](https://junior-joy-hr-pro.onrender.com)

## 🔑 Demo Credentials

- Admin: `user` / `password`
- HR: `hr` / `password`
- Employee: `employee` / `password`

## 🌟 Key Features

### 👥 Employee Management
- Complete employee database with personal and professional details
- Salary information in USD and MVR
- Search, filter, and sorting capabilities
- Employee photos and profile management

### 👮 User Administration
- Role-based access (Admin, HR, Employee)
- Secure authentication with JWT
- User management dashboard (Admin only)
- Account management with USD/MVR account numbers

### 💰 Payroll System
- Payroll overview and detailed breakdowns
- Salary calculations with various components
- Exportable reports and analytics
- Multi-currency support (USD/MVR)

### 📅 Leave Management
- Leave request creation and approval workflow
- Different leave types (Annual, Sick, Casual, etc.)
- Leave calendar and statistics
- Policy enforcement and notifications

### 🏢 Organization Chart
- Visual representation of company structure
- Department and team visualization
- Hierarchy and reporting lines
- Interactive D3.js visualization

### 📊 Reporting & Analytics
- Comprehensive HR analytics dashboard
- Customizable reports by department, timeframe
- Visual data representation with charts
- Export capabilities (PDF, Excel)

### 🔔 Real-time Notifications
- Socket.io integration for live updates
- HR notifications and alerts
- System event broadcasting

## 🛠️ Technology Stack

### Frontend
- **React**: UI library for building the interface
- **Material UI**: Component library for modern design
- **Chart.js/D3.js**: Data visualization libraries
- **Socket.io Client**: Real-time communication
- **React Router**: Application routing
- **Date-fns**: Date manipulation utilities

### Backend
- **Node.js/Express**: Server framework
- **MongoDB Atlas**: Cloud database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication mechanism
- **Socket.io**: Real-time event handling
- **Bcrypt**: Password hashing

### DevOps
- **Netlify**: Frontend deployment and hosting
- **Render**: Backend deployment and hosting
- **GitHub**: Version control and CI/CD

## 🏗️ Project Structure

```
/junior_joy_hr_pro
├── /client                 # React frontend
│   ├── /public             # Static files
│   ├── /src                # Source code
│   │   ├── /components     # Reusable UI components
│   │   ├── /pages          # Main application pages
│   │   ├── /services       # API services and utilities
│   │   └── App.js          # Main application component
│   ├── package.json        # Dependencies and scripts
│   └── .env                # Environment variables
│
├── /server                 # Node.js backend
│   ├── /models             # Mongoose data models
│   ├── /routes             # API route handlers
│   ├── /scripts            # Utility scripts for imports
│   ├── index.js            # Server entry point
│   ├── package.json        # Dependencies and scripts
│   └── .env                # Environment variables
│
├── netlify.toml            # Netlify deployment config
└── README.md               # Project documentation
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rettey-G/junior_joy_hr_pro.git
   cd junior_joy_hr_pro
   ```

2. **Setup environment variables**
   
   Create `.env` files in both client and server directories based on the `.env.example` templates.

3. **Install dependencies**

   For the client:
   ```bash
   cd client
   npm install
   ```

   For the server:
   ```bash
   cd server
   npm install
   ```

4. **Run development servers**

   For the client:
   ```bash
   cd client
   npm start
   ```

   For the server:
   ```bash
   cd server
   npm run dev
   ```

5. **Import sample data (optional)**
   ```bash
   cd server
   node scripts/importEmployees.js
   node scripts/importUsers.js
   ```

## 🔐 Environment Variables

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Server (.env)
```
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

For questions or support, please contact the development team at: support@juniorjoyhr.com
