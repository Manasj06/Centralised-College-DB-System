const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function getAll(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.full_name, u.email, r.role_name,
              l.username, l.last_login
       FROM User u
       JOIN Roles r ON r.role_id = u.role_id
       LEFT JOIN Login l ON l.user_id = u.user_id
       ORDER BY u.full_name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function create(req, res) {
  const conn = await db.getConnection();
  try {
    const { full_name, email, role_id, username, password } = req.body;
    if (!full_name || !email || !role_id || !username || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    await conn.beginTransaction();

    const [userResult] = await conn.query(
      'INSERT INTO User(full_name, email, role_id) VALUES(?,?,?)',
      [full_name, email, role_id]
    );
    const newUserId = userResult.insertId;

    const hash = await bcrypt.hash(password, 10);
    await conn.query(
      'INSERT INTO Login(user_id, username, password_hash) VALUES(?,?,?)',
      [newUserId, username, hash]
    );

    await conn.commit();
    res.status(201).json({ success: true, message: 'User created', user_id: newUserId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
}

async function update(req, res) {
  try {
    const { full_name, email, role_id } = req.body;
    const [result] = await db.query(
      'UPDATE User SET full_name=?, email=?, role_id=? WHERE user_id=?',
      [full_name, email, role_id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function remove(req, res) {
  try {
    const [result] = await db.query('DELETE FROM User WHERE user_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getRoles(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM Roles ORDER BY role_name');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, create, update, remove, getRoles };
