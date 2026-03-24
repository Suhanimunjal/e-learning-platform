# Moodle Frontend Remapping Plan
## Modern Next.js Frontend for Moodle LMS

---

## Overview

This project replaces the traditional PHP-rendered Moodle frontend with a modern **Next.js 15** frontend that communicates with Moodle via its **REST Web Services API**. An Express.js adapter layer bridges the gap between the frontend's expected API format and Moodle's web service endpoints.

---

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Next.js Frontend  │────▶│   Express Adapter   │────▶│   Moodle REST API   │
│   (Port 3000)       │◀────│   (Port 3001)       │◀────│   (Port 80)         │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
     React 18                  Translates API calls        Moodle 5.1
     TypeScript                JWT Auth bridge             XAMPP stack
     Tailwind CSS              Response mapping
```

---

## Directory Structure

```
D:/projects/Moodle/
├── server/                    # XAMPP Moodle (Apache, MariaDB, PHP)
│   ├── moodle/               # Moodle 5.1 core
│   ├── moodledata/           # Moodle data directory
│   ├── mysql/                # MariaDB
│   ├── apache/               # Apache
│   └── php/                  # PHP
├── adapter/                   # Express.js API adapter
│   ├── index.js              # Main server (PORT 3001)
│   └── package.json
├── frontend/                  # Next.js 15 frontend (to be created)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   └── lib/              # Utilities & API client
│   └── package.json
├── FRONTEND_REMAPPING_PLAN.md # This file
└── README.md
```

---

## Feature Mapping: Moodle → Next.js Frontend

### Authentication & User Management

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| Login | `core_user_get_users_by_field` + JWT | `/login` | ✅ Done |
| Register (Student) | `core_user_create_users` | `/register` | ✅ Done |
| Logout | JWT client-side clear | `/logout` | ✅ Done |
| View Profile | `core_user_get_users_by_field` | `/settings` | 🔄 Pending |
| Update Profile | `core_user_update_users` | `/settings` | 🔄 Pending |
| Password Change | Manual Moodle integration | `/settings` | ❌ Not Done |
| User Roles | Moodle role assignment | Built into auth | ✅ Done |

### Course Management

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| List All Courses | `core_course_get_courses` | `/courses` | ✅ Done |
| View Course | `core_course_get_courses_by_field` | `/courses/[id]` | ✅ Done |
| Course Contents | `core_course_get_contents` | `/courses/[id]` | ✅ Done |
| Create Course | `core_course_create_courses` | `/courses/create` | ✅ Done |
| Edit Course | `core_course_update_courses` | `/courses/[id]/edit` | 🔄 Pending |
| Delete Course | `core_course_delete_courses` | Admin panel | ✅ Done |
| Course Categories | `core_course_get_categories` | `/courses` filters | 🔄 Pending |
| Search Courses | `core_course_search_courses` | `/courses` | 🔄 Pending |

### Enrollment

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| Self Enrollment | `enrol_self_enrol_user` | `/courses/[id]` | ✅ Done |
| Manual Enrollment | `enrol_manual_enrol_users` | Teacher dashboard | 🔄 Pending |
| Unenroll | `enrol_manual_unenrol_users` | Teacher dashboard | 🔄 Pending |
| View Enrolled | `core_enrol_get_users_courses` | `/dashboard/student` | ✅ Done |
| Course Students | `core_enrol_get_enrolled_users` | `/dashboard/teacher/students` | ✅ Done |
| Pending Enrollments | Custom handler | `/dashboard/teacher` | 🔄 Pending |

### Student Features

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| Student Dashboard | Aggregate WS calls | `/dashboard/student` | ✅ Done |
| View Enrolled Courses | `core_enrol_get_users_courses` | `/dashboard/student/courses` | ✅ Done |
| Course Progress | `core_completion_*` APIs | `/courses/[id]` | ✅ Done |
| Take Quiz | `mod_quiz_start_attempt`, `mod_quiz_process_attempt` | `/quizzes/[id]` | 🔄 Pending |
| Submit Assignment | `mod_assign_save_submission` | `/assignments/[id]` | 🔄 Pending |
| View Grades | `gradereport_overview_get_course_grades` | `/dashboard/student/grades` | 🔄 Pending |
| Certificates | Custom/Moodle badge | `/dashboard/student/certificates` | 🔄 Pending |
| Notifications | Custom handler | `/dashboard/student` | 🔄 Pending |

### Teacher Features

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| Teacher Dashboard | Aggregate WS calls | `/dashboard/teacher` | ✅ Done |
| My Courses | `core_course_get_courses` (filtered) | `/dashboard/teacher/courses` | ✅ Done |
| Create Section | `core_course_create_sections` | `/courses/[id]` edit | 🔄 Pending |
| Add Module | `core_course_create_module` | `/courses/[id]` edit | 🔄 Pending |
| View Submissions | `mod_assign_get_submissions` | `/dashboard/teacher/grading` | 🔄 Pending |
| Grade Submission | `mod_assign_save_grade` | `/dashboard/teacher/grading` | 🔄 Pending |
| Quiz Submissions | `mod_quiz_get_user_attempts` | `/dashboard/teacher/quizzes` | 🔄 Pending |
| Grade Quiz | Custom grading | `/dashboard/teacher/grading` | 🔄 Pending |
| Student List | `core_enrol_get_enrolled_users` | `/dashboard/teacher/students` | ✅ Done |

### Admin Features

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| Admin Dashboard | Aggregate WS calls | `/dashboard/admin` | ✅ Done |
| User Management | `core_user_get_users`, `core_user_*` | `/dashboard/admin/users` | ✅ Done |
| Approve Users | Custom handler | `/dashboard/admin/users` | 🔄 Pending |
| Blacklist Users | Custom handler | `/dashboard/admin/users` | 🔄 Pending |
| Course Management | `core_course_*` APIs | `/dashboard/admin/courses` | ✅ Done |
| Platform Analytics | Aggregate data | `/dashboard/admin/analytics` | 🔄 Pending |
| System Settings | Moodle admin settings | `/dashboard/admin/settings` | ❌ Not Done |

### Quiz & Assignment Features

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| List Quizzes | `mod_quiz_get_quizzes_by_courses` | `/quizzes` | ✅ Done |
| Quiz Details | `mod_quiz_get_quizzes_by_courses` | `/quizzes/[id]` | ✅ Done |
| Start Attempt | `mod_quiz_start_attempt` | `/quizzes/[id]/attempt` | 🔄 Pending |
| Submit Attempt | `mod_quiz_process_attempt` | `/quizzes/[id]/attempt` | 🔄 Pending |
| Review Attempt | `mod_quiz_get_attempt_review` | `/quizzes/[id]/review` | 🔄 Pending |
| List Assignments | `mod_assign_get_assignments` | `/assignments` | 🔄 Pending |
| Assignment Details | `mod_assign_get_submissions` | `/assignments/[id]` | 🔄 Pending |
| Submit Work | `mod_assign_save_submission` | `/assignments/[id]/submit` | 🔄 Pending |

### Completion & Progress

| Moodle Feature | Moodle Web Service | Frontend Route | Status |
|----------------|-------------------|----------------|--------|
| Activity Completion | `core_completion_get_activities_completion_status` | Course view | ✅ Done |
| Course Completion | `core_completion_get_course_completion_status` | Course view | ✅ Done |
| Mark Complete | `core_completion_update_activity_completion_status_manually` | Course view | 🔄 Pending |
| Progress Dashboard | Aggregate data | `/dashboard/student` | ✅ Done |

---

## Implementation Status Summary

### ✅ Completed (Core Functionality)

1. **Moodle Setup**
   - XAMPP installation and configuration
   - MariaDB database creation
   - Moodle 5.1 installation
   - REST Web Services enabled

2. **API Adapter (Express.js)**
   - Core authentication endpoints
   - Course CRUD operations
   - Enrollment endpoints
   - Student dashboard data
   - Admin user management
   - Quiz listing

3. **Frontend (Design Reference - to be rebuilt)**
   - Modern UI components (Button, Card, Modal, etc.)
   - Layout components (Navbar, Sidebar, DashboardLayout)
   - Auth context and providers
   - API client with interceptors

### 🔄 Pending (In Progress)

1. **Frontend Pages**
   - Course detail page with content
   - Quiz taking interface
   - Assignment submission interface
   - Teacher grading interface
   - Settings/Profile page
   - Course creation/editing forms

2. **Adapter Endpoints**
   - Quiz attempt start/submit/review
   - Assignment submission/grading
   - Manual enrollment management
   - Course section/module management
   - Notification system

3. **Integration**
   - End-to-end testing
   - Error handling improvements
   - Loading states
   - Responsive design fixes

### ❌ Not Started

1. **Advanced Features**
   - AI-powered features (requires separate backend)
   - Video generation (requires separate backend)
   - Payment integration (Razorpay)
   - Plugin management system
   - Chatbot functionality

2. **Moodle-Specific Features**
   - Custom Moodle themes
   - Plugin installation UI
   - Gradebook full integration
   - Competencies framework
   - Learning plans

---

## Technical Stack

| Layer | Technology | Version |
|-------|------------|---------|
| LMS Backend | Moodle | 5.1dev |
| Database | MariaDB | (bundled) |
| Web Server | Apache | 2.4.56 |
| API Adapter | Express.js | 5.x |
| Frontend Framework | Next.js | 15.x |
| UI Library | React | 18.x |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | 5.x |
| HTTP Client | Axios | 1.x |
| Icons | Lucide React | 0.577.x |

---

## Quick Start Commands

### Start Moodle (XAMPP)
```bash
# Run the Start Moodle.exe or:
cd server
apache_start.bat
```

### Start API Adapter
```bash
cd adapter
npm install
node index.js
# Runs on http://localhost:3001
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Adapter (configurable in index.js)
```javascript
const MOODLE_URL = 'http://localhost';
const WS_TOKEN = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';
const JWT_SECRET = 'moodle-adapter-secret-key-2026';
const PORT = 3001;
```

