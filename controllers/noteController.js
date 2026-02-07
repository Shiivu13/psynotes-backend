const Note = require('../models/Note');

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, content } = req.body;

    try {
        const note = await Note.create({
            title,
            content,
            user: req.user.id,
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
    const { title, content } = req.body;

    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check for user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        note.title = title || note.title;
        note.content = content || note.content;

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check for user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await note.deleteOne();
        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notes (Admin)
// @route   GET /api/notes/all
// @access  Private/Admin
const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({}).populate('user', 'username email').sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNote,
    getNotes,
    getAllNotes,
    updateNote,
    deleteNote,
};
