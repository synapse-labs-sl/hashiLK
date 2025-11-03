import express from 'express';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin role
router.use(authenticate, authorize('admin'));

// Get pending products
router.get('/products/pending', async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' }).populate('seller', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject product
router.patch('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending services
router.get('/services/pending', async (req, res) => {
  try {
    const services = await Service.find({ status: 'pending' }).populate('provider', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/reject service
router.patch('/services/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
