import express from 'express';
import Order from '../models/Order.js';
import ServiceOrder from '../models/ServiceOrder.js';
import Service from '../models/Service.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get buyer's product orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's received orders
router.get('/seller-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ 'items.product': { $exists: true } })
      .populate('items.product')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 });
    
    // Filter orders that contain products from this seller
    const sellerOrders = orders.filter(order => 
      order.items.some(item => 
        item.product?.seller?.toString() === req.user._id.toString()
      )
    );
    
    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (seller)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create service order (book a service)
router.post('/service-order', authenticate, async (req, res) => {
  try {
    const { serviceId, requirements } = req.body;
    
    const service = await Service.findById(serviceId);
    if (!service || service.status !== 'approved') {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const commission = (service.price * service.commissionRate) / 100;
    const orderNumber = `HS${Date.now()}`;
    
    const serviceOrder = await ServiceOrder.create({
      orderNumber,
      service: service._id,
      buyer: req.user._id,
      provider: service.provider,
      requirements,
      price: service.price,
      commission
    });
    
    await serviceOrder.populate(['service', 'provider']);
    res.status(201).json(serviceOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get buyer's service orders
router.get('/my-service-orders', authenticate, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ buyer: req.user._id })
      .populate('service')
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get provider's service orders
router.get('/provider-orders', authenticate, async (req, res) => {
  try {
    const orders = await ServiceOrder.find({ provider: req.user._id })
      .populate('service')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update service order status (provider)
router.patch('/service-order/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await ServiceOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    order.status = status;
    if (status === 'completed') {
      order.completedAt = new Date();
    }
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
