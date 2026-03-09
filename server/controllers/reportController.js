const Report = require('../models/Report');

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      interviewId: req.params.interviewId,
      userId: req.user._id
    }).populate('interviewId', 'role difficulty type questions duration completedAt');
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questionBreakdown');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
