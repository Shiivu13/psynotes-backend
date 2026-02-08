const prisma = require('../utils/prismaClient');

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
    const { title, content } = req.body;

    try {
        const note = await prisma.note.create({
            data: {
                title,
                content,
                userId: req.user.id,
            },
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
        const notes = await prisma.note.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
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
        const note = await prisma.note.findUnique({
            where: { id: req.params.id },
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check for user
        if (note.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedNote = await prisma.note.update({
            where: { id: req.params.id },
            data: {
                title: title || note.title,
                content: content || note.content,
            },
        });

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
        const note = await prisma.note.findUnique({
            where: { id: req.params.id },
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check for user
        if (note.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await prisma.note.delete({
            where: { id: req.params.id },
        });

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
        const notes = await prisma.note.findMany({
            include: {
                user: {
                    select: { username: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
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
