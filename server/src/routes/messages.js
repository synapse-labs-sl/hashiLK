import express from 'express';
import { Message, Conversation } from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', 'name avatar')
      .populate('relatedTo.product', 'title images')
      .populate('relatedTo.service', 'title images')
      .sort({ updatedAt: -1 });
    
    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCount.get(req.user._id.toString()) || 0
    }));
    
    res.json(conversationsWithUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get or create conversation
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { recipientId, productId, serviceId } = req.body;
    
    // Check for existing conversation
    let query = {
      participants: { $all: [req.user._id, recipientId] }
    };
    
    if (productId) query['relatedTo.product'] = productId;
    if (serviceId) query['relatedTo.service'] = serviceId;
    
    let conversation = await Conversation.findOne(query);
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        relatedTo: {
          type: productId ? 'product' : serviceId ? 'service' : 'general',
          product: productId,
          service: serviceId
        }
      });
    }
    
    await conversation.populate('participants', 'name avatar');
    await conversation.populate('relatedTo.product', 'title images price');
    await conversation.populate('relatedTo.service', 'title images price');
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages in a conversation
router.get('/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversation._id, 
        sender: { $ne: req.user._id },
        readAt: null 
      },
      { readAt: new Date() }
    );
    
    // Reset unread count
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();
    
    res.json({ messages: messages.reverse(), conversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { content, attachments } = req.body;
    
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content,
      attachments
    });
    
    // Update conversation
    conversation.lastMessage = {
      content,
      sender: req.user._id,
      createdAt: new Date()
    };
    
    // Increment unread count for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(participantId.toString(), currentCount + 1);
      }
    });
    
    await conversation.save();
    await message.populate('sender', 'name avatar');
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    });
    
    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount.get(req.user._id.toString()) || 0;
    });
    
    res.json({ unreadCount: totalUnread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete conversation (soft delete)
router.delete('/conversations/:conversationId', authenticate, async (req, res) => {
  try {
    await Conversation.findOneAndUpdate(
      { _id: req.params.conversationId, participants: req.user._id },
      { isActive: false }
    );
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
