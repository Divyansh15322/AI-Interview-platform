const express = require('express');
const router = express.Router();
const {
  createInterview, getInterview, submitAnswer,
  completeInterview, getUserInterviews, abandonInterview
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createInterview);
router.get('/', getUserInterviews);
router.get('/:id', getInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);
router.post('/:id/abandon', abandonInterview);

module.exports = router;
