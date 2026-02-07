const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: String, // Storing the correct option text or index. Let's use text for clarity.
        required: true,
    },
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    questions: [questionSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
