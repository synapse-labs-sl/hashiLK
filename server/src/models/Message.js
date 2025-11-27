import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  attachments: [{
    url: String,
    type: { type: String, enum: ['image', 'file'] }
  }],
  readAt: { type: Date },
  isSystemMessage: { type: Boolean, default: false }
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  relatedTo: {
    type: { type: String, enum: ['product', 'service', 'order', 'general'] },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    order: { type: mongoose.Schema.Types.ObjectId }
  },
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'relatedTo.product': 1 });
conversationSchema.index({ 'relatedTo.service': 1 });

export const Message = mongoose.model('Message', messageSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
