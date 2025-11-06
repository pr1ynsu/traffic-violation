// backend/controllers/auth.controller.js (CommonJS - Complete)

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// NOTE: Uses the JWT_SECRET defined in the environment variables (or the fallback)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; 

// ** 1. REGISTRATION LOGIC **
async function register(req, res) {
    try {
        const { name, email, password, mobile, vehicle, license, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // HASH THE PASSWORD (Security Requirement)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, email, password: hashedPassword, mobile, vehicle, license, 
            role: role || 'user'
        });
        await user.save();

        res.status(201).json({ message: 'User registered successfully. Please login.' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
}


// ** 2. LOGIN LOGIC **
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        // 2. Compare the password (Hash check)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        // 3. GENERATE JSON WEB TOKEN (The Security Token)
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                vehicle: user.vehicle, // Required for Chalan lookup
                role: user.role
            }
        };

        const token = jwt.sign(
            payload,
            JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        // 4. Send token and user data (Excludes password hash)
        const { password: _, ...userData } = user._doc;
        res.json({ token, user: userData, message: 'Login successful.' });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
}

module.exports = { register, login };