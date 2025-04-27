import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, useMediaQuery } from '@mui/material';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import UserManagement from './pages/UserManagement';
import PayrollDetails from './pages/PayrollDetails';
import LeavePlan from './pages/LeavePlan';
import LeavePage from './pages/LeavePage';
import OrgChart from './pages/OrgChart';
import Reports from './pages/Reports';
import TimeAttendance from './pages/TimeAttendance';
import Training from './pages/Training';

// Components
import Navbar from './components/Navbar';

// Theme
let theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Make fonts responsive
theme = responsiveFontSizes(theme);

const ResponsiveContainer = ({ children }) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  return (
    <Container 
      maxWidth={false} 
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        paddingTop: isMobile ? '56px' : '64px', // Mobile app bar is 56px, desktop is 64px
        height: '100vh',
        overflowX: 'hidden'
      }}
    >
      {children}
    </Container>
  );
};

function App() {
  // Simple auth check (replace with real auth logic later)
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  const isAdmin = () => {
    return localStorage.getItem('userRole') === 'admin';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {isAuthenticated() && <Navbar />}
          <ResponsiveContainer>
            <Routes>
              <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/" />} />
              <Route path="/" element={
                isAuthenticated() ? 
                  (isAdmin() ? <Dashboard /> : <UserDashboard />) : 
                  <Navigate to="/login" />
              } />
              <Route path="/employees" element={isAuthenticated() && isAdmin() ? <Employees /> : <Navigate to="/" />} />
              <Route path="/payroll" element={isAuthenticated() ? <Payroll /> : <Navigate to="/login" />} />
              <Route path="/payroll-details" element={isAuthenticated() ? <PayrollDetails /> : <Navigate to="/login" />} />
              <Route path="/leave-plan" element={isAuthenticated() && isAdmin() ? <LeavePlan /> : <Navigate to="/" />} />
              <Route path="/leave" element={isAuthenticated() ? <LeavePage /> : <Navigate to="/login" />} />
              <Route path="/org-chart" element={isAuthenticated() ? <OrgChart /> : <Navigate to="/login" />} />
              <Route path="/reports" element={isAuthenticated() && isAdmin() ? <Reports /> : <Navigate to="/" />} />
              <Route path="/time-attendance" element={isAuthenticated() ? <TimeAttendance /> : <Navigate to="/login" />} />
              <Route path="/users" element={isAuthenticated() && isAdmin() ? <UserManagement /> : <Navigate to="/" />} />
              <Route path="/training" element={isAuthenticated() ? <Training /> : <Navigate to="/login" />} />
            </Routes>
          </ResponsiveContainer>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
