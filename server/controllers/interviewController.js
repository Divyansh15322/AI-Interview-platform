const Interview = require('../models/Interview');
const Report = require('../models/Report');
const User = require('../models/User');
const { generateQuestions, evaluateAnswer, generateFinalReport } = require('../utils/openai');

exports.createInterview = async (req, res) => {
  try {
    const { role, difficulty, type, totalQuestions = 5 } = req.body;
    if (!role || !difficulty || !type) {
      return res.status(400).json({ success: false, message: 'Role, difficulty, and type are required' });
    }

    // Generate questions via AI
    const aiQuestions = await generateQuestions(role, difficulty, type, totalQuestions);
    const questions = Array.isArray(aiQuestions) 
      ? aiQuestions.map((q, i) => ({ questionNumber: i + 1, question: q.question || q, answer: '', timeTaken: 0 }))
      : [];

    const interview = await Interview.create({
      userId: req.user._id,
      role, difficulty, type,
      questions,
      totalQuestions: questions.length
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { interviews: interview._id },
      $inc: { totalInterviews: 1 }
    });

    res.status(201).json({ success: true, interview });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, interview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { questionIndex, answer, timeTaken } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Interview already completed' });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question not found' });
    }

    // Evaluate answer with AI
    const evaluation = await evaluateAnswer(
      question.question, answer,
      interview.role, interview.difficulty, interview.type
    );

    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].timeTaken = timeTaken || 0;
    interview.questions[questionIndex].evaluation = {
      score: Math.round((evaluation.technicalScore + evaluation.communicationScore + evaluation.problemSolvingScore) / 3),
      feedback: evaluation.feedback
    };
    interview.currentQuestion = questionIndex + 1;
    await interview.save();

    res.json({ success: true, evaluation, nextQuestionIndex: questionIndex + 1 });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const { duration } = req.body;
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    // Generate final report
    const finalReport = await generateFinalReport(interview);

    // Calculate aggregate scores
    const answeredQuestions = interview.questions.filter(q => q.answer);
    let totalTech = 0, totalComm = 0, totalPS = 0;

    for (const q of interview.questions) {
      if (q.evaluation) {
        totalTech += q.evaluation.score || 0;
        totalComm += q.evaluation.score || 0;
        totalPS += q.evaluation.score || 0;
      }
    }

    const count = answeredQuestions.length || 1;
    const technicalScore = Math.min(10, Math.round((totalTech / count) * 10) / 10);
    const communicationScore = Math.min(10, Math.round((totalComm / count) * 10) / 10);
    const problemSolvingScore = Math.min(10, Math.round((totalPS / count) * 10) / 10);
    const overallScore = Math.round((technicalScore + communicationScore + problemSolvingScore) / 3 * 10) / 10;

    interview.status = 'completed';
    interview.duration = duration || 0;
    interview.completedAt = new Date();
    interview.score = { technicalScore, communicationScore, problemSolvingScore, overallScore };
    interview.feedback = {
      strengths: finalReport.strengths || [],
      weaknesses: finalReport.weaknesses || [],
      recommendations: finalReport.recommendations || [],
      summary: finalReport.overallSummary || ''
    };
    await interview.save();

    // Create report
    const report = await Report.create({
      interviewId: interview._id,
      userId: req.user._id,
      role: interview.role,
      difficulty: interview.difficulty,
      type: interview.type,
      scores: { technicalScore, communicationScore, problemSolvingScore, overallScore },
      strengths: finalReport.strengths || [],
      weaknesses: finalReport.weaknesses || [],
      recommendations: finalReport.recommendations || [],
      aiFeedback: finalReport.overallSummary || '',
      questionBreakdown: interview.questions.map(q => ({
        question: q.question,
        answer: q.answer,
        score: q.evaluation?.score || 0,
        feedback: q.evaluation?.feedback || ''
      })),
      duration: duration || 0,
      completedAt: new Date()
    });

    // Update user average score
    const user = await User.findById(req.user._id);
    const allInterviews = await Interview.find({ userId: req.user._id, status: 'completed' });
    const avgScore = allInterviews.reduce((sum, i) => sum + (i.score?.overallScore || 0), 0) / allInterviews.length;
    await User.findByIdAndUpdate(req.user._id, { averageScore: Math.round(avgScore * 10) / 10 });

    res.json({ success: true, interview, report, hiringDecision: finalReport.hiringDecision });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserInterviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-questions');

    const total = await Interview.countDocuments({ userId: req.user._id });
    res.json({ success: true, interviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.abandonInterview = async (req, res) => {
  try {
    await Interview.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'abandoned' }
    );
    res.json({ success: true, message: 'Interview abandoned' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
