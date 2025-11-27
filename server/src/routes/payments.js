import express from 'express';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import ServiceOrder from '../models/ServiceOrder.js';
import { authenticate } from '../middleware/auth.js';
import { createNotification } from '../services/notifications.js';

const router = express.Router();

// PayHere configuration
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const PAYHERE_MODE = process.env.PAYHERE_MODE || 'sandbox'; // sandbox or live

const getPayhereUrl = () => {
  return PAYHERE_MODE === 'live' 
    ? 'https://www.payhere.lk/pay/checkout'
    : 'https://sandbox.payhere.lk/pay/checkout';
};

// Generate PayHere hash
const generateHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  const amountFormatted = parseFloat(amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
  const hash = crypto.createHash('md5')
    .update(merchantId + orderId + amountFormatted + currency + crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase())
    .digest('hex')
    .toUpperCase();
  return hash;
};

// Initiate payment for product order
router.post('/initiate/order/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, buyer: req.user._id });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }
    
    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      paymentMethod: 'payhere',
      status: 'pending',
      payhere: {
        orderId: `ORD-${order._id}-${Date.now()}`
      }
    });
    
    // Generate PayHere checkout data
    const hash = generateHash(
      PAYHERE_MERCHANT_ID,
      payment.payhere.orderId,
      order.totalAmount,
      'LKR',
      PAYHERE_MERCHANT_SECRET
    );
    
    const checkoutData = {
      sandbox: PAYHERE_MODE === 'sandbox',
      merchant_id: PAYHERE_MERCHANT_ID,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      notify_url: `${process.env.SERVER_URL}/api/payments/webhook`,
      order_id: payment.payhere.orderId,
      items: `Order #${order.orderNumber}`,
      amount: order.totalAmount,
      currency: 'LKR',
      hash: hash,
      first_name: req.user.name.split(' ')[0],
      last_name: req.user.name.split(' ').slice(1).join(' ') || '',
      email: req.user.email,
      phone: req.user.phone || '',
      address: order.shippingAddress?.street || '',
      city: order.shippingAddress?.city || '',
      country: 'Sri Lanka'
    };
    
    res.json({ 
      paymentId: payment._id,
      checkoutUrl: getPayhereUrl(),
      checkoutData 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initiate payment for service order (escrow)
router.post('/initiate/service-order/:serviceOrderId', authenticate, async (req, res) => {
  try {
    const serviceOrder = await ServiceOrder.findOne({ 
      _id: req.params.serviceOrderId, 
      buyer: req.user._id 
    }).populate('service');
    
    if (!serviceOrder) {
      return res.status(404).json({ message: 'Service order not found' });
    }
    
    // Create escrow payment
    const payment = await Payment.create({
      serviceOrder: serviceOrder._id,
      user: req.user._id,
      amount: serviceOrder.price,
      paymentMethod: 'payhere',
      status: 'pending',
      escrow: {
        isEscrow: true
      },
      payhere: {
        orderId: `SVC-${serviceOrder._id}-${Date.now()}`
      }
    });
    
    const hash = generateHash(
      PAYHERE_MERCHANT_ID,
      payment.payhere.orderId,
      serviceOrder.price,
      'LKR',
      PAYHERE_MERCHANT_SECRET
    );
    
    const checkoutData = {
      sandbox: PAYHERE_MODE === 'sandbox',
      merchant_id: PAYHERE_MERCHANT_ID,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      notify_url: `${process.env.SERVER_URL}/api/payments/webhook`,
      order_id: payment.payhere.orderId,
      items: serviceOrder.service.title,
      amount: serviceOrder.price,
      currency: 'LKR',
      hash: hash,
      first_name: req.user.name.split(' ')[0],
      last_name: req.user.name.split(' ').slice(1).join(' ') || '',
      email: req.user.email,
      phone: req.user.phone || ''
    };
    
    res.json({ 
      paymentId: payment._id,
      checkoutUrl: getPayhereUrl(),
      checkoutData 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PayHere webhook (IPN)
router.post('/webhook', async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      method,
      card_holder_name,
      card_no,
      card_expiry
    } = req.body;
    
    // Verify signature
    const localMd5sig = crypto.createHash('md5')
      .update(
        merchant_id + 
        order_id + 
        payhere_amount + 
        payhere_currency + 
        status_code + 
        crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase()
      )
      .digest('hex')
      .toUpperCase();
    
    if (localMd5sig !== md5sig) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Find payment
    const payment = await Payment.findOne({ 'payhere.orderId': order_id });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update payment
    payment.payhere = {
      ...payment.payhere,
      paymentId: payment_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      md5sig,
      method,
      cardHolderName: card_holder_name,
      cardNo: card_no,
      cardExpiry: card_expiry
    };
    
    // Status codes: 2 = success, 0 = pending, -1 = canceled, -2 = failed, -3 = chargedback
    if (status_code === '2') {
      payment.status = payment.escrow?.isEscrow ? 'escrow' : 'completed';
      
      // Update order status
      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order, { 
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      }
      
      if (payment.serviceOrder) {
        await ServiceOrder.findByIdAndUpdate(payment.serviceOrder, {
          paymentStatus: 'escrow'
        });
      }
      
      // Send notification
      await createNotification(payment.user, 'payment_received', 
        'Payment Successful', 
        `Your payment of Rs. ${payment.amount} has been received.`
      );
    } else if (status_code === '-1' || status_code === '-2') {
      payment.status = 'failed';
    }
    
    await payment.save();
    res.json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Release escrow payment (for completed services)
router.post('/release-escrow/:paymentId', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('serviceOrder');
    
    if (!payment || !payment.escrow?.isEscrow) {
      return res.status(404).json({ message: 'Escrow payment not found' });
    }
    
    // Only buyer can release escrow
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only buyer can release payment' });
    }
    
    // Service must be completed
    if (payment.serviceOrder.status !== 'completed') {
      return res.status(400).json({ message: 'Service must be completed first' });
    }
    
    payment.status = 'completed';
    payment.escrow.releasedAt = new Date();
    payment.escrow.releasedBy = req.user._id;
    await payment.save();
    
    // Notify provider
    await createNotification(
      payment.serviceOrder.provider,
      'payment_released',
      'Payment Released',
      `Payment of Rs. ${payment.amount} has been released to your account.`
    );
    
    res.json({ message: 'Payment released successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'orderNumber totalAmount')
      .populate('serviceOrder', 'orderNumber price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
