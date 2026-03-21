-- Update the new user to be TEACHER
UPDATE "User" SET role = 'TEACHER' WHERE id = '1bba245e-85ba-4820-976f-3a87c6a7eabd';

-- Update course to be owned by this user
UPDATE "Course" SET "instructorId" = '1bba245e-85ba-4820-976f-3a87c6a7eabd' WHERE id = '88888888-8888-8888-8888-888888888888';
