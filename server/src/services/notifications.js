import Notification from '../models/Notification.js';
import nodemailer from 'nodemailer';

// Email transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Create in-app notification
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Send email notification
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.SMTP_USER) {
      console.log('Email not configured, skipping:', subject);
      return;
    }
    
    await transporter.sendMail({
      from: `"Hashi.lk" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('Email sent:', subject);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Email templates
export const emailTemplates = {
  orderPlaced: (order) => ({
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0B4F6C, #1A6B8A); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Hashi.lk</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #0B4F6C;">Order Confirmed!</h2>
          <p>Thank you for your order. Your order number is <strong>#${order.orderNumber}</strong>.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <p><strong>Total:</strong> Rs. ${order.totalAmount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <p>We'll notify you when your order ships.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin-top: 20px;">View Order</a>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Hashi.lk - Sri Lanka's Marketplace</p>
        </div>
      </div>
    `
  }),
  
  serviceBooked: (serviceOrder, service) => ({
    subject: `Service Booking Confirmed - #${serviceOrder.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D97706, #F59E0B); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Hashi.lk</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #D97706;">Service Booking Confirmed!</h2>
          <p>Your booking for <strong>${service.title}</strong> has been submitted.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Booking #:</strong> ${serviceOrder.orderNumber}</p>
            <p><strong>Service:</strong> ${service.title}</p>
            <p><strong>Price:</strong> Rs. ${serviceOrder.price.toLocaleString()}</p>
            <p><strong>Status:</strong> Pending provider acceptance</p>
          </div>
          <p>The service provider will review your request and respond within 24 hours.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: #0B4F6C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin-top: 20px;">View Booking</a>
        </div>
      </div>
    `
  }),
  
  newOrder: (order, seller) => ({
    subject: `New Order Received - #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #10B981); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Hashi.lk</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #059669;">New Order Received!</h2>
          <p>Hi ${seller.name}, you have received a new order.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order #${order.orderNumber}</h3>
            <p><strong>Total:</strong> Rs. ${order.totalAmount.toLocaleString()}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/seller/dashboard" style="display: inline-block; background: #0B4F6C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin-top: 20px;">View Order</a>
        </div>
      </div>
    `
  }),
  
  passwordReset: (user, resetToken) => ({
    subject: 'Password Reset Request - Hashi.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0B4F6C, #1A6B8A); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Hashi.lk</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #0B4F6C;">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${process.env.CLIENT_URL}/reset-password?token=${resetToken}" style="display: inline-block; background: #D97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  }),
  
  emailVerification: (user, verificationToken) => ({
    subject: 'Verify Your Email - Hashi.lk',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0B4F6C, #1A6B8A); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Hashi.lk</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #0B4F6C;">Welcome to Hashi.lk!</h2>
          <p>Hi ${user.name},</p>
          <p>Please verify your email address to complete your registration:</p>
          <a href="${process.env.CLIENT_URL}/verify-email?token=${verificationToken}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin: 20px 0;">Verify Email</a>
        </div>
      </div>
    `
  })
};

// Notify order placed
export const notifyOrderPlaced = async (order, buyer) => {
  await createNotification(buyer._id, 'order_placed', 'Order Placed', `Your order #${order.orderNumber} has been placed successfully.`, { orderId: order._id });
  
  const template = emailTemplates.orderPlaced(order);
  await sendEmail(buyer.email, template.subject, template.html);
};

// Notify service booked
export const notifyServiceBooked = async (serviceOrder, service, buyer, provider) => {
  // Notify buyer
  await createNotification(buyer._id, 'service_booked', 'Service Booked', `Your booking for "${service.title}" has been submitted.`, { orderId: serviceOrder._id });
  
  // Notify provider
  await createNotification(provider._id, 'service_booked', 'New Booking Request', `You have a new booking request for "${service.title}".`, { orderId: serviceOrder._id });
  
  const template = emailTemplates.serviceBooked(serviceOrder, service);
  await sendEmail(buyer.email, template.subject, template.html);
};
