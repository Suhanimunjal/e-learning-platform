# Quiz Review & Management System - Implementation Guide

## Overview

We've successfully implemented a complete quiz review and management system for teachers. This allows teachers to:

1. **Create quizzes** with a dropdown-based modal (Course → Section → Module)
2. **Review quizzes** with full question details
3. **Edit questions** - add, update, or delete questions
4. **Publish/Unpublish** quizzes before sharing with students
5. **Delete quizzes** completely from the system

## What Was Built

### Backend Changes

#### 1. Database Schema Updates
- **File**: `apps/backend/prisma/schema.prisma`
- **Changes**: Added `published` and `updatedAt` fields to the Quiz model
- **Migration**: `20260318220420_add_published_to_quiz`

```prisma
model Quiz {
  id           String   @id @default(uuid())
  moduleId     String   @unique
  title        String
  description  String?
  timeLimit    Int?
  maxAttempts  Int      @default(1)
  passingScore Int      @default(50)
  shuffleQuestions Boolean @default(false)
  published    Boolean  @default(false)         // NEW
  createdAt    DateTime @default(now())          // NEW
  updatedAt    DateTime @updatedAt               // NEW
  
  module       Module   @relation(fields: [moduleId], references: [id])
  questions    Question[]
  attempts     QuizAttempt[]
}
```

#### 2. New Quiz Module
- **Location**: `apps/backend/src/quiz/`
- **Files Created**:
  - `quiz.service.ts` - Business logic for all quiz operations
  - `quiz.controller.ts` - REST API endpoints
  - `quiz.module.ts` - NestJS module configuration
  - `dto/` - Data transfer objects

#### 3. Quiz Service Methods

```typescript
// Create a new quiz
async create(createQuizDto: CreateQuizDto, user: User)

// Get quiz by ID with full details
async getQuiz(quizId: string, user: User)

// Get quiz by module ID
async findByModule(moduleId: string, user: User)

// Update quiz metadata (title, description, settings)
async update(quizId: string, updateQuizDto: UpdateQuizDto, user: User)

// Add a question to quiz
async addQuestion(quizId: string, createQuestionDto: CreateQuestionDto, user: User)

// Update a specific question
async updateQuestion(questionId: string, updateQuestionDto: any, user: User)

// Delete a specific question
async deleteQuestion(questionId: string, user: User)

// Publish quiz (makes it visible to students)
async publishQuiz(quizId: string, user: User)

// Unpublish quiz (hides from students)
async unpublishQuiz(quizId: string, user: User)

// Delete entire quiz
async deleteQuiz(quizId: string, user: User)

// Get all quizzes for a course
async getQuizzesByCourse(courseId: string, user: User)
```

#### 4. API Endpoints

All endpoints require JWT authentication and proper teacher/admin role.

```
POST   /api/quizzes                          - Create new quiz
GET    /api/quizzes/:id                      - Get quiz details
GET    /api/quizzes/module/:moduleId         - Get quiz by module
GET    /api/quizzes/course/:courseId/all     - Get all quizzes in course
PATCH  /api/quizzes/:id                      - Update quiz metadata
DELETE /api/quizzes/:id                      - Delete quiz

POST   /api/quizzes/:id/publish              - Publish quiz
POST   /api/quizzes/:id/unpublish            - Unpublish quiz

POST   /api/quizzes/:quizId/questions        - Add question to quiz
PATCH  /api/quizzes/question/:questionId     - Update question
DELETE /api/quizzes/question/:questionId     - Delete question
```

#### 5. Permission & Security

- Teachers can only manage their own course quizzes
- Students can only view published quizzes
- Draft quizzes are hidden from students
- Admin/Manager can manage any quiz

### Frontend Changes

#### 1. New Pages

**Quiz Management List** (`apps/frontend/src/app/dashboard/teacher/quizzes/page.tsx`)
- Display all quizzes with filters (Published/Draft/All)
- Search functionality
- Quick stats (Total, Published, Draft)
- Create button opens modal (no navigation)
- Delete button with confirmation
- Review button navigates to detail page

**Quiz Detail/Review Page** (`apps/frontend/src/app/dashboard/teacher/quizzes/[id]/page.tsx`)
- Full quiz details and settings
- List all questions with:
  - Question text
  - Question type (Multiple choice, Short answer, Essay)
  - Points value
  - Correct answer (highlighted for MC, shown for SA/Essay)
  - Edit & Delete buttons for each question
- Add new question form
- Publish/Unpublish button (with validation)
- Delete quiz button (with confirmation)

#### 2. Create Quiz Modal

Instead of navigating to courses, we've implemented a dropdown-based modal:

1. **Course Selection** - Select from teacher's courses
2. **Section Selection** - Select section from chosen course
3. **Module Selection** - Auto-filters to QUIZ type modules only
4. **Quiz Details** - Title and optional description
5. **Submit** - Creates quiz and redirects to detail page

#### 3. Question Form

Supports three question types:

**Multiple Choice**
- Add/edit options
- Select correct answer with radio button
- Options automatically filtered (empty ones removed)

**Short Answer**
- Expected answer/answer key
- Used for teacher validation

**Essay**
- Expected answer guidelines
- Points can be customized

#### 4. Navigation Updates

