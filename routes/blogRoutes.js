const express = require('express');
const router = express.Router();
const {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, createBlog)
    .get(getBlogs);

router.route('/:id')
    .get(getBlogById)
    .put(protect, admin, updateBlog)
    .delete(protect, admin, deleteBlog);

module.exports = router;
