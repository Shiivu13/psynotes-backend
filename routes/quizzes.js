const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const BlogPost = require('../models/BlogPost');

// Create a quiz for a blog post (Admin only)
router.post('/:blog_id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Authorization denied. Admin only.' });
    }

    const { questions } = req.body;

    try {
        let blogPost = await BlogPost.findById(req.params.blog_id);

        if (!blogPost) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        const newQuiz = new Quiz({
            blogPost: req.params.blog_id,
            questions
        });

        const quiz = await newQuiz.save();
        res.json(quiz);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get quiz by blog post ID
router.get('/:blog_id', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ blogPost: req.params.blog_id });

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found for this blog post' });
        }

        res.json(quiz);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Submit quiz answers and get score
router.post('/:blog_id/submit', auth, async (req, res) => {
    const { answers } = req.body; // answers will be an array of { questionId, selectedOptionId }

    try {
        const quiz = await Quiz.findOne({ blogPost: req.params.blog_id });

        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found for this blog post' });
        }

        let score = 0;
        let totalQuestions = quiz.questions.length;

        quiz.questions.forEach(q => {
            const userAnswer = answers.find(ans => ans.questionId === q._id.toString());
            if (userAnswer) {
                const correctOption = q.options.find(opt => opt.isCorrect === true);
                if (correctOption && correctOption._id.toString() === userAnswer.selectedOptionId) {
                    score++;
                }
            }
        });

        res.json({ score, totalQuestions });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
