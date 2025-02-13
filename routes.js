// routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// Simple authentication middleware
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log('Authorization Header:', req.header('Authorization'));  // Log the full header
    console.log('Token:', token);  // Log token separately

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);  // Debugging: Log decoded token
        req.user = decoded;
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);  // Log error
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Rate limiter (limit to 10 requests per minute per IP)
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many requests. Try again later.',
});

// Allowed task types (to prevent injection)
const allowedTasks = ['cleanup', 'reporting'];

// Execute Task
router.post(
    '/execute',
    authenticate,
    limiter,
    body('name').isString().custom((value) => allowedTasks.includes(value)),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name } = req.body;
        db.run('INSERT INTO tasks (name, status) VALUES (?, ?)', [name, 'running'], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ taskId: this.lastID, message: `Task '${name}' started.` });
        });
    }
);

// Query Task
router.get('/task/:id', authenticate, limiter, param('id').isInt(), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Task not found' });
        res.json(row);
    });
});

module.exports = router;