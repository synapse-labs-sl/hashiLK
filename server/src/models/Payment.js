import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  serviceOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceOrder' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'LKR' },
  paymentMethod: { 
    type: String, 
    enum: ['payhere', 'card', 'bank_transfer', 'cash_on_delivery'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'escrow'],
    default: 'pending'
  },
  // PayHere specific fields
  payhere: {
    orderId: String,
    paymentId: String,
    payhereAmount: Number,
    payhereCurrency: String,
    statusCode: Number,
    md5sig: String,
    method: String,
    cardHolderName: String,
    cardNo: String,
    cardExpiry: String
  },
  // Escrow for services
  escrow: {
    isEscrow: { type: Boolean, default: false },
    releaseDate: Date,
    releasedAt: Date,
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

paymentSchema.index({ order: 1 });
paymentSchema.index({ serviceOrder: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ 'payhere.orderId': 1 });

export default mongoose.model('Payment', paymentSchema);
