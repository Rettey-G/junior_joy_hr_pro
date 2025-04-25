import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Users from './pages/Users';
import PayrollDetails from './pages/PayrollDetails';
import LeavePlan from './pages/LeavePlan';
import OrgChart from './pages/OrgChart';
import Reports from './pages/Reports';

// Components
import Navbar from './components/Navbar';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  // Simple auth check (replace with real auth logic later)
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          {isAuthenticated() && <Navbar />}
          <Routes>
            <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/employees" element={isAuthenticated() ? <Employees /> : <Navigate to="/login" />} />
            <Route path="/payroll" element={isAuthenticated() ? <Payroll /> : <Navigate to="/login" />} />
            <Route path="/payroll-details" element={isAuthenticated() ? <PayrollDetails /> : <Navigate to="/login" />} />
            <Route path="/leave-plan" element={isAuthenticated() ? <LeavePlan /> : <Navigate to="/login" />} />
            <Route path="/org-chart" element={isAuthenticated() ? <OrgChart /> : <Navigate to="/login" />} />
            <Route path="/reports" element={isAuthenticated() ? <Reports /> : <Navigate to="/login" />} />
            <Route path="/users" element={isAuthenticated() ? <Users /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
