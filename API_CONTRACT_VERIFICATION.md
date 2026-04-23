# API Contract Verification - Frontend ↔️ Backend

## ✅ Status: ALL APIs ALIGNED

**Last Updated**: 2024-11-08  
**Verification**: Complete

---

## 📋 API Endpoints

### 1. Start Full Test

**Endpoint**: `POST /exams/{testId}/start`

**Frontend Request** (testService.js):
```javascript
api.post(`/exams/${testId}/start`)
// No body required
```

**Backend Controller**:
```java
@PostMapping("/{testId}/start")
public ApiResponse<ExamSessionResponse> startFullTest(@PathVariable String testId)
```

**Response Structure**:
```json
{
  "code": 1000,
  "message": "Success",
  "result": {
    "sessionToken": "uuid-string",
    "sessionId": "uuid-string",
    "testId": "test-123",
    "testName": "TOEIC Full Test 01",
    "startTime": "2024-11-08T10:30:00",
    "expiryTime": "2024-11-08T12:30:00",
    "timeLimitMinutes": 120,
    "isFullTest": true,
    "examQuestions": {
      "parts": [...]
    }
  }
}
```

**Frontend Handling**:
- ✅ Stores `sessionToken`, `sessionId`, `startTime`, `expiryTime` in localStorage
- ✅ Flattens response to include session data with examQuestions

---

### 2. Start Practice Test

**Endpoint**: `POST /exams/practice/{testId}`

**Frontend Request** (testService.js):
```javascript
api.post(`/exams/practice/${testId}`, {
  partIds: ["part-1", "part-2"]  // Array of part IDs
})
```

**Backend Controller**:
```java
@PostMapping("/practice/{testId}")
public ApiResponse<ExamSessionResponse> practiceTest(
  @PathVariable String testId,
  @RequestBody(required = false) PracticeExamRequest request
)
```

**Request DTO** (PracticeExamRequest.java):
```java
public class PracticeExamRequest {
    List<String> partIds;  // Can be null or empty
}
```

**Response Structure**: Same as Start Full Test above

**Frontend Handling**:
- ✅ Sends partIds array in request body
- ✅ Stores session data in localStorage
- ✅ Flattens response structure

---

### 3. Submit Exam

**Endpoint**: `POST /exams/{testId}/submit`

**Frontend Request** (testService.js):
```javascript
const payload = {
  sessionToken: "uuid-from-localStorage",  // REQUIRED
  testId: "test-123",
  partIds: ["part-1", "part-2"],  // Empty array for full test
  answers: [
    {
      questionId: "q1",
      answerId: "a1"
    }
  ]
};
api.post(`/exams/${testId}/submit`, payload)
```

**Backend Controller**:
```java
@PostMapping("/{testId}/submit")
@RateLimit(maxRequests = 3, windowSeconds = 60)
public ApiResponse<ExamResultResponse> submitExam(
  @PathVariable String testId,
  @RequestBody @Valid SubmitExamRequest request
)
```

**Request DTO** (SubmitExamRequest.java):
```java
public class SubmitExamRequest {
    @NotBlank String sessionToken;  // REQUIRED
    @NotBlank String testId;
    List<String> partIds;  // Can be null
    @Valid @NotEmpty List<UserAnswerSubmit> answers;
}

public class UserAnswerSubmit {
    @NotBlank String questionId;
    @NotBlank String answerId;
}
```

**Response Structure**:
```json
{
  "code": 1000,
  "message": "Exam submitted successfully",
  "result": {
    "resultId": "result-xyz",
    "testName": "TOEIC Full Test 01",
    "userName": "john.doe@example.com",
    "score": 850,
    "totalQuestions": 200,
    "correctAnswers": 170,
    "submittedAt": "2024-11-08T12:25:30",
    "details": [...]
  }
}
```

**Frontend Handling**:
- ✅ Retrieves sessionToken from localStorage
- ✅ Throws error if no session token found
- ✅ Maps answers to correct field names (answerId not selectedAnswerId)
- ✅ Clears session data from localStorage after submit

---

## 🔒 Session Management

### Session Token Flow

1. **Start Exam** (POST /exams/{testId}/start OR /exams/practice/{testId})
   - Backend generates UUID sessionToken
   - Returns sessionToken + expiryTime
   - Frontend stores in localStorage

