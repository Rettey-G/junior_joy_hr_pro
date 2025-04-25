const mongoose = require('mongoose');
const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  department: String,
  salary: Number,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
});
module.exports = mongoose.model('Employee', EmployeeSchema);
