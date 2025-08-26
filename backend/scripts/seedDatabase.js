const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User } = require('../models');

async function seedDatabase() {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('123456789', 10);
    
    await User.create({
      id: 'admin-default',
      username: 'CEDADER',
      password: hashedPassword,
      role: 'admin',
      fullName: 'Administrador CEDADER',
      email: 'admin@cedader.com',
      isActive: true,
      createdBy: 'system'
    });

    console.log('Default admin user created successfully');
    console.log('Username: CEDADER');
    console.log('Password: 123456789');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

