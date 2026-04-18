const db = require('../config/db');

async function getStats(req, res) {
  try {
    const [[{ totalStudents }]]     = await db.query('SELECT COUNT(*) AS totalStudents FROM Student');
    const [[{ totalCourses }]]      = await db.query('SELECT COUNT(*) AS totalCourses FROM Course');
    const [[{ totalColleges }]]     = await db.query('SELECT COUNT(*) AS totalColleges FROM College');
    const [[{ totalUsers }]]        = await db.query('SELECT COUNT(*) AS totalUsers FROM User');
    const [[{ totalRegistrations }]]= await db.query('SELECT COUNT(*) AS totalRegistrations FROM Registration');

    const [topCourses] = await db.query(
      `SELECT c.course_name, c.course_code, COUNT(r.reg_id) AS enrolled
       FROM Course c LEFT JOIN Registration r ON r.course_id = c.course_id
       GROUP BY c.course_id ORDER BY enrolled DESC LIMIT 5`
    );

    const [recentRegistrations] = await db.query(
      `SELECT s.full_name AS student, c.course_name AS course, r.registered_at
       FROM Registration r
       JOIN Student s ON s.student_id = r.student_id
       JOIN Course c  ON c.course_id  = r.course_id
       ORDER BY r.registered_at DESC LIMIT 8`
    );

    res.json({
      success: true,
      data: { totalStudents, totalCourses, totalColleges, totalUsers, totalRegistrations, topCourses, recentRegistrations }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getStats };
