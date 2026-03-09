const User = require('../models/User');
const Interview = require('../models/Interview');
const Report = require('../models/Report');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalInterviews, completedInterviews, reports] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Interview.countDocuments(),
      Interview.countDocuments({ status: 'completed' }),
      Report.countDocuments()
    ]);

    const recentInterviews = await Interview.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('role difficulty type score completedAt');

    const roleStats = await Interview.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const avgScoreResult = await Report.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$scores.overallScore' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalInterviews,
        completedInterviews,
        totalReports: reports,
        completionRate: totalInterviews ? Math.round((completedInterviews / totalInterviews) * 100) : 0,
        avgOverallScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0,
        roleStats,
        recentInterviews
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');
    const total = await User.countDocuments({ role: 'user' });
    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Interview.deleteMany({ userId: req.params.id }),
      Report.deleteMany({ userId: req.params.id })
    ]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name email')
      .select('-questions');
    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
