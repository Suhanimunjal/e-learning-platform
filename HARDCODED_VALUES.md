# Backend & Frontend Hardcoded Values & Missing Implementations

## Status: PARTIALLY FIXED (March 20, 2026)

## Overview
This document catalogs all hardcoded/mock values and missing implementations found in the e-learning platform backend (`apps/backend/src`) and frontend teacher portal (`apps/frontend/src`).

---

## PART 1: FIXED ISSUES ✅

### ✅ Backend Fixes Applied

#### 1. Quiz Attempt Endpoints Added
**File**: `apps/backend/src/quiz/quiz.controller.ts` & `quiz.service.ts`

Added endpoints:
- `POST /quizzes/:id/start` - Start a quiz attempt
- `POST /quizzes/:id/submit` - Submit quiz answers
- `GET /quizzes/:id/attempts` - Get user's quiz attempts
- `GET /quizzes/:id/attempts/:attemptId` - Get specific attempt
- `GET /quizzes/:id/submissions` - Get all submissions for a quiz (for teachers)
- `POST /quizzes/:id/attempts/:attemptId/grade` - Grade a quiz attempt

#### 2. AI Quiz Grading Added
**File**: `apps/backend/src/ai/ai.controller.ts` & `services/ai.service.ts`

Added:
- `POST /ai/grade-quiz/:attemptId` - AI grade a quiz attempt
- `GET /ai/grade-quiz/:attemptId/status` - Get grading status
- `gradeQuizAttempt()` method - Actual AI grading with Claude API
- `getQuizGradingStatus()` method - Track grading progress

#### 3. Fixed Hardcoded Pass Rate
**File**: `apps/backend/src/analytics/services/analytics-reporting.service.ts`

Changed from hardcoded `50%` to use `quiz.passingScore` field.

#### 4. Fixed Search Suggestions Fake Fallback
**File**: `apps/backend/src/ai/services/ai.service.ts`

Removed fake suggestions when database returns < 5 results.

### ✅ Frontend Fixes Applied

#### 1. Grading Dashboard Now Fetches Real Data
**File**: `apps/frontend/src/app/dashboard/teacher/grading/page.tsx`

- Removed all mock data (`MOCK_QUESTIONS`, `MOCK_STUDENT_ANSWERS`, `MOCK_SUBMISSIONS`)
- Now fetches quizzes and submissions from API
- Stats calculated from actual data
- Quiz selection dropdown populated from API

#### 2. AI Auto-Grade Connected to API
**File**: `apps/frontend/src/app/dashboard/teacher/grading/page.tsx`

- `handleAutoGrade()` now calls `grading.gradeQuizAttempt()`
- Shows loading state during grading
- Updates UI with graded results

#### 3. QuestionCard Has Loading/Error States
**File**: `apps/frontend/src/components/grading/QuestionCard.tsx`

- Added `loadingAIAnswer` prop
- Added `errorAIAnswer` prop
- Shows spinner while fetching AI answer
- Shows error message if API call fails

#### 4. GradingPanel Updated
**File**: `apps/frontend/src/components/grading/GradingPanel.tsx`

- Props updated to include `onAutoGrade`, `gradingLoading`, `gradingAttemptId`
- AI grading button triggers real API call
- Loading states properly managed

#### 5. SubmissionList Updated
**File**: `apps/frontend/src/components/grading/SubmissionList.tsx`

- Uses real status values from API
- Shows actual scores from data

#### 6. QuizGenerator Fetches Real Courses/Quizzes
**File**: `apps/frontend/src/components/grading/QuizGenerator.tsx`

- Removed mock `MOCK_COURSES` and `MOCK_QUIZZES`
- Fetches courses from `GET /courses`
- Fetches quizzes from `GET /courses/:id/quizzes`
- Generates quiz via `POST /quizzes`

#### 7. PreviewModal Fixed
**File**: `apps/frontend/src/components/grading/PreviewModal.tsx`

- Fixed `useState` callback bug
- Removed mock delays

#### 8. API Client Updated
**File**: `apps/frontend/src/lib/api.ts`

Added new endpoints:
- `quizzes.startQuiz()`
- `quizzes.submitQuiz()`
- `quizzes.getQuizAttempts()`
- `quizzes.getQuizAttempt()`
- `quizzes.getQuizSubmissions()`
- `quizzes.gradeQuizAttempt()`
- `grading.gradeQuizAttempt()` (for AI grading)
- `grading.getQuizGradingStatus()`

---

## PART 2: REMAINING ISSUES

### Still Missing / Not Implemented

#### 1. Chat History Persistence
**Status**: NOT FIXED - Still returns empty array

```typescript
// apps/backend/src/ai/services/ai.service.ts:656
async getChatHistory(sessionId: string): Promise<any> {
  return {
    success: true,
    data: [],  // ALWAYS EMPTY
    sessionId,
  };
}
```

