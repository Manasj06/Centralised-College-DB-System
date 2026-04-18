const express = require('express');
const router  = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const auth         = require('../controllers/authController');
const students     = require('../controllers/studentController');
const courses      = require('../controllers/courseController');
const colleges     = require('../controllers/collegeController');
const users        = require('../controllers/userController');
const registrations= require('../controllers/registrationController');
const dashboard    = require('../controllers/dashboardController');

// ── AUTH ─────────────────────────────────────────────────────────────────────
router.post('/auth/login',  auth.login);
router.get('/auth/me',      authenticate, auth.getMe);

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', authenticate, authorize('Admin', 'Faculty'), dashboard.getStats);

// ── STUDENTS ──────────────────────────────────────────────────────────────────
router.get('/students',           authenticate, authorize('Admin', 'Faculty'), students.getAll);
router.get('/students/me',        authenticate, authorize('Student'), students.getMe);
router.get('/students/me/courses', authenticate, authorize('Student'), students.getMyCourses);
router.get('/students/:id',       authenticate, students.getById);
router.post('/students',          authenticate, authorize('Admin'), students.create);
router.put('/students/:id',       authenticate, authorize('Admin'), students.update);
router.delete('/students/:id',    authenticate, authorize('Admin'), students.remove);
router.get('/students/:id/courses', authenticate, students.getStudentCourses);

// ── COURSES ───────────────────────────────────────────────────────────────────
router.get('/courses',            authenticate, courses.getAll);
router.get('/courses/:id',        authenticate, courses.getById);
router.post('/courses',           authenticate, authorize('Admin', 'Faculty'), courses.create);
router.put('/courses/:id',        authenticate, authorize('Admin', 'Faculty'), courses.update);
router.delete('/courses/:id',     authenticate, authorize('Admin'), courses.remove);
router.get('/courses/:id/students', authenticate, authorize('Admin','Faculty'), courses.getCourseStudents);

// ── COLLEGES ──────────────────────────────────────────────────────────────────
router.get('/colleges',           authenticate, colleges.getAll);
router.post('/colleges',          authenticate, authorize('Admin'), colleges.create);
router.put('/colleges/:id',       authenticate, authorize('Admin'), colleges.update);
router.delete('/colleges/:id',    authenticate, authorize('Admin'), colleges.remove);

// ── USERS ─────────────────────────────────────────────────────────────────────
router.get('/users',              authenticate, authorize('Admin'), users.getAll);
router.post('/users',             authenticate, authorize('Admin'), users.create);
router.put('/users/:id',          authenticate, authorize('Admin'), users.update);
router.delete('/users/:id',       authenticate, authorize('Admin'), users.remove);
router.get('/roles',              authenticate, users.getRoles);

// ── REGISTRATIONS ─────────────────────────────────────────────────────────────
router.get('/registrations',      authenticate, authorize('Admin','Faculty'), registrations.getAll);
router.post('/registrations',     authenticate, authorize('Admin','Student'), registrations.register);
router.delete('/registrations/:id', authenticate, authorize('Admin','Student'), registrations.unregister);

module.exports = router;
