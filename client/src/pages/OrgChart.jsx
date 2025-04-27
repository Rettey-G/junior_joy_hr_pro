import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from '@emotion/styled';
import axios from 'axios';

const StyledNode = styled(Paper)`
  padding: 16px;
  border-radius: 8px;
  min-width: 200px;
  display: inline-block;
  text-align: center;
  background-color: ${props => {
    switch (props.level) {
      case 1: return '#2196f3'; // Managing Director - Blue
      case 2: return '#4caf50'; // C-Level & Chiefs - Green
      case 3: return '#ff9800'; // Managers - Orange
      case 4: return '#9c27b0'; // Mid-Level - Purple
      case 5: return '#f5f5f5'; // Staff - Light Gray
      default: return '#ffffff';
    }
  }};
  color: ${props => props.level === 5 ? '#000000' : '#ffffff'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const OrgChart = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process and organize the employee data
      const processedData = response.data.map(emp => ({
        ...emp,
        level: determineLevel(emp.designation)
      }));
      
      setEmployeeData(processedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load organization chart');
      setLoading(false);
    }
  };

  const determineLevel = (designation) => {
    const lowerDesignation = designation.toLowerCase();
    if (lowerDesignation.includes('managing director')) return 1;
    if (lowerDesignation.includes('chief') || lowerDesignation.includes('legal officer')) return 2;
    if (lowerDesignation.includes('manager') || lowerDesignation.includes('engineer')) return 3;
    if (lowerDesignation.includes('captain') || lowerDesignation.includes('executive') || 
        lowerDesignation.includes('accountant') || lowerDesignation.includes('admin')) return 4;
    return 5; // All other positions
  };

  const renderOrgNode = (employee) => (
    <StyledNode level={employee.level}>
      <Typography variant="subtitle1" fontWeight="bold">
        {employee.name}
      </Typography>
      <Typography variant="body2">
        {employee.designation}
      </Typography>
      <Typography variant="caption" color={employee.level === 5 ? 'text.secondary' : 'rgba(255,255,255,0.7)'}>
        {employee.workSite}
      </Typography>
    </StyledNode>
  );

  const buildHierarchy = () => {
    const md = employeeData.find(emp => emp.level === 1);
    if (!md) return null;

    const level2 = employeeData.filter(emp => emp.level === 2);
    const level3 = employeeData.filter(emp => emp.level === 3);
    const level4 = employeeData.filter(emp => emp.level === 4);
    const level5 = employeeData.filter(emp => emp.level === 5);

    return (
      <Tree
        lineWidth={'2px'}
        lineColor={'#bdbdbd'}
        lineBorderRadius={'10px'}
        label={renderOrgNode(md)}
      >
        {level2.map(l2Emp => (
          <TreeNode key={l2Emp.empNo} label={renderOrgNode(l2Emp)}>
            {level3
              .filter(l3Emp => determineReportsTo(l3Emp, l2Emp))
              .map(l3Emp => (
                <TreeNode key={l3Emp.empNo} label={renderOrgNode(l3Emp)}>
                  {level4
                    .filter(l4Emp => determineReportsTo(l4Emp, l3Emp))
                    .map(l4Emp => (
                      <TreeNode key={l4Emp.empNo} label={renderOrgNode(l4Emp)}>
                        {level5
                          .filter(l5Emp => determineReportsTo(l5Emp, l4Emp))
                          .map(l5Emp => (
                            <TreeNode key={l5Emp.empNo} label={renderOrgNode(l5Emp)} />
                          ))}
                      </TreeNode>
                    ))}
                </TreeNode>
              ))}
          </TreeNode>
        ))}
      </Tree>
    );
  };

  const determineReportsTo = (employee, manager) => {
    // Enhanced logic to determine reporting structure
    if (employee.workSite === manager.workSite) {
      // Same worksite, check designation hierarchy
      if (manager.designation.includes('Chief') && 
          (employee.designation.includes('Manager') || 
           employee.designation.includes('Engineer'))) {
        return true;
      }
      if (manager.designation.includes('Manager') && 
          (employee.designation.includes('Executive') || 
           employee.designation.includes('Officer'))) {
        return true;
      }
    }
    
    // Special cases for vessel hierarchy
    if (manager.designation.includes('Chief Officer') && 
        employee.workSite.includes('Express')) {
      return true;
    }
    if (manager.designation.includes('Captain') && 
        employee.designation.includes('Crew')) {
      return employee.workSite === manager.workSite;
    }
    
    return false;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 3,
      overflowX: 'auto',
      minWidth: '100%',
      '& .MuiPaper-root': {
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    }}>
      <Typography variant="h4" gutterBottom>
        Organization Chart
      </Typography>
      <Box sx={{ 
        mt: 4,
        display: 'flex',
        justifyContent: 'center',
        '& > div': { minWidth: 'fit-content' }
      }}>
        {buildHierarchy()}
      </Box>
    </Box>
  );
};

export default OrgChart; 