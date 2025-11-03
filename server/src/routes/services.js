import express from 'express';
import Service from '../models/Service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    const query = { status: 'approved' };
    
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    
    const services = await Service.find(query)
      .populate('provider', 'name sellerInfo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Service.countDocuments(query);
    
    res.json({
      services,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name sellerInfo phone');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    service.views += 1;
    await service.save();
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create service
router.post('/', authenticate, async (req, res) => {
  try {
    const service = await Service.create({
      ...req.body,
      provider: req.user._id,
      commissionRate: process.env.SERVICE_COMMISSION_RATE || 15
    });
    
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service
router.put('/:id', authenticate, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    Object.assign(service, req.body);
    await service.save();
    
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
