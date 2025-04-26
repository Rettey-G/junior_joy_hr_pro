import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
  Tooltip
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Visibility,
  CalendarMonth,
  Person,
  School,
  History,
  Check,
  EventNote,
  Search
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

// Main Training Management Component
const Training = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Employee data
  const [employees, setEmployees] = useState([]);
  
  // Trainers state
  const [trainers, setTrainers] = useState([]);
  const [trainerDialogOpen, setTrainerDialogOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  
  // Training programs state
  const [trainingPrograms, setTrainingPrograms] = useState([]);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  
  // Training sessions state
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionParticipants, setSessionParticipants] = useState([]);
  const [viewAttendanceDialogOpen, setViewAttendanceDialogOpen] = useState(false);
  
  // Form data for trainers
  const [trainerForm, setTrainerForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    isExternal: false
  });
  
  // Form data for training programs
  const [programForm, setProgramForm] = useState({
    id: '',
    title: '',
    description: '',
    category: '',
    duration: '',
    skillLevel: 'beginner',
    materials: '',
    prerequisites: ''
  });
  
  // Form data for training sessions
  const [sessionForm, setSessionForm] = useState({
    id: '',
    title: '',
    programId: '',
    trainerId: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    maxParticipants: 20,
    status: 'scheduled',
    notes: '',
    participants: []
  });
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchEmployees(),
          fetchTrainers(),
          fetchTrainingPrograms(),
          fetchTrainingSessions()
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching training data:', err);
        setError('Failed to load training data. Using demo data instead.');
        // Use demo data if API fails
        useDemoData();
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Fetch employees from the database
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEmployees(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching employees:', err);
      // Return empty array as fallback
      return [];
    }
  };
  
  // Fetch trainers (implementation would connect to actual API endpoint)
  const fetchTrainers = async () => {
    try {
      // In a real implementation, this would be an API call:
      // const token = localStorage.getItem('token');
      // const response = await axios.get(`${apiUrl}/api/trainers`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setTrainers(response.data);
      
      // For demo, using mock data
      const mockTrainers = [
        {
          id: 'TR001',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@juniorjoy.com',
          phone: '555-123-4567',
          specialization: 'Leadership Development',
          bio: 'PhD in Organizational Psychology with 10+ years of corporate training experience',
          isExternal: false
        },
        {
          id: 'TR002',
          name: 'Michael Chen',
          email: 'michael.chen@juniorjoy.com',
          phone: '555-987-6543',
          specialization: 'Technical Skills',
          bio: 'Senior Developer and Certified Technical Trainer',
          isExternal: false
        },
        {
          id: 'TR003',
          name: 'Emma Rodriguez',
          email: 'emma@trainingpro.com',
          phone: '555-456-7890',
          specialization: 'Soft Skills & Communication',
          bio: 'Communication coach with expertise in team dynamics',
          isExternal: true
        }
      ];
      
      setTrainers(mockTrainers);
      return mockTrainers;
    } catch (err) {
      console.error('Error fetching trainers:', err);
      return [];
    }
  };
  
  // Fetch training programs
  const fetchTrainingPrograms = async () => {
    try {
      // In a real implementation, this would be an API call
      // For demo, using mock data
      const mockPrograms = [
        {
          id: 'TP001',
          title: 'Leadership Essentials',
          description: 'Fundamental leadership skills for new managers',
          category: 'Leadership',
          duration: '16 hours',
          skillLevel: 'intermediate',
          materials: 'Workbooks provided',
          prerequisites: 'Minimum 1 year management experience'
        },
        {
          id: 'TP002',
          title: 'Advanced JavaScript',
          description: 'Deep dive into modern JavaScript features and best practices',
          category: 'Technical',
          duration: '24 hours',
          skillLevel: 'advanced',
          materials: 'Laptop required',
          prerequisites: 'Basic JavaScript knowledge'
        },
        {
          id: 'TP003',
          title: 'Effective Communication',
          description: 'Improve verbal and written communication in the workplace',
          category: 'Soft Skills',
          duration: '8 hours',
          skillLevel: 'beginner',
          materials: 'None',
          prerequisites: 'None'
        }
      ];
      
      setTrainingPrograms(mockPrograms);
      return mockPrograms;
    } catch (err) {
      console.error('Error fetching training programs:', err);
      return [];
    }
  };
  
  // Fetch training sessions
  const fetchTrainingSessions = async () => {
    try {
      // In a real implementation, this would be an API call
      // For demo, using mock data
      const mockSessions = [
        {
          id: 'TS001',
          title: 'Leadership Essentials - May Cohort',
          programId: 'TP001',
          trainerId: 'TR001',
          startDate: new Date(2025, 4, 15),
          endDate: new Date(2025, 4, 16),
          location: 'Conference Room A',
          maxParticipants: 20,
          status: 'scheduled',
          notes: 'Lunch will be provided',
          participants: ['EMP001', 'EMP002', 'EMP005']
        },
        {
          id: 'TS002',
          title: 'JavaScript Masterclass',
          programId: 'TP002',
          trainerId: 'TR002',
          startDate: new Date(2025, 4, 20),
          endDate: new Date(2025, 4, 22),
          location: 'Training Lab 2',
          maxParticipants: 15,
          status: 'scheduled',
          notes: 'Please bring laptops',
          participants: ['EMP003', 'EMP004', 'EMP006']
        },
        {
          id: 'TS003',
          title: 'Communication Workshop',
          programId: 'TP003',
          trainerId: 'TR003',
          startDate: new Date(2025, 3, 10),
          endDate: new Date(2025, 3, 10),
          location: 'Conference Room B',
          maxParticipants: 25,
          status: 'completed',
          notes: 'Certificates will be provided',
          participants: ['EMP001', 'EMP003', 'EMP005', 'EMP007']
        }
      ];
      
      setTrainingSessions(mockSessions);
      return mockSessions;
    } catch (err) {
      console.error('Error fetching training sessions:', err);
      return [];
    }
  };
  
  // Use demo data if API calls fail
  const useDemoData = () => {
    // Demo employees if needed
    if (employees.length === 0) {
      const mockEmployees = [
        { id: 'EMP001', firstName: 'John', lastName: 'Doe', department: 'IT' },
        { id: 'EMP002', firstName: 'Jane', lastName: 'Smith', department: 'HR' },
        { id: 'EMP003', firstName: 'Bob', lastName: 'Johnson', department: 'IT' },
        { id: 'EMP004', firstName: 'Alice', lastName: 'Williams', department: 'Marketing' },
        { id: 'EMP005', firstName: 'Charlie', lastName: 'Brown', department: 'Finance' },
        { id: 'EMP006', firstName: 'Diana', lastName: 'Miller', department: 'IT' },
        { id: 'EMP007', firstName: 'Edward', lastName: 'Davis', department: 'Sales' }
      ];
      setEmployees(mockEmployees);
    }
    
    // Add mock trainers
    if (trainers.length === 0) {
      const mockTrainers = [
        {
          id: 'TR001',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@juniorjoy.com',
          phone: '555-123-4567',
          specialization: 'Leadership Development',
          bio: 'PhD in Organizational Psychology with 10+ years of corporate training experience',
          isExternal: false
        },
        {
          id: 'TR002',
          name: 'Michael Chen',
          email: 'michael.chen@juniorjoy.com',
          phone: '555-987-6543',
          specialization: 'Technical Skills',
          bio: 'Senior Developer and Certified Technical Trainer',
          isExternal: false
        },
        {
          id: 'TR003',
          name: 'Emma Rodriguez',
          email: 'emma@trainingpro.com',
          phone: '555-456-7890',
          specialization: 'Soft Skills & Communication',
          bio: 'Communication coach with expertise in team dynamics',
          isExternal: true
        }
      ];
      setTrainers(mockTrainers);
    }
    
    // Add mock training programs
    if (trainingPrograms.length === 0) {
      const mockPrograms = [
        {
          id: 'TP001',
          title: 'Leadership Essentials',
          description: 'Fundamental leadership skills for new managers',
          category: 'Leadership',
          duration: '16 hours',
          skillLevel: 'intermediate',
          materials: 'Workbooks provided',
          prerequisites: 'Minimum 1 year management experience'
        },
        {
          id: 'TP002',
          title: 'Advanced JavaScript',
          description: 'Deep dive into modern JavaScript features and best practices',
          category: 'Technical',
          duration: '24 hours',
          skillLevel: 'advanced',
          materials: 'Laptop required',
          prerequisites: 'Basic JavaScript knowledge'
        },
        {
          id: 'TP003',
          title: 'Effective Communication',
          description: 'Improve verbal and written communication in the workplace',
          category: 'Soft Skills',
          duration: '8 hours',
          skillLevel: 'beginner',
          materials: 'None',
          prerequisites: 'None'
        }
      ];
      setTrainingPrograms(mockPrograms);
    }
    
    // Add mock training sessions
    if (trainingSessions.length === 0) {
      const mockSessions = [
        {
          id: 'TS001',
          title: 'Leadership Essentials - May Cohort',
          programId: 'TP001',
          trainerId: 'TR001',
          startDate: new Date(2025, 4, 15),
          endDate: new Date(2025, 4, 16),
          location: 'Conference Room A',
          maxParticipants: 20,
          status: 'scheduled',
          notes: 'Lunch will be provided',
          participants: ['EMP001', 'EMP002', 'EMP005']
        },
        {
          id: 'TS002',
          title: 'JavaScript Masterclass',
          programId: 'TP002',
          trainerId: 'TR002',
          startDate: new Date(2025, 4, 20),
          endDate: new Date(2025, 4, 22),
          location: 'Training Lab 2',
          maxParticipants: 15,
          status: 'scheduled',
          notes: 'Please bring laptops',
          participants: ['EMP003', 'EMP004', 'EMP006']
        },
        {
          id: 'TS003',
          title: 'Communication Workshop',
          programId: 'TP003',
          trainerId: 'TR003',
          startDate: new Date(2025, 3, 10),
          endDate: new Date(2025, 3, 10),
          location: 'Conference Room B',
          maxParticipants: 25,
          status: 'completed',
          notes: 'Certificates will be provided',
          participants: ['EMP001', 'EMP003', 'EMP005', 'EMP007']
        }
      ];
      setTrainingSessions(mockSessions);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Get trainer by ID
  const getTrainerById = (id) => {
    return trainers.find(trainer => trainer.id === id) || { name: 'Unknown Trainer' };
  };
  
  // Get program by ID
  const getProgramById = (id) => {
    return trainingPrograms.find(program => program.id === id) || { title: 'Unknown Program' };
  };
  
  // Get employee name by ID
  const getEmployeeById = (id) => {
    const employee = employees.find(emp => emp.id === id);
    if (!employee) return 'Unknown Employee';
    return `${employee.firstName} ${employee.lastName}`;
  };

  // Get session status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in-progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  // Check if loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading training data...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Training Management
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<CalendarMonth />} label="Sessions" />
          <Tab icon={<School />} label="Programs" />
          <Tab icon={<Person />} label="Trainers" />
          <Tab icon={<History />} label="History" />
        </Tabs>
      </Paper>
      
      {/* Training Sessions Tab */}
      {activeTab === 0 && (
        <TrainingSessionsTab 
          sessions={trainingSessions}
          programs={trainingPrograms}
          trainers={trainers}
          employees={employees}
          getProgramById={getProgramById}
          getTrainerById={getTrainerById}
          getStatusColor={getStatusColor}
          getEmployeeById={getEmployeeById}
        />
      )}
      
      {/* Training Programs Tab */}
      {activeTab === 1 && (
        <TrainingProgramsTab 
          programs={trainingPrograms}
        />
      )}
      
      {/* Trainers Tab */}
      {activeTab === 2 && (
        <TrainersTab 
          trainers={trainers}
        />
      )}
      
      {/* Training History Tab */}
      {activeTab === 3 && (
        <TrainingHistoryTab 
          sessions={trainingSessions}
          employees={employees}
          getProgramById={getProgramById}
          getTrainerById={getTrainerById}
          getEmployeeById={getEmployeeById}
        />
      )}
    </Container>
  );
};

