const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Send a message
router.post('/:userId', auth, async (req, res) => {
  try {
    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: req.params.userId,
      text: req.body.text
    });
    res.json(newMessage);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