---

## API Endpoint Reference

### Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/register` | Register new user |
| PATCH | `/api/auth/profile` | Update user profile |
| POST | `/api/auth/logout` | Logout |

### Course Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course by ID |
| GET | `/api/courses/:id/full` | Get course with content |
| POST | `/api/courses` | Create new course |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Enrollment Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/enrollments/:courseId` | Self-enroll in course |
| GET | `/api/enrollments/my-courses` | Get user's enrolled courses |
| GET | `/api/enrollments/course/:id/students` | Get course students |

### Student Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/student/dashboard` | Get dashboard data |
| GET | `/api/student/enrolled` | Get enrolled with progress |
| GET | `/api/student/course/:id/full` | Get course with progress |
| GET | `/api/student/certificates` | Get certificates |
| GET | `/api/student/notifications` | Get notifications |

### Admin Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Get platform statistics |
| GET | `/api/admin/students` | List all students |
| GET | `/api/admin/teachers` | List all teachers |
| POST | `/api/admin/users/:id/approve` | Approve user |
| POST | `/api/admin/users/:id/reject` | Reject user |

### Quiz Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/quizzes/course/:courseId/all` | List course quizzes |
| GET | `/api/quizzes/:id` | Get quiz details |
| GET | `/api/quizzes/:id/attempts` | Get quiz attempts |

---

## Notes

- The legacy frontend at `D:/projects/moodle_legacy/` serves as a **design reference only**
- All features must be rebuilt to work with Moodle's REST API via the adapter
- AI features, video generation, and payments require separate backends
- Moodle password verification is handled via JWT (simplified auth model)

---

*Last Updated: March 24, 2026*
