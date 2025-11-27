import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import ServiceOrder from '../models/ServiceOrder.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    
    let sortOption = { createdAt: -1 };
    if (sort === 'helpful') sortOption = { helpfulCount: -1 };
    if (sort === 'rating_high') sortOption = { rating: -1 };
    if (sort === 'rating_low') sortOption = { rating: 1 };
    
    const reviews = await Review.find({ product: req.params.productId })
      .populate('reviewer', 'name avatar')
      .sort(sortOption)
      .limit(limit)
      .skip((page - 1) * limit);
    
    const stats = await Review.calculateAverageRating(req.params.productId, 'product');
    
    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(req.params.productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    res.json({ reviews, stats, distribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const stats = await Review.calculateAverageRating(req.params.serviceId, 'service');
    
    res.json({ reviews, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create review for product
router.post('/product/:productId', authenticate, async (req, res) => {
  try {
    const { rating, title, comment, images, orderId } = req.body;
    
    // Check if user has purchased this product
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        buyer: req.user._id,
        'items.product': req.params.productId,
        status: 'delivered'
      });
      isVerifiedPurchase = !!order;
    }
    
    // Check for existing review
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      product: req.params.productId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({
      reviewer: req.user._id,
      reviewType: 'product',
      product: req.params.productId,
      order: orderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase
    });
    
    // Update product average rating
    const stats = await Review.calculateAverageRating(req.params.productId, 'product');
    await Product.findByIdAndUpdate(req.params.productId, {
      'rating.average': stats.averageRating,
      'rating.count': stats.totalReviews
    });
    
    await review.populate('reviewer', 'name avatar');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create review for service
router.post('/service/:serviceId', authenticate, async (req, res) => {
  try {
    const { rating, title, comment, images, serviceOrderId } = req.body;
    
    // Check if user has completed this service
    let isVerifiedPurchase = false;
    if (serviceOrderId) {
      const serviceOrder = await ServiceOrder.findOne({
        _id: serviceOrderId,
        buyer: req.user._id,
        service: req.params.serviceId,
        status: 'completed'
      });
      isVerifiedPurchase = !!serviceOrder;
    }
    
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      service: req.params.serviceId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this service' });
    }
    
    const review = await Review.create({
      reviewer: req.user._id,
      reviewType: 'service',
      service: req.params.serviceId,
      order: serviceOrderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase
    });
    
    // Update service average rating
    const stats = await Review.calculateAverageRating(req.params.serviceId, 'service');
    await Service.findByIdAndUpdate(req.params.serviceId, {
      'rating.average': stats.averageRating,
      'rating.count': stats.totalReviews
    });
    
    await review.populate('reviewer', 'name avatar');
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seller respond to review
router.post('/:reviewId/respond', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.reviewId)
      .populate('product')
      .populate('service');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the seller
    const sellerId = review.product?.seller || review.service?.provider;
    if (sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the seller can respond' });
    }
    
    review.response = { text, respondedAt: new Date() };
    await review.save();
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authenticate, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    res.json({ helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate('product', 'title images')
      .populate('service', 'title images')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

import mongoose from 'mongoose';

export default router;