2. **During Exam**
   - ExamTimer component monitors expiryTime
   - SessionToken kept in localStorage

3. **Submit Exam** (POST /exams/{testId}/submit)
   - Frontend retrieves sessionToken from localStorage
   - Includes in request payload
   - Backend validates session is active
   - Frontend clears localStorage after submit

### localStorage Keys

```javascript
localStorage.setItem('examSessionToken', sessionToken);
localStorage.setItem('examSessionId', sessionId);
localStorage.setItem('examStartTime', startTime);
localStorage.setItem('examExpiryTime', expiryTime);
localStorage.setItem('examTestId', testId);
```

---

## ⚠️ Error Codes (Session-Related)

| Code | Message | Frontend Handling |
|------|---------|-------------------|
| 2600 | SESSION_NOT_FOUND | Alert + redirect to test list |
| 2601 | SESSION_EXPIRED | Alert + redirect to test list |
| 2603 | DUPLICATE_SUBMISSION | Alert "Already submitted" + redirect |

**Implementation** (Exam.jsx):
```javascript
if ([2600, 2601, 2603].includes(error.response?.data?.code)) {
  toast.error(error.response.data.message);
  navigate('/tests');
}
```

---

## 🔄 Breaking Changes Summary

### What Changed from Old API

| Aspect | Old API | New API |
|--------|---------|---------|
| Start Full Test | `GET /exams/tests/{testId}/start` | `POST /exams/{testId}/start` |
| Practice Test | `GET /exams/tests/{testId}/practice?part=p1` | `POST /exams/practice/{testId}` + body |
| Submit Exam | `POST /exams/submit` | `POST /exams/{testId}/submit` |
| Submit payload | `userAnswers` array | `answers` array |
| Answer field | `selectedAnswerId` | `answerId` |
| Session tracking | None | `sessionToken` required |
| Response structure | `{ parts: [...] }` | `{ examQuestions: { parts: [...] }, sessionToken, ... }` |

---

## 📁 Files Modified

### Backend (5 files)
1. ✅ `ExamController.java` - Changed all 3 endpoints
2. ✅ `ExamSessionResponse.java` - New response DTO
3. ✅ `SubmitExamRequest.java` - Added sessionToken field
4. ✅ `PracticeExamRequest.java` - New request DTO (created)
5. ✅ `UserAnswerSubmit.java` - Uses `answerId` field

### Frontend (3 files)
1. ✅ `testService.js` - Updated 3 methods
   - getTestQuestions() - POST with session handling
   - getPracticeQuestions() - POST with body
   - submitTest() - Added sessionToken + correct field names
2. ✅ `ExamTimer.jsx` - New timer component
3. ✅ `Exam.jsx` - Integrated session management

---

## ✅ Verification Checklist

- [x] Endpoint URLs match (controller annotations vs frontend calls)
- [x] HTTP methods match (POST vs POST)
- [x] Request body structure matches DTOs
- [x] Response structure matches frontend parsing
- [x] Field names are identical (camelCase)
- [x] Session token properly passed
- [x] Error codes handled correctly
- [x] localStorage management correct

---

## 🧪 Testing Recommendations

### 1. Start Full Test
```bash
curl -X POST http://localhost:8080/exams/test-123/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Start Practice Test
```bash
curl -X POST http://localhost:8080/exams/practice/test-123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"partIds": ["part-1", "part-3"]}'
```

### 3. Submit Exam
```bash
curl -X POST http://localhost:8080/exams/test-123/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionToken": "uuid-from-start-response",
    "testId": "test-123",
    "partIds": [],
    "answers": [
      {"questionId": "q1", "answerId": "a1"},
      {"questionId": "q2", "answerId": "a2"}
    ]
  }'
```

---

## 🎯 Next Steps

1. ✅ **Backend**: All endpoints updated
2. ✅ **Frontend**: All API calls updated
3. ⏳ **Build & Test**: Run both applications
4. ⏳ **Integration Test**: Test full exam flow
5. ⏳ **Deploy**: Follow QUICK_DEPLOYMENT_GUIDE.md

---

**Document Status**: ✅ Complete  
**API Contract**: ✅ Verified  
**Ready for Testing**: ✅ Yes
