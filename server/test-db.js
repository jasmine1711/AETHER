// test-db.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    
    // Check if the user exists
    const userEmail = 'tanushreenayal17@gmail.com';
    const user = await User.findOne({ email: userEmail.toLowerCase() }).select('+password');
    
    console.log('🔍 Looking for user:', userEmail);
    
    if (user) {
      console.log('✅ User found in database:', user.email);
      console.log('📋 User details:', {
        name: user.name,
        username: user.username,
        hasPassword: !!user.password
      });
      
      // Test password verification
      const testPassword = 'yourpassword'; // Replace with actual password
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('🔑 Password verification result:', isMatch);
      
      if (!isMatch) {
        console.log('❌ Password does not match. The user might have a different password.');
      }
    } else {
      console.log('❌ User not found in database');
      console.log('💡 Try creating the user first through registration');
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDatabase();