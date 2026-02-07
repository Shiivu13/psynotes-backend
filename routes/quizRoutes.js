const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    submitQuiz,
    getUserResults,
    deleteQuiz,
    resetQuizHistory,
} = require('../controllers/quizController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createQuiz)
    .get(getQuizzes);

router.route('/results')
    .get(protect, getUserResults);

router.route('/history')
    .delete(protect, resetQuizHistory);

router.route('/:id')
    .get(getQuizById)
    .delete(protect, admin, deleteQuiz)
    .put(protect, admin, updateQuiz);

router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
