const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Username and password required' });

    const [rows] = await db.query(
      `SELECT l.login_id, l.user_id, l.username, l.password_hash,
              u.full_name, u.email, r.role_name, r.role_id
       FROM Login l
       JOIN User u  ON u.user_id  = l.user_id
       JOIN Roles r ON r.role_id  = u.role_id
       WHERE l.username = ?`,
      [username]
    );

    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid username or password' });

    // Update last login
    await db.query('UPDATE Login SET last_login = NOW() WHERE login_id = ?', [user.login_id]);

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role_name, name: user.full_name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { user_id: user.user_id, name: user.full_name, email: user.email, role: user.role_name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { login, getMe };
