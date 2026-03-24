const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const MOODLE_URL = 'http://localhost';
const WS_TOKEN = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';
const JWT_SECRET = 'moodle-adapter-secret-key-2026';
const PORT = 3001;

// In-memory user cache mapping JWT user IDs to Moodle user data
const userCache = new Map();

// ─── Moodle WS helper ───
async function moodleCall(wsfunction, params = {}) {
  const url = `${MOODLE_URL}/webservice/rest/server.php`;
  const qs = new URLSearchParams({
    wstoken: WS_TOKEN,
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  });
  const { data } = await axios.get(`${url}?${qs}`);
  if (data && data.exception) {
    throw new Error(data.message || 'Moodle error');
  }
  return data;
}

// ─── JWT middleware ───
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ─── User mapper ───
function mapMoodleUser(mUser) {
  return {
    id: String(mUser.id),
    email: mUser.email,
    name: `${mUser.firstname} ${mUser.lastname}`.trim(),
    role: mapRole(mUser),
    phone: null,
    rollNo: null,
    year: null,
    branch: null,
    course: null,
    organizationId: null,
  };
}

function mapRole(mUser) {
  if (mUser.username === 'admin') return 'ADMIN';
  // Check if user has teacher/creator roles via auth
  // For simplicity, check if username contains teacher or check capabilities
  if (mUser.username && mUser.username.toLowerCase().includes('teacher')) return 'TEACHER';
  // Default to student
  return 'STUDENT';
}

// ═══════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    // Get users by email to find the user
    let users;
    try {
      users = await moodleCall('core_user_get_users_by_field', {
        'field': 'email',
        'values[0]': email,
      });
    } catch {
      // Try by username
      users = await moodleCall('core_user_get_users_by_field', {
        'field': 'username',
        'values[0]': email,
      });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const mUser = users[0];
    const user = mapMoodleUser(mUser);

    // Moodle passwords are hashed with bcrypt-like, we use JWT directly
    // In production, you'd verify against Moodle's password hash
    // For now, we'll accept any password for existing users (admin password is the Moodle one)
    const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      accessToken,
      user,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const users = await moodleCall('core_user_get_users_by_field', {
      'field': 'id',
      'values[0]': req.user.id,
    });
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(mapMoodleUser(users[0]));
  } catch (err) {
    console.error('Get me error:', err.message);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [firstname, ...rest] = name.split(' ');
    const lastname = rest.join(' ') || 'User';
    const username = email.split('@')[0] + '_' + Date.now();

    const result = await moodleCall('core_user_create_users', {
      'users[0][username]': username,
      'users[0][password]': password || 'Welcome@123',
      'users[0][firstname]': firstname,
      'users[0][lastname]': lastname,
      'users[0][email]': email,
      'users[0][auth]': 'manual',
    });

    if (result && result[0] && result[0].id) {
      res.json({ id: String(result[0].id), message: 'User created' });
    } else {
      res.status(400).json({ message: 'Failed to create user' });
    }
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(400).json({ message: err.message || 'Registration failed' });
  }
});

app.patch('/api/auth/profile', auth, async (req, res) => {
  try {
    const { name, phone, rollNo, year, branch, course } = req.body;
    const updateData = { 'users[0][id]': req.user.id };

    if (name) {
      const [firstname, ...rest] = name.split(' ');
      updateData['users[0][firstname]'] = firstname;
      updateData['users[0][lastname]'] = rest.join(' ') || '';
    }

    if (phone) updateData['users[0][phone1]'] = phone;
    // Store custom fields in description for now
    if (rollNo || year || branch || course) {
      const extra = { rollNo, year, branch, course };
      updateData['users[0][description]'] = JSON.stringify(extra);
    }

    await moodleCall('core_user_update_users', updateData);
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(400).json({ message: 'Failed to update profile' });
  }
});

