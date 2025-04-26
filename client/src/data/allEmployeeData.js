// Master employee data file for Junior Joy HR Pro
// Last updated: April 26, 2025
// Consolidates all employee data into a single file

import employeeData1 from './employeeData';
import employeeData2 from './employeeData2';
import employeeData3 from './employeeData3';
import employeeData4 from './employeeData4';
import employeeData5 from './employeeData5';

// Combine all employee data parts
const allEmployeeData = [
  ...employeeData1,
  ...employeeData2,
  ...employeeData3,
  ...employeeData4,
  ...employeeData5
];

// Ensure all employees have a unique ID and image field for display
const processedEmployeeData = allEmployeeData.map(employee => ({
  ...employee,
  _id: employee.empNo, // Use empNo as _id for compatibility with existing code
  image: '', // Default empty image
  joinedDate: employee.joinedDate || '', // Ensure joinedDate exists
}));

export default processedEmployeeData;
