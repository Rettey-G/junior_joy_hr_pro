import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, Button, Card, CardContent,
  Grid, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { PictureAsPdf, Download } from '@mui/icons-material';
import { hierarchy, tree } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { linkVertical } from 'd3-shape';
import api from '../services/api';

const OrgChart = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [department, setDepartment] = useState('');
  const svgRef = useRef(null);

  // Fetch employees data
  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Transform employee data into hierarchical structure
  const prepareOrgData = () => {
    if (!employees.length) return null;
    
    // Filter by department if selected
    let filteredEmployees = employees;
    if (department) {
      filteredEmployees = employees.filter(emp => emp.department === department);
    }
    
    // Find department heads (assume employees with 'Manager' or 'Head' in designation)
    const isHead = (designation) => {
      return designation && (
        designation.includes('Manager') || 
        designation.includes('Head') || 
        designation.includes('Director') ||
        designation.includes('Chief') ||
        designation.includes('CEO') ||
        designation.includes('CTO')
      );
    };
    
    // Get all departments
    const departments = [...new Set(filteredEmployees.map(emp => emp.department))];
    
    // Create root node
    const rootNode = {
      name: "Organization",
      id: "root",
      children: []
    };
    
    // Add department nodes
    departments.forEach(dept => {
      const deptEmployees = filteredEmployees.filter(emp => emp.department === dept);
      
      // Find department head
      const deptHead = deptEmployees.find(emp => isHead(emp.designation));
      
      // Create department node
      const deptNode = {
        name: dept,
        id: `dept-${dept}`,
        children: []
      };
      
      // Add department head as first child
      if (deptHead) {
        deptNode.children.push({
          name: deptHead.name,
          id: deptHead.empNo,
          title: deptHead.designation,
          department: deptHead.department,
          image: deptHead.image || '',
          children: []
        });
        
        // Add other employees of this department as children of the head
        deptEmployees
          .filter(emp => emp.empNo !== deptHead.empNo)
          .forEach(emp => {
            deptNode.children[0].children.push({
              name: emp.name,
              id: emp.empNo,
              title: emp.designation,
              department: emp.department,
              image: emp.image || ''
            });
          });
      } else {
        // If no department head, add all employees directly under department
        deptEmployees.forEach(emp => {
          deptNode.children.push({
            name: emp.name,
            id: emp.empNo,
            title: emp.designation,
            department: emp.department,
            image: emp.image || ''
          });
        });
      }
      
      rootNode.children.push(deptNode);
    });
    
    return rootNode;
  };

  // Render org chart using D3
  const renderOrgChart = () => {
    if (!svgRef.current) return;
    
    const data = prepareOrgData();
    if (!data) return;
    
    const svg = select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart
    
    const width = 1200;
    const height = 800;
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, 50)`);
    
    const treeLayout = tree()
      .size([width - 200, height - 100])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));
    
    const root = hierarchy(data);
    
    // Set fixed depth for first level children (departments)
    root.children.forEach(child => {
      child.depth = 1;
      child.y = 100; // Fixed vertical position for departments
    });
    
    const nodes = treeLayout(root);
    
    // Create links
    const linkGenerator = linkVertical()
      .x(d => d.x)
      .y(d => d.y);
    
    g.selectAll(".link")
      .data(nodes.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", linkGenerator)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5);
    
    // Create nodes
    const node = g.selectAll(".node")
      .data(nodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Add node rectangles
    node.append("rect")
      .attr("width", d => {
        // Root node (Organization)
        if (d.depth === 0) return 150;
        // Department nodes
        if (d.depth === 1) return 140;
        // Employee nodes
        return 120;
      })
      .attr("height", d => {
        // Root node (Organization)
        if (d.depth === 0) return 60;
        // Department nodes
        if (d.depth === 1) return 50;
        // Employee nodes
        return d.data.title ? 80 : 60;
      })
      .attr("x", d => {
        // Root node (Organization)
        if (d.depth === 0) return -75;
        // Department nodes
        if (d.depth === 1) return -70;
        // Employee nodes
        return -60;
      })
      .attr("y", d => {
        // Root node (Organization)
        if (d.depth === 0) return -30;
        // Department nodes
        if (d.depth === 1) return -25;
        // Employee nodes
        return d.data.title ? -40 : -30;
      })
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", d => {
        // Root node (Organization)
        if (d.depth === 0) return "#34568B"; // Blue
        // Department nodes
        if (d.depth === 1) return "#6B5B95"; // Purple
        // Employee nodes
        return d.data.title && (
          d.data.title.includes('Manager') || 
          d.data.title.includes('Head') || 
          d.data.title.includes('Director') ||
          d.data.title.includes('Chief')
        ) ? "#FF6F61" : "#88B04B"; // Orange for managers, green for others
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    
    // Add node text (names)
    node.append("text")
      .attr("dy", d => {
        // Root node (Organization)
        if (d.depth === 0) return -5;
        // Department nodes
        if (d.depth === 1) return -5;
        // Employee nodes
        return -15;
      })
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => d.data.name)
      .style("font-size", d => {
        // Root node (Organization)
        if (d.depth === 0) return "14px";
        // Department nodes
        if (d.depth === 1) return "12px";
        // Employee nodes
        return "11px";
      })
      .style("font-weight", d => (d.depth <= 1 ? "bold" : "normal"));
    
    // Add titles for employee nodes
    node.filter(d => d.data.title)
      .append("text")
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => d.data.title)
      .style("font-size", "9px")
      .style("font-style", "italic");
    
    // Add department for employee nodes
    node.filter(d => d.data.department && d.depth > 1)
      .append("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text(d => d.data.department)
      .style("font-size", "8px");
  };

  // Render chart when employees data changes
  useEffect(() => {
    if (!loading && employees.length > 0) {
      renderOrgChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, employees, department]);

  // Get unique departments for filtering
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Organization Chart</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Department</InputLabel>
              <Select
                value={department}
                label="Filter by Department"
                onChange={(e) => setDepartment(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                disabled={loading || !employees.length}
              >
                Export as PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                disabled={loading || !employees.length}
              >
                Download as Image
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Employees
              </Typography>
              <Typography variant="h4">
                {employees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Departments
              </Typography>
              <Typography variant="h4">
                {departments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Managers
              </Typography>
              <Typography variant="h4">
                {employees.filter(emp => 
                  emp.designation && (
                    emp.designation.includes('Manager') || 
                    emp.designation.includes('Head') || 
                    emp.designation.includes('Director') ||
                    emp.designation.includes('Chief')
                  )
                ).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Avg. Team Size
              </Typography>
              <Typography variant="h4">
                {departments.length ? Math.round(employees.length / departments.length) : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Organization Chart */}
      <Paper sx={{ p: 2, overflowX: 'auto', backgroundColor: '#f5f5f5' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : employees.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <Typography>No employee data available to create organization chart</Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '800px', overflowX: 'auto' }}>
            <svg ref={svgRef} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OrgChart;
