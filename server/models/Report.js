const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: String,
  difficulty: String,
  type: String,
  scores: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number
  },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  aiFeedback: String,
  questionBreakdown: [{
    question: String,
    answer: String,
    score: Number,
    feedback: String
  }],
  duration: Number,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
