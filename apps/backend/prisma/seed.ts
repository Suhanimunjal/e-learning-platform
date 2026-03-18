import { PrismaClient, ModuleType, PluginCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'lms_db',
  user: 'lms_user',
  password: 'lms_password',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = 'Test@123';

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: { password: await bcrypt.hash(password, 10) },
    create: {
      email: 'admin@lms.com',
      name: 'Admin User',
      password: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: { password: await bcrypt.hash(password, 10) },
    create: {
      email: 'teacher@example.com',
      name: 'Demo Teacher',
      password: await bcrypt.hash(password, 10),
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@lms.com' },
    update: { password: await bcrypt.hash(password, 10) },
    create: {
      email: 'student@lms.com',
      name: 'Demo Student',
      password: await bcrypt.hash(password, 10),
      role: 'STUDENT',
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'intro-web-dev' },
    update: {},
    create: {
      id: 'demo-course-1',
      title: 'Introduction to Web Development',
      slug: 'intro-web-dev',
      description: 'Learn the fundamentals of web development with HTML, CSS, and JavaScript.',
      thumbnail: null,
      price: 0,
      published: true,
      instructorId: teacher.id,
    },
  });

  const section = await prisma.section.upsert({
    where: { id: 'demo-section-1' },
    update: {},
    create: {
      id: 'demo-section-1',
      title: 'Getting Started',
      order: 1,
      courseId: course.id,
    },
  });

  const modules: { id: string; title: string; type: ModuleType; order: number; textContent?: string }[] = [
    { id: 'demo-module-1', title: 'What is Web Development?', type: 'LESSON', order: 1, textContent: 'Web development is the process of creating websites and web applications. It involves a combination of frontend development (what users see) and backend development (server-side logic). In this course, we will explore the fundamentals of both.' },
    { id: 'demo-module-2', title: 'HTML Basics', type: 'LESSON', order: 2, textContent: 'HTML stands for HyperText Markup Language. It is the standard markup language for creating web pages. HTML describes the structure of a web page using elements.' },
    { id: 'demo-module-3', title: 'CSS Fundamentals', type: 'LESSON', order: 3, textContent: 'CSS (Cascading Style Sheets) is used to style and layout web pages. With CSS, you can control colors, fonts, spacing, and the overall visual appearance of your website.' },
    { id: 'demo-module-4', title: 'JavaScript Introduction', type: 'LESSON', order: 4, textContent: 'JavaScript is a programming language that enables interactive web pages. It is an essential part of web applications and is supported by all modern browsers.' },
    { id: 'demo-module-5', title: 'Section Quiz', type: 'QUIZ', order: 5 },
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {},
      create: {
        id: mod.id,
        title: mod.title,
        type: mod.type,
        order: mod.order,
        content: {},
        sectionId: section.id,
        ...(mod.textContent && { textContent: mod.textContent }),
      },
    });
  }

  // Seed 50 plugins
  const plugins = [
    { pluginId: 'plugin-advanced-analytics', name: 'Advanced Analytics', category: 'ANALYTICS' as PluginCategory, author: 'Analytics Team' },
    { pluginId: 'plugin-gamification-system', name: 'Gamification System', category: 'GAMIFICATION' as PluginCategory, author: 'Engagement Team' },
    { pluginId: 'plugin-video-hosting', name: 'Video Hosting Integration', category: 'CONTENT' as PluginCategory, author: 'Media Team' },
    { pluginId: 'plugin-scorm-support', name: 'SCORM Support', category: 'CONTENT' as PluginCategory, author: 'Standards Team' },
    { pluginId: 'plugin-social-learning', name: 'Social Learning', category: 'COMMUNICATION' as PluginCategory, author: 'Community Team' },
    { pluginId: 'plugin-forum-system', name: 'Forum System', category: 'COMMUNICATION' as PluginCategory, author: 'Community Team' },
    { pluginId: 'plugin-peer-review', name: 'Peer Review System', category: 'USERMGMT' as PluginCategory, author: 'Assessment Team' },
    { pluginId: 'plugin-email-notifications', name: 'Email Notifications', category: 'COMMUNICATION' as PluginCategory, author: 'Notifications Team' },
    { pluginId: 'plugin-sms-alerts', name: 'SMS Alerts', category: 'COMMUNICATION' as PluginCategory, author: 'Notifications Team' },
    { pluginId: 'plugin-attendance-tracking', name: 'Attendance Tracking', category: 'ANALYTICS' as PluginCategory, author: 'Analytics Team' },
    { pluginId: 'plugin-certificate-generator', name: 'Certificate Generator', category: 'UTILITY' as PluginCategory, author: 'Admin Team' },
    { pluginId: 'plugin-course-branching', name: 'Course Branching Logic', category: 'CONTENT' as PluginCategory, author: 'Content Team' },
    { pluginId: 'plugin-adaptive-learning', name: 'Adaptive Learning Paths', category: 'AI' as PluginCategory, author: 'AI Team' },
    { pluginId: 'plugin-content-recommender', name: 'Content Recommender', category: 'AI' as PluginCategory, author: 'AI Team' },
    { pluginId: 'plugin-chatbot', name: 'AI Chatbot Support', category: 'AI' as PluginCategory, author: 'AI Team' },
    { pluginId: 'plugin-stripe-payment', name: 'Stripe Payments', category: 'PAYMENTS' as PluginCategory, author: 'Payments Team' },
    { pluginId: 'plugin-razorpay-payment', name: 'Razorpay Payments', category: 'PAYMENTS' as PluginCategory, author: 'Payments Team' },
    { pluginId: 'plugin-subscription-mgmt', name: 'Subscription Management', category: 'PAYMENTS' as PluginCategory, author: 'Payments Team' },
    { pluginId: 'plugin-oauth-integration', name: 'OAuth Integration', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-zoom-integration', name: 'Zoom Integration', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-teams-integration', name: 'Microsoft Teams Integration', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-slack-integration', name: 'Slack Integration', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-google-classroom', name: 'Google Classroom Sync', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-canvas-integration', name: 'Canvas LMS Integration', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-blackboard-integration', name: 'Blackboard Integration', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-moodle-bridge', name: 'Moodle Bridge', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-grade-sync', name: 'Grade Synchronization', category: 'INTEGRATIONS' as PluginCategory, author: 'Integration Team' },
    { pluginId: 'plugin-ldap-sync', name: 'LDAP User Sync', category: 'USERMGMT' as PluginCategory, author: 'User Management Team' },
    { pluginId: 'plugin-sso-saml', name: 'SSO (SAML)', category: 'USERMGMT' as PluginCategory, author: 'User Management Team' },
    { pluginId: 'plugin-role-permissions', name: 'Advanced Role Permissions', category: 'USERMGMT' as PluginCategory, author: 'User Management Team' },
    { pluginId: 'plugin-custom-fields', name: 'Custom User Fields', category: 'USERMGMT' as PluginCategory, author: 'User Management Team' },
    { pluginId: 'plugin-bulk-import', name: 'Bulk User Import', category: 'USERMGMT' as PluginCategory, author: 'User Management Team' },
    { pluginId: 'plugin-reporting-engine', name: 'Advanced Reporting Engine', category: 'ANALYTICS' as PluginCategory, author: 'Analytics Team' },
    { pluginId: 'plugin-data-visualization', name: 'Data Visualization Dashboard', category: 'ANALYTICS' as PluginCategory, author: 'Analytics Team' },
    { pluginId: 'plugin-real-time-stats', name: 'Real-time Statistics', category: 'ANALYTICS' as PluginCategory, author: 'Analytics Team' },
    { pluginId: 'plugin-learner-engagement', name: 'Learner Engagement Metrics', category: 'ANALYTICS' as PluginCategory, author: 'Analytics Team' },
    { pluginId: 'plugin-content-library', name: 'Content Library', category: 'CONTENT' as PluginCategory, author: 'Content Team' },
    { pluginId: 'plugin-interactive-lessons', name: 'Interactive Lessons', category: 'CONTENT' as PluginCategory, author: 'Content Team' },
    { pluginId: 'plugin-interactive-quizzes', name: 'Interactive Quizzes', category: 'CONTENT' as PluginCategory, author: 'Content Team' },
    { pluginId: 'plugin-question-bank', name: 'Question Bank Management', category: 'CONTENT' as PluginCategory, author: 'Content Team' },
    { pluginId: 'plugin-assessment-tools', name: 'Advanced Assessment Tools', category: 'UTILITY' as PluginCategory, author: 'Assessment Team' },
    { pluginId: 'plugin-rubric-grading', name: 'Rubric-based Grading', category: 'UTILITY' as PluginCategory, author: 'Assessment Team' },
    { pluginId: 'plugin-plagiarism-check', name: 'Plagiarism Detection', category: 'UTILITY' as PluginCategory, author: 'Assessment Team' },
    { pluginId: 'plugin-proctoring', name: 'AI Proctoring', category: 'UTILITY' as PluginCategory, author: 'Proctoring Team' },
    { pluginId: 'plugin-accessibility', name: 'Accessibility Enhancement', category: 'UTILITY' as PluginCategory, author: 'Accessibility Team' },
    { pluginId: 'plugin-mobile-app', name: 'Mobile App Sync', category: 'UTILITY' as PluginCategory, author: 'Mobile Team' },
    { pluginId: 'plugin-offline-mode', name: 'Offline Mode', category: 'UTILITY' as PluginCategory, author: 'Mobile Team' },
    { pluginId: 'plugin-white-label', name: 'White Label Customization', category: 'UTILITY' as PluginCategory, author: 'Customization Team' },
    { pluginId: 'plugin-theme-builder', name: 'Theme Builder', category: 'UTILITY' as PluginCategory, author: 'Design Team' },
    { pluginId: 'plugin-backup-restore', name: 'Backup & Restore', category: 'UTILITY' as PluginCategory, author: 'Admin Team' },
  ];

  for (const pluginData of plugins) {
    await prisma.plugin.upsert({
      where: { pluginId: pluginData.pluginId },
      update: {},
      create: {
        pluginId: pluginData.pluginId,
        name: pluginData.name,
        description: `${pluginData.name} - Enhance your LMS with powerful features`,
        version: '1.0.0',
        author: pluginData.author,
        category: pluginData.category,
        icon: '⚡',
        enabled: false,
        config: {},
      },
    });
  }

  console.log('Updated demo users');
  console.log('Admin:', admin.email);
  console.log('Teacher:', teacher.email);
  console.log('Student:', student.email);
  console.log('Created course:', course.title);
  console.log('Created', modules.length, 'modules');
  console.log('Created', plugins.length, 'plugins');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