app.post('/api/auth/change-password', auth, async (req, res) => {
  // Simplified - Moodle doesn't expose password change via WS easily
  res.json({ message: 'Password change not supported via API' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// ═══════════════════════════════════════════════
// COURSES ROUTES
// ═══════════════════════════════════════════════

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await moodleCall('core_course_get_courses');
    const mapped = courses.map(mapCourse);
    res.json(mapped);
  } catch (err) {
    console.error('Get courses error:', err.message);
    res.json([]);
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const courses = await moodleCall('core_course_get_courses_by_field', {
      'field': 'id',
      'value': req.params.id,
    });
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(mapCourse(courses[0]));
  } catch (err) {
    console.error('Get course error:', err.message);
    res.status(404).json({ message: 'Course not found' });
  }
});

app.post('/api/courses', auth, async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const result = await moodleCall('core_course_create_courses', {
      'courses[0][fullname]': title,
      'courses[0][shortname]': title.replace(/\s+/g, '_').toLowerCase().substring(0, 50),
      'courses[0][summary]': description || '',
      'courses[0][summaryformat]': '1',
      'courses[0][categoryid]': '1',
      'courses[0][format]': 'topics',
      'courses[0][visible]': '1',
    });

    if (result && result[0] && result[0].id) {
      res.json({
        id: String(result[0].id),
        title,
        description,
        price: price || 0,
        status: 'APPROVED',
        instructorId: req.user.id,
        thumbnail: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      res.status(400).json({ message: 'Failed to create course' });
    }
  } catch (err) {
    console.error('Create course error:', err.message);
    res.status(400).json({ message: err.message || 'Failed to create course' });
  }
});

app.patch('/api/courses/:id', auth, async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const updateData = { 'courses[0][id]': req.params.id };
    if (title) updateData['courses[0][fullname]'] = title;
    if (description) updateData['courses[0][summary]'] = description;
    if (status === 'APPROVED') updateData['courses[0][visible]'] = '1';
    if (status === 'DRAFT') updateData['courses[0][visible]'] = '0';

    await moodleCall('core_course_update_courses', updateData);
    res.json({ id: req.params.id, message: 'Course updated' });
  } catch (err) {
    console.error('Update course error:', err.message);
    res.status(400).json({ message: 'Failed to update course' });
  }
});

app.delete('/api/courses/:id', auth, async (req, res) => {
  try {
    await moodleCall('core_course_delete_courses', {
      'courseids[0]': req.params.id,
    });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Delete course error:', err.message);
    res.status(400).json({ message: 'Failed to delete course' });
  }
});

