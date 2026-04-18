const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function getRoleById(connOrDb, roleId) {
  const [rows] = await connOrDb.query(
    'SELECT role_id, role_name FROM Roles WHERE role_id = ?',
    [roleId]
  );
  return rows[0] || null;
}

function validateStudentProfile(studentProfile) {
  return Boolean(
    studentProfile &&
    studentProfile.dob &&
    studentProfile.gender &&
    studentProfile.college_id
  );
}

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
    const { full_name, email, role_id, username, password, student_profile } = req.body;
    if (!full_name || !email || !role_id || !username || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    await conn.beginTransaction();

    const role = await getRoleById(conn, role_id);
    if (!role) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    if (role.role_name === 'Student' && !validateStudentProfile(student_profile)) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Student date of birth, gender, and college are required' });
    }

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

    if (role.role_name === 'Student') {
      await conn.query(
        `INSERT INTO Student(full_name, email, dob, gender, phone, college_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          full_name,
          email,
          student_profile.dob,
          student_profile.gender,
          student_profile.phone || null,
          student_profile.college_id,
        ]
      );
    }

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
  const conn = await db.getConnection();
  try {
    const { full_name, email, role_id, student_profile } = req.body;
    if (!full_name || !email || !role_id)
      return res.status(400).json({ success: false, message: 'Full name, email, and role are required' });

    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT u.user_id, u.email, r.role_name
       FROM User u
       JOIN Roles r ON r.role_id = u.role_id
       WHERE u.user_id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingUser = rows[0];
    const nextRole = await getRoleById(conn, role_id);
    if (!nextRole) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    const isStudentRole = nextRole.role_name === 'Student';
    const wasStudentRole = existingUser.role_name === 'Student';

    if (isStudentRole && !validateStudentProfile(student_profile)) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Student date of birth, gender, and college are required' });
    }

    const [result] = await conn.query(
      'UPDATE User SET full_name=?, email=?, role_id=? WHERE user_id=?',
      [full_name, email, role_id, req.params.id]
    );
    if (!result.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (isStudentRole) {
      const [studentUpdate] = await conn.query(
        `UPDATE Student
         SET full_name=?, email=?, dob=?, gender=?, phone=?, college_id=?
         WHERE email=?`,
        [
          full_name,
          email,
          student_profile.dob,
          student_profile.gender,
          student_profile.phone || null,
          student_profile.college_id,
          existingUser.email,
        ]
      );

      if (!studentUpdate.affectedRows) {
        await conn.query(
          `INSERT INTO Student(full_name, email, dob, gender, phone, college_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            full_name,
            email,
            student_profile.dob,
            student_profile.gender,
            student_profile.phone || null,
            student_profile.college_id,
          ]
        );
      }
    } else if (wasStudentRole) {
      await conn.query('DELETE FROM Student WHERE email = ?', [existingUser.email]);
    }

    await conn.commit();
    res.json({ success: true, message: 'User updated' });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email or username already exists' });
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
}

async function remove(req, res) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT u.user_id, u.email, r.role_name
       FROM User u
       JOIN Roles r ON r.role_id = u.role_id
       WHERE u.user_id = ?`,
      [req.params.id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];

    if (user.role_name === 'Student') {
      await conn.query('DELETE FROM Student WHERE email = ?', [user.email]);
    }

    const [result] = await conn.query('DELETE FROM User WHERE user_id = ?', [req.params.id]);
    if (!result.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await conn.commit();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
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
