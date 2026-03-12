const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const Post = require('../models/Post');
const fs = require('fs');

// Get all posts (from followed users + own posts)
router.get('/', auth, async (req, res) => {
  try {
    const currentUser = await require('../models/User').findById(req.user.id);

    // Get posts from current user and followed users
    const followingIds = (currentUser.following || []).map(id => id.toString());
    followingIds.push(req.user.id); // Include own posts

    const posts = await Post.find({ user: { $in: followingIds } })
      .populate('user', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name')
      .populate('comments.user', 'name');
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server error');
  }
});

// Create post with image
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    let imagePublicId = null;

    // Upload image to Cloudinary if exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'social-dashboard'
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
      
      // Delete file from local uploads
      fs.unlinkSync(req.file.path);
    }

    const newPost = new Post({
      content: req.body.content,
      image: imageUrl,
      imagePublicId: imagePublicId,
      user: req.user.id
    });

    const post = await newPost.save();
    await post.populate('user', 'name');
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Like/Unlike post
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      // User hasn't liked this post yet
      post.likes.push(req.user.id);
      // Create notification for post owner
      if (post.user.toString() !== req.user.id) {
        const Notification = require('../models/Notification');
        await Notification.create({
          user: post.user,
          type: 'like',
          fromUser: req.user.id,
          post: post._id
        });
      }
    } else {
      // User already liked this post, remove the like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server error');
  }
          // Create notification for post owner
          if (post.user.toString() !== req.user.id) {
            const Notification = require('../models/Notification');
            await Notification.create({
              user: post.user,
              type: 'comment',
              fromUser: req.user.id,
              post: post._id,
              message: req.body.text
            });
          }
});

// Add comment to post
router.post('/comment/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    const newComment = {
      user: req.user.id,
      text: req.body.text,
      createdAt: Date.now()
    };

    post.comments.unshift(newComment);
    await post.save();
    
    // Populate user info for the new comment
    await post.populate('comments.user', 'name');
    
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server error');
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this post' });
    }

    // Delete image from Cloudinary if exists
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
    }

    // Remove likes and comments from other users
    // Since likes and comments are stored in the post document, deleting the post removes them from all users
    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Post not found' });
    res.status(500).send('Server error');
  }
});

module.exports = router;