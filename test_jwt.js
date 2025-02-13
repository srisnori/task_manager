const jwt = require('jsonwebtoken');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpYXQiOjE3Mzk0MjE0MTQsImV4cCI6MTczOTQyNTAxNH0.c5i4F05upiAufOQhs1rL5zQs4d0sOQvY2o0D8jsq79k"; // Replace with your actual token
const secret = process.env.JWT_SECRET || "supersecuresecret"; 

jwt.verify(token, secret, (err, decoded) => {
    if (err) {
        console.log("JWT Verification Failed:", err.message);
    } else {
        console.log("Decoded Token:", decoded);
    }
});