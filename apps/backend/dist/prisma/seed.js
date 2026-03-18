"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + '/../.env' });
const pool = new pg_1.Pool({
    host: 'localhost',
    port: 5432,
    database: 'lms_db',
    user: 'lms_user',
    password: 'lms_password',
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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
    const modules = [
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
    const plugins = [
        { pluginId: 'plugin-advanced-analytics', name: 'Advanced Analytics', category: 'ANALYTICS', author: 'Analytics Team' },
        { pluginId: 'plugin-gamification-system', name: 'Gamification System', category: 'GAMIFICATION', author: 'Engagement Team' },
        { pluginId: 'plugin-video-hosting', name: 'Video Hosting Integration', category: 'CONTENT', author: 'Media Team' },
        { pluginId: 'plugin-scorm-support', name: 'SCORM Support', category: 'CONTENT', author: 'Standards Team' },
        { pluginId: 'plugin-social-learning', name: 'Social Learning', category: 'COMMUNICATION', author: 'Community Team' },
        { pluginId: 'plugin-forum-system', name: 'Forum System', category: 'COMMUNICATION', author: 'Community Team' },
        { pluginId: 'plugin-peer-review', name: 'Peer Review System', category: 'USERMGMT', author: 'Assessment Team' },
        { pluginId: 'plugin-email-notifications', name: 'Email Notifications', category: 'COMMUNICATION', author: 'Notifications Team' },
        { pluginId: 'plugin-sms-alerts', name: 'SMS Alerts', category: 'COMMUNICATION', author: 'Notifications Team' },
        { pluginId: 'plugin-attendance-tracking', name: 'Attendance Tracking', category: 'ANALYTICS', author: 'Analytics Team' },
        { pluginId: 'plugin-certificate-generator', name: 'Certificate Generator', category: 'UTILITY', author: 'Admin Team' },
        { pluginId: 'plugin-course-branching', name: 'Course Branching Logic', category: 'CONTENT', author: 'Content Team' },
        { pluginId: 'plugin-adaptive-learning', name: 'Adaptive Learning Paths', category: 'AI', author: 'AI Team' },
        { pluginId: 'plugin-content-recommender', name: 'Content Recommender', category: 'AI', author: 'AI Team' },
        { pluginId: 'plugin-chatbot', name: 'AI Chatbot Support', category: 'AI', author: 'AI Team' },
        { pluginId: 'plugin-stripe-payment', name: 'Stripe Payments', category: 'PAYMENTS', author: 'Payments Team' },
        { pluginId: 'plugin-razorpay-payment', name: 'Razorpay Payments', category: 'PAYMENTS', author: 'Payments Team' },
        { pluginId: 'plugin-subscription-mgmt', name: 'Subscription Management', category: 'PAYMENTS', author: 'Payments Team' },
        { pluginId: 'plugin-oauth-integration', name: 'OAuth Integration', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-zoom-integration', name: 'Zoom Integration', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-teams-integration', name: 'Microsoft Teams Integration', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-slack-integration', name: 'Slack Integration', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-google-classroom', name: 'Google Classroom Sync', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-canvas-integration', name: 'Canvas LMS Integration', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-blackboard-integration', name: 'Blackboard Integration', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-moodle-bridge', name: 'Moodle Bridge', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-grade-sync', name: 'Grade Synchronization', category: 'INTEGRATIONS', author: 'Integration Team' },
        { pluginId: 'plugin-ldap-sync', name: 'LDAP User Sync', category: 'USERMGMT', author: 'User Management Team' },
        { pluginId: 'plugin-sso-saml', name: 'SSO (SAML)', category: 'USERMGMT', author: 'User Management Team' },
        { pluginId: 'plugin-role-permissions', name: 'Advanced Role Permissions', category: 'USERMGMT', author: 'User Management Team' },
        { pluginId: 'plugin-custom-fields', name: 'Custom User Fields', category: 'USERMGMT', author: 'User Management Team' },
        { pluginId: 'plugin-bulk-import', name: 'Bulk User Import', category: 'USERMGMT', author: 'User Management Team' },
        { pluginId: 'plugin-reporting-engine', name: 'Advanced Reporting Engine', category: 'ANALYTICS', author: 'Analytics Team' },
        { pluginId: 'plugin-data-visualization', name: 'Data Visualization Dashboard', category: 'ANALYTICS', author: 'Analytics Team' },
        { pluginId: 'plugin-real-time-stats', name: 'Real-time Statistics', category: 'ANALYTICS', author: 'Analytics Team' },
        { pluginId: 'plugin-learner-engagement', name: 'Learner Engagement Metrics', category: 'ANALYTICS', author: 'Analytics Team' },
        { pluginId: 'plugin-content-library', name: 'Content Library', category: 'CONTENT', author: 'Content Team' },
        { pluginId: 'plugin-interactive-lessons', name: 'Interactive Lessons', category: 'CONTENT', author: 'Content Team' },
        { pluginId: 'plugin-interactive-quizzes', name: 'Interactive Quizzes', category: 'CONTENT', author: 'Content Team' },
        { pluginId: 'plugin-question-bank', name: 'Question Bank Management', category: 'CONTENT', author: 'Content Team' },
        { pluginId: 'plugin-assessment-tools', name: 'Advanced Assessment Tools', category: 'UTILITY', author: 'Assessment Team' },
        { pluginId: 'plugin-rubric-grading', name: 'Rubric-based Grading', category: 'UTILITY', author: 'Assessment Team' },
        { pluginId: 'plugin-plagiarism-check', name: 'Plagiarism Detection', category: 'UTILITY', author: 'Assessment Team' },
        { pluginId: 'plugin-proctoring', name: 'AI Proctoring', category: 'UTILITY', author: 'Proctoring Team' },
        { pluginId: 'plugin-accessibility', name: 'Accessibility Enhancement', category: 'UTILITY', author: 'Accessibility Team' },
        { pluginId: 'plugin-mobile-app', name: 'Mobile App Sync', category: 'UTILITY', author: 'Mobile Team' },
        { pluginId: 'plugin-offline-mode', name: 'Offline Mode', category: 'UTILITY', author: 'Mobile Team' },
        { pluginId: 'plugin-white-label', name: 'White Label Customization', category: 'UTILITY', author: 'Customization Team' },
        { pluginId: 'plugin-theme-builder', name: 'Theme Builder', category: 'UTILITY', author: 'Design Team' },
        { pluginId: 'plugin-backup-restore', name: 'Backup & Restore', category: 'UTILITY', author: 'Admin Team' },
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
//# sourceMappingURL=seed.js.map