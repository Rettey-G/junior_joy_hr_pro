import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Visibility, 
  Search, 
  PersonAdd
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserManagement = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    fullName: '',
    role: 'user',
    department: '',
    isActive: true,
    password: '',
    confirmPassword: ''
  });

  // Sample roles
  const roles = ['admin', 'manager', 'hr', 'user'];

  useEffect(() => {
    // Fetch users when component mounts
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Try to get users from the API
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`${apiUrl}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const apiUsers = response.data.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            role: user.role || 'user',
            department: user.department || '',
            isActive: user.isActive !== undefined ? user.isActive : true,
            lastLogin: user.lastLogin || null
          }));
          
          setUsers(apiUsers);
          setFilteredUsers(apiUsers);
          setLoading(false);
        } catch (apiError) {
          console.warn('Failed to fetch users from API, using mock data:', apiError);
          
          // Fall back to mock data if API call fails
          const mockUsers = [
            {
              id: 'USR001',
              username: 'johndoe',
              email: 'john.doe@juniorjoy.com',
              fullName: 'John Doe',
              role: 'admin',
              department: 'IT',
              isActive: true,
              lastLogin: new Date(2025, 3, 20).toISOString()
            },
            {
              id: 'USR002',
              username: 'janedoe',
              email: 'jane.doe@juniorjoy.com',
              fullName: 'Jane Doe',
              role: 'hr',
              department: 'Human Resources',
              isActive: true,
              lastLogin: new Date(2025, 3, 25).toISOString()
            },
            {
              id: 'USR003',
              username: 'bobsmith',
              email: 'bob.smith@juniorjoy.com',
              fullName: 'Bob Smith',
              role: 'manager',
              department: 'Finance',
              isActive: false,
              lastLogin: new Date(2025, 2, 15).toISOString()
            },
            {
              id: 'USR004',
              username: 'alicejones',
              email: 'alice.jones@juniorjoy.com',
              fullName: 'Alice Jones',
              role: 'user',
              department: 'Marketing',
              isActive: true,
              lastLogin: new Date(2025, 3, 22).toISOString()
            },
            {
              id: 'USR005',
              username: 'davidwilson',
              email: 'david.wilson@juniorjoy.com',
              fullName: 'David Wilson',
              role: 'user',
              department: 'Sales',
              isActive: true,
              lastLogin: new Date(2025, 3, 18).toISOString()
            }
          ];
          
          setUsers(mockUsers);
          setFilteredUsers(mockUsers);
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [apiUrl]);
  
  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);
  
  // Get unique departments for filtering
  const getDepartments = () => {
    const departments = new Set();
    users.forEach(user => {
      if (user.department) departments.add(user.department);
    });
    return Array.from(departments);
  };

  // Handle viewing user details
  const handleViewUser = (user) => {
    setCurrentUser(user);
    setViewDialogOpen(true);
  };

  // Handle editing user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      password: '',
      confirmPassword: ''
    });
    setEditDialogOpen(true);
  };

  // Handle deleting user
  const handleDeleteUser = (user) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle adding new user
  const handleAddUser = () => {
    setFormData({
      id: '',
      username: '',
      email: '',
      fullName: '',
      role: 'user',
      department: '',
      isActive: true,
      password: '',
      confirmPassword: ''
    });
    setAddDialogOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  // Handle save (edit or add)
  const handleSaveUser = async () => {
    try {
      // Validate form
      if (!formData.username || !formData.email || !formData.fullName || !formData.role) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Validate email format
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Validate password match if adding new user
      if (!formData.id && formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      try {
        if (formData.id) {
          // Editing existing user - try API first
          const userData = {
            username: formData.username,
            email: formData.email,
            fullName: formData.fullName,
            role: formData.role,
            department: formData.department,
            isActive: formData.isActive
          };
          
          // Only include password if it was changed
          if (formData.password) {
            userData.password = formData.password;
          }
          
          try {
            await axios.put(`${apiUrl}/api/users/${formData.id}`, userData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update local state after successful API update
            const updatedUsers = users.map(user => 
              user.id === formData.id ? { 
                ...user, 
                username: formData.username,
                email: formData.email,
                fullName: formData.fullName,
                role: formData.role,
                department: formData.department,
                isActive: formData.isActive
              } : user
            );
            setUsers(updatedUsers);
          } catch (apiError) {
            console.warn('Failed to update user via API, updating local state only:', apiError);
            // Fall back to updating local state only
            const updatedUsers = users.map(user => 
              user.id === formData.id ? { 
                ...user, 
                username: formData.username,
                email: formData.email,
                fullName: formData.fullName,
                role: formData.role,
                department: formData.department,
                isActive: formData.isActive
              } : user
            );
            setUsers(updatedUsers);
          }
          setEditDialogOpen(false);
        } else {
          // Adding new user
          const userData = {
            username: formData.username,
            email: formData.email,
            fullName: formData.fullName,
            password: formData.password,
            role: formData.role,
            department: formData.department,
            isActive: formData.isActive
          };
          
          try {
            const response = await axios.post(`${apiUrl}/api/users`, userData, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            // Add the returned user from API to local state
            const newUser = {
              id: response.data._id,
              username: response.data.username,
              email: response.data.email,
              fullName: response.data.fullName,
              role: response.data.role,
              department: response.data.department,
              isActive: response.data.isActive,
              lastLogin: null
            };
            setUsers(prev => [...prev, newUser]);
          } catch (apiError) {
            console.warn('Failed to add user via API, adding to local state only:', apiError);
            // Fall back to adding to local state only
            const newUser = {
              ...formData,
              id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
              lastLogin: null
            };
            setUsers(prev => [...prev, newUser]);
          }
          setAddDialogOpen(false);
        }
      } catch (err) {
        console.error('Error saving user data:', err);
        alert('An error occurred while saving user data. Please try again.');
      }
    } catch (err) {
      console.error('Error in form validation:', err);
      alert('An error occurred. Please check your input and try again.');
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      
      try {
        // Try to delete from API first
        await axios.delete(`${apiUrl}/api/users/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // If successful, update local state
        const updatedUsers = users.filter(user => user.id !== currentUser.id);
        setUsers(updatedUsers);
      } catch (apiError) {
        console.warn('Failed to delete user via API, removing from local state only:', apiError);
        // Fall back to updating local state only
        const updatedUsers = users.filter(user => user.id !== currentUser.id);
        setUsers(updatedUsers);
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('An error occurred while deleting the user. Please try again.');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle role filter
  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
  };

  // Close all dialogs
  const handleCloseDialogs = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setAddDialogOpen(false);
    setCurrentUser(null);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
        User Management
      </Typography>
      
      {/* Filters and controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by name, username or email"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={handleRoleFilter}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<PersonAdd />}
              onClick={handleAddUser}
              size="large"
            >
              Add User
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users</Typography>
              <Typography variant="h5">{users.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Users</Typography>
              <Typography variant="h5">{users.filter(u => u.isActive).length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Admins</Typography>
              <Typography variant="h5">{users.filter(u => u.role === 'admin').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Departments</Typography>
              <Typography variant="h5">{getDepartments().length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Users table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                        color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : user.role === 'hr' ? 'info' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.isActive ? 'Active' : 'Inactive'} 
                        color={user.isActive ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditUser(user)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete"
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found matching the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {currentUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">ID</Typography>
                <Typography variant="body1" gutterBottom>{currentUser.id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Username</Typography>
                <Typography variant="body1" gutterBottom>{currentUser.username}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Full Name</Typography>
                <Typography variant="body1" gutterBottom>{currentUser.fullName}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Email</Typography>
                <Typography variant="body1" gutterBottom>{currentUser.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Role</Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} 
                    color={currentUser.role === 'admin' ? 'error' : currentUser.role === 'manager' ? 'warning' : currentUser.role === 'hr' ? 'info' : 'default'} 
                    size="small" 
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Department</Typography>
                <Typography variant="body1" gutterBottom>{currentUser.department}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip 
                    label={currentUser.isActive ? 'Active' : 'Inactive'} 
                    color={currentUser.isActive ? 'success' : 'default'} 
                    size="small" 
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Last Login</Typography>
                <Typography variant="body1" gutterBottom>
                  {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Never'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Account Status</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label={formData.isActive ? "Active" : "Inactive"}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Change Password (leave blank to keep current)</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="New Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Set Password</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user: <strong>{currentUser?.fullName}</strong> ({currentUser?.username})?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
