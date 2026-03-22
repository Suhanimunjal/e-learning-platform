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
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('Starting database seed...\n');
    console.log('Cleaning existing data...');
    await prisma.moduleQuizAttempt.deleteMany();
    await prisma.moduleQuestion.deleteMany();
    await prisma.moduleQuiz.deleteMany();
    await prisma.contentItem.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.module.deleteMany();
    await prisma.section.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.aIGenerationJob.deleteMany();
    await prisma.analyticsEvent.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
    await prisma.course.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
    await prisma.plugin.deleteMany();
    console.log('Cleaned existing data\n');
    console.log('Creating organizations...');
    const org1 = await prisma.organization.create({
        data: {
            name: 'Tech Academy',
            slug: 'tech-academy',
            domain: 'techacademy.com',
            settings: { theme: 'blue', timezone: 'UTC' },
        },
    });
    const org2 = await prisma.organization.create({
        data: {
            name: 'LearnHub Institute',
            slug: 'learnhub-institute',
            domain: 'learnhub.edu',
            settings: { theme: 'green', timezone: 'America/New_York' },
        },
    });
    console.log('Created 2 organizations\n');
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'suhanimunjal97@gmail.com',
            name: 'System Admin',
            password: hashedPassword,
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.ACTIVE,
            organizationId: org1.id,
        },
    });
    const admin2 = await prisma.user.create({
        data: {
            email: 'tanubhavj.mca25@cs.du.ac.in',
            name: 'Tanubhav Jain',
            password: hashedPassword,
            role: client_1.Role.ADMIN,
            status: client_1.UserStatus.ACTIVE,
            organizationId: org1.id,
        },
    });
    const teacher1 = await prisma.user.create({
        data: {
            email: 'teacher@example.com',
            name: 'John Smith',
            password: hashedPassword,
            role: client_1.Role.TEACHER,
            status: client_1.UserStatus.ACTIVE,
            phone: '+91 9876543210',
            organizationId: org1.id,
        },
    });
    const teacher2 = await prisma.user.create({
        data: {
            email: 'teacher2@example.com',
            name: 'Sarah Johnson',
            password: hashedPassword,
            role: client_1.Role.TEACHER,
            status: client_1.UserStatus.ACTIVE,
            phone: '+91 9123456780',
            organizationId: org2.id,
        },
    });
    const teacher3 = await prisma.user.create({
        data: {
            email: 'junejatanubhav@gmail.com',
            name: 'Tanubhav Juneja',
            password: hashedPassword,
            role: client_1.Role.TEACHER,
            status: client_1.UserStatus.ACTIVE,
            phone: '+91 9876501234',
            organizationId: org1.id,
        },
    });
    const student1 = await prisma.user.create({
        data: {
            email: 'student@lms.com',
            name: 'Alice Williams',
            password: hashedPassword,
            role: client_1.Role.STUDENT,
            status: client_1.UserStatus.ACTIVE,
            phone: '+91 8765432109',
            rollNo: 'CS2025001',
            year: '2nd Year',
            branch: 'Computer Science',
            course: 'MCA',
            organizationId: org1.id,
        },
    });
    const student2 = await prisma.user.create({
        data: {
            email: 'student2@lms.com',
            name: 'Bob Davis',
            password: hashedPassword,
            role: client_1.Role.STUDENT,
            status: client_1.UserStatus.ACTIVE,
            phone: '+91 7654321098',
            rollNo: 'CS2025002',
            year: '1st Year',
            branch: 'Computer Science',
            course: 'B.Tech',
            organizationId: org1.id,
        },
    });
    const student3 = await prisma.user.create({
        data: {
            email: 'student3@lms.com',
            name: 'Carol Martinez',
            password: hashedPassword,
            role: client_1.Role.STUDENT,
            status: client_1.UserStatus.ACTIVE,
            phone: '+91 6543210987',
            rollNo: 'EC2025003',
            year: '3rd Year',
            branch: 'Electronics',
            course: 'B.Tech',
            organizationId: org2.id,
        },
    });
    console.log('Created 8 users\n');
    console.log('Creating subscription plans...');
    await prisma.subscriptionPlan.createMany({
        data: [
            {
                name: 'Basic',
                description: 'Access to basic courses',
                price: 9.99,
                billingCycle: 'monthly',
                features: ['Access to basic courses', 'Community forum', 'Email support'],
                maxCourses: 5,
                maxStudents: 100,
                isActive: true,
            },
            {
                name: 'Professional',
                description: 'Access to all courses and features',
                price: 29.99,
                billingCycle: 'monthly',
                features: ['Access to all courses', 'Priority support', 'Certificates', 'AI tutoring'],
                maxCourses: -1,
                maxStudents: 1000,
                isActive: true,
            },
            {
                name: 'Enterprise',
                description: 'Full platform access for organizations',
                price: 99.99,
                billingCycle: 'monthly',
                features: ['Unlimited courses', 'Unlimited students', 'Custom branding', 'API access', 'Dedicated support'],
                maxCourses: -1,
                maxStudents: -1,
                isActive: true,
            },
        ],
    });
    console.log('Created 3 subscription plans\n');
    console.log('Creating courses...');
    const course1 = await prisma.course.create({
        data: {
            title: 'Introduction to JavaScript',
            slug: 'intro-javascript',
            description: 'Learn the fundamentals of JavaScript programming. Perfect for beginners who want to start web development.',
            instructorId: teacher1.id,
            price: 0,
            status: 'APPROVED',
            thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
        },
    });
    const course2 = await prisma.course.create({
        data: {
            title: 'Advanced React Patterns',
            slug: 'advanced-react-patterns',
            description: 'Master advanced React concepts including hooks, context, performance optimization, and testing.',
            instructorId: teacher1.id,
            price: 49.99,
            status: 'APPROVED',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-45a1465c2479?w=800',
        },
    });
    const course3 = await prisma.course.create({
        data: {
            title: 'Python for Data Science',
            slug: 'python-data-science',
            description: 'Learn Python programming with a focus on data analysis, visualization, and machine learning.',
            instructorId: teacher2.id,
            price: 79.99,
            status: 'APPROVED',
            thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        },
    });
    const course4 = await prisma.course.create({
        data: {
            title: 'CSS Grid & Flexbox Mastery',
            slug: 'css-grid-flexbox',
            description: 'Create stunning responsive layouts with modern CSS techniques.',
            instructorId: teacher2.id,
            price: 29.99,
            status: 'REJECTED',
            thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        },
    });
    const course5 = await prisma.course.create({
        data: {
            title: 'Web Development Fundamentals',
            slug: 'web-dev-fundamentals',
            description: 'Learn HTML, CSS, and JavaScript to build modern websites from scratch.',
            instructorId: teacher3.id,
            price: 0,
            status: 'APPROVED',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        },
    });
    console.log('Created 5 courses\n');
    console.log('Creating sections and modules for course5...');
    const c5Section1 = await prisma.section.create({
        data: { title: 'Introduction to HTML', courseId: course5.id, order: 1 },
    });
    const c5Section2 = await prisma.section.create({
        data: { title: 'CSS Fundamentals', courseId: course5.id, order: 2 },
    });
    const c5Section3 = await prisma.section.create({
        data: { title: 'JavaScript Basics', courseId: course5.id, order: 3 },
    });
    const c5Section4 = await prisma.section.create({
        data: { title: 'Building a Website Project', courseId: course5.id, order: 4 },
    });
    const c5Module1 = await prisma.module.create({
        data: {
            title: 'Introduction to HTML',
            sectionId: c5Section1.id,
            type: client_1.ModuleType.LESSON,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages.',
        },
    });
    await prisma.contentItem.createMany({
        data: [
            {
                moduleId: c5Module1.id,
                type: 'PDF',
                title: 'HTML Basics Presentation',
                url: 'https://www.w3schools.com/html/pic_trulli.jpg',
                order: 1,
                metadata: { fileSize: '2.5MB', pages: 25 },
            },
        ],
    });
    const c5Module2 = await prisma.module.create({
        data: {
            title: 'HTML Elements and Tags',
            sectionId: c5Section1.id,
            type: client_1.ModuleType.LESSON,
            order: 2,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'HTML elements are the building blocks of web pages.',
        },
    });
    await prisma.contentItem.createMany({
        data: [
            {
                moduleId: c5Module2.id,
                type: 'YOUTUBE',
                title: 'HTML Tutorial for Beginners',
                url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
                order: 1,
                duration: 120,
            },
        ],
    });
    const c5Module3 = await prisma.module.create({
        data: {
            title: 'Getting Started with CSS',
            sectionId: c5Section2.id,
            type: client_1.ModuleType.LESSON,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'CSS (Cascading Style Sheets) is used to style and layout web pages.',
        },
    });
    await prisma.contentItem.createMany({
        data: [
            {
                moduleId: c5Module3.id,
                type: 'VIDEO',
                title: 'CSS Fundamentals Video',
                url: 'https://www.w3schools.com/css/mov_bbb.mp4',
                order: 1,
                duration: 600,
            },
            {
                moduleId: c5Module3.id,
                type: 'EXTERNAL_LINK',
                title: 'MDN CSS Documentation',
                url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
                order: 2,
                metadata: { description: 'Official CSS documentation' },
            },
        ],
    });
    const c5Module4 = await prisma.module.create({
        data: {
            title: 'JavaScript Fundamentals Quiz',
            sectionId: c5Section3.id,
            type: client_1.ModuleType.QUIZ,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
        },
    });
    const c5Quiz = await prisma.moduleQuiz.create({
        data: {
            moduleId: c5Module4.id,
            title: 'JavaScript Basics Assessment',
            description: 'Test your knowledge of JavaScript fundamentals',
            timeLimit: 20,
            maxAttempts: 2,
            passingScore: 70,
            published: true,
        },
    });
    await prisma.moduleQuestion.createMany({
        data: [
            { moduleQuizId: c5Quiz.id, type: 'multiple_choice', text: 'Which keyword is used to declare a variable in JavaScript?', options: ['var', 'let', 'const', 'All of the above'], correctAnswer: 'All of the above', points: 10, order: 1 },
            { moduleQuizId: c5Quiz.id, type: 'multiple_choice', text: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Syntax', 'Colorful Style Scripts'], correctAnswer: 'Cascading Style Sheets', points: 10, order: 2 },
            { moduleQuizId: c5Quiz.id, type: 'true_false', text: 'HTML is a programming language.', correctAnswer: 'false', points: 5, order: 3 },
        ],
    });
    const c5Module5 = await prisma.module.create({
        data: {
            title: 'Building Your First Website',
            sectionId: c5Section4.id,
            type: client_1.ModuleType.LESSON,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'Put together everything you have learned to build a complete website.',
        },
    });
    await prisma.contentItem.createMany({
        data: [
            {
                moduleId: c5Module5.id,
                type: 'PDF',
                title: 'Project Guidelines',
                url: 'https://www.w3schools.com/html/img_girl.jpg',
                order: 1,
                metadata: { fileSize: '1.2MB', pages: 10 },
            },
            {
                moduleId: c5Module5.id,
                type: 'YOUTUBE',
                title: 'Build a Website Tutorial',
                url: 'https://www.youtube.com/watch?v=1q6y_aDKYbU',
                order: 2,
                duration: 900,
            },
            {
                moduleId: c5Module5.id,
                type: 'EXTERNAL_LINK',
                title: 'CodePen Examples',
                url: 'https://codepen.io',
                order: 3,
                metadata: { description: 'Practice your code online' },
            },
        ],
    });
    console.log('Created sections and modules for course5\n');
    console.log('Creating sections and modules for course1...');
    const section1 = await prisma.section.create({
        data: { title: 'Getting Started', courseId: course1.id, order: 1 },
    });
    const section2 = await prisma.section.create({
        data: { title: 'Variables and Data Types', courseId: course1.id, order: 2 },
    });
    const section3 = await prisma.section.create({
        data: { title: 'Functions and Control Flow', courseId: course1.id, order: 3 },
    });
    const module1 = await prisma.module.create({
        data: {
            title: 'Welcome to JavaScript',
            sectionId: section1.id,
            type: client_1.ModuleType.LESSON,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'Welcome to our JavaScript course! JavaScript was created in 1995 by Brendan Eich...',
        },
    });
    const quizModule1 = await prisma.module.create({
        data: {
            title: 'Section 1 Quiz',
            sectionId: section1.id,
            type: client_1.ModuleType.QUIZ,
            order: 2,
            contentStatus: client_1.ContentStatus.APPROVED,
        },
    });
    const module2 = await prisma.module.create({
        data: {
            title: 'Understanding Variables',
            sectionId: section2.id,
            type: client_1.ModuleType.LESSON,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'Variables are containers for storing data values...',
        },
    });
    const module3 = await prisma.module.create({
        data: {
            title: 'JavaScript Data Types',
            sectionId: section2.id,
            type: client_1.ModuleType.LESSON,
            order: 2,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'JavaScript has several data types including strings, numbers, booleans...',
        },
    });
    const module4 = await prisma.module.create({
        data: {
            title: 'Introduction to Functions',
            sectionId: section3.id,
            type: client_1.ModuleType.LESSON,
            order: 1,
            contentStatus: client_1.ContentStatus.APPROVED,
            textContent: 'Functions are reusable blocks of code...',
        },
    });
    const assignmentModule1 = await prisma.module.create({
        data: {
            title: 'Variables Practice',
            sectionId: section2.id,
            type: client_1.ModuleType.ASSIGNMENT,
            order: 3,
            contentStatus: client_1.ContentStatus.APPROVED,
        },
    });
    console.log('Created sections and modules\n');
    console.log('Creating quizzes...');
    const quiz1 = await prisma.quiz.create({
        data: {
            moduleId: quizModule1.id,
            title: 'JavaScript Basics Quiz',
            description: 'Test your understanding of JavaScript fundamentals',
            timeLimit: 15,
            maxAttempts: 3,
            passingScore: 70,
        },
    });
    await prisma.question.createMany({
        data: [
            { quizId: quiz1.id, type: 'multiple_choice', text: 'Which keyword is used to declare a constant variable in JavaScript?', options: ['var', 'let', 'const', 'constant'], correctAnswer: 'const', points: 10, order: 1 },
            { quizId: quiz1.id, type: 'multiple_choice', text: 'What is the result of typeof null in JavaScript?', options: ['null', 'undefined', 'object', 'string'], correctAnswer: 'object', points: 10, order: 2 },
            { quizId: quiz1.id, type: 'short_answer', text: 'What symbol is used for single-line comments in JavaScript?', correctAnswer: '//', points: 5, order: 3 },
            { quizId: quiz1.id, type: 'multiple_choice', text: 'Which method is used to add an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctAnswer: 'push()', points: 10, order: 4 },
            { quizId: quiz1.id, type: 'essay', text: 'Explain the difference between == and === operators in JavaScript. Provide examples.', correctAnswer: '== compares values with type coercion, while === compares both value and type without coercion.', points: 15, order: 5 },
        ],
    });
    const quiz2 = await prisma.quiz.create({
        data: {
            moduleId: module4.id,
            title: 'Functions Quiz',
            description: 'Test your knowledge of JavaScript functions',
            timeLimit: 20,
            maxAttempts: 2,
            passingScore: 60,
        },
    });
    await prisma.question.createMany({
        data: [
            { quizId: quiz2.id, type: 'multiple_choice', text: 'What keyword is used to define an arrow function?', options: ['function', 'arrow', '=>', 'lambda'], correctAnswer: '=>', points: 10, order: 1 },
            { quizId: quiz2.id, type: 'short_answer', text: 'What does the return statement do in a function?', correctAnswer: 'It specifies the value to be returned to the caller', points: 10, order: 2 },
        ],
    });
    console.log('Created 2 quizzes with questions\n');
    console.log('Creating assignments...');
    await prisma.assignment.create({
        data: {
            moduleId: assignmentModule1.id,
            title: 'Variables Practice Assignment',
            description: 'Complete the following exercises to practice working with variables.',
            maxPoints: 100,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('Created 1 assignment\n');
    console.log('Creating enrollments...');
    await prisma.enrollment.createMany({
        data: [
            { userId: student1.id, courseId: course1.id, accessStatus: 'APPROVED' },
            { userId: student1.id, courseId: course2.id, accessStatus: 'APPROVED' },
            { userId: student2.id, courseId: course1.id, accessStatus: 'APPROVED' },
            { userId: student3.id, courseId: course3.id, accessStatus: 'APPROVED' },
        ],
    });
    console.log('Created 4 enrollments\n');
    console.log('Creating quiz attempts...');
    await prisma.quizAttempt.createMany({
        data: [
            { userId: student1.id, quizId: quiz1.id, answers: { q1: { answer: 'const' }, q2: { answer: 'object' }, q3: { answer: '//' }, q4: { answer: 'push()' } }, score: 30, percentage: 60, passed: false, startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000) },
            { userId: student2.id, quizId: quiz1.id, answers: { q1: { answer: 'const' }, q2: { answer: 'object' }, q3: { answer: '//' }, q4: { answer: 'push()' } }, score: 50, percentage: 100, passed: true, startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000) },
        ],
    });
    console.log('Created 2 quiz attempts\n');
    console.log('Creating progress records...');
    await prisma.progress.createMany({
        data: [
            { userId: student1.id, moduleId: module1.id, courseProgress: 100, completed: true },
            { userId: student1.id, moduleId: module2.id, courseProgress: 75, completed: false },
            { userId: student1.id, moduleId: quizModule1.id, courseProgress: 60, completed: false },
            { userId: student2.id, moduleId: module1.id, courseProgress: 100, completed: true },
            { userId: student2.id, moduleId: module2.id, courseProgress: 100, completed: true },
            { userId: student2.id, moduleId: module3.id, courseProgress: 50, completed: false },
            { userId: student3.id, moduleId: module1.id, courseProgress: 30, completed: false },
        ],
    });
    console.log('Created progress records\n');
    console.log('Creating plugins...');
    const plugins = [
        { pluginId: 'plugin-quiz-system', name: 'Quiz System', category: 'CONTENT', enabled: true },
        { pluginId: 'plugin-question-bank', name: 'Question Bank', category: 'CONTENT', enabled: true },
        { pluginId: 'plugin-content-library', name: 'Content Library', category: 'CONTENT', enabled: true },
        { pluginId: 'plugin-forum', name: 'Forum System', category: 'COMMUNICATION', enabled: true },
        { pluginId: 'plugin-analytics', name: 'Learner Analytics', category: 'ANALYTICS', enabled: true },
        { pluginId: 'plugin-payments', name: 'Razorpay Payments', category: 'PAYMENTS', enabled: true },
        { pluginId: 'plugin-subscriptions', name: 'Subscription Management', category: 'PAYMENTS', enabled: true },
        { pluginId: 'plugin-user-management', name: 'User Management', category: 'USERMGMT', enabled: true },
        { pluginId: 'plugin-ai-content', name: 'AI Content Generation', category: 'AI', enabled: true },
        { pluginId: 'plugin-certificates', name: 'Certificate Generator', category: 'UTILITY', enabled: true },
    ];
    for (const plugin of plugins) {
        await prisma.plugin.create({
            data: { ...plugin, version: '1.0.0', author: 'LMS Team', description: `${plugin.name} for the LMS platform`, config: {} },
        });
    }
    console.log('Created 10 plugins\n');
    console.log('==================================================');
    console.log('DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('\nUsers:');
    console.log('  Admin:    suhanimunjal97@gmail.com / Test@123');
    console.log('  Teacher:  teacher@example.com / Test@123');
    console.log('  Teacher:  junejatanubhav@gmail.com / Test@123');
    console.log('  Student:  student@lms.com / Test@123');
    console.log('==================================================\n');
}
main()
    .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map