-- Create teacher user
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES ('99999999-9999-9999-9999-999999999999', 'testfix@example.com', 'Test Fix User', 'hashed', 'TEACHER', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create course
INSERT INTO "Course" (id, title, slug, description, "instructorId", "createdAt", "updatedAt")
VALUES ('88888888-8888-8888-8888-888888888888', 'Fix Test Course', 'fix-test-course', 'Testing content and quiz fixes', '99999999-9999-9999-9999-999999999999', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create section
INSERT INTO "Section" (id, title, "courseId", "order")
VALUES ('77777777-7777-7777-7777-777777777777', 'Test Section', '88888888-8888-8888-8888-888888888888', 1)
ON CONFLICT DO NOTHING;

-- Create LESSON module for content generation test
INSERT INTO "Module" (id, title, "sectionId", type, "order", "contentStatus", "videoStatus")
VALUES ('66666666-6666-6666-6666-666666666666', 'Lesson for Content Gen', '77777777-7777-7777-7777-777777777777', 'LESSON', 1, 'PENDING', 'PENDING')
ON CONFLICT DO NOTHING;

-- Create QUIZ module with APPROVED content for quiz test
INSERT INTO "Module" (id, title, "sectionId", type, "order", "contentStatus", "videoStatus", "generatedContent")
VALUES ('55555555-5555-5555-5555-555555555555', 'Quiz Module', '77777777-7777-7777-7777-777777777777', 'QUIZ', 2, 'APPROVED', 'PENDING', '{"topic":"test","title":"test quiz","quiz":{"questions":[]},"assignment":{"problemStatement":"test"}}')
ON CONFLICT DO NOTHING;
