const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Admin
const createQuiz = async (req, res) => {
    const { title, description, questions } = req.body;

    try {
        const quiz = await Quiz.create({
            title,
            description,
            questions,
        });

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit a quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
    const { answers } = req.body; // Array of { questionId, answer } or just index?
    // Let's assume an array of answers corresponding to questions index or map.
    // Actually simpler: { questionId: answer } map?
    // Let's assume input is: { answers: { [questionId]: "answer" } } 
    // OR simpler for MVP: Array of answers matching question order? No, risky.
    // Let's go with: body.answers = { questionId: selectedOption }

    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question) => {
            const userAnswer = answers[question._id];
            if (userAnswer === question.correctAnswer) {
                score++;
            }
        });

        const result = await QuizResult.create({
            user: req.user.id,
            quiz: quiz._id,
            score,
            totalQuestions,
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user results
// @route   GET /api/quizzes/results
// @access  Private
const getUserResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ user: req.user.id })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz) {
            await quiz.deleteOne();
            res.json({ message: 'Quiz removed' });
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
const updateQuiz = async (req, res) => {
    const { title, description, questions } = req.body;

    try {
        const quiz = await Quiz.findById(req.params.id);

        if (quiz) {
            quiz.title = title || quiz.title;
            quiz.description = description || quiz.description;
            quiz.questions = questions || quiz.questions;

            const updatedQuiz = await quiz.save();
            res.json(updatedQuiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset user quiz history
// @route   DELETE /api/quizzes/history
// @access  Private
const resetQuizHistory = async (req, res) => {
    try {
        await QuizResult.deleteMany({ user: req.user.id });
        res.json({ message: 'Quiz history reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    getQuizzes,
    getQuizById,
    updateQuiz,
    submitQuiz,
    getUserResults,
    deleteQuiz,
    resetQuizHistory,
};
