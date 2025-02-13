require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { 
    expiresIn: '1h', 
    algorithm: 'HS256' 
});

console.log('Generated Token:', token);
