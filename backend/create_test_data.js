const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Create a teacher user
    const user = await prisma.user.create({
      data: {
        email: 'teacher-test@example.com',
        name: 'Test Teacher',
        password: 'hashed',
        role: 'TEACHER',
      },
    });

    // Create a course
    const course = await prisma.course.create({
      data: {
        title: 'Test Course for Fixes',
        description: 'Testing content generation and quiz creation fixes',
        category: 'Technology',
        instructorId: user.id,
      },
    });

    // Create a section
    const section = await prisma.section.create({
      data: {
        title: 'Test Section',
        courseId: course.id,
        order: 1,
      },
    });

    // Create a LESSON module for content generation testing
    const lessonModule = await prisma.module.create({
      data: {
        title: 'Test Lesson Module',
        sectionId: section.id,
        type: 'LESSON',
        order: 1,
      },
    });

    // Create a QUIZ module for quiz creation testing (with APPROVED content)
    const quizModule = await prisma.module.create({
      data: {
        title: 'Test Quiz Module',
        sectionId: section.id,
        type: 'QUIZ',
        order: 2,
        contentStatus: 'APPROVED',
        generatedContent: {
          topic: 'Test Topic',
          title: 'Test Quiz',
          quiz: { questions: [] },
          assignment: { problemStatement: 'test' }
        },
      },
    });

    console.log(JSON.stringify({
      userId: user.id,
      courseId: course.id,
      sectionId: section.id,
      lessonModuleId: lessonModule.id,
      quizModuleId: quizModule.id,
    }, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
