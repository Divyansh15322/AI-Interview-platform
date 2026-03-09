const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionNumber: Number,
  question: String,
  answer: { type: String, default: '' },
  timeTaken: { type: Number, default: 0 },
  evaluation: {
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' }
  }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'AI Engineer', 'DevOps Engineer', 'Mobile Developer']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  type: {
    type: String,
    required: true,
    enum: ['Technical', 'HR', 'System Design', 'Behavioral']
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  questions: [questionSchema],
  totalQuestions: {
    type: Number,
    default: 5
  },
  currentQuestion: {
    type: Number,
    default: 0
  },
  score: {
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    problemSolvingScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 }
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    summary: { type: String, default: '' }
  },
  duration: {
    type: Number,
    default: 0
  },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
