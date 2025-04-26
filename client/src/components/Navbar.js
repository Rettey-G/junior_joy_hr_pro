import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  
  // State for dropdown menus
  const [payrollAnchorEl, setPayrollAnchorEl] = useState(null);
  const [orgAnchorEl, setOrgAnchorEl] = useState(null);
  
  // Handle menu open/close
  const handlePayrollMenuOpen = (event) => setPayrollAnchorEl(event.currentTarget);
  const handlePayrollMenuClose = () => setPayrollAnchorEl(null);
  
  const handleOrgMenuOpen = (event) => setOrgAnchorEl(event.currentTarget);
  const handleOrgMenuClose = () => setOrgAnchorEl(null);
  
  // Navigate and close menu
  const handleMenuNavigation = (path) => {
    navigate(path);
    handlePayrollMenuClose();
    handleOrgMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Junior Joy HR Pro
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<DashboardIcon />}
            size="small"
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/employees"
            startIcon={<PeopleIcon />}
            size="small"
          >
            Employees
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/payroll"
            startIcon={<AttachMoneyIcon />}
            size="small"
          >
            Payroll
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/payroll-details"
            startIcon={<ReceiptIcon />}
            size="small"
          >
            Payroll Details
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/leave-plan"
            startIcon={<EventNoteIcon />}
            size="small"
          >
            Leave
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/org-chart"
            startIcon={<AccountTreeIcon />}
            size="small"
          >
            Org Chart
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/reports"
            startIcon={<AssessmentIcon />}
            size="small"
          >
            Reports
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/time-attendance"
            startIcon={<AccessTimeIcon />}
            size="small"
          >
            Time & Attendance
          </Button>
          
          {isAdmin && (
            <Button 
              color="inherit" 
              component={Link}
              to="/users"
              startIcon={<ManageAccountsIcon />}
            >
              Users
            </Button>
          )}
          
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
          
          <Avatar sx={{ ml: 2, bgcolor: 'secondary.main' }}>
            {userRole?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
