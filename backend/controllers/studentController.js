const db = require('../config/db');

async function getAll(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT s.*, c.college_name FROM Student s
       JOIN College c ON c.college_id = s.college_id
       ORDER BY s.full_name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getById(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT s.*, c.college_name FROM Student s
       JOIN College c ON c.college_id = s.college_id
       WHERE s.student_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function create(req, res) {
  const conn = await db.getConnection();
  try {
    const { full_name, email, dob, gender, phone, college_id } = req.body;
    if (!full_name || !email || !dob || !gender || !college_id)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Student(full_name, email, dob, gender, phone, college_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, dob, gender, phone || null, college_id]
    );

    await conn.commit();
    res.status(201).json({ success: true, message: 'Student created', student_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email already exists' });
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
}

async function update(req, res) {
  try {
    const { full_name, email, dob, gender, phone, college_id } = req.body;
    const [result] = await db.query(
      `UPDATE Student SET full_name=?, email=?, dob=?, gender=?, phone=?, college_id=?
       WHERE student_id=?`,
      [full_name, email, dob, gender, phone || null, college_id, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function remove(req, res) {
  try {
    const [result] = await db.query('DELETE FROM Student WHERE student_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get student's registrations
async function getStudentCourses(req, res) {
  try {
    const studentId = req.params.id || req.user.user_id;
    const [rows] = await db.query(
      `SELECT r.reg_id, c.course_id, c.course_name, c.course_code, c.credits,
              col.college_name, r.registered_at
       FROM Registration r
       JOIN Course c   ON c.course_id  = r.course_id
       JOIN College col ON col.college_id = c.college_id
       WHERE r.student_id = ?
       ORDER BY r.registered_at DESC`,
      [studentId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, getById, create, update, remove, getStudentCourses };