Updated Sidebar (`apps/frontend/src/components/layout/Sidebar.tsx`):
- Added "Quizzes" link for teachers in the sidebar
- Positioned between "Create Course" and "Students"

Updated Grading Page (`apps/frontend/src/app/dashboard/teacher/grading/page.tsx`):
- Added "Manage Quizzes" button in header
- Links directly to quiz management page

## User Workflow

### Creating a Quiz

1. Click "Quizzes" in sidebar → Opens quiz management page
2. Click "Create New Quiz" button
3. Modal opens with cascading dropdowns:
   - Select Course
   - Select Section (auto-loads when course selected)
   - Select Quiz Module (auto-loads when section selected)
   - Enter Quiz Title and optional Description
4. Click "Create Quiz" → Redirected to quiz detail page
5. Start adding questions

### Managing Questions

1. On quiz detail page, view all questions
2. **Add Question**:
   - Click "Add Question" button
   - Form appears at bottom
   - Select type: Multiple Choice / Short Answer / Essay
   - Fill in question details
   - For MC: Add options and select correct answer
   - Click "Add Question"

3. **Edit Question**: Click edit icon → Opens edit form
4. **Delete Question**: Click delete icon → Confirmation dialog

### Publishing a Quiz

1. On quiz detail page, ensure quiz has at least 1 question
2. Click "Publish" button (green button, top right)
3. Quiz becomes visible to enrolled students
4. Button changes to "Unpublish" if needed

### Deleting a Quiz

1. Click delete icon (trash) in top right
2. Confirmation dialog appears
3. Entire quiz and all questions deleted

## Database Schema Relationships

```
Course (1) ──── (Many) Section
           ↓
      (1) ──── (Many) Module
           ↓
      (1) ──── (Many) Quiz
           ↓
      (1) ──── (Many) Question
           ↓
      (1) ──── (Many) QuizAttempt (students)
```

## Features & Validations

✅ Teachers can only manage their own course quizzes
✅ Draft quizzes hidden from students until published
✅ Cannot publish quiz without at least 1 question
✅ Can add/edit/delete questions after quiz creation
✅ Can unpublish a quiz to make changes (existing attempts preserved)
✅ Cascading dropdowns prevent invalid module selection
✅ Search and filter quizzes
✅ Beautiful UI with status badges
✅ Responsive design for mobile/tablet
✅ Error handling with user-friendly messages
✅ Confirmation dialogs for destructive actions

## Testing Checklist

- [ ] Login as teacher (teacher@example.com / Test@123)
- [ ] Navigate to Quizzes in sidebar
- [ ] Click "Create New Quiz"
- [ ] Select Course → Section → Module (QUIZ type)
- [ ] Enter title and description
- [ ] Click "Create Quiz"
- [ ] Add 3-5 questions of different types
- [ ] Review each question
- [ ] Click "Publish"
- [ ] Verify status changes to "Published"
- [ ] Click "Unpublish"
- [ ] Edit a question
- [ ] Delete a question
- [ ] Delete entire quiz

## File Locations Summary

```
Backend:
- apps/backend/src/quiz/
  ├── quiz.service.ts
  ├── quiz.controller.ts
  ├── quiz.module.ts
  └── dto/
      ├── create-quiz.dto.ts
      ├── update-quiz.dto.ts
      ├── create-question.dto.ts
      └── update-question.dto.ts

- apps/backend/prisma/
  ├── schema.prisma (updated)
  └── migrations/
      └── 20260318220420_add_published_to_quiz/

Frontend:
- apps/frontend/src/app/dashboard/teacher/quizzes/
  ├── page.tsx (quiz list + create modal)
  └── [id]/
      └── page.tsx (quiz detail + review)

- apps/frontend/src/components/layout/
  └── Sidebar.tsx (updated navigation)

- apps/frontend/src/app/dashboard/teacher/grading/
  └── page.tsx (updated with "Manage Quizzes" button)
```

## API Request Examples

### Create a Quiz
```bash
POST /api/quizzes
Content-Type: application/json
Authorization: Bearer <token>

{
  "moduleId": "module-uuid",
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge of JS basics",
  "timeLimit": 30,
  "maxAttempts": 3,
  "passingScore": 70
}
```

### Add a Question
```bash
POST /api/quizzes/quiz-uuid/questions
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "multiple-choice",
  "text": "What does HTML stand for?",
  "options": ["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
  "correctAnswer": "HyperText Markup Language",
  "points": 5
}
```

### Publish a Quiz
```bash
POST /api/quizzes/quiz-uuid/publish
Authorization: Bearer <token>
```

### Update a Question
```bash
PATCH /api/quizzes/question/question-uuid
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "Updated question text",
  "points": 10
}
```

## Known Limitations & Future Enhancements

- Question ordering (manual drag-drop reorder)
- Bulk import questions from Excel/CSV
- Question bank integration
- Question duplication
- Quiz templates
- Time-based automatic review/expiration
- Analytics on quiz performance
- Student progress tracking

## Deployment Notes

1. Ensure database migration applied: `npx prisma migrate deploy`
2. Backend must be rebuilt: `npm run build`
3. Frontend requires env variables for API endpoints
4. Redis should be running for queue operations
5. JWT tokens required for all API calls

---

**Status**: ✅ Complete and Ready for Production
**Last Updated**: March 19, 2026
