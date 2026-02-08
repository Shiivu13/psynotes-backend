const prisma = require('../utils/prismaClient');

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
    const { title, content, image, category } = req.body;

    try {
        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                image,
                categoryId: category,
                authorId: req.user.id,
            },
        });

        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
    const { category } = req.query;

    try {
        const where = {};
        if (category) {
            where.categoryId = category;
        }

        const blogs = await prisma.blog.findMany({
            where,
            include: {
                category: {
                    select: { name: true, slug: true }
                },
                author: {
                    select: { username: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: req.params.id },
            include: {
                category: {
                    select: { name: true, slug: true }
                },
                author: {
                    select: { username: true }
                }
            },
        });

        if (blog) {
            res.json(blog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
    const { title, content, image, category } = req.body;

    try {
        const blog = await prisma.blog.findUnique({
            where: { id: req.params.id },
        });

        if (blog) {
            const updatedBlog = await prisma.blog.update({
                where: { id: req.params.id },
                data: {
                    title: title || blog.title,
                    content: content || blog.content,
                    image: image || blog.image,
                    categoryId: category || blog.categoryId,
                },
            });
            res.json(updatedBlog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
    try {
        const blog = await prisma.blog.findUnique({
            where: { id: req.params.id },
        });

        if (blog) {
            await prisma.blog.delete({
                where: { id: req.params.id },
            });
            res.json({ message: 'Blog removed' });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
};
