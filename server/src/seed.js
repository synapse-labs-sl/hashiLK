import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Service from './models/Service.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hashi.lk',
      password: 'admin123',
      role: 'admin',
      isSeller: true,
      sellerInfo: {
        businessName: 'Hashi Admin',
        description: 'Platform administrator'
      }
    });
    console.log('Created admin user: admin@hashi.lk / admin123');

    // Create seller users
    const seller1 = await User.create({
      name: 'Kamal Perera',
      email: 'kamal@example.com',
      password: 'seller123',
      role: 'seller',
      isSeller: true,
      sellerInfo: {
        businessName: 'Kamal Electronics',
        description: 'Quality electronics at best prices',
        rating: 4.5
      },
      address: { city: 'Colombo', province: 'Western' }
    });

    const seller2 = await User.create({
      name: 'Nimal Silva',
      email: 'nimal@example.com',
      password: 'seller123',
      role: 'seller',
      isSeller: true,
      sellerInfo: {
        businessName: 'Silva Web Solutions',
        description: 'Professional web development services',
        rating: 4.8
      },
      address: { city: 'Kandy', province: 'Central' }
    });

    const seller3 = await User.create({
      name: 'Priya Fernando',
      email: 'priya@example.com',
      password: 'seller123',
      role: 'seller',
      isSeller: true,
      sellerInfo: {
        businessName: 'Priya Fashion',
        description: 'Trendy fashion for everyone',
        rating: 4.2
      },
      address: { city: 'Galle', province: 'Southern' }
    });
    console.log('Created seller users');

    // Create buyer user
    await User.create({
      name: 'Test Buyer',
      email: 'buyer@example.com',
      password: 'buyer123',
      role: 'buyer'
    });
    console.log('Created buyer user: buyer@example.com / buyer123');

    // Create products
    const products = [
      {
        title: 'iPhone 14 Pro Max - 256GB',
        description: 'Brand new iPhone 14 Pro Max with 256GB storage. Deep Purple color. Full warranty included.',
        price: 450000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500'],
        seller: seller1._id,
        stock: 5,
        condition: 'new',
        status: 'approved',
        location: { city: 'Colombo', province: 'Western' }
      },
      {
        title: 'Samsung Galaxy S23 Ultra',
        description: 'Samsung Galaxy S23 Ultra 512GB. Phantom Black. S Pen included.',
        price: 380000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
        seller: seller1._id,
        stock: 3,
        condition: 'new',
        status: 'approved',
        location: { city: 'Colombo', province: 'Western' }
      },
      {
        title: 'MacBook Pro 14" M3 Pro',
        description: 'Apple MacBook Pro 14-inch with M3 Pro chip. 18GB RAM, 512GB SSD. Space Black.',
        price: 850000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
        seller: seller1._id,
        stock: 2,
        condition: 'new',
        status: 'approved',
        location: { city: 'Colombo', province: 'Western' }
      },
      {
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Premium noise cancelling wireless headphones. Industry-leading noise cancellation.',
        price: 95000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500'],
        seller: seller1._id,
        stock: 10,
        condition: 'new',
        status: 'approved',
        location: { city: 'Colombo', province: 'Western' }
      },
      {
        title: 'Designer Saree - Silk',
        description: 'Beautiful handwoven silk saree with traditional Sri Lankan design. Perfect for weddings.',
        price: 25000,
        category: 'Fashion',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'],
        seller: seller3._id,
        stock: 8,
        condition: 'new',
        status: 'approved',
        location: { city: 'Galle', province: 'Southern' }
      },
      {
        title: 'Men\'s Formal Shirt - Blue',
        description: 'Premium cotton formal shirt. Slim fit. Available in multiple sizes.',
        price: 3500,
        category: 'Fashion',
        images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'],
        seller: seller3._id,
        stock: 20,
        condition: 'new',
        status: 'approved',
        location: { city: 'Galle', province: 'Southern' }
      },
      {
        title: 'Cricket Bat - English Willow',
        description: 'Professional grade English willow cricket bat. Perfect balance and pickup.',
        price: 45000,
        category: 'Sports',
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500'],
        seller: seller1._id,
        stock: 5,
        condition: 'new',
        status: 'approved',
        location: { city: 'Colombo', province: 'Western' }
      },
      {
        title: 'Used Toyota Aqua 2018',
        description: 'Well maintained Toyota Aqua 2018 model. 45,000 km. Full service history.',
        price: 6500000,
        category: 'Vehicles',
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500'],
        seller: seller1._id,
        stock: 1,
        condition: 'used',
        status: 'approved',
        location: { city: 'Colombo', province: 'Western' }
      }
    ];

    await Product.insertMany(products);
    console.log('Created sample products');

    // Create services
    const services = [
      {
        title: 'Professional Website Development',
        description: 'Full-stack web development services. React, Node.js, MongoDB. Responsive design included. SEO optimized.',
        price: 150000,
        priceType: 'fixed',
        category: 'Web Development',
        images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500'],
        provider: seller2._id,
        deliveryTime: '2-3 weeks',
        status: 'approved',
        location: { city: 'Kandy', province: 'Central' }
      },
      {
        title: 'E-commerce Website Package',
        description: 'Complete e-commerce solution with payment integration, inventory management, and admin panel.',
        price: 250000,
        priceType: 'fixed',
        category: 'Web Development',
        images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500'],
        provider: seller2._id,
        deliveryTime: '4-6 weeks',
        status: 'approved',
        location: { city: 'Kandy', province: 'Central' }
      },
      {
        title: 'Logo Design & Branding',
        description: 'Professional logo design with complete brand identity package. 3 concepts, unlimited revisions.',
        price: 25000,
        priceType: 'fixed',
        category: 'Graphic Design',
        images: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500'],
        provider: seller2._id,
        deliveryTime: '5-7 days',
        status: 'approved',
        location: { city: 'Kandy', province: 'Central' }
      },
      {
        title: 'Social Media Marketing',
        description: 'Complete social media management. Content creation, scheduling, and analytics reporting.',
        price: 35000,
        priceType: 'fixed',
        category: 'Marketing',
        images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500'],
        provider: seller2._id,
        deliveryTime: 'Monthly',
        status: 'approved',
        location: { city: 'Kandy', province: 'Central' }
      },
      {
        title: 'Wedding Photography Package',
        description: 'Full day wedding photography coverage. 500+ edited photos, album included.',
        price: 85000,
        priceType: 'fixed',
        category: 'Photography',
        images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=500'],
        provider: seller3._id,
        deliveryTime: '2 weeks',
        status: 'approved',
        location: { city: 'Galle', province: 'Southern' }
      },
      {
        title: 'English Language Tutoring',
        description: 'One-on-one English tutoring for all levels. IELTS preparation available.',
        price: 2500,
        priceType: 'hourly',
        category: 'Tutoring',
        images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500'],
        provider: seller2._id,
        deliveryTime: 'Flexible',
        status: 'approved',
        location: { city: 'Kandy', province: 'Central' }
      }
    ];

    await Service.insertMany(services);
    console.log('Created sample services');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('  Admin: admin@hashi.lk / admin123');
    console.log('  Seller: kamal@example.com / seller123');
    console.log('  Buyer: buyer@example.com / buyer123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
