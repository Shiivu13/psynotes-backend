const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

// Create a blog post (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Authorization denied. Admin only.' });
    }

    const { title, content, tags } = req.body;

    try {
        const newBlogPost = new BlogPost({
            title,
            content,
            author: req.user.id,
            tags: tags.split(',').map(tag => tag.trim())
        });

        const blogPost = await newBlogPost.save();
        res.json(blogPost);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const blogPosts = await BlogPost.find().populate('author', ['username']);
        res.json(blogPosts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get blog post by ID
router.get('/:id', async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id).populate('author', ['username']);

        if (!blogPost) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        res.json(blogPost);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a blog post (Admin only)
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Authorization denied. Admin only.' });
    }

    const { title, content, tags } = req.body;

    try {
        let blogPost = await BlogPost.findById(req.params.id);

        if (!blogPost) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        // Make sure user owns blog post (optional, as it's admin only here)
        if (blogPost.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        blogPost = await BlogPost.findByIdAndUpdate(
            req.params.id,
            { $set: { title, content, tags: tags.split(',').map(tag => tag.trim()) } },
            { new: true }
        );

        res.json(blogPost);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a blog post (Admin only)
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Authorization denied. Admin only.' });
    }

    try {
        const blogPost = await BlogPost.findById(req.params.id);

        if (!blogPost) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        // Make sure user owns blog post (optional, as it's admin only here)
        if (blogPost.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await BlogPost.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Blog post removed' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a comment to a blog post
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.id);

        if (!blogPost) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        const newComment = {
            user: req.user.id,
            text: req.body.text
        };

        blogPost.comments.unshift(newComment);

        await blogPost.save();

        res.json(blogPost.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a comment from a blog post
router.delete('/:blog_id/comments/:comment_id', auth, async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.blog_id);

        if (!blogPost) {
            return res.status(404).json({ msg: 'Blog post not found' });
        }

        // Pull out comment
        const comment = blogPost.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        // Make sure user owns comment or is admin
        if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Get remove index
        const removeIndex = blogPost.comments
            .map((comment) => comment.user.toString())
            .indexOf(req.user.id);

        blogPost.comments.splice(removeIndex, 1);

        await blogPost.save();

        res.json(blogPost.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
