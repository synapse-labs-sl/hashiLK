import express from 'express';
import Product from '../models/Product.js';
import Service from '../models/Service.js';
import Order from '../models/Order.js';
import ServiceOrder from '../models/ServiceOrder.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Seller analytics
router.get('/seller', authenticate, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Products stats
    const products = await Product.find({ seller: req.user._id });
    const productIds = products.map(p => p._id);
    
    const totalProductViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
    const approvedProducts = products.filter(p => p.status === 'approved').length;
    
    // Services stats
    const services = await Service.find({ provider: req.user._id });
    const serviceIds = services.map(s => s._id);
    
    const totalServiceViews = services.reduce((sum, s) => sum + (s.views || 0), 0);
    const approvedServices = services.filter(s => s.status === 'approved').length;
    
    // Orders containing seller's products
    const productOrders = await Order.find({
      'items.product': { $in: productIds },
      createdAt: { $gte: startDate }
    }).populate('items.product');
    
    // Calculate product revenue
    let productRevenue = 0;
    let productSales = 0;
    productOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product?._id))) {
          productRevenue += item.price * item.quantity;
          productSales += item.quantity;
        }
      });
    });
    
    // Service orders
    const serviceOrders = await ServiceOrder.find({
      provider: req.user._id,
      createdAt: { $gte: startDate }
    });
    
    const serviceRevenue = serviceOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.price - o.commission), 0);
    
    const completedServices = serviceOrders.filter(o => o.status === 'completed').length;
    const pendingServices = serviceOrders.filter(o => o.status === 'pending').length;
    
    // Reviews
    const productReviews = await Review.find({ product: { $in: productIds } });
    const serviceReviews = await Review.find({ service: { $in: serviceIds } });
    
    const avgProductRating = productReviews.length > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      : 0;
    
    const avgServiceRating = serviceReviews.length > 0
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length
      : 0;
    
    // Daily revenue for chart
    const dailyRevenue = [];
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayProductOrders = productOrders.filter(o => 
        o.createdAt >= date && o.createdAt < nextDate
      );
      
      let dayRevenue = 0;
      dayProductOrders.forEach(order => {
        order.items.forEach(item => {
          if (productIds.some(id => id.equals(item.product?._id))) {
            dayRevenue += item.price * item.quantity;
          }
        });
      });
      
      const dayServiceOrders = serviceOrders.filter(o =>
        o.createdAt >= date && o.createdAt < nextDate && o.status === 'completed'
      );
      dayRevenue += dayServiceOrders.reduce((sum, o) => sum + (o.price - o.commission), 0);
      
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }
    
    // Top products
    const topProducts = products
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({ title: p.title, views: p.views, price: p.price }));
    
    res.json({
      overview: {
        totalProducts: products.length,
        approvedProducts,
        totalServices: services.length,
        approvedServices,
        totalProductViews,
        totalServiceViews,
        productRevenue,
        serviceRevenue,
        totalRevenue: productRevenue + serviceRevenue,
        productSales,
        completedServices,
        pendingServices
      },
      ratings: {
        avgProductRating: Math.round(avgProductRating * 10) / 10,
        productReviewCount: productReviews.length,
        avgServiceRating: Math.round(avgServiceRating * 10) / 10,
        serviceReviewCount: serviceReviews.length
      },
      dailyRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin analytics
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // User stats
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const totalSellers = await User.countDocuments({ $or: [{ isSeller: true }, { role: 'seller' }] });
    
    // Product stats
    const totalProducts = await Product.countDocuments();
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    const approvedProducts = await Product.countDocuments({ status: 'approved' });
    
    // Service stats
    const totalServices = await Service.countDocuments();
    const pendingServices = await Service.countDocuments({ status: 'pending' });
    const approvedServices = await Service.countDocuments({ status: 'approved' });
    
    // Order stats
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    const totalOrderValue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Service order stats
    const totalServiceOrders = await ServiceOrder.countDocuments();
    const recentServiceOrders = await ServiceOrder.countDocuments({ createdAt: { $gte: startDate } });
    const totalServiceValue = await ServiceOrder.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    
    // Commission earned
    const commissionEarned = await ServiceOrder.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$commission' } } }
    ]);
    
    // Daily signups
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top categories
    const topProductCategories = await Product.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const topServiceCategories = await Service.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      users: {
        total: totalUsers,
        new: newUsers,
        sellers: totalSellers
      },
      products: {
        total: totalProducts,
        pending: pendingProducts,
        approved: approvedProducts
      },
      services: {
        total: totalServices,
        pending: pendingServices,
        approved: approvedServices
      },
      orders: {
        totalProductOrders: totalOrders,
        recentProductOrders: recentOrders,
        productOrderValue: totalOrderValue[0]?.total || 0,
        totalServiceOrders,
        recentServiceOrders,
        serviceOrderValue: totalServiceValue[0]?.total || 0
      },
      revenue: {
        totalGMV: (totalOrderValue[0]?.total || 0) + (totalServiceValue[0]?.total || 0),
        commissionEarned: commissionEarned[0]?.total || 0
      },
      dailySignups,
      topProductCategories,
      topServiceCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
