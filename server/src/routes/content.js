import express from 'express';
import { Banner, Promotion, Notice, Featured } from '../models/Content.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============

// Get active banners
router.get('/banners', async (req, res) => {
  try {
    const { position } = req.query;
    const now = new Date();
    
    const query = {
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    };
    
    if (position) query.position = position;
    
    const banners = await Banner.find(query).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active notices
router.get('/notices', async (req, res) => {
  try {
    const { position, target } = req.query;
    const now = new Date();
    
    const query = {
      isActive: true,
      $or: [
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    };
    
    if (position) query.position = position;
    if (target) query.target = { $in: [target, 'all'] };
    
    const notices = await Notice.find(query).sort({ priority: -1, createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active promotions
router.get('/promotions', async (req, res) => {
  try {
    const now = new Date();
    
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ createdAt: -1 });
    
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate promotion code
router.post('/promotions/validate', authenticate, async (req, res) => {
  try {
    const { code, orderAmount, itemType } = req.body;
    const now = new Date();
    
    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    if (!promotion) {
      return res.status(404).json({ message: 'Invalid or expired promotion code' });
    }
    
    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ message: 'Promotion code has reached its usage limit' });
    }
    
    // Check minimum order amount
    if (orderAmount < promotion.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount is Rs. ${promotion.minOrderAmount}` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (orderAmount * promotion.discountValue) / 100;
      if (promotion.maxDiscount) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
    } else if (promotion.type === 'fixed') {
      discount = promotion.discountValue;
    }
    
    res.json({
      valid: true,
      promotion: {
        id: promotion._id,
        title: promotion.title,
        type: promotion.type,
        discountValue: promotion.discountValue
      },
      discount,
      finalAmount: orderAmount - discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured sections
router.get('/featured', async (req, res) => {
  try {
    const featured = await Featured.find({ isActive: true })
      .populate('items.product', 'title price images rating')
      .populate('items.service', 'title price priceType images rating')
      .sort({ order: 1 });
    
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ ADMIN ROUTES ============

// --- Banners ---
router.get('/admin/banners', authenticate, authorize('admin'), async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin/banners', authenticate, authorize('admin'), async (req, res) => {
  try {
    const banner = await Banner.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/banners/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/banners/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Promotions ---
router.get('/admin/promotions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin/promotions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const promotion = await Promotion.create({
      ...req.body,
      code: req.body.code?.toUpperCase(),
      createdBy: req.user._id
    });
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/promotions/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id, 
      { ...req.body, code: req.body.code?.toUpperCase() }, 
      { new: true }
    );
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/promotions/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Notices ---
router.get('/admin/notices', authenticate, authorize('admin'), async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin/notices', authenticate, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/notices/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/notices/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Featured ---
router.get('/admin/featured', authenticate, authorize('admin'), async (req, res) => {
  try {
    const featured = await Featured.find()
      .populate('items.product', 'title price images')
      .populate('items.service', 'title price images')
      .populate('createdBy', 'name')
      .sort({ order: 1 });
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin/featured', authenticate, authorize('admin'), async (req, res) => {
  try {
    const featured = await Featured.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/featured/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const featured = await Featured.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(featured);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/featured/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Featured.findByIdAndDelete(req.params.id);
    res.json({ message: 'Featured section deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
