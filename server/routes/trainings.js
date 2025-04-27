const express = require('express');
const router = express.Router();
const Training = require('../models/Training');
const auth = require('../middleware/auth');

// GET all trainers
router.get('/trainers', auth, async (req, res) => {
  try {
    const trainers = await Training.distinct('trainer');
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all training programs
router.get('/programs', auth, async (req, res) => {
  try {
    const trainings = await Training.find({}).sort({ startDate: -1 });
    res.json(trainings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET training sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (department) query.department = department;
    
    const sessions = await Training.find(query)
      .populate('participants', 'name department')
      .sort({ startDate: -1 });
    
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single training by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('participants', 'name department');
    
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }
    
    res.json(training);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new training
router.post('/', auth, async (req, res) => {
  try {
    const training = new Training(req.body);
    await training.save();
    res.status(201).json(training);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update training
router.put('/:id', auth, async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }
    
    res.json(training);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE training
router.delete('/:id', auth, async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }
    
    res.json({ message: 'Training deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add feedback to training
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    
    if (!training) {
      return res.status(404).json({ error: 'Training not found' });
    }
    
    training.feedback.push(req.body);
    await training.save();
    
    res.status(201).json(training);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 