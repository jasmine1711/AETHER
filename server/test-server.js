const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Test server is working!' });
});

// Signup endpoint for testing
app.post('/api/auth/signup', (req, res) => {
  console.log('Signup attempt:', req.body);
  res.json({ 
    message: 'Signup successful (test mode)', 
    user: req.body 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📋 Test at: http://localhost:${PORT}/api/test`);
});