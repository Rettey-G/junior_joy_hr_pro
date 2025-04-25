import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Avatar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

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
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<DashboardIcon />}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/employees"
            startIcon={<PeopleIcon />}
          >
            Employees
          </Button>
          
          <Button 
            color="inherit" 
            component={Link}
            to="/payroll"
            startIcon={<AttachMoneyIcon />}
          >
            Payroll
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
