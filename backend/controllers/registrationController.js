const db = require('../config/db');

async function findStudentIdByEmail(connOrDb, email) {
  const [rows] = await connOrDb.query(
    'SELECT student_id FROM Student WHERE email = ?',
    [email]
  );
  return rows[0]?.student_id || null;
}

async function getAll(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT r.reg_id, s.full_name AS student_name, s.email AS student_email,
              c.course_name, c.course_code, c.credits,
              col.college_name, r.registered_at
       FROM Registration r
       JOIN Student s  ON s.student_id  = r.student_id
       JOIN Course c   ON c.course_id   = r.course_id
       JOIN College col ON col.college_id = c.college_id
       ORDER BY r.registered_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function register(req, res) {
  const conn = await db.getConnection();
  try {
    let { student_id, course_id } = req.body;
    if (!course_id)
      return res.status(400).json({ success: false, message: 'course_id required' });

    await conn.beginTransaction();

    if (req.user.role === 'Student') {
      student_id = await findStudentIdByEmail(conn, req.user.email);
      if (!student_id) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }
    } else if (!student_id) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'student_id required' });
    }

    // Check duplicate
    const [exists] = await conn.query(
      'SELECT reg_id FROM Registration WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    if (exists.length) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Already registered for this course' });
    }

    // Verify student and course exist
    const [[student]] = await conn.query('SELECT student_id FROM Student WHERE student_id = ?', [student_id]);
    const [[course]]  = await conn.query('SELECT course_id FROM Course WHERE course_id = ?', [course_id]);
    if (!student || !course) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Student or course not found' });
    }

    const [result] = await conn.query(
      'INSERT INTO Registration(student_id, course_id, registered_at) VALUES(?, ?, NOW())',
      [student_id, course_id]
    );

    await conn.commit();
    res.status(201).json({ success: true, message: 'Successfully registered', reg_id: result.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
}

async function unregister(req, res) {
  try {
    let result;

    if (req.user.role === 'Student') {
      const studentId = await findStudentIdByEmail(db, req.user.email);
      if (!studentId) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      [result] = await db.query(
        'DELETE FROM Registration WHERE reg_id = ? AND student_id = ?',
        [req.params.id, studentId]
      );
    } else {
      [result] = await db.query('DELETE FROM Registration WHERE reg_id = ?', [req.params.id]);
    }

    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, message: 'Unregistered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, register, unregister };
