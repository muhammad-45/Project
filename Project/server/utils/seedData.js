const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');

const categories = [
  { name: 'Electrician', icon: '⚡', description: 'Electrical wiring, repairs, installations, and maintenance services' },
  { name: 'Plumber', icon: '🔧', description: 'Plumbing repairs, pipe fitting, water heater installation' },
  { name: 'Tutor', icon: '📚', description: 'Home tutoring, online classes, exam preparation' },
  { name: 'Mechanic', icon: '🔩', description: 'Vehicle repair, engine maintenance, oil change, tire services' },
  { name: 'Beautician', icon: '💄', description: 'Hair styling, makeup, skincare, bridal services' },
  { name: 'Carpenter', icon: '🪚', description: 'Furniture making, wood repairs, cabinet installation' },
  { name: 'Painter', icon: '🎨', description: 'House painting, wall textures, waterproofing' },
  { name: 'AC Technician', icon: '❄️', description: 'AC installation, repair, gas refilling, maintenance' },
  { name: 'Cleaning', icon: '🧹', description: 'House cleaning, deep cleaning, office cleaning services' },
  { name: 'Tailor', icon: '🧵', description: 'Stitching, alterations, custom clothing, embroidery' }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Seed categories
    const existingCategories = await Category.countDocuments();
    if (existingCategories === 0) {
      await Category.insertMany(categories);
      console.log('✅ Categories seeded successfully');
    } else {
      console.log('ℹ️  Categories already exist, skipping...');
    }

    // Seed admin user
    const existingAdmin = await User.findOne({ email: 'admin@servenear.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: 'admin@servenear.com',
        password: 'admin123',
        role: 'admin',
        phone: '+92-300-0000000',
        city: 'Islamabad'
      });
      console.log('✅ Admin user created (admin@servenear.com / admin123)');
    } else {
      console.log('ℹ️  Admin user already exists, skipping...');
    }

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
