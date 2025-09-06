import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Customer } from '../models/Customer';
import { Service } from '../models/Service';
import { Product } from '../models/Product';

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_booking';
    await mongoose.connect(mongoURI);
    
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Service.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Administrator',
      role: 'admin'
    });

    // Create employee user
    const employeeUser = await User.create({
      email: 'employee@example.com',
      password: 'employee123',
      name: 'Nhân viên 1',
      role: 'employee'
    });

    console.log('Created users');

    // Create sample customers
    const customers = await Customer.create([
      {
        name: 'Nguyễn Thị Lan',
        phone: '0901234567',
        lineId: 'lan_nguyen',
        gender: 'female',
        dateOfBirth: new Date('1990-05-15'),
        notes: 'Khách hàng VIP, thích dịch vụ chăm sóc da'
      },
      {
        name: 'Trần Văn Nam',
        phone: '0907654321',
        gender: 'male',
        dateOfBirth: new Date('1985-12-20'),
        notes: 'Khách hàng thường xuyên'
      },
      {
        name: 'Lê Thị Hoa',
        phone: '0912345678',
        lineId: 'hoa_le',
        gender: 'female',
        dateOfBirth: new Date('1992-08-10'),
        notes: 'Thích các sản phẩm chăm sóc tóc'
      }
    ]);

    console.log('Created sample customers');

    // Create sample services
    const services = await Service.create([
      {
        name: 'Cắt tóc nam',
        description: 'Dịch vụ cắt tóc chuyên nghiệp cho nam',
        price: 150000,
        duration: 30
      },
      {
        name: 'Cắt tóc nữ',
        description: 'Dịch vụ cắt tóc và tạo kiểu cho nữ',
        price: 200000,
        duration: 60
      },
      {
        name: 'Nhuộm tóc',
        description: 'Dịch vụ nhuộm tóc với màu sắc đa dạng',
        price: 500000,
        duration: 120
      },
      {
        name: 'Chăm sóc da mặt',
        description: 'Dịch vụ chăm sóc và làm đẹp da mặt',
        price: 300000,
        duration: 90
      },
      {
        name: 'Massage thư giãn',
        description: 'Dịch vụ massage toàn thân thư giãn',
        price: 400000,
        duration: 60
      }
    ]);

    console.log('Created sample services');

    // Create sample products
    const products = await Product.create([
      {
        name: 'Dầu gội đầu cao cấp',
        description: 'Dầu gội dành cho mọi loại tóc',
        sellingPrice: 250000,
        costPrice: 150000,
        unit: 'chai',
        currentStock: 50,
        minStockAlert: 10
      },
      {
        name: 'Kem dưỡng da mặt',
        description: 'Kem dưỡng da chống lão hóa',
        sellingPrice: 450000,
        costPrice: 300000,
        unit: 'hộp',
        currentStock: 30,
        minStockAlert: 5
      },
      {
        name: 'Serum vitamin C',
        description: 'Serum làm sáng da với vitamin C',
        sellingPrice: 350000,
        costPrice: 200000,
        unit: 'chai',
        currentStock: 25,
        minStockAlert: 5
      },
      {
        name: 'Mặt nạ dưỡng ẩm',
        description: 'Mặt nạ giấy dưỡng ẩm da mặt',
        sellingPrice: 50000,
        costPrice: 25000,
        unit: 'miếng',
        currentStock: 100,
        minStockAlert: 20
      },
      {
        name: 'Tinh dầu massage',
        description: 'Tinh dầu thư giãn cho massage',
        sellingPrice: 180000,
        costPrice: 100000,
        unit: 'chai',
        currentStock: 15,
        minStockAlert: 3
      }
    ]);

    console.log('Created sample products');

    console.log('✅ Sample data seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`Admin: ${adminUser.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`Employee: ${employeeUser.email} / employee123`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

