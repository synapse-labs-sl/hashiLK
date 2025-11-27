import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'order_placed', 'order_confirmed', 'order_shipped', 'order_delivered',
      'service_booked', 'service_accepted', 'service_completed',
      'payment_received', 'payment_released',
      'new_message', 'new_review',
      'product_approved', 'product_rejected',
      'service_approved', 'service_rejected',
      'price_drop', 'back_in_stock',
      'system'
    ],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId },
    productId: { type: mongoose.Schema.Types.ObjectId },
    serviceId: { type: mongoose.Schema.Types.ObjectId },
    conversationId: { type: mongoose.Schema.Types.ObjectId },
    link: String
  },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  emailSent: { type: Boolean, default: false },
  smsSent: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
