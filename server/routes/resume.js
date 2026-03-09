const express = require('express');
const router = express.Router();
const { analyzeResume, uploadMiddleware } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
router.post('/analyze', protect, uploadMiddleware, analyzeResume);
module.exports = router;
