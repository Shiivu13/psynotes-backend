const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const categoryExists = await prisma.category.findUnique({
            where: { name },
        });

        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const slug = slugify(name, { lower: true });
        const category = await prisma.category.create({
            data: { name, slug },
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    const { name } = req.body;

    try {
        const category = await prisma.category.findUnique({
            where: { id: req.params.id },
        });

        if (category) {
            const data = { name: name || category.name };
            if (name) {
                data.slug = slugify(name, { lower: true });
            }

            const updatedCategory = await prisma.category.update({
                where: { id: req.params.id },
                data,
            });
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: req.params.id },
        });

        if (category) {
            await prisma.category.delete({
                where: { id: req.params.id },
            });
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
