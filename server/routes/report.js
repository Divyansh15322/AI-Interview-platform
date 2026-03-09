// routes/report.js
const express = require('express');
const router = express.Router();
const { getReport, getUserReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', getUserReports);
router.get('/:interviewId', getReport);
module.exports = router;
