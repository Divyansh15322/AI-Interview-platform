const Interview = require('../models/Interview');
const Report = require('../models/Report');
const User = require('../models/User');

const {
  generateQuestions,
  evaluateAnswer,
  generateFinalReport
} = require('../utils/openai');


/* ==============================
   CREATE INTERVIEW
================================ */

exports.createInterview = async (req, res) => {
  try {

    const { role, difficulty, type, totalQuestions = 5 } = req.body;

    if (!role || !difficulty || !type) {
      return res.status(400).json({
        success: false,
        message: 'Role, difficulty and type are required'
      });
    }

    const aiQuestions = await generateQuestions(
      role,
      difficulty,
      type,
      totalQuestions
    );

    const questions = (Array.isArray(aiQuestions) ? aiQuestions : []).map((q, i) => ({
      questionNumber: i + 1,
      question: q.question || q,
      answer: '',
      timeTaken: 0,
      evaluation: null
    }));

    const interview = await Interview.create({
      userId: req.user._id,
      role,
      difficulty,
      type,
      questions,
      totalQuestions: questions.length
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { interviews: interview._id },
      $inc: { totalInterviews: 1 }
    });

    res.status(201).json({
      success: true,
      interview
    });

  } catch (error) {

    console.error('Create interview error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/* ==============================
   GET INTERVIEW
================================ */

exports.getInterview = async (req, res) => {
  try {

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.json({
      success: true,
      interview
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/* ==============================
   SUBMIT ANSWER
================================ */

exports.submitAnswer = async (req, res) => {
  try {

    const { questionIndex, answer, timeTaken } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview already completed'
      });
    }

    const question = interview.questions[questionIndex];

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question not found'
      });
    }

    const evaluation = await evaluateAnswer(
      question.question,
      answer,
      interview.role,
      interview.difficulty,
      interview.type
    );

    const avgScore = Math.round(
      (evaluation.technicalScore +
        evaluation.communicationScore +
        evaluation.problemSolvingScore) / 3
    );

    interview.questions[questionIndex].answer = answer;
    interview.questions[questionIndex].timeTaken = timeTaken || 0;

    interview.questions[questionIndex].evaluation = {
      score: avgScore,
      feedback: evaluation.feedback
    };

    interview.currentQuestion = questionIndex + 1;

    await interview.save();

    res.json({
      success: true,
      evaluation,
      nextQuestionIndex: questionIndex + 1
    });

  } catch (error) {

    console.error('Submit answer error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/* ==============================
   COMPLETE INTERVIEW
================================ */

exports.completeInterview = async (req, res) => {
  try {

    const { duration } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const finalReport = await generateFinalReport(interview);

    const answered = interview.questions.filter(q => q.evaluation);

    const totalScore = answered.reduce(
      (sum, q) => sum + (q.evaluation?.score || 0),
      0
    );

    const overallScore =
      answered.length > 0
        ? Math.round((totalScore / answered.length) * 10) / 10
        : 0;

    interview.status = 'completed';
    interview.duration = duration || 0;
    interview.completedAt = new Date();

    interview.score = {
      overallScore
    };

    interview.feedback = {
      strengths: finalReport.strengths || [],
      weaknesses: finalReport.weaknesses || [],
      recommendations: finalReport.recommendations || [],
      summary: finalReport.overallSummary || ''
    };

    await interview.save();



    /* ==============================
       CREATE REPORT
    =============================== */

    const report = await Report.create({

      interviewId: interview._id,
      userId: req.user._id,

      role: interview.role,
      difficulty: interview.difficulty,
      type: interview.type,

      scores: {
        overallScore
      },

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



    /* ==============================
       UPDATE USER AVG SCORE
    =============================== */

    const allInterviews = await Interview.find({
      userId: req.user._id,
      status: 'completed'
    });

    const avgScore =
      allInterviews.reduce(
        (sum, i) => sum + (i.score?.overallScore || 0),
        0
      ) / (allInterviews.length || 1);

    await User.findByIdAndUpdate(req.user._id, {
      averageScore: Math.round(avgScore * 10) / 10
    });



    res.json({
      success: true,
      interview,
      report,
      hiringDecision: finalReport.hiringDecision
    });

  } catch (error) {

    console.error('Complete interview error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/* ==============================
   USER INTERVIEW HISTORY
================================ */

exports.getUserInterviews = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const interviews = await Interview.find({
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-questions');

    const total = await Interview.countDocuments({
      userId: req.user._id
    });

    res.json({
      success: true,
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/* ==============================
   ABANDON INTERVIEW
================================ */

exports.abandonInterview = async (req, res) => {
  try {

    await Interview.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        status: 'abandoned'
      }
    );

    res.json({
      success: true,
      message: 'Interview abandoned'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};