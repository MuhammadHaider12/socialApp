const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

// Get all users for suggestions (excluding current user)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Users route called by user:', req.user.id);
    console.log('Querying database for users...');
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name email profilePicture followers following createdAt');
    console.log('Database query completed. Found users:', users.length);
    console.log('Users data:', users.map(u => ({ id: u._id, name: u.name })));
    res.json(users);
  } catch (err) {
    console.error('Error in users route:', err.message);
    res.status(500).send('Server error');
  }
});

// Get current user data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching current user:', err.message);
    res.status(500).send('Server error');
  }
});

// Follow a user - MUST come before /:id route
router.put('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Already following this user' });
    }

    // Add to following list of current user
    currentUser.following.push(req.params.id);
    await currentUser.save();

    // Add to followers list of target user
    userToFollow.followers.push(req.user.id);
    await userToFollow.save();

      // Create notification for followed user
      const Notification = require('../models/Notification');
      await Notification.create({
        user: userToFollow._id,
        type: 'follow',
        fromUser: req.user.id
      });

    res.json({ msg: 'User followed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Unfollow a user
router.put('/unfollow/:id', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!userToUnfollow.followers) userToUnfollow.followers = [];

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );
    await currentUser.save();

    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );
    await userToUnfollow.save();

    res.json({ msg: 'User unfollowed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get followers of a user
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name email');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get following of a user
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name email');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Upload profile/background image to Cloudinary and return URL
// Accepts one file field named "image" and a query parameter "type" which
// should be either "profile" or "background". The frontend can call this
// endpoint independently and then use the returned url when updating the user.
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'social-dashboard'
    });

    // delete local file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Error uploading image:', err.message);
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/update/profile', auth, async (req, res) => {
  try {
    const { name, bio, profilePicture, backgroundPicture } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;
    if (backgroundPicture) user.backgroundPicture = backgroundPicture;

    await user.save();

    res.json({ 
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        backgroundPicture: user.backgroundPicture,
        following: user.following || [],
        followers: user.followers || []
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile - MUST come after specific action routes
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;