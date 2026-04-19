const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. GET ROUTE: Fetch Jobs
// ==========================================
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. POST ROUTE: User Signup
// ==========================================
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// ==========================================
// 3. POST ROUTE: User Login (This was missing/404ing!)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const tokenSecret = process.env.JWT_SECRET || 'super_secret_placeaura_key';
    const token = jwt.sign({ id: user.id, role: user.role }, tokenSecret, { expiresIn: '1h' });

    res.json({
      message: 'Logged in successfully',
      token: token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Placeaura backend running on port ${PORT}`);
});