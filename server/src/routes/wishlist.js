import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product', 'title price images status stock')
      .populate('services.service', 'title price priceType images status');
    
    if (!wishlist) {
      wishlist = { products: [], services: [] };
    }
    
    // Filter out deleted/rejected items and add price drop info
    const products = wishlist.products
      .filter(p => p.product && p.product.status === 'approved')
      .map(p => ({
        ...p.product.toObject(),
        addedAt: p.addedAt,
        priceDropped: p.product.price < p.priceWhenAdded,
        priceDrop: p.priceWhenAdded - p.product.price
      }));
    
    const services = wishlist.services
      .filter(s => s.service && s.service.status === 'approved')
      .map(s => ({
        ...s.service.toObject(),
        addedAt: s.addedAt,
        priceDropped: s.service.price < s.priceWhenAdded,
        priceDrop: s.priceWhenAdded - s.service.price
      }));
    
    res.json({ products, services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product to wishlist
router.post('/product/:productId', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: product._id, priceWhenAdded: product.price }],
        services: []
      });
    } else {
      // Check if already in wishlist
      const exists = wishlist.products.some(p => p.product.toString() === product._id.toString());
      if (exists) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      
      wishlist.products.push({ product: product._id, priceWhenAdded: product.price });
      await wishlist.save();
    }
    
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add service to wishlist
router.post('/service/:serviceId', authenticate, async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
        services: [{ service: service._id, priceWhenAdded: service.price }]
      });
    } else {
      const exists = wishlist.services.some(s => s.service.toString() === service._id.toString());
      if (exists) {
        return res.status(400).json({ message: 'Service already in wishlist' });
      }
      
      wishlist.services.push({ service: service._id, priceWhenAdded: service.price });
      await wishlist.save();
    }
    
    res.json({ message: 'Added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove product from wishlist
router.delete('/product/:productId', authenticate, async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: { product: req.params.productId } } }
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove service from wishlist
router.delete('/service/:serviceId', authenticate, async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { services: { service: req.params.serviceId } } }
    );
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if item is in wishlist
router.get('/check/:type/:itemId', authenticate, async (req, res) => {
  try {
    const { type, itemId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }
    
    let inWishlist = false;
    if (type === 'product') {
      inWishlist = wishlist.products.some(p => p.product.toString() === itemId);
    } else if (type === 'service') {
      inWishlist = wishlist.services.some(s => s.service.toString() === itemId);
    }
    
    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
