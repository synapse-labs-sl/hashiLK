import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'address', 'language', 'sellerInfo'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    Object.assign(req.user, updates);
    await req.user.save();
    
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Become a seller
router.post('/become-seller', authenticate, async (req, res) => {
  try {
    req.user.isSeller = true;
    req.user.role = 'seller';
    req.user.sellerInfo = {
      ...req.user.sellerInfo,
      ...req.body.sellerInfo
    };
    await req.user.save();
    
    // Return user without password
    const userResponse = req.user.toObject();
    delete userResponse.password;
    
    res.json({ message: 'Successfully registered as seller', user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller dashboard
router.get('/seller/dashboard', authenticate, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    const services = await Service.find({ provider: req.user._id });
    
    res.json({ products, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get buyer orders
router.get('/orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