**Fix Required**: Store chat messages in database, implement retrieval.

#### 2. Chat Session Persistence
**Status**: NOT FIXED - Creates fake session IDs

```typescript
// apps/backend/src/ai/services/ai.service.ts:664
async createChatSession(courseId?: string): Promise<any> {
  return {
    data: {
      id: `session-${Date.now()}-${Math.random().toString(36).substring(7)}`, // FAKE ID
    },
  };
}
```

**Fix Required**: Store sessions in database with proper UUID.

#### 3. Video URL is Just Audio URL
**Status**: NOT FIXED

```typescript
// apps/backend/src/video-generation/video-generation.service.ts:73
videoUrl: audioUrl, // USING AUDIO AS VIDEO PLACEHOLDER
```

**Fix Required**: Implement actual video generation or indicate it's audio-only.

#### 4. Certificate PDF Generation
**Status**: NOT IMPLEMENTED

Schema has `pdfUrl` field but no actual PDF generation.

#### 5. Discussion/Reply System
**Status**: NOT IMPLEMENTED

Schema models exist but no CRUD endpoints.

#### 6. Course Reviews
**Status**: NOT IMPLEMENTED

Schema has `Review` model but no endpoints.

#### 7. Assignment File Uploads
**Status**: NOT IMPLEMENTED

Schema supports file uploads but no upload endpoint exists.

#### 8. Email Notifications
**Status**: NOT IMPLEMENTED

No email service implementation despite notifications.

---

## PART 3: DATA MODEL GAPS

### Missing Student Quiz Flow
```
Student Quiz Flow (NOW IMPLEMENTED - Backend):
1. ✅ Student starts quiz → Create QuizAttempt (status: started)
2. ✅ Student submits answers → Submit to /quizzes/:id/submit
3. ✅ Teacher grades → /ai/grade-quiz/:attemptId
4. Student views results → Already in QuizAttempt

Frontend (Teacher Portal - Grading):
1. ✅ Fetch quizzes list
2. ✅ Fetch submissions for quiz
3. ✅ Trigger AI grading
4. ✅ Display grades
5. ✅ Save grades to backend
```

---

## PART 4: REQUIRED API ENDPOINTS TO IMPLEMENT

### Chat Persistence (CRITICAL)
```typescript
// Store chat messages
POST /chat/messages
Body: { sessionId: string, message: string, role: 'user' | 'assistant' }

// Get chat history (FIX THIS)
GET /chat/history/:sessionId
```

### Certificate Generation
```typescript
POST /certificates/generate/:courseId
GET /certificates/:id/pdf
```

### Discussion Forum
```typescript
GET /courses/:id/discussions
POST /courses/:id/discussions
POST /discussions/:id/replies
```

### Course Reviews
```typescript
POST /courses/:id/reviews
GET /courses/:id/reviews
```

---

## PART 5: SUMMARY OF CHANGES

### Backend Changes
| File | Change |
|------|--------|
| `quiz/quiz.controller.ts` | Added quiz attempt endpoints |
| `quiz/quiz.service.ts` | Implemented quiz attempt logic, grading |
| `ai/ai.controller.ts` | Added AI quiz grading endpoints |
| `ai/services/ai.service.ts` | Implemented AI quiz grading, removed fake search suggestions |
| `analytics/services/analytics-reporting.service.ts` | Fixed hardcoded 50% pass rate |

### Frontend Changes
| File | Change |
|------|--------|
| `app/dashboard/teacher/grading/page.tsx` | Full rewrite - uses real API data |
| `components/grading/GradingPanel.tsx` | Connected to API for auto-grade |
| `components/grading/QuestionCard.tsx` | Added loading/error states |
| `components/grading/SubmissionList.tsx` | Uses real data |
| `components/grading/QuizGenerator.tsx` | Fetches real courses/quizzes |
| `components/grading/PreviewModal.tsx` | Fixed useState bug |
| `lib/api.ts` | Added new API endpoints |

---

## PART 6: TESTING CHECKLIST

To verify the fixes work:

### Backend Testing
- [ ] `POST /quizzes/:id/start` - Creates quiz attempt
- [ ] `POST /quizzes/:id/submit` - Submits answers and calculates score
- [ ] `GET /quizzes/:id/submissions` - Returns all submissions for teachers
- [ ] `POST /ai/grade-quiz/:attemptId` - Grades all questions using AI
- [ ] Verify pass rate uses quiz.passingScore

### Frontend Testing
- [ ] Grading page loads quizzes from API
- [ ] Selecting a quiz loads submissions
- [ ] Clicking "AI Auto-Grade" triggers actual API call
- [ ] Loading spinner shows while grading
- [ ] Error message shows if grading fails
- [ ] Grades are saved to backend
- [ ] Stats (pending/graded counts) are calculated from real data
