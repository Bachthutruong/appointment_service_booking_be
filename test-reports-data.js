const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Order = require('./dist/models/Order');
const Product = require('./dist/models/Product');
const Service = require('./dist/models/Service');
const Customer = require('./dist/models/Customer');

async function testReportsData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_booking');
    console.log('✅ Connected to MongoDB');

    // Check orders
    const orderCount = await Order.countDocuments();
    console.log(`📊 Total Orders: ${orderCount}`);

    if (orderCount > 0) {
      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('customer', 'name phone')
        .populate('createdBy', 'name');
      
      console.log('📋 Recent Orders:');
      recentOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.customer?.name} - ${order.totalAmount} - ${order.status}`);
      });
    }

    // Check products
    const productCount = await Product.countDocuments();
    console.log(`📦 Total Products: ${productCount}`);

    // Check services
    const serviceCount = await Service.countDocuments();
    console.log(`🔧 Total Services: ${serviceCount}`);

    // Check customers
    const customerCount = await Customer.countDocuments();
    console.log(`👥 Total Customers: ${customerCount}`);

    // Test revenue aggregation
    if (orderCount > 0) {
      console.log('\n💰 Testing Revenue Aggregation...');
      const revenueData = await Order.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'delivered'] }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
        },
        {
          $limit: 7
        }
      ]);

      console.log('📈 Revenue Data:', JSON.stringify(revenueData, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testReportsData();
