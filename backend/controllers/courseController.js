const db = require('../config/db');

async function getAll(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT co.*, c.college_name,
              COUNT(r.reg_id) AS enrolled_count
       FROM Course co
       JOIN College c ON c.college_id = co.college_id
       LEFT JOIN Registration r ON r.course_id = co.course_id
       GROUP BY co.course_id
       ORDER BY co.course_name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getById(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT co.*, c.college_name FROM Course co
       JOIN College c ON c.college_id = co.college_id
       WHERE co.course_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function create(req, res) {
  try {
    const { course_name, course_code, credits, college_id, description } = req.body;
    if (!course_name || !course_code || !credits || !college_id)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const [result] = await db.query(
      `INSERT INTO Course(course_name, course_code, credits, college_id, description)
       VALUES (?, ?, ?, ?, ?)`,
      [course_name, course_code, parseInt(credits), college_id, description || null]
    );
    res.status(201).json({ success: true, message: 'Course created', course_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Course code already exists' });
    res.status(500).json({ success: false, message: err.message });
  }
}

async function update(req, res) {
  try {
    const { course_name, course_code, credits, college_id, description } = req.body;
    const [result] = await db.query(
      `UPDATE Course SET course_name=?, course_code=?, credits=?, college_id=?, description=?
       WHERE course_id=?`,
      [course_name, course_code, parseInt(credits), college_id, description || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function remove(req, res) {
  try {
    const [result] = await db.query('DELETE FROM Course WHERE course_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get all students enrolled in a course
async function getCourseStudents(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT s.student_id, s.full_name, s.email, r.registered_at
       FROM Registration r
       JOIN Student s ON s.student_id = r.student_id
       WHERE r.course_id = ?
       ORDER BY s.full_name`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, getById, create, update, remove, getCourseStudents };
