const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Get conversations for current user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name profilePicture');
    res.json(conversations);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get conversation with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, req.params.userId] }
    }).populate('participants', 'name profilePicture');
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, req.params.userId],
        messages: []
      });
      await conversation.populate('participants', 'name profilePicture');
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Send a message in a conversation
router.post('/:userId', auth, async (req, res) => {
  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, req.params.userId] }
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, req.params.userId],
        messages: []
      });
    }
    conversation.messages.push({ sender: req.user.id, text: req.body.text });
    await conversation.save();
    res.json(conversation);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
