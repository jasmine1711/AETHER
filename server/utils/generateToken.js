// server/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiresIn = process.env.NODE_ENV === 'production' 
        ? '7d'  // Shorter in production
        : '365d'; // Longer in development

    return jwt.sign(
        { userId }, 
        secret, 
        { expiresIn }
    );
};

module.exports = generateToken;