# Quiz Review System - Testing Guide

## Quick Test Workflow

Follow these steps to verify everything works:

### 1. Access Quiz Management
```
1. Login as: teacher@example.com / Test@123
2. Click "Quizzes" in sidebar
3. See: Quiz Management page with list view
4. Note: Empty state message if no quizzes yet
```

### 2. Create a Quiz (Modal Test)
```
1. Click "Create New Quiz" button
2. Modal opens with dropdowns
3. Select Course: "Introduction to Web Development"
4. Section auto-loads: Select "Getting Started"
5. Module auto-loads: Select "Section Quiz"
6. Title: "JavaScript Variables Quiz"
7. Description: "Test your knowledge of JS variables"
8. Click "Create Quiz"
9. Verify: Redirected to quiz detail page
```

### 3. Add Questions
```
Multiple Choice:
1. Click "Add Question" button
2. Type: "Multiple Choice"
3. Question: "Which keyword declares a constant?"
4. Options: const, let, var, static
5. Correct: const
6. Points: 5
7. Click "Add Question"
8. Verify: Question appears in list

Short Answer:
1. Click "Add Question"
2. Type: "Short Answer"
3. Question: "Explain hoisting in JavaScript"
4. Expected Answer: "Variables and functions are moved to top"
5. Points: 10
6. Click "Add Question"

Essay:
1. Click "Add Question"
2. Type: "Essay"
3. Question: "How do closures work in JavaScript?"
4. Expected Answer: "Provide answer guidelines"
5. Points: 15
6. Click "Add Question"
```

### 4. Review Questions
```
1. View all 3 questions on page
2. Verify each shows:
   - Question number (Q1, Q2, Q3)
   - Question type (Multiple Choice, Short Answer, Essay)
   - Points value
   - Question text
   - Correct answer highlighted
```

### 5. Edit Question
```
1. Click edit icon on any question
2. Form appears with current data
3. Modify question text
4. Click "Save" (or equivalent)
5. Verify: Changes appear in list
```

### 6. Delete Question
```
1. Click delete icon on any question
2. Confirmation dialog appears
3. Click "Delete" to confirm
4. Verify: Question removed from list
```

### 7. Publish Quiz
```
1. Click "Publish" button (top right)
2. Verify: Button changes to "Unpublish"
3. Verify: Badge changes to "Published" (green)
4. Verify: Status message confirms publication
```

### 8. Back to Quiz List
```
1. Click back arrow or navigate to Quizzes
2. See: Quiz list with your new quiz
3. Verify: Status badge shows "Published"
4. Verify: Stats show 1 Published quiz
```

### 9. Unpublish Quiz
```
1. Click "Review" button on quiz
2. Click "Unpublish" button
3. Verify: Changes to "Published" button
4. Verify: Badge changes to "Draft" (yellow)
```

### 10. Delete Quiz
```
1. Click trash/delete icon (top right)
2. Confirmation dialog appears
3. Click "Delete" to confirm
4. Verify: Redirected to quiz list
5. Verify: Quiz no longer in list
```

---

## Additional Tests

### Search Functionality
```
1. On quiz list page
2. Type in search box: "JavaScript"
3. Verify: Only matching quizzes show
4. Clear search
5. Verify: All quizzes show again
```

### Filter Functionality
```
1. Create 2 more quizzes
2. Publish one, leave one as draft
3. Click "published" filter button
4. Verify: Only published quizzes show
5. Click "draft" filter button
6. Verify: Only draft quizzes show
7. Click "all" filter button
8. Verify: All quizzes show
```

### Statistics
```
1. On quiz list page
2. Verify stats cards show:
   - Total Quizzes: (count)
   - Published: (count)
   - In Draft: (count)
3. Numbers should be accurate
```

---

## Expected Behavior

### Quiz Creation Modal
- ✅ Dropdowns cascade (Course → Section → Module)
- ✅ Only QUIZ type modules show in Module dropdown
- ✅ Modal has clear title "Create New Quiz"
- ✅ Submit button is disabled if fields empty
- ✅ Cancel button closes modal without creating

### Quiz Detail Page
- ✅ Shows all quiz settings clearly
- ✅ All questions visible with details
- ✅ "Add Question" form appears at bottom
- ✅ Each question has edit/delete buttons
- ✅ Publish button visible and functional

### Question Management
- ✅ Form validates required fields
- ✅ Correct answer highlighted for MC
- ✅ Options for MC automatically trimmed
- ✅ Points value required and validated
- ✅ Question type selector shows 3 options

### Status Badges
- ✅ "Published" = Green badge
- ✅ "Draft" = Yellow badge
- ✅ Status syncs when publish/unpublish
- ✅ Status persists on page reload

### Error Handling
- ✅ Can't publish without questions
- ✅ Can't create quiz without selecting module
- ✅ Form errors shown clearly
- ✅ Delete requires confirmation
- ✅ Network errors display user-friendly messages

---

## Permission Tests (Optional)

### As Teacher
```
1. Login as teacher@example.com / Test@123
2. Can see "Quizzes" in sidebar ✅
3. Can create quizzes ✅
4. Can edit/delete own quizzes ✅
5. Can see all own course quizzes ✅
```

### As Student (if testing)
```
1. Login as student@lms.com / Test@123
2. Cannot see "Quizzes" in sidebar ✅
3. Cannot access quiz management page ✅
4. Can see published quizzes in courses ✅
5. Cannot see draft quizzes ✅
```

---

## Browser Console Checks

✅ No TypeScript errors
✅ No console errors
✅ Network tab shows successful API calls
✅ No 404 or 500 errors
✅ JWT tokens valid in Authorization header

---

## Performance Checks

✅ Quiz list loads quickly (<2 seconds)
✅ Quiz detail loads quickly (<2 seconds)
✅ Adding question is instant (<1 second)
✅ Publish/unpublish responds quickly
✅ Search filters in real-time

---

## UI/UX Checks

✅ Buttons have hover effects
✅ Status badges are color-coded
✅ Icons are appropriate and clear
✅ Loading states show spinners
✅ Empty states have helpful messages
✅ Responsive on mobile/tablet
✅ Forms show validation errors
✅ Confirmation dialogs are clear

---

## Final Verification

```
Checklist:
□ Quiz list page loads and displays correctly
□ Create quiz modal opens and cascades properly
□ Quiz is created and detail page opens
□ Questions can be added (all 3 types)
□ Questions display with all details
□ Questions can be edited
□ Questions can be deleted
□ Quiz can be published (status changes)
□ Quiz can be unpublished (status changes)
□ Quiz can be deleted
□ Search works
□ Filter works
□ Stats are accurate
□ No console errors
□ No network errors
```

---

## Success Criteria

✅ All tests pass without errors
✅ UI is responsive and intuitive
✅ All features work as expected
✅ No console or network errors
✅ Performance is acceptable
✅ User feedback is clear

**Once all tests pass, the system is ready for production deployment.**

---

Date: March 19, 2026
Version: 1.0.0
Status: Ready for Testing
