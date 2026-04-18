const db = require('../config/db');

async function getAll(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT c.*, COUNT(s.student_id) AS student_count,
              COUNT(DISTINCT co.course_id) AS course_count
       FROM College c
       LEFT JOIN Student s ON s.college_id = c.college_id
       LEFT JOIN Course co ON co.college_id = c.college_id
       GROUP BY c.college_id ORDER BY c.college_name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function create(req, res) {
  try {
    const { college_name, city, established_year, email, phone } = req.body;
    if (!college_name) return res.status(400).json({ success: false, message: 'College name required' });
    const [result] = await db.query(
      'INSERT INTO College(college_name, city, established_year, email, phone) VALUES(?,?,?,?,?)',
      [college_name, city||null, established_year||null, email||null, phone||null]
    );
    res.status(201).json({ success: true, message: 'College created', college_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function update(req, res) {
  try {
    const { college_name, city, established_year, email, phone } = req.body;
    const [result] = await db.query(
      'UPDATE College SET college_name=?, city=?, established_year=?, email=?, phone=? WHERE college_id=?',
      [college_name, city||null, established_year||null, email||null, phone||null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, message: 'College updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function remove(req, res) {
  try {
    const [result] = await db.query('DELETE FROM College WHERE college_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'College not found' });
    res.json({ success: true, message: 'College deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2')
      return res.status(409).json({ success: false, message: 'Cannot delete: college has students or courses' });
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, create, update, remove };
