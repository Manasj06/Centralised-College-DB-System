/**
 * setup.js — Run this ONCE to set up the database with correct password hashes.
 * Usage: node setup.js
 * This replaces the need to manually run database.sql with placeholder hashes.
 */

require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const cfg = {
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function setup() {
  const conn = await mysql.createConnection(cfg);
  console.log('✅ Connected to MySQL\n');

  // ── Create DB and tables ────────────────────────────────────
  console.log('⏳ Creating database and tables…');
  await conn.query(`CREATE DATABASE IF NOT EXISTS CollegeDB;`);
  await conn.query(`USE CollegeDB;`);

  const tables = `
    DROP TABLE IF EXISTS Registration;
    DROP TABLE IF EXISTS Login;
    DROP TABLE IF EXISTS Permission;
    DROP TABLE IF EXISTS Student;
    DROP TABLE IF EXISTS Course;
    DROP TABLE IF EXISTS User;
    DROP TABLE IF EXISTS Roles;
    DROP TABLE IF EXISTS College;

    CREATE TABLE Roles (
      role_id    INT AUTO_INCREMENT PRIMARY KEY,
      role_name  VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(200)
    );

    CREATE TABLE College (
      college_id       INT AUTO_INCREMENT PRIMARY KEY,
      college_name     VARCHAR(150) NOT NULL,
      city             VARCHAR(100),
      established_year YEAR,
      email            VARCHAR(100),
      phone            VARCHAR(20)
    );

    CREATE TABLE User (
      user_id    INT AUTO_INCREMENT PRIMARY KEY,
      full_name  VARCHAR(100) NOT NULL,
      email      VARCHAR(100) NOT NULL UNIQUE,
      role_id    INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES Roles(role_id)
    );

    CREATE TABLE Login (
      login_id      INT AUTO_INCREMENT PRIMARY KEY,
      user_id       INT NOT NULL UNIQUE,
      username      VARCHAR(60) NOT NULL UNIQUE,
      password_hash VARCHAR(256) NOT NULL,
      last_login    TIMESTAMP NULL,
      CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
    );

    CREATE TABLE Permission (
      permission_id INT AUTO_INCREMENT PRIMARY KEY,
      role_id       INT NOT NULL,
      module_name   VARCHAR(60) NOT NULL,
      can_read      TINYINT(1) DEFAULT 0,
      can_write     TINYINT(1) DEFAULT 0,
      can_delete    TINYINT(1) DEFAULT 0,
      CONSTRAINT fk_perm_role FOREIGN KEY (role_id) REFERENCES Roles(role_id),
      UNIQUE KEY uq_role_module (role_id, module_name)
    );

    CREATE TABLE Student (
      student_id  INT AUTO_INCREMENT PRIMARY KEY,
      full_name   VARCHAR(100) NOT NULL,
      email       VARCHAR(100) NOT NULL UNIQUE,
      dob         DATE NOT NULL,
      gender      ENUM('Male','Female','Other') NOT NULL,
      phone       VARCHAR(15),
      college_id  INT NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_student_college FOREIGN KEY (college_id) REFERENCES College(college_id)
    );

    CREATE TABLE Course (
      course_id   INT AUTO_INCREMENT PRIMARY KEY,
      course_name VARCHAR(150) NOT NULL,
      course_code VARCHAR(20) NOT NULL UNIQUE,
      credits     TINYINT NOT NULL,
      college_id  INT NOT NULL,
      description TEXT,
      CONSTRAINT chk_credits   CHECK (credits BETWEEN 1 AND 6),
      CONSTRAINT fk_course_col FOREIGN KEY (college_id) REFERENCES College(college_id)
    );

    CREATE TABLE Registration (
      reg_id        INT AUTO_INCREMENT PRIMARY KEY,
      student_id    INT NOT NULL,
      course_id     INT NOT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_reg (student_id, course_id),
      CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
      CONSTRAINT fk_reg_course  FOREIGN KEY (course_id)  REFERENCES Course(course_id)  ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Registration_Log (
      log_id      INT AUTO_INCREMENT PRIMARY KEY,
      student_id  INT,
      course_id   INT,
      action      VARCHAR(10),
      action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await conn.query(tables);
  console.log('✅ Tables created\n');

  // ── Seed data ───────────────────────────────────────────────
  await conn.query(`
    INSERT INTO Roles(role_name, description) VALUES
      ('Admin',   'Full system access'),
      ('Faculty', 'Course and student management'),
      ('Student', 'View courses and self-register');

    INSERT INTO College(college_name, city, established_year, email, phone) VALUES
      ('PSG College of Technology',           'Coimbatore', 1951, 'info@psgtech.ac.in',    '0422-4344000'),
      ('MIT - Madras Institute of Technology','Chennai',    1949, 'info@mitchennai.edu',   '044-22516681'),
      ('College of Engineering Guindy',       'Chennai',    1794, 'info@ceg.ac.in',        '044-22350397'),
      ('Sri Sivasubramaniya Nadar College',   'Chennai',    1996, 'info@ssn.edu.in',       '044-27469700');

    INSERT INTO User(full_name, email, role_id) VALUES
      ('System Administrator', 'admin@college.edu',   1),
      ('Dr. Priya Ramesh',     'priya.r@college.edu', 2),
      ('Dr. Arjun Nair',       'arjun.n@college.edu', 2),
      ('Kavya Reddy',          'kavya@student.edu',   3),
      ('Ravi Kumar',           'ravi@student.edu',    3),
      ('Anitha Devi',          'anitha@student.edu',  3);

    INSERT INTO Permission(role_id, module_name, can_read, can_write, can_delete) VALUES
      (1,'Students',1,1,1),(1,'Courses',1,1,1),(1,'Colleges',1,1,1),(1,'Users',1,1,1),(1,'Registrations',1,1,1),
      (2,'Students',1,1,0),(2,'Courses',1,1,0),(2,'Registrations',1,0,0),
      (3,'Courses',1,0,0),(3,'Registrations',1,1,0);

    INSERT INTO Student(full_name, email, dob, gender, phone, college_id) VALUES
      ('Kavya Reddy',     'kavya@student.edu',   '2003-05-12','Female','9876543210',1),
      ('Ravi Kumar',      'ravi@student.edu',    '2002-08-20','Male',  '9876543211',2),
      ('Anitha Devi',     'anitha@student.edu',  '2003-01-15','Female','9876543212',1),
      ('Mohammed Farhan', 'farhan@student.edu',  '2002-11-30','Male',  '9876543213',3),
      ('Sneha Iyer',      'sneha@student.edu',   '2003-07-22','Female','9876543214',4),
      ('Deepak Raj',      'deepak@student.edu',  '2002-03-18','Male',  '9876543215',2),
      ('Pooja Menon',     'pooja@student.edu',   '2003-09-05','Female','9876543216',3),
      ('Aryan Sharma',    'aryan@student.edu',   '2002-12-10','Male',  '9876543217',4);

    INSERT INTO Course(course_name, course_code, credits, college_id, description) VALUES
      ('Database Management Systems',    'CS301',4,1,'Covers relational DB design, SQL, transactions and concurrency.'),
      ('Operating Systems',              'CS302',3,1,'Process management, memory management, file systems.'),
      ('Computer Networks',              'CS303',3,2,'OSI model, TCP/IP, routing protocols and network security.'),
      ('Software Engineering',           'CS304',4,2,'SDLC, agile methodologies, testing and project management.'),
      ('Machine Learning',               'CS401',4,1,'Supervised and unsupervised learning, neural networks.'),
      ('Web Technologies',               'CS305',3,3,'HTML, CSS, JavaScript, REST APIs, and full-stack development.'),
      ('Data Structures and Algorithms', 'CS201',4,3,'Arrays, linked lists, trees, graphs, sorting and searching.'),
      ('Artificial Intelligence',        'CS402',3,4,'Search algorithms, knowledge representation, expert systems.'),
      ('Cloud Computing',                'CS501',3,4,'Cloud architecture, AWS, Azure, and deployment strategies.'),
      ('Cybersecurity Fundamentals',     'CS502',3,2,'Encryption, network security, ethical hacking basics.');

    INSERT INTO Registration(student_id, course_id) VALUES
      (1,1),(1,2),(1,5),(2,3),(2,4),(3,1),(3,6),
      (4,7),(4,3),(5,8),(5,9),(6,2),(6,10),(7,6),(7,7),(8,8),(8,1);
  `);

  // ── Generate password hashes ────────────────────────────────
  console.log('⏳ Hashing passwords…');
  const adminHash   = await bcrypt.hash('Admin@123',   10);
  const facultyHash = await bcrypt.hash('Faculty@123', 10);
  const studentHash = await bcrypt.hash('Student@123', 10);

  await conn.query(`
    INSERT INTO Login(user_id, username, password_hash) VALUES
      (1, 'admin',    ?),
      (2, 'priya_r',  ?),
      (3, 'arjun_n',  ?),
      (4, 'kavya_r',  ?),
      (5, 'ravi_k',   ?),
      (6, 'anitha_d', ?)
  `, [adminHash, facultyHash, facultyHash, studentHash, studentHash, studentHash]);

  // ── Create triggers ─────────────────────────────────────────
  await conn.query(`DROP TRIGGER IF EXISTS trg_after_registration_insert`);
  await conn.query(`
    CREATE TRIGGER trg_after_registration_insert
    AFTER INSERT ON Registration
    FOR EACH ROW
    BEGIN
      INSERT INTO Registration_Log(student_id, course_id, action)
      VALUES (NEW.student_id, NEW.course_id, 'INSERT');
    END
  `);

  // ── Create views ────────────────────────────────────────────
  await conn.query(`
    CREATE OR REPLACE VIEW vw_student_course_summary AS
    SELECT s.student_id, s.full_name AS student_name, s.email,
           col.college_name, c.course_name, c.course_code, c.credits, r.registered_at
    FROM Student s
    JOIN College col      ON col.college_id = s.college_id
    JOIN Registration r   ON r.student_id   = s.student_id
    JOIN Course c         ON c.course_id    = r.course_id
  `);

  await conn.close();

  console.log('✅ All done! Database seeded successfully.\n');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│         TEST LOGIN CREDENTIALS          │');
  console.log('├──────────────┬──────────────────────────┤');
  console.log('│ admin        │ Admin@123                │');
  console.log('│ priya_r      │ Faculty@123              │');
  console.log('│ kavya_r      │ Student@123              │');
  console.log('└──────────────┴──────────────────────────┘');
  console.log('\n▶  Now run: node server.js');
  console.log('▶  Open:    http://localhost:5000\n');
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
