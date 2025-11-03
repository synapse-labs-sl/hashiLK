import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create order
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;
    
    // Calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${product?.title || 'unknown'} is out of stock` });
      }
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
      
      totalAmount += product.price * item.quantity;
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Generate order number
    const orderNumber = `HL${Date.now()}`;
    
    const order = await Order.create({
      orderNumber,
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      shippingAddress
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
