import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';

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
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/employees" 
              element={isAuthenticated() ? <Employees /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/payroll" 
              element={isAuthenticated() ? <Payroll /> : <Navigate to="/login" />} 
            />
            <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
