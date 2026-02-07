const express = require('express');
const router = express.Router();
const {
    createNote,
    getNotes,
    getAllNotes,
    updateNote,
    deleteNote,
} = require('../controllers/noteController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/all', protect, admin, getAllNotes);

router.route('/')
    .post(protect, createNote)
    .get(protect, getNotes);

router.route('/:id')
    .put(protect, updateNote)
    .delete(protect, deleteNote);

module.exports = router;
