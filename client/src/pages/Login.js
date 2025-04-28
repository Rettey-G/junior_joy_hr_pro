import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Login attempt with:', { username: formData.username });
      console.log('API URL:', process.env.REACT_APP_API_URL || 'default');
      
      // Always try demo login first in Netlify environment
      let response;
      try {
        console.log('Attempting demo login...');
        response = await api.post('/api/auth/demo-login', formData);
        console.log('Demo login successful:', response.data);
      } catch (demoErr) {
        console.log('Demo login failed, trying regular login...', demoErr.message);
        response = await api.post('/api/auth/login', formData);
        console.log('Regular login successful:', response.data);
      }
      
      if (!response.data.token) {
        throw new Error('No token received from server');
      }
      
      // Store the token, user role, and user ID in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userId', response.data.user.id);
      
      console.log('Authentication successful, redirecting to dashboard...');
      
      // Force a page reload to ensure proper state update
      window.location.href = '/';
    } catch (err) {
      console.error('Login error details:', err.message, err.response?.data);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="sm" sx={{ px: isMobile ? 2 : 3 }}>
      <Box sx={{ 
        mt: isMobile ? 4 : 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        height: '100vh'
      }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: 3, 
          mt: isMobile ? 2 : 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography 
            component="h1" 
            variant={isMobile ? "h5" : "h4"} 
            color="primary" 
            gutterBottom
          >
            Junior Joy HR Pro
          </Typography>
          <Typography 
            component="h2" 
            variant={isMobile ? "subtitle1" : "h6"} 
            color="textSecondary" 
            gutterBottom
          >
            Happy Teams, Smarter HR
          </Typography>
        </Box>
        
        <Card 
          elevation={3} 
          sx={{ 
            width: '100%', 
            borderRadius: 2, 
            overflow: 'hidden',
            boxShadow: 3
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "large" : "medium"}
              sx={{
                mt: 3,
                mb: 2,
                py: isMobile ? 1.5 : 1,
                fontSize: isMobile ? '1rem' : 'inherit',
                boxShadow: 2
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary" align="center" gutterBottom fontWeight="bold">
                Demo credentials:
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'center',
                gap: 2,
                mt: 1 
              }}>
                <Box sx={{ textAlign: 'center', px: 1 }}>
                  <Typography variant="caption" color="primary" display="block">
                    Admin
                  </Typography>
                  <Typography variant="body2">
                    user / password
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', px: 1 }}>
                  <Typography variant="caption" color="primary" display="block">
                    HR
                  </Typography>
                  <Typography variant="body2">
                    hr / password
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', px: 1 }}>
                  <Typography variant="caption" color="primary" display="block">
                    Employee
                  </Typography>
                  <Typography variant="body2">
                    employee / password
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
        </Card>
        
        <Typography variant="caption" color="textSecondary" sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Junior Joy HR Pro. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