// Training Sessions Tab Component
const TrainingSessionsTab = ({ 
  sessions, 
  programs, 
  trainers, 
  employees, 
  getProgramById, 
  getTrainerById,
  getStatusColor,
  getEmployeeById
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Upcoming Training Sessions</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
        >
          Schedule New Session
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session Title</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell>Dates</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map(session => (
              <TableRow key={session.id} hover>
                <TableCell>{session.title}</TableCell>
                <TableCell>{getProgramById(session.programId).title}</TableCell>
                <TableCell>{getTrainerById(session.trainerId).name}</TableCell>
                <TableCell>
                  {format(new Date(session.startDate), 'MMM d, yyyy')}
                  {session.startDate !== session.endDate && 
                    ` - ${format(new Date(session.endDate), 'MMM d, yyyy')}`}
                </TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>
                  <Chip 
                    label={session.status.charAt(0).toUpperCase() + session.status.slice(1)} 
                    color={getStatusColor(session.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {session.participants.length} / {session.maxParticipants}
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" title="View Details">
                    <Visibility />
                  </IconButton>
                  <IconButton color="secondary" title="Edit Session">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" title="Cancel Session">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Training Programs Tab Component
const TrainingProgramsTab = ({ programs }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Training Programs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
        >
          Add New Program
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {programs.map(program => (
          <Grid item xs={12} md={6} key={program.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {program.title}
                  <Chip 
                    label={program.skillLevel.charAt(0).toUpperCase() + program.skillLevel.slice(1)} 
                    color={program.skillLevel === 'beginner' ? 'success' : program.skillLevel === 'intermediate' ? 'primary' : 'error'} 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Typography>
                
                <Typography variant="body2" color="textSecondary" paragraph>
                  {program.description}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Category</Typography>
                    <Typography variant="body2">{program.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Duration</Typography>
                    <Typography variant="body2">{program.duration}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" color="primary" sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" color="error">
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Trainers Tab Component
const TrainersTab = ({ trainers }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Trainers</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
        >
          Add New Trainer
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {trainers.map(trainer => (
          <Grid item xs={12} md={6} lg={4} key={trainer.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {trainer.name}
                  {trainer.isExternal && (
                    <Chip 
                      label="External" 
                      color="secondary" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>
                
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {trainer.specialization}
                </Typography>
                
                <Typography variant="body2" paragraph>
                  {trainer.bio}
                </Typography>
                
                <Typography variant="caption" display="block" color="textSecondary">
                  {trainer.email} • {trainer.phone}
                </Typography>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button size="small" color="primary" sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button size="small" color="error">
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Training History Tab Component
const TrainingHistoryTab = ({ 
  sessions, 
  employees, 
  getProgramById, 
  getTrainerById,
  getEmployeeById
}) => {
  const completedSessions = sessions.filter(session => session.status === 'completed');
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Training History</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Session Title</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedSessions.map(session => (
              <TableRow key={session.id} hover>
                <TableCell>{session.title}</TableCell>
                <TableCell>{getProgramById(session.programId).title}</TableCell>
                <TableCell>{getTrainerById(session.trainerId).name}</TableCell>
                <TableCell>
                  {format(new Date(session.startDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>
                  {session.participants.length} attendees
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" title="View Attendance">
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {completedSessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No completed training sessions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Training;
