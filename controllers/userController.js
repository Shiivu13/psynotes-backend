const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // Fetch all users and manually exclude passwords
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const usersWithoutPassword = users.map(user => {
            const { password, ...userParts } = user;
            return userParts;
        });

        res.json(usersWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
        });

        if (user) {
            await prisma.user.delete({
                where: { id: req.params.id },
            });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (user) {
            let hashedPassword = user.password;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    username: req.body.username || user.username,
                    password: hashedPassword,
                },
            });

            res.json({
                _id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser.id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    deleteUser,
    updateUserProfile,
};
