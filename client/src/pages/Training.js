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
  const [successMessage, setSuccessMessage] = useState('');
  
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
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Training sessions state
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionParticipants, setSessionParticipants] = useState([]);
  const [viewAttendanceDialogOpen, setViewAttendanceDialogOpen] = useState(false);
  
  // Handle dialog opening for adding a new trainer
  const handleAddTrainer = () => {
    setCurrentTrainer(null);
    setTrainerForm({
      id: `TR${String(trainers.length + 1).padStart(3, '0')}`,
      name: '',
      email: '',
      phone: '',
      specialization: '',
      bio: '',
      isExternal: false
    });
    setTrainerDialogOpen(true);
  };
  
  // Handle dialog opening for adding a new program
  const handleAddProgram = () => {
    setCurrentProgram(null);
    setProgramForm({
      id: `TP${String(trainingPrograms.length + 1).padStart(3, '0')}`,
      title: '',
      description: '',
      category: '',
      duration: '',
      skillLevel: 'beginner',
      materials: '',
      prerequisites: ''
    });
    setProgramDialogOpen(true);
  };
  
  // Handle dialog opening for adding a new session
  const handleAddSession = () => {
    setCurrentSession(null);
    setSessionForm({
      id: `TS${String(trainingSessions.length + 1).padStart(3, '0')}`,
      title: '',
      programId: trainingPrograms.length > 0 ? trainingPrograms[0].id : '',
      trainerId: trainers.length > 0 ? trainers[0].id : '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      maxParticipants: 20,
      status: 'scheduled',
      notes: '',
      participants: []
    });
    setSessionParticipants([]);
    setSessionDialogOpen(true);
  };
  
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
    const fetchData = async () => {
      try {
        setLoading(true);
        let hasError = false;
        
        // Mock data for fallback
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
          },
          {
            id: 'TR004',
            name: 'Ahmed Hassan',
            email: 'ahmed@fuelsafetytraining.com',
            phone: '555-789-0123',
            specialization: 'Fuel Safety & Handling',
            bio: 'Certified Safety Specialist with 15 years experience in fuel industry',
            isExternal: true
          }
        ];
        
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
            title: 'Customer Service Excellence',
            description: 'Strategies for exceptional customer experiences',
            category: 'Customer Service',
            duration: '8 hours',
            skillLevel: 'beginner',
            materials: 'Digital handbook',
            prerequisites: 'None'
          },
          {
            id: 'TP003',
            title: 'Advanced Fuel Handling Safety',
            description: 'Comprehensive safety protocols for fuel handling and storage',
            category: 'Safety',
            duration: '24 hours',
            skillLevel: 'advanced',
            materials: 'Safety manual, protective equipment for demonstrations',
            prerequisites: 'Basic safety training'
          },
          {
            id: 'TP004',
            title: 'Environmental Compliance in Fuel Operations',
            description: 'Understanding regulations and best practices for environmental protection',
            category: 'Compliance',
            duration: '16 hours',
            skillLevel: 'intermediate',
            materials: 'Regulatory guidelines, case studies',
            prerequisites: 'Basic knowledge of fuel operations'
          },
          {
            id: 'TP005',
            title: 'Fuel Quality Management',
            description: 'Techniques for testing, maintaining and ensuring fuel quality standards',
            category: 'Technical',
            duration: '12 hours',
            skillLevel: 'intermediate',
            materials: 'Testing equipment demos, quality control handbook',
            prerequisites: 'Technical background preferred'
          }
        ];

        const mockSessions = [
          {
            id: 'TS001',
            title: 'Leadership Workshop: May 2025',
            programId: 'TP001',
            trainerId: 'TR001',
            startDate: '2025-05-15',
            endDate: '2025-05-16',
            location: 'Training Room A',
            maxParticipants: 15,
            status: 'scheduled',
            participants: ['EMP001', 'EMP003', 'EMP005'],
            notes: 'Bring laptops and prepare leadership self-assessment'
          },
          {
            id: 'TS002',
            title: 'Fuel Safety Training: June 2025',
            programId: 'TP003',
            trainerId: 'TR004',
            startDate: '2025-06-05',
            endDate: '2025-06-07',
            location: 'Safety Training Facility',
            maxParticipants: 10,
            status: 'scheduled',
            participants: ['EMP002', 'EMP004'],
            notes: 'PPE will be provided'
          },
          {
            id: 'TS003',
            title: 'Customer Service Essentials',
            programId: 'TP002',
            trainerId: 'TR003',
            startDate: '2025-04-20',
            endDate: '2025-04-20',
            location: 'Conference Room B',
            maxParticipants: 20,
            status: 'completed',
            participants: ['EMP001', 'EMP002', 'EMP003', 'EMP004'],
            notes: 'Follow-up assignments due one week after training'
          }
        ];

        // Try to fetch trainers, fallback to mock data if fails
        try {
          const trainersResponse = await axios.get(`${apiUrl}/api/trainers`);
          if (trainersResponse.data) {
            setTrainers(trainersResponse.data);
          }
        } catch (error) {
          console.error('Error fetching trainers:', error);
          setTrainers(mockTrainers);
          hasError = true;
        }
        
        // Try to fetch training programs, fallback to mock data if fails
        try {
          const programsResponse = await axios.get(`${apiUrl}/api/trainingprograms`);
          if (programsResponse.data) {
            const programs = programsResponse.data;
            setTrainingPrograms(programs);
            setFilteredPrograms(programs);
          }
        } catch (error) {
          console.error('Error fetching training programs:', error);
          setTrainingPrograms(mockPrograms);
          setFilteredPrograms(mockPrograms);
          hasError = true;
        }
        
        // Try to fetch training sessions, fallback to mock data if fails
        try {
          const sessionsResponse = await axios.get(`${apiUrl}/api/trainingsessions`);
          if (sessionsResponse.data) {
            setTrainingSessions(sessionsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching training sessions:', error);
          setTrainingSessions(mockSessions);
          hasError = true;
        }
        
        // Try to fetch employees, fallback to local data if fails
        try {
          const employeesResponse = await axios.get(`${apiUrl}/api/employees`);
          if (employeesResponse.data) {
            setEmployees(employeesResponse.data);
          }
        } catch (error) {
          console.error('Error fetching employees:', error);
          // Use data from local file
          import('../data/allEmployeeData').then(module => {
            setEmployees(module.default || []);
          });
          hasError = true;
        }
        
        if (hasError) {
          setError('Unable to connect to the backend API. Using demo data instead.');
        }
        
        // Always finish loading regardless of API success
        setLoading(false);
      } catch (error) {
        console.error('Fatal error in fetchData:', error);
        setError('An unexpected error occurred. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [apiUrl]);
  
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
  const generateDemoData = () => {
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
    // Reset filters when changing tabs
    setCategoryFilter('All');
    setSearchQuery('');
    setFilteredPrograms(trainingPrograms);
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (event) => {
    const category = event.target.value;
    setCategoryFilter(category);
    filterPrograms(searchQuery, category);
  };
  
  // Handle search query change
  const handleSearchQueryChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterPrograms(query, categoryFilter);
  };
  
  // Filter programs based on search query and category
  const filterPrograms = (query, category) => {
    let filtered = trainingPrograms;
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(program => 
        program.name.toLowerCase().includes(query.toLowerCase()) ||
        program.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category !== 'All') {
      filtered = filtered.filter(program => program.category === category);
    }
    
    setFilteredPrograms(filtered);
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

  // Save trainer form data
  const handleSaveTrainer = () => {
    if (!trainerForm.name || !trainerForm.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newTrainers = [...trainers];
    
    if (currentTrainer) {
      // Update existing trainer
      const index = newTrainers.findIndex(t => t.id === currentTrainer.id);
      if (index !== -1) {
        newTrainers[index] = {...trainerForm, id: currentTrainer.id};
      }
    } else {
      // Add new trainer
      newTrainers.push(trainerForm);
    }
    
    setTrainers(newTrainers);
    setTrainerDialogOpen(false);
    setCurrentTrainer(null);
    setSuccessMessage('Trainer saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Save program form data
  const handleSaveProgram = () => {
    if (!programForm.title || !programForm.description || !programForm.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newPrograms = [...trainingPrograms];
    
    if (currentProgram) {
      // Update existing program
      const index = newPrograms.findIndex(p => p.id === currentProgram.id);
      if (index !== -1) {
        newPrograms[index] = {...programForm, id: currentProgram.id};
      }
    } else {
      // Add new program
      newPrograms.push(programForm);
    }
    
    setTrainingPrograms(newPrograms);
    setProgramDialogOpen(false);
    setCurrentProgram(null);
    setSuccessMessage('Training program saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Save session form data
  const handleSaveSession = () => {
    if (!sessionForm.title || !sessionForm.programId || !sessionForm.trainerId || !sessionForm.location) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate dates
    if (new Date(sessionForm.endDate) < new Date(sessionForm.startDate)) {
      setError('End date cannot be before start date');
      return;
    }
    
    const newSessions = [...trainingSessions];
    const updatedSessionForm = {
      ...sessionForm,
      participants: sessionParticipants.map(p => p.id)
    };
    
    if (currentSession) {
      // Update existing session
      const index = newSessions.findIndex(s => s.id === currentSession.id);
      if (index !== -1) {
        newSessions[index] = {...updatedSessionForm, id: currentSession.id};
      }
    } else {
      // Add new session
      newSessions.push(updatedSessionForm);
    }
    
    setTrainingSessions(newSessions);
    setSessionDialogOpen(false);
    setCurrentSession(null);
    setSuccessMessage('Training session saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCloseDialog = () => {
    setTrainerDialogOpen(false);
    setProgramDialogOpen(false);
    setSessionDialogOpen(false);
    setViewAttendanceDialogOpen(false);
    setError(null);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
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
          handleAddSession={() => {
            setSessionForm({
              title: '',
              programId: '',
              trainerId: '',
              startDate: format(new Date(), 'yyyy-MM-dd'),
              endDate: format(new Date(), 'yyyy-MM-dd'),
              location: '',
              status: 'scheduled',
              maxParticipants: 20,
              participants: []
            });
            setSessionDialogOpen(true);
          }}
        />
      )}
      
      {/* Add Trainer Dialog */}
      <Dialog open={trainerDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentTrainer ? 'Edit Trainer' : 'Add New Trainer'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                name="name"
                fullWidth
                variant="outlined"
                value={trainerForm.name}
                onChange={(e) => setTrainerForm({...trainerForm, name: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                value={trainerForm.email}
                onChange={(e) => setTrainerForm({...trainerForm, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                variant="outlined"
                value={trainerForm.phone}
                onChange={(e) => setTrainerForm({...trainerForm, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Specialization"
                name="specialization"
                fullWidth
                variant="outlined"
                value={trainerForm.specialization}
                onChange={(e) => setTrainerForm({...trainerForm, specialization: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Bio"
                name="bio"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={trainerForm.bio}
                onChange={(e) => setTrainerForm({...trainerForm, bio: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="body2" color="textSecondary">
                  Is this an external trainer?
                </Typography>
                <Select
                  value={trainerForm.isExternal}
                  onChange={(e) => setTrainerForm({...trainerForm, isExternal: e.target.value})}
                  variant="outlined"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value={false}>No - Internal Staff</MenuItem>
                  <MenuItem value={true}>Yes - External Trainer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSaveTrainer} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Program Dialog */}
      <Dialog open={programDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentProgram ? 'Edit Program' : 'Add New Training Program'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Title"
                name="title"
                fullWidth
                variant="outlined"
                value={programForm.title}
                onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Category"
                name="category"
                fullWidth
                variant="outlined"
                value={programForm.category}
                onChange={(e) => setProgramForm({...programForm, category: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={programForm.description}
                onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (e.g., 8 hours, 2 days)"
                name="duration"
                fullWidth
                variant="outlined"
                value={programForm.duration}
                onChange={(e) => setProgramForm({...programForm, duration: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Skill Level</InputLabel>
                <Select
                  label="Skill Level"
                  value={programForm.skillLevel}
                  onChange={(e) => setProgramForm({...programForm, skillLevel: e.target.value})}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Materials"
                name="materials"
                fullWidth
                variant="outlined"
                value={programForm.materials}
                onChange={(e) => setProgramForm({...programForm, materials: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prerequisites"
                name="prerequisites"
                fullWidth
                variant="outlined"
                value={programForm.prerequisites}
                onChange={(e) => setProgramForm({...programForm, prerequisites: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSaveProgram} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{currentSession ? 'Edit Training Session' : 'Schedule New Training Session'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Session Title"
                name="title"
                fullWidth
                variant="outlined"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Training Program</InputLabel>
                <Select
                  label="Training Program"
                  value={sessionForm.programId}
                  onChange={(e) => setSessionForm({...sessionForm, programId: e.target.value})}
                  required
                >
                  {trainingPrograms.map(program => (
                    <MenuItem key={program.id} value={program.id}>{program.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Trainer</InputLabel>
                <Select
                  label="Trainer"
                  value={sessionForm.trainerId}
                  onChange={(e) => setSessionForm({...sessionForm, trainerId: e.target.value})}
                  required
                >
                  {trainers.map(trainer => (
                    <MenuItem key={trainer.id} value={trainer.id}>{trainer.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={sessionForm.startDate}
                  onChange={(newDate) => setSessionForm({...sessionForm, startDate: newDate})}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={sessionForm.endDate}
                  onChange={(newDate) => setSessionForm({...sessionForm, endDate: newDate})}
                  renderInput={(params) => <TextField {...params} fullWidth variant="outlined" required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                name="location"
                fullWidth
                variant="outlined"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({...sessionForm, location: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Max Participants"
                name="maxParticipants"
                type="number"
                fullWidth
                variant="outlined"
                value={sessionForm.maxParticipants}
                onChange={(e) => setSessionForm({...sessionForm, maxParticipants: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={sessionForm.status}
                  onChange={(e) => setSessionForm({...sessionForm, status: e.target.value})}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                options={employees}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.id})`}
                value={sessionParticipants}
                onChange={(event, newValue) => setSessionParticipants(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Participants"
                    placeholder="Select employees"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSaveSession} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Training Programs Tab */}
      {activeTab === 1 && (
        <TrainingProgramsTab 
          programs={trainingPrograms} 
          handleAddProgram={() => {
            setProgramForm({
              title: '',
              description: '',
              category: '',
              skillLevel: 'beginner',
              duration: '',
              topics: []
            });
            setProgramDialogOpen(true);
          }}
        />
      )}
      
      {/* Trainers Tab */}
      {activeTab === 2 && (
        <TrainersTab 
          trainers={trainers} 
          handleAddTrainer={() => {
            setTrainerForm({
              name: '',
              email: '',
              phone: '',
              specialization: '',
              bio: '',
              qualifications: '',
              ratings: 0,
              imageUrl: '/juniorjoyhr.jpg'
            });
            setTrainerDialogOpen(true);
          }}
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
  getEmployeeById,
  handleAddSession
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Upcoming Training Sessions</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleAddSession()}
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
const TrainingProgramsTab = ({ programs, handleAddProgram }) => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState(programs);
  
  // Get unique categories from programs
  const categories = ['All', ...new Set(programs.map(program => program.category))];
  
  // Handle category filter change
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setCategoryFilter(category);
    filterPrograms(searchQuery, category);
  };
  
  // Handle search query change
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterPrograms(query, categoryFilter);
  };
  
  // Filter programs based on search query and category
  const filterPrograms = (query, category) => {
    let filtered = programs;
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(program => 
        program.name?.toLowerCase().includes(query.toLowerCase()) ||
        program.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category !== 'All') {
      filtered = filtered.filter(program => program.category === category);
    }
    
    setFilteredPrograms(filtered);
  };
  
  // Update filtered programs when programs prop changes
  useEffect(() => {
    setFilteredPrograms(programs);
  }, [programs]);
  
  // Get color for category chip
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Safety': 'error',
      'Technical': 'info',
      'Management': 'success',
      'Soft Skills': 'warning',
      'Compliance': 'secondary',
      'Leadership': 'primary',
      'Security': 'error'
    };
    return categoryColors[category] || 'default';
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">Training Programs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleAddProgram()}
        >
          Add New Program
        </Button>
      </Box>
      
      {/* Filter and Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Training Programs"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredPrograms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="textSecondary">No matching training programs found</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredPrograms.map(program => (
            <Grid item xs={12} sm={6} md={4} key={program.id || program._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: program.category?.includes('Fuel') || program.category === 'Safety' ? '#ff9f0a' : 'primary.main', color: 'white', p: 2 }}>
                  <Typography variant="h6" noWrap>
                    {program.name || program.title}
                  </Typography>
                  <Chip 
                    label={program.category} 
                    size="small" 
                    sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {program.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="primary">Target Audience</Typography>
                      <Typography variant="body2">{program.targetAudience || 'All Employees'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="primary">Duration</Typography>
                      <Typography variant="body2">{program.duration} hours</Typography>
                    </Grid>
                  </Grid>
                  
                  {program.objectives && program.objectives.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="primary">Learning Objectives</Typography>
                      <List dense sx={{ pl: 2 }}>
                        {program.objectives.slice(0, 2).map((objective, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText 
                              primary={<Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Check sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                                {objective}
                              </Typography>} 
                            />
                          </ListItem>
                        ))}
                        {program.objectives.length > 2 && (
                          <ListItem sx={{ py: 0 }}>
                            <ListItemText 
                              primary={<Typography variant="body2" color="text.secondary">
                                +{program.objectives.length - 2} more objectives
                              </Typography>} 
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  )}
                </CardContent>
                
                <Divider />
                
                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                  <Tooltip title="View Material">
                    <IconButton size="small" color="primary">
                      <School fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Box>
                    <Tooltip title="Edit Program">
                      <IconButton size="small" color="primary" sx={{ ml: 1 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Schedule Session">
                      <IconButton size="small" color="secondary" sx={{ ml: 1 }}>
                        <CalendarMonth fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Trainers Tab Component
const TrainersTab = ({ trainers, handleAddTrainer }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Trainers</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleAddTrainer()}
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