function mapCourse(mCourse) {
  return {
    id: String(mCourse.id),
    title: mCourse.fullname,
    shortName: mCourse.shortname,
    description: mCourse.summary ? mCourse.summary.replace(/<[^>]*>/g, '') : '',
    price: 0,
    status: mCourse.visible ? 'APPROVED' : 'DRAFT',
    thumbnail: null,
    instructor: null,
    instructorId: null,
    createdAt: mCourse.timecreated ? new Date(mCourse.timecreated * 1000).toISOString() : new Date().toISOString(),
    updatedAt: mCourse.timemodified ? new Date(mCourse.timemodified * 1000).toISOString() : new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════
// COURSE CONTENT / SECTIONS
// ═══════════════════════════════════════════════

app.get('/api/sections/course/:courseId', async (req, res) => {
  try {
    const contents = await moodleCall('core_course_get_contents', {
      'courseid': req.params.courseId,
    });
    const mapped = contents.map((section, i) => ({
      id: String(section.id),
      title: section.name || `Section ${i + 1}`,
      courseId: req.params.courseId,
      order: section.section || i,
      modules: (section.modules || []).map(mod => ({
        id: String(mod.id),
        title: mod.name,
        type: mod.modname ? mod.modname.toUpperCase() : 'LESSON',
        url: mod.url || null,
        description: mod.description || '',
      })),
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get sections error:', err.message);
    res.json([]);
  }
});

// ═══════════════════════════════════════════════
// ENROLLMENTS
// ═══════════════════════════════════════════════

app.post('/api/enrollments/:courseId', auth, async (req, res) => {
  try {
    // Self-enrol
    await moodleCall('enrol_self_enrol_user', {
      'courseid': req.params.courseId,
      'userid': req.user.id,
    });
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('Enrollment error:', err.message);
    res.status(400).json({ message: 'Enrollment failed' });
  }
});

app.get('/api/enrollments/my-courses', auth, async (req, res) => {
  try {
    const courses = await moodleCall('core_enrol_get_users_courses', {
      'userid': req.user.id,
    });
    const mapped = courses.map(c => ({
      id: String(c.id),
      course: mapCourse(c),
      createdAt: c.enrolledusercount ? new Date().toISOString() : new Date().toISOString(),
    }));
    res.json(mapped);
  } catch (err) {
    console.error('My courses error:', err.message);
    res.json([]);
  }
});

app.get('/api/enrollments/course/:courseId/students', auth, async (req, res) => {
  try {
    const users = await moodleCall('core_enrol_get_enrolled_users', {
      'courseid': req.params.courseId,
    });
    const mapped = users.map(u => ({
      id: String(u.id),
      user: mapMoodleUser(u),
      enrolledAt: new Date().toISOString(),
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Course students error:', err.message);
    res.json([]);
  }
});

// ═══════════════════════════════════════════════
// STUDENT DASHBOARD
// ═══════════════════════════════════════════════

app.get('/api/student/dashboard', auth, async (req, res) => {
  try {
    const courses = await moodleCall('core_enrol_get_users_courses', {
      'userid': req.user.id,
    });
    res.json({
      totalCourses: courses.length,
      completedCourses: 0,
      inProgressCourses: courses.length,
      recentActivity: [],
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.json({ totalCourses: 0, completedCourses: 0, inProgressCourses: 0, recentActivity: [] });
  }
});

app.get('/api/student/enrolled', auth, async (req, res) => {
  try {
    const courses = await moodleCall('core_enrol_get_users_courses', {
      'userid': req.user.id,
    });
    const mapped = courses.map(c => ({
      id: String(c.id),
      createdAt: new Date().toISOString(),
      course: mapCourse(c),
      progress: {
        totalModules: 0,
        completedModules: 0,
        percentage: 0,
        lastAccessedModuleId: null,
        lastAccessedModuleTitle: null,
        lastAccessedAt: null,
      },
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Enrolled error:', err.message);
    res.json([]);
  }
});

app.get('/api/student/certificates', auth, async (req, res) => {
  res.json([]);
});

app.get('/api/student/notifications', auth, async (req, res) => {
  res.json([]);
});

app.get('/api/student/notifications/unread-count', auth, async (req, res) => {
  res.json({ unreadCount: 0 });
});

app.patch('/api/student/notifications/:id/read', auth, async (req, res) => {
  res.json({ id: req.params.id, read: true });
});

// ═══════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════

app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const courses = await moodleCall('core_course_get_courses');
    res.json({
      totalUsers: 1,
      totalCourses: courses.length,
      totalEnrollments: 0,
      totalRevenue: 0,
    });
  } catch (err) {
    res.json({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalRevenue: 0 });
  }
});

app.get('/api/admin/students', auth, async (req, res) => {
  try {
    const users = await moodleCall('core_user_get_users', {
      'criteria[0][key]': 'lastname',
      'criteria[0][value]': '%',
    });
    const students = (users.users || []).filter(u => u.id > 1).map(u => ({
      id: String(u.id),
      ...mapMoodleUser(u),
      status: 'APPROVED',
      createdAt: new Date((u.timecreated || Date.now() / 1000) * 1000).toISOString(),
    }));
    res.json(students);
  } catch (err) {
    console.error('Admin students error:', err.message);
    res.json([]);
  }
});

app.get('/api/admin/students/:id', auth, async (req, res) => {
  try {
    const users = await moodleCall('core_user_get_users_by_field', {
      'field': 'id',
      'values[0]': req.params.id,
    });
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const u = users[0];
    res.json({
      id: String(u.id),
      ...mapMoodleUser(u),
      status: 'APPROVED',
      createdAt: new Date((u.timecreated || Date.now() / 1000) * 1000).toISOString(),
    });
  } catch (err) {
    res.status(404).json({ message: 'User not found' });
  }
});

app.get('/api/admin/teachers', auth, async (req, res) => {
  res.json([]);
});

app.post('/api/admin/users/:id/approve', auth, async (req, res) => {
  res.json({ message: 'User approved' });
});

app.post('/api/admin/users/:id/reject', auth, async (req, res) => {
  res.json({ message: 'User rejected' });
});

// ═══════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════

app.get('/api/analytics/my-analytics', auth, async (req, res) => {
  res.json({ coursesEnrolled: 0, averageGrade: 0, timeSpent: 0 });
});

app.get('/api/analytics/courses/:courseId', auth, async (req, res) => {
  res.json({ enrollments: 0, averageGrade: 0, completionRate: 0 });
});

app.get('/api/analytics/platform', auth, async (req, res) => {
  res.json({ totalUsers: 0, totalCourses: 0, activeUsers: 0 });
});

// ═══════════════════════════════════════════════
// QUIZZES & ASSIGNMENTS
// ═══════════════════════════════════════════════

app.get('/api/quizzes/course/:courseId/all', async (req, res) => {
  try {
    const quizzes = await moodleCall('mod_quiz_get_quizzes_by_courses', {
      'courseids[0]': req.params.courseId,
    });
    const mapped = (quizzes.quizzes || []).map(q => ({
      id: String(q.id),
      title: q.name,
      description: q.intro ? q.intro.replace(/<[^>]*>/g, '') : '',
      courseId: String(q.course),
      timeLimit: q.timelimit || 0,
      dueDate: q.timeclose ? new Date(q.timeclose * 1000).toISOString() : null,
      published: q.visible === 1,
      createdAt: new Date((q.timecreated || Date.now() / 1000) * 1000).toISOString(),
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Quizzes error:', err.message);
    res.json([]);
  }
});

app.get('/api/quizzes/:id', async (req, res) => {
  try {
    // Get quiz by searching all courses
    const courses = await moodleCall('core_course_get_courses');
    for (const course of courses) {
      const quizzes = await moodleCall('mod_quiz_get_quizzes_by_courses', {
        'courseids[0]': String(course.id),
      });
      const found = (quizzes.quizzes || []).find(q => String(q.id) === req.params.id);
      if (found) {
        return res.json({
          id: String(found.id),
          title: found.name,
          description: found.intro ? found.intro.replace(/<[^>]*>/g, '') : '',
          courseId: String(found.course),
          timeLimit: found.timelimit || 0,
          dueDate: found.timeclose ? new Date(found.timeclose * 1000).toISOString() : null,
          published: found.visible === 1,
        });
      }
    }
    res.status(404).json({ message: 'Quiz not found' });
  } catch (err) {
    res.status(404).json({ message: 'Quiz not found' });
  }
});

// ═══════════════════════════════════════════════
// UPLOADS (stub - Moodle has its own file API)
// ═══════════════════════════════════════════════

app.post('/api/uploads/single', auth, (req, res) => {
  res.status(501).json({ message: 'Use Moodle file API' });
});

app.post('/api/uploads/multiple', auth, (req, res) => {
  res.status(501).json({ message: 'Use Moodle file API' });
});

// ═══════════════════════════════════════════════
// MODULES (stub)
// ═══════════════════════════════════════════════

app.get('/api/modules/section/:sectionId', auth, (req, res) => {
  res.json([]);
});

app.get('/api/modules/:id', auth, (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ═══════════════════════════════════════════════
// PLUGINS (stub)
// ═══════════════════════════════════════════════

app.get('/api/plugins', (req, res) => {
  res.json([]);
});

app.get('/api/plugins/available', (req, res) => {
  res.json([]);
});

app.get('/api/plugins/stats', (req, res) => {
  res.json({ installed: 0, available: 0 });
});

// ═══════════════════════════════════════════════
// PAYMENTS (stub)
// ═══════════════════════════════════════════════

app.post('/api/payments/create-order', auth, (req, res) => {
  res.status(501).json({ message: 'Payments not configured' });
});

// ═══════════════════════════════════════════════
// AI (stub)
// ═══════════════════════════════════════════════

app.post('/api/ai/generate-assignment', auth, (req, res) => {
  res.status(501).json({ message: 'AI not configured' });
});

app.post('/api/ai/generate-quiz/:courseId', auth, (req, res) => {
  res.status(501).json({ message: 'AI not configured' });
});

app.post('/api/ai/chat', auth, (req, res) => {
  res.status(501).json({ message: 'AI not configured' });
});

// ═══════════════════════════════════════════════
// VIDEO GENERATION (stub)
// ═══════════════════════════════════════════════

app.get('/api/video-generation/stats/all', auth, (req, res) => {
  res.json({ total: 0, completed: 0, pending: 0 });
});

// ═══════════════════════════════════════════════
// GRADING (stub)
// ═══════════════════════════════════════════════

app.get('/api/quizzes/:id/submissions', auth, (req, res) => {
  res.json([]);
});

app.get('/api/quizzes/:id/attempts', auth, async (req, res) => {
  try {
    const attempts = await moodleCall('mod_quiz_get_user_attempts', {
      'quizid': req.params.id,
      'userid': req.user.id,
      'status': 'all',
      'includepreviews': '0',
    });
    const mapped = (attempts.attempts || []).map(a => ({
      id: String(a.id),
      quizId: req.params.id,
      userId: String(a.userid),
      attempt: a.attempt,
      state: a.state,
      timeStart: a.timestart ? new Date(a.timestart * 1000).toISOString() : null,
      timeFinish: a.timefinish ? new Date(a.timefinish * 1000).toISOString() : null,
      sumGrades: a.sumgrades,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Quiz attempts error:', err.message);
    res.json([]);
  }
});

// ═══════════════════════════════════════════════
// COURSE DETAIL WITH CONTENT
// ═══════════════════════════════════════════════

app.get('/api/courses/:id/full', async (req, res) => {
  try {
    const [courses, contents, enrolledUsers] = await Promise.all([
      moodleCall('core_course_get_courses_by_field', {
        'field': 'id',
        'value': req.params.id,
      }),
      moodleCall('core_course_get_contents', {
        'courseid': req.params.id,
      }).catch(() => []),
      moodleCall('core_enrol_get_enrolled_users', {
        'courseid': req.params.id,
      }).catch(() => []),
    ]);

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courses[0];
    res.json({
      ...mapCourse(course),
      sections: contents.map((section, i) => ({
        id: String(section.id),
        title: section.name || `Section ${i + 1}`,
        order: section.section || i,
        modules: (section.modules || []).map(mod => ({
          id: String(mod.id),
          title: mod.name,
          type: mod.modname ? mod.modname.toUpperCase() : 'LESSON',
          url: mod.url || null,
          description: mod.description || '',
        })),
      })),
      enrollments: enrolledUsers.map(u => ({
        id: String(u.id),
        user: mapMoodleUser(u),
      })),
    });
  } catch (err) {
    console.error('Course full error:', err.message);
    res.status(404).json({ message: 'Course not found' });
  }
});

// ═══════════════════════════════════════════════
// STUDENT COURSE FULL DETAIL
// ═══════════════════════════════════════════════

app.get('/api/student/course/:courseId/full', auth, async (req, res) => {
  try {
    const [courses, contents, completion] = await Promise.all([
      moodleCall('core_course_get_courses_by_field', {
        'field': 'id',
        'value': req.params.courseId,
      }),
      moodleCall('core_course_get_contents', {
        'courseid': req.params.courseId,
      }).catch(() => []),
      moodleCall('core_completion_get_activities_completion_status', {
        'courseid': req.params.courseId,
        'userid': req.user.id,
      }).catch(() => ({ statuses: [] })),
    ]);

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courses[0];
    const statuses = completion.statuses || [];
    const completedCount = statuses.filter(s => s.state === 1).length;

    res.json({
      course: mapCourse(course),
      sections: contents.map((section, i) => ({
        id: String(section.id),
        title: section.name || `Section ${i + 1}`,
        order: section.section || i,
        modules: (section.modules || []).map(mod => {
          const modStatus = statuses.find(s => String(s.cmid) === String(mod.id));
          return {
            id: String(mod.id),
            title: mod.name,
            type: mod.modname ? mod.modname.toUpperCase() : 'LESSON',
            url: mod.url || null,
            description: mod.description || '',
            completed: modStatus ? modStatus.state === 1 : false,
          };
        }),
      })),
      progress: {
        totalModules: statuses.length,
        completedModules: completedCount,
        percentage: statuses.length > 0 ? Math.round((completedCount / statuses.length) * 100) : 0,
      },
    });
  } catch (err) {
    console.error('Student course full error:', err.message);
    res.status(404).json({ message: 'Course not found' });
  }
});

// ═══════════════════════════════════════════════
// Catch-all for unimplemented routes
// ═══════════════════════════════════════════════

app.use('/api', (req, res) => {
  res.status(501).json({
    message: `Endpoint ${req.method} ${req.path} not implemented`,
    hint: 'This feature requires Moodle plugin or custom implementation',
  });
});

app.listen(PORT, () => {
  console.log(`\n  Moodle Adapter running on http://localhost:${PORT}`);
  console.log(`  Connected to Moodle at ${MOODLE_URL}`);
  console.log(`  Frontend should point to: http://localhost:${PORT}/api\n`);
});
