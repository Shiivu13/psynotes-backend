const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Admin
const createQuiz = async (req, res) => {
    const { title, description, questions } = req.body;

    try {
        // questions should be an array of objects { questionText, options, correctAnswer }
        const formattedQuestions = questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer
        }));

        const quiz = await prisma.quiz.create({
            data: {
                title,
                description,
                questions: {
                    create: formattedQuestions
                }
            },
            include: {
                questions: true
            }
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
        const quizzes = await prisma.quiz.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                questions: true // Optional: include questions in list view? Maybe just count?
            }
        });
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
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.id },
            include: {
                questions: true
            }
        });

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
    const { answers } = req.body;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.id },
            include: { questions: true }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;

        quiz.questions.forEach((question) => {
            const userAnswer = answers[question.id];
            if (userAnswer === question.correctAnswer) {
                score++;
            }
        });

        const result = await prisma.quizResult.create({
            data: {
                userId: req.user.id,
                quizId: quiz.id,
                score,
                totalQuestions,
            }
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
        const results = await prisma.quizResult.findMany({
            where: { userId: req.user.id },
            include: {
                quiz: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
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
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.id }
        });

        if (quiz) {
            await prisma.quiz.delete({
                where: { id: req.params.id }
            });
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
        const quiz = await prisma.quiz.findUnique({
            where: { id: req.params.id }
        });

        if (quiz) {
            // For updates, the simplest strategy for questions is replace all:
            // 1. Delete all existing questions for this quiz
            // 2. Create new ones
            // Note: Use transaction for safety used to be best, but nested update is easier.

            const formattedQuestions = questions ? questions.map(q => ({
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer
            })) : [];

            const updatedQuiz = await prisma.quiz.update({
                where: { id: req.params.id },
                data: {
                    title: title || quiz.title,
                    description: description || quiz.description,
                    questions: questions ? {
                        deleteMany: {},
                        create: formattedQuestions
                    } : undefined
                },
                include: { questions: true }
            });

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
        await prisma.quizResult.deleteMany({
            where: { userId: req.user.id }
        });
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
