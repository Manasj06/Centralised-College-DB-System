# Centralized College Database Management System

A full-stack web application with Role-Based Access Control (RBAC) built with Node.js, Express, MySQL, and vanilla HTML/CSS/JS.

---

## 🗂️ Project Structure

```
college-cms/
├── backend/
│   ├── config/
│   │   └── db.js               # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js   # Login / JWT
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   ├── collegeController.js
│   │   ├── userController.js
│   │   ├── registrationController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js             # JWT verify + role authorization
│   ├── routes/
│   │   └── index.js            # All API routes
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Express app entry point
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js              # Centralized fetch wrapper
│   │   ├── utils.js            # Toast, modal, search helpers
│   │   ├── app.js              # Login, routing, nav
│   │   └── pages/
│   │       ├── dashboard.js
│   │       ├── students.js
│   │       ├── courses.js
│   │       ├── colleges.js
│   │       ├── users.js
│   │       ├── registrations.js
│   │       └── my-courses.js
│   └── index.html
└── database.sql                # Schema + sample data
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v16+
- MySQL 8.0+

---

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=CollegeDB
JWT_SECRET=college_cms_super_secret_2024
PORT=5000
```

Initialize the database with seeded users and real bcrypt password hashes:

```bash
node setup.js
```

This creates:
- All 8 tables (Roles, College, User, Login, Permission, Student, Course, Registration)
- Sample data with 4 colleges, 10 courses, 8 students, 6 users
- Registration audit trigger
- Reporting view
- Working test logins for the sample users

If you prefer a manual SQL import, you can also run:

```bash
mysql -u root < database.sql
```

Start the server:

```bash
node server.js
# or for auto-reload:
npx nodemon server.js
```

You should see:
```
✅ MySQL connected successfully
🚀 College CMS Server running on http://localhost:5000
```

### Step 2: Open Frontend

Open your browser and go to:

```
http://localhost:5000
```

The backend serves the frontend automatically.

---

## 🔐 Test Credentials

| Role    | Username  | Password     |
|---------|-----------|--------------|
| Admin   | admin     | Admin@123    |
| Faculty | priya_r   | Faculty@123  |
| Faculty | arjun_n   | Faculty@123  |
| Student | kavya_r   | Student@123  |
| Student | ravi_k    | Student@123  |
| Student | anitha_d  | Student@123  |

---

## 🛠️ API Endpoints

### Auth
| Method | Endpoint        | Description      |
|--------|-----------------|------------------|
| POST   | /api/auth/login | Login (get JWT)  |
| GET    | /api/auth/me    | Get current user |

### Students (Admin/Faculty)
| Method | Endpoint                       | Description             |
|--------|--------------------------------|-------------------------|
| GET    | /api/students                  | List all students       |
| POST   | /api/students                  | Create student (Admin)  |
| PUT    | /api/students/:id              | Update student (Admin)  |
| DELETE | /api/students/:id              | Delete student (Admin)  |
| GET    | /api/students/:id/courses      | Student's courses       |

### Courses (All roles)
| Method | Endpoint                       | Description                  |
|--------|--------------------------------|------------------------------|
| GET    | /api/courses                   | List all courses             |
| POST   | /api/courses                   | Create (Admin/Faculty)       |
| PUT    | /api/courses/:id               | Update (Admin/Faculty)       |
| DELETE | /api/courses/:id               | Delete (Admin only)          |
| GET    | /api/courses/:id/students      | Students in course           |

### Colleges, Users, Registrations
Similar CRUD structure with role-based guards.

---

## 🔐 RBAC Summary

| Feature              | Admin | Faculty | Student |
|----------------------|-------|---------|---------|
| Dashboard stats      | ✅    | ✅      | ❌      |
| Manage students      | ✅    | View    | ❌      |
| Manage courses       | ✅    | ✅      | View    |
| Manage colleges      | ✅    | ❌      | ❌      |
| Manage users/roles   | ✅    | ❌      | ❌      |
| View all registrations| ✅   | ✅      | ❌      |
| Register for courses | ❌    | ❌      | ✅      |
| View own courses     | ❌    | ❌      | ✅      |

---

## 🚀 Features

- JWT-based authentication with 8h expiry
- bcrypt password hashing (salt rounds: 10)
- MySQL connection pooling (10 connections)
- Transactional course registration with duplicate prevention
- Audit triggers on Registration table
- Full CRUD for Students, Courses, Colleges, Users
- Real-time search filtering in all tables
- Toast notifications for all operations
- Responsive sidebar navigation
- Role-specific dashboards and views
