import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
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
import SchoolIcon from '@mui/icons-material/School';
import MenuIcon from '@mui/icons-material/Menu';


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };
  
  // Navigation items for both desktop and mobile views
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/employees' },
    { text: 'Payroll', icon: <AttachMoneyIcon />, path: '/payroll' },
    { text: 'Payroll Details', icon: <ReceiptIcon />, path: '/payroll-details' },
    { text: 'Leave Plan', icon: <EventNoteIcon />, path: '/leave-plan' },
    { text: 'Leave Requests', icon: <EventNoteIcon />, path: '/leave' },
    { text: 'Org Chart', icon: <AccountTreeIcon />, path: '/org-chart' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Time & Attendance', icon: <AccessTimeIcon />, path: '/time-attendance' },
    { text: 'Training', icon: <SchoolIcon />, path: '/training' }
  ];
  
  // Add Users management for admin
  if (isAdmin) {
    navItems.push({ text: 'Users', icon: <ManageAccountsIcon />, path: '/users' });
  }

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Junior Joy HR Pro
          </Typography>
          
          {isMobile ? (
            <Box>
              <IconButton 
                color="inherit" 
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              
              <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
              
              <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
                {userRole?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button 
                  key={item.path}
                  color="inherit" 
                  component={Link} 
                  to={item.path}
                  startIcon={item.icon}
                  size="small"
                  sx={{ 
                    mx: 0.5,
                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                  }}
                >
                  {item.text}
                </Button>
              ))}
              
              <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
              
              <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
                {userRole?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen && isMobile}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
        }}
      >
        <Box sx={{ textAlign: 'center', pt: 2, pb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Junior Joy HR Pro
          </Typography>
          <Divider />
          <Box sx={{ pt: 2 }}>
            <Avatar sx={{ mx: 'auto', bgcolor: 'secondary.main' }}>
              {userRole?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ mt: 1, textTransform: 'capitalize' }}>
              {userRole || 'User'}
            </Typography>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Box>
        
        <List>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.path} 
              component={Link} 
              to={item.path}
              onClick={handleDrawerToggle}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
