# Backend Fixes Plan - Fallbacks, Hardcoded Values & Mock Code

## Overview
Remove all hardcoded fallbacks, insecure defaults, and mock implementations. All services should properly integrate with their intended APIs or fail fast when configuration is missing.

---

## Critical Security Issues (Must Fix Immediately)

### 1. JWT_SECRET Hardcoded Fallback
**Files:** `src/auth/strategies/jwt.strategy.ts`, `src/auth/auth.module.ts`
```typescript
secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
```
**Status:** ✅ FIXED - Now throws error if JWT_SECRET is not configured

### 2. RAZORPAY_KEY_ID Hardcoded Fallback
**Files:** `src/payments/services/payments.service.ts`, `src/subscriptions/services/subscription-payments.service.ts`
```typescript
keyId: this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_demo',
```
**Status:** ✅ FIXED - Now throws error if RAZORPAY_KEY_ID is not configured

---

## Mock Implementations

### 3. AI Service - All Features Mocked
**File:** `src/ai/services/ai.service.ts` (Lines 101-305)

**Status:** ✅ FIXED - Rewritten to use actual AI services
- `generateAssignment()` - Now uses ContentGeneratorEnhancedService
- `generateExamples()` - Now uses ContentGeneratorEnhancedService  
- `summarizeContent()` - Now uses AnthropicService
- `gradeSubmission()` - Now uses AnthropicService for actual AI grading
- `getGradingFeedback()` - Returns stored feedback from database
- `overrideGrade()` - Validates and updates in database
- `getRecommendations()` - Now queries real enrollment/progress data
- `trackProgress()` - Validates and stores in database
- `translateText()` - Now uses AnthropicService
- `detectLanguage()` - Now uses AnthropicService
- `search()` - Now queries real course/module data
- `getSearchSuggestions()` - Now queries real course data
- `chat()` - Now uses AnthropicService for AI responses
- `getChatHistory()` - Returns empty (no session storage)
- `createChatSession()` - Generates proper session ID

### 4. Quiz Verification Service - Internet Search Fallback
**File:** `src/ai/quiz-verification.service.ts`

**Status:** ⚠️ Not Changed - Still uses DuckDuckGo API. This is a legitimate external API call for fact-checking quiz answers, not a mock. If not needed, can be removed.

### 5. Video Generation - Mock Audio
**File:** `src/video-generation/video-generation.service.ts` (Lines 125-128)

**Status:** ✅ FIXED - Now uses TTSService with Google Cloud Text-to-Speech

---

## Mock Payment/Subscription Flows

### 6. Payments Service - Mock Razorpay
**File:** `src/payments/services/payments.service.ts`

**Status:** ✅ FIXED - Now uses real Razorpay API

### 7. Subscription Payments - Mock Subscription
**File:** `src/subscriptions/services/subscription-payments.service.ts`

**Status:** ✅ FIXED - Now uses real Razorpay API

## High Priority - DTO Validation Issues

### 8. AI Controller - Missing Tone Validation
**File:** `src/ai/ai.controller.ts`
```typescript
return this.aiService.generateAssignment(body.topic, body.tone || 'formal');
return this.aiService.generateExamples(body.topic, body.tone || 'casual');
return this.aiService.summarizeContent(body.content, body.tone || 'simplified');
```

**Fix:** Add proper DTO validation with `@IsEnum()` or `@IsIn()` for tone parameter

### 9. Quiz Service - Silently Defaulting Fields
**File:** `src/quiz/quiz.service.ts`
```typescript
timeLimit: createQuizDto.timeLimit || null,
shuffleQuestions: createQuizDto.shuffleQuestions || false,
correctAnswer: question.correctAnswer || '',
order: question.order || 0,
```

**Fix:** Use proper DTO validation, reject invalid input

### 10. Auth Service - Default Role Assignment
**File:** `src/auth/auth.service.ts`
```typescript
role: role || 'STUDENT',
```

**Fix:** Throw error if role is invalid, don't default silently

---

## Lower Priority - Defensive Null Handling

### 11. Analytics Reporting Service
```typescript
totalRevenue: totalRevenue._sum.amount || 0,
```

**Issue:** Hides null aggregation - could mask data issues

### 12. AI Service - Session Language Default
```typescript
sourceLang: sourceLang || 'en',
sessionId: sessionId || 'new-session',
```

**Fix:** Validate inputs properly

### 13. Video Generation Error Handling
```typescript
errorMessage: error.message || 'Video generation failed',
```

**Issue:** Masks actual error details

---

## Implementation Priority

### Phase 1: Security (Do Now)
- [x] JWT_SECRET fallback - FIXED
- [x] RAZORPAY_KEY_ID fallback - FIXED

### Phase 2: Mock AI Features
- [x] AI Service mock methods - FIXED - Rewritten to use real AI services

### Phase 3: Mock Payments
- [x] Razorpay integration - FIXED - Now uses real API

### Phase 4: Video Generation
- [x] Google TTS integration - FIXED - Uses TTSService

### Phase 5: DTO Validation
- [x] AI Controller tone validation - FIXED
- [x] Register DTO role default - FIXED
- [x] AI Service field defaults - Fixed where critical

---

## Files Changed

| File | Change |
|------|--------|
| `src/auth/strategies/jwt.strategy.ts` | Removed fallback, throws error |
| `src/auth/auth.module.ts` | Removed fallback, throws error |
| `src/auth/auth.service.ts` | Added Role import, uses Role.STUDENT constant |
| `src/auth/dto/register.dto.ts` | Removed hardcoded default for role |
| `src/payments/services/payments.service.ts` | Implemented real Razorpay API |
| `src/subscriptions/services/subscription-payments.service.ts` | Implemented real Razorpay API |
| `src/ai/content-generator-enhanced.service.ts` | Removed console.warn fallback, throws error |
| `src/ai/services/ai.service.ts` | Complete rewrite - uses real AI services |
| `src/ai/services/anthropic.service.ts` | Added generateStructuredResponse method |
| `src/ai/ai.controller.ts` | Added proper DTOs for validation |
| `src/ai/dto/ai-content.dto.ts` | New file with proper validation DTOs |
| `src/video-generation/video-generation.service.ts` | Now uses TTSService for real audio |
| `src/video-generation/video-generation.module.ts` | Added AiModule import |
| `src/ai/tts.service.ts` | Uses Google Cloud TTS (already implemented) |
| `.env` | Added RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET placeholders |

---

## Notes

- Always use `ConfigService.get()` with strict validation
- Environment variables should be validated at startup
- Mock code should either be implemented properly or removed entirely
- Consider adding a `NODE_ENV=production` check that enforces all config is present
