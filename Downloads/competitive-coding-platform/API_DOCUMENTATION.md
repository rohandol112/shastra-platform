# Coding Platform - API Documentation

**Version:** 1.0.0  
**Last Updated:** December 3, 2025  
**Base URL:** `http://localhost:3000/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Portal APIs (User-Facing)](#portal-apis-user-facing)
   - [Auth](#portal-auth)
   - [Problems](#portal-problems)
   - [Contests](#portal-contests)
   - [Submissions](#portal-submissions)
   - [Leaderboard](#portal-leaderboard)
   - [User Profile](#portal-user-profile)
3. [Dashboard APIs (Admin)](#dashboard-apis-admin)
   - [User Management](#dashboard-user-management)
   - [Problem Management](#dashboard-problem-management)
   - [Contest Management](#dashboard-contest-management)
   - [Submission Monitoring](#dashboard-submission-monitoring)
   - [Analytics](#dashboard-analytics)
   - [Editorial Management](#dashboard-editorial-management)
4. [Plagiarism Detection](#plagiarism-detection)
5. [Data Models](#data-models)
6. [Error Responses](#error-responses)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Structure
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "role": "USER|ADMIN|MODERATOR"
}
```

---

## Portal APIs (User-Facing)

### Portal Auth

#### Register User
**POST** `/portal/auth/jwt/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  }
}
```

---

#### Login
**POST** `/portal/auth/jwt/login`

**Request Body:**
```json
{
  "identifier": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "USER"
    },
    "token": "jwt_token_here"
  }
}
```

---

#### Get Profile
**GET** `/portal/auth/jwt/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Change Password
**PUT** `/portal/auth/jwt/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Portal Problems

#### Get All Problems
**GET** `/portal/problems`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `difficulty` (string: EASY|MEDIUM|HARD)
- `tags` (string, comma-separated)
- `search` (string)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "uuid",
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "EASY",
        "tags": ["array", "hash-table"],
        "acceptanceRate": 45.5,
        "totalSubmissions": 1000,
        "solvedCount": 455
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

---

#### Get Problem Details
**GET** `/portal/problems/:slug`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Two Sum",
    "slug": "two-sum",
    "description": "Given an array of integers...",
    "difficulty": "EASY",
    "tags": ["array", "hash-table"],
    "timeLimit": 2000,
    "memoryLimit": 256,
    "inputFormat": "First line contains...",
    "outputFormat": "Single integer...",
    "constraints": "1 <= n <= 10^5",
    "sampleTestCases": [
      {
        "input": "2 7 11 15\n9",
        "output": "0 1",
        "explanation": "nums[0] + nums[1] = 9"
      }
    ],
    "hints": [
      {
        "id": "uuid",
        "orderIndex": 1,
        "content": "Try using a hash map",
        "penalty": 10
      }
    ]
  }
}
```

---

### Portal Contests

#### Get All Contests
**GET** `/portal/contests`

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (string: DRAFT|SCHEDULED|RUNNING|ENDED|CANCELLED)
- `type` (string: INDIVIDUAL|TEAM)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contests": [
      {
        "id": "uuid",
        "title": "Weekly Contest 1",
        "slug": "weekly-contest-1",
        "startTime": "2025-01-01T10:00:00.000Z",
        "endTime": "2025-01-01T12:00:00.000Z",
        "duration": 7200,
        "type": "INDIVIDUAL",
        "status": "SCHEDULED",
        "participantCount": 150,
        "problemCount": 4
      }
    ],
    "total": 20,
    "page": 1,
    "totalPages": 2
  }
}
```

---

#### Get Contest Details
**GET** `/portal/contests/:slug`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Weekly Contest 1",
    "slug": "weekly-contest-1",
    "description": "Test your coding skills...",
    "startTime": "2025-01-01T10:00:00.000Z",
    "endTime": "2025-01-01T12:00:00.000Z",
    "duration": 7200,
    "type": "INDIVIDUAL",
    "status": "RUNNING",
    "rules": "1. No plagiarism\n2. Fair play",
    "problems": [
      {
        "problemId": "uuid",
        "title": "Problem A",
        "slug": "problem-a",
        "points": 100,
        "orderIndex": 1,
        "solvedCount": 50
      }
    ],
    "isRegistered": true
  }
}
```

---

#### Register for Contest
**POST** `/portal/contests/:contestId/register`

**Headers:** `Authorization: Bearer <token>`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Successfully registered for contest",
  "data": {
    "contestId": "uuid",
    "userId": "uuid",
    "registeredAt": "2025-01-01T09:00:00.000Z"
  }
}
```

---

#### Get Contest Leaderboard
**GET** `/portal/contests/:contestId/leaderboard`

**Query Parameters:**
- `page` (number)
- `limit` (number, max: 200)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "username": "johndoe",
          "firstName": "John",
          "lastName": "Doe"
        },
        "totalScore": 350,
        "problemsSolved": 4,
        "lastSubmissionTime": "2025-01-01T11:30:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "totalPages": 2
  }
}
```

---

### Portal Submissions

#### Submit Solution
**POST** `/portal/submissions`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "problemId": "uuid",
  "language": "cpp",
  "sourceCode": "#include<iostream>\nusing namespace std;\nint main() {...}",
  "contestId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Submission created successfully",
  "data": {
    "id": "uuid",
    "status": "QUEUED",
    "language": "cpp",
    "createdAt": "2025-01-01T10:30:00.000Z"
  }
}
```

---

#### Get Submission Status
**GET** `/portal/submissions/:submissionId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACCEPTED",
    "language": "cpp",
    "time": 120,
    "memory": 2048,
    "score": 100,
    "testCasesPassed": 10,
    "totalTestCases": 10,
    "createdAt": "2025-01-01T10:30:00.000Z",
    "judgedAt": "2025-01-01T10:30:05.000Z",
    "errorMessage": null
  }
}
```

---

#### Get My Submissions
**GET** `/portal/submissions/my`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `problemId` (string, uuid)
- `status` (string)
- `language` (string)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "problem": {
          "id": "uuid",
          "title": "Two Sum",
          "slug": "two-sum"
        },
        "status": "ACCEPTED",
        "language": "cpp",
        "time": 120,
        "memory": 2048,
        "createdAt": "2025-01-01T10:30:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "totalPages": 3
  }
}
```

---

### Portal Leaderboard

#### Get Global Leaderboard
**GET** `/portal/leaderboard`

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `timeframe` (string: ALL_TIME|MONTHLY|WEEKLY)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "username": "johndoe",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "url"
        },
        "problemsSolved": 250,
        "totalScore": 15000,
        "contestsParticipated": 20
      }
    ],
    "total": 1000,
    "page": 1,
    "totalPages": 10
  }
}
```

---

### Portal User Profile

#### Get Public Profile
**GET** `/portal/users/:username`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "url",
    "bio": "Competitive programmer",
    "statistics": {
      "problemsSolved": 250,
      "contestsParticipated": 20,
      "globalRank": 15,
      "easyProblems": 100,
      "mediumProblems": 120,
      "hardProblems": 30
    },
    "recentSubmissions": [
      {
        "problemTitle": "Two Sum",
        "status": "ACCEPTED",
        "language": "cpp",
        "createdAt": "2025-01-01T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Dashboard APIs (Admin)

**Note:** All Dashboard APIs require Admin or Moderator role.

### Dashboard User Management

#### Get All Users
**GET** `/dashboard/users`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number)
- `limit` (number, max: 100)
- `role` (string: USER|ADMIN|MODERATOR)
- `isActive` (boolean)
- `search` (string)
- `sortBy` (string: createdAt|email|username|firstName|lastName|lastLoginAt)
- `sortOrder` (string: asc|desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "role": "USER",
        "isActive": true,
        "isVerified": true,
        "lastLoginAt": "2025-01-01T10:00:00.000Z",
        "createdAt": "2024-12-01T00:00:00.000Z",
        "submissionCount": 150,
        "contestCount": 10
      }
    ],
    "total": 500,
    "page": 1,
    "totalPages": 5
  }
}
```

---

#### Get User Details
**GET** `/dashboard/users/:userId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "USER",
    "isActive": true,
    "isVerified": true,
    "lastLoginAt": "2025-01-01T10:00:00.000Z",
    "createdAt": "2024-12-01T00:00:00.000Z",
    "submissionCount": 150,
    "contestCount": 10
  }
}
```

---

#### Update User
**PUT** `/dashboard/users/:userId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isVerified": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isActive": true,
    "isVerified": true
  }
}
```

---

#### Update User Role
**PATCH** `/dashboard/users/:userId/role`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "role": "MODERATOR"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "uuid",
    "role": "MODERATOR"
  }
}
```

---

#### Activate User
**PATCH** `/dashboard/users/:userId/activate`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User activated successfully"
}
```

---

#### Deactivate User
**PATCH** `/dashboard/users/:userId/deactivate`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

#### Delete User
**DELETE** `/dashboard/users/:userId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### Dashboard Problem Management

#### Create Problem
**POST** `/dashboard/problems`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "description": "Given an array of integers...",
  "difficulty": "EASY",
  "tags": ["array", "hash-table"],
  "timeLimit": 2000,
  "memoryLimit": 256,
  "inputFormat": "First line contains...",
  "outputFormat": "Single integer...",
  "constraints": "1 <= n <= 10^5",
  "sampleTestCases": [
    {
      "input": "2 7 11 15\n9",
      "output": "0 1",
      "explanation": "nums[0] + nums[1] = 9"
    }
  ],
  "isPublic": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "EASY",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Get All Problems (Admin)
**GET** `/dashboard/problems`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number)
- `limit` (number, max: 100)
- `difficulty` (string)
- `tags` (string)
- `search` (string)
- `isPublic` (boolean)
- `sortBy` (string: createdAt|title|difficulty)
- `sortOrder` (string: asc|desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "uuid",
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "EASY",
        "isPublic": true,
        "submissionCount": 1000,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 5
  }
}
```

---

#### Update Problem
**PUT** `/dashboard/problems/:problemId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Two Sum Updated",
  "description": "Updated description...",
  "difficulty": "MEDIUM",
  "isPublic": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Two Sum Updated",
    "difficulty": "MEDIUM"
  }
}
```

---

#### Delete Problem
**DELETE** `/dashboard/problems/:problemId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Problem deleted successfully"
}
```

---

#### Add Test Case
**POST** `/dashboard/problems/:problemId/testcases`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "input": "2 7 11 15\n9",
  "expectedOutput": "0 1",
  "isHidden": true,
  "points": 10,
  "orderIndex": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "input": "...",
    "expectedOutput": "...",
    "isHidden": true,
    "points": 10
  }
}
```

---

#### Get Test Cases
**GET** `/dashboard/problems/:problemId/testcases`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "testCases": [
      {
        "id": "uuid",
        "input": "...",
        "expectedOutput": "...",
        "isHidden": true,
        "points": 10,
        "orderIndex": 1
      }
    ]
  }
}
```

---

#### Update Test Case
**PUT** `/dashboard/problems/testcases/:testCaseId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "input": "updated input",
  "expectedOutput": "updated output",
  "points": 15
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "input": "updated input",
    "points": 15
  }
}
```

---

#### Delete Test Case
**DELETE** `/dashboard/problems/testcases/:testCaseId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Test case deleted successfully"
}
```

---

### Dashboard Contest Management

#### Create Contest
**POST** `/dashboard/contests`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Weekly Contest 1",
  "slug": "weekly-contest-1",
  "description": "Test your skills...",
  "startTime": "2025-01-01T10:00:00.000Z",
  "endTime": "2025-01-01T12:00:00.000Z",
  "duration": 7200,
  "type": "INDIVIDUAL",
  "rules": "1. No plagiarism",
  "isPublic": true,
  "maxParticipants": 500
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Weekly Contest 1",
    "slug": "weekly-contest-1",
    "status": "DRAFT",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Get All Contests (Admin)
**GET** `/dashboard/contests`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number)
- `limit` (number, max: 100)
- `status` (string)
- `type` (string)
- `search` (string)
- `sortBy` (string: startTime|endTime|createdAt|title)
- `sortOrder` (string: asc|desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contests": [
      {
        "id": "uuid",
        "title": "Weekly Contest 1",
        "slug": "weekly-contest-1",
        "startTime": "2025-01-01T10:00:00.000Z",
        "endTime": "2025-01-01T12:00:00.000Z",
        "status": "SCHEDULED",
        "participantCount": 150,
        "problemCount": 4
      }
    ],
    "total": 20,
    "page": 1,
    "totalPages": 2
  }
}
```

---

#### Update Contest
**PUT** `/dashboard/contests/:contestId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Weekly Contest 1 Updated",
  "startTime": "2025-01-02T10:00:00.000Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Weekly Contest 1 Updated"
  }
}
```

---

#### Delete Contest
**DELETE** `/dashboard/contests/:contestId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Contest deleted successfully"
}
```

---

#### Add Problem to Contest
**POST** `/dashboard/contests/:contestId/problems`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "problemId": "uuid",
  "points": 100,
  "orderIndex": 1,
  "bonusPoints": 20
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "contestId": "uuid",
    "problemId": "uuid",
    "points": 100,
    "orderIndex": 1
  }
}
```

---

#### Remove Problem from Contest
**DELETE** `/dashboard/contests/:contestId/problems/:problemId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Problem removed from contest"
}
```

---

#### Update Contest Status
**PATCH** `/dashboard/contests/:contestId/status`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "RUNNING"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "RUNNING"
  }
}
```

---

#### Get Contest Participants
**GET** `/dashboard/contests/:contestId/participants`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number)
- `limit` (number, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "userId": "uuid",
        "username": "johndoe",
        "email": "user@example.com",
        "registeredAt": "2025-01-01T09:00:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "totalPages": 2
  }
}
```

---

#### Clone Contest
**POST** `/dashboard/contests/:contestId/clone`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "newSlug": "weekly-contest-2",
  "newTitle": "Weekly Contest 2"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Contest cloned successfully",
  "data": {
    "id": "new-uuid",
    "title": "Weekly Contest 2",
    "slug": "weekly-contest-2"
  }
}
```

---

### Dashboard Submission Monitoring

#### Get All Submissions
**GET** `/dashboard/submissions`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (number)
- `limit` (number, max: 100)
- `userId` (string, uuid)
- `problemId` (string, uuid)
- `status` (string)
- `language` (string)
- `startDate` (ISO date)
- `endDate` (ISO date)
- `sortBy` (string: createdAt|status|language|time|memory|score)
- `sortOrder` (string: asc|desc)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Submissions fetched successfully",
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "username": "johndoe",
          "email": "user@example.com"
        },
        "problem": {
          "id": "uuid",
          "title": "Two Sum",
          "slug": "two-sum",
          "difficulty": "EASY"
        },
        "status": "ACCEPTED",
        "language": "cpp",
        "time": 120,
        "memory": 2048,
        "score": 100,
        "createdAt": "2025-01-01T10:30:00.000Z"
      }
    ],
    "total": 5000,
    "page": 1,
    "totalPages": 50
  }
}
```

---

#### Get Submission Details
**GET** `/dashboard/submissions/:submissionId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Submission fetched successfully",
  "data": {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "user@example.com"
    },
    "problem": {
      "id": "uuid",
      "title": "Two Sum",
      "difficulty": "EASY"
    },
    "sourceCode": "...",
    "language": "cpp",
    "status": "ACCEPTED",
    "time": 120,
    "memory": 2048,
    "score": 100,
    "testCasesPassed": 10,
    "totalTestCases": 10,
    "errorMessage": null,
    "createdAt": "2025-01-01T10:30:00.000Z",
    "judgedAt": "2025-01-01T10:30:05.000Z"
  }
}
```

---

#### Delete Submission
**DELETE** `/dashboard/submissions/:submissionId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

---

#### Rejudge Submission
**POST** `/dashboard/submissions/:submissionId/rejudge`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Submission queued for rejudging",
  "data": {
    "id": "uuid",
    "status": "QUEUED"
  }
}
```

---

### Dashboard Analytics

#### Get Dashboard Overview
**GET** `/dashboard/analytics`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Analytics fetched successfully",
  "data": {
    "users": {
      "total": 5000,
      "active": 4500
    },
    "problems": {
      "total": 500,
      "published": 450
    },
    "contests": {
      "total": 50,
      "active": 2
    },
    "submissions": {
      "total": 50000,
      "today": 500
    },
    "recentUsers": [
      {
        "id": "uuid",
        "username": "johndoe",
        "email": "user@example.com",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "popularProblems": [
      {
        "id": "uuid",
        "title": "Two Sum",
        "slug": "two-sum",
        "submissionCount": 1000
      }
    ],
    "upcomingContests": [
      {
        "id": "uuid",
        "title": "Weekly Contest 2",
        "startTime": "2025-01-05T10:00:00.000Z"
      }
    ]
  }
}
```

---

#### Get Submission Statistics
**GET** `/dashboard/analytics/submissions`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `startDate` (ISO date)
- `endDate` (ISO date)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Submission stats fetched successfully",
  "data": {
    "total": 50000,
    "byStatus": {
      "ACCEPTED": 25000,
      "WRONG_ANSWER": 15000,
      "TIME_LIMIT_EXCEEDED": 5000,
      "COMPILE_ERROR": 3000,
      "RUNTIME_ERROR": 2000
    },
    "byLanguage": {
      "cpp": 20000,
      "python": 15000,
      "java": 10000,
      "javascript": 5000
    }
  }
}
```

---

#### Get Problem Statistics
**GET** `/dashboard/analytics/problems`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Problem stats fetched successfully",
  "data": {
    "byDifficulty": {
      "EASY": 200,
      "MEDIUM": 250,
      "HARD": 50
    },
    "byTag": {
      "array": 150,
      "hash-table": 100,
      "dynamic-programming": 80,
      "graph": 60
    }
  }
}
```

---

### Dashboard Editorial Management

#### Create Editorial
**POST** `/dashboard/editorials`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "problemId": "uuid",
  "approach": "We can solve this using hash map...",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "codeExamples": [
    {
      "language": "cpp",
      "code": "#include<iostream>...",
      "explanation": "This solution uses..."
    }
  ],
  "relatedTopics": ["hash-table", "array"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Editorial created successfully",
  "data": {
    "id": "uuid",
    "problemId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### Get Editorial
**GET** `/dashboard/editorials/:problemId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "problemId": "uuid",
    "problem": {
      "title": "Two Sum",
      "slug": "two-sum"
    },
    "approach": "We can solve this...",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "codeExamples": [...],
    "hints": [
      {
        "id": "uuid",
        "content": "Try using hash map",
        "orderIndex": 1,
        "penalty": 10
      }
    ],
    "relatedTopics": ["hash-table", "array"]
  }
}
```

---

#### Update Editorial
**PUT** `/dashboard/editorials/:editorialId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "approach": "Updated approach...",
  "timeComplexity": "O(n log n)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Editorial updated successfully"
}
```

---

#### Delete Editorial
**DELETE** `/dashboard/editorials/:editorialId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Editorial deleted successfully"
}
```

---

#### Add Hint
**POST** `/dashboard/editorials/:editorialId/hints`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "content": "Think about using hash map",
  "orderIndex": 1,
  "penalty": 10
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Hint added successfully",
  "data": {
    "id": "uuid",
    "content": "Think about using hash map",
    "penalty": 10
  }
}
```

---

#### Update Hint
**PUT** `/dashboard/editorials/hints/:hintId`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "content": "Updated hint content",
  "penalty": 15
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Hint updated successfully"
}
```

---

#### Delete Hint
**DELETE** `/dashboard/editorials/hints/:hintId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Hint deleted successfully"
}
```

---

## Plagiarism Detection

**Note:** Plagiarism detection is powered by an external API service. The platform acts as a wrapper to provide seamless integration.

### Check Submission for Plagiarism
**POST** `/plagiarism/check`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "submissionId": "uuid",
  "threshold": 0.85,
  "compareWithContest": true,
  "contestId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid",
    "hasPlagiarism": true,
    "externalProvider": "plagiarism-api-service",
    "matches": [
      {
        "matchedSubmissionId": "uuid",
        "matchedUserId": "uuid",
        "matchedUsername": "otheruser",
        "similarity": 0.92,
        "matchedLines": [
          {
            "originalLine": 10,
            "matchedLine": 15,
            "content": "int result = a + b;"
          }
        ]
      }
    ],
    "maxSimilarity": 0.92,
    "checkedAt": "2025-01-01T11:00:00.000Z"
  }
}
```

---

### Get Plagiarism Report
**GET** `/plagiarism/report/:submissionId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid",
    "userId": "uuid",
    "username": "johndoe",
    "problemId": "uuid",
    "problemTitle": "Two Sum",
    "language": "cpp",
    "submittedAt": "2025-01-01T10:30:00.000Z",
    "plagiarismStatus": "FLAGGED",
    "matches": [
      {
        "matchedSubmissionId": "uuid",
        "matchedUserId": "uuid",
        "matchedUsername": "otheruser",
        "similarity": 0.92,
        "matchedAt": "2025-01-01T10:25:00.000Z"
      }
    ],
    "maxSimilarity": 0.92,
    "reviewStatus": "PENDING",
    "reviewedBy": null,
    "reviewNotes": null
  }
}
```

---

### Get Contest Plagiarism Report
**GET** `/plagiarism/contest/:contestId`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `threshold` (number, 0-1, default: 0.85)
- `page` (number)
- `limit` (number)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "contestId": "uuid",
    "contestTitle": "Weekly Contest 1",
    "totalSubmissions": 500,
    "flaggedSubmissions": 15,
    "flaggedUsers": [
      {
        "userId": "uuid",
        "username": "johndoe",
        "submissionsCount": 2,
        "maxSimilarity": 0.95,
        "problemsAffected": ["Two Sum", "Three Sum"]
      }
    ],
    "page": 1,
    "totalPages": 1
  }
}
```

---

### Update Plagiarism Review
**PATCH** `/plagiarism/:submissionId/review`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reviewStatus": "CONFIRMED",
  "action": "DISQUALIFY",
  "notes": "Clear case of plagiarism. User copied from another submission."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Plagiarism review updated successfully",
  "data": {
    "submissionId": "uuid",
    "reviewStatus": "CONFIRMED",
    "action": "DISQUALIFY",
    "reviewedBy": "admin-uuid",
    "reviewedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

### Bulk Plagiarism Check
**POST** `/plagiarism/bulk-check`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "problemId": "uuid",
  "contestId": "uuid",
  "threshold": 0.85,
  "languages": ["cpp", "java"]
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "message": "Bulk plagiarism check started",
  "data": {
    "jobId": "uuid",
    "status": "PROCESSING",
    "estimatedTime": "5 minutes",
    "totalSubmissions": 300
  }
}
```

---

### Get Bulk Check Status
**GET** `/plagiarism/bulk-check/:jobId`

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "COMPLETED",
    "progress": 100,
    "processedSubmissions": 300,
    "totalSubmissions": 300,
    "flaggedSubmissions": 25,
    "startedAt": "2025-01-01T12:00:00.000Z",
    "completedAt": "2025-01-01T12:05:00.000Z"
  }
}
```

---

## Data Models

### User
```typescript
{
  id: string (UUID)
  email: string (unique)
  username: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  phone: string
  avatar: string (URL)
  provider: "LOCAL" | "GOOGLE" | "GITHUB"
  role: "USER" | "ADMIN" | "MODERATOR"
  isActive: boolean
  isVerified: boolean
  lastLoginAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Problem
```typescript
{
  id: string (UUID)
  title: string
  slug: string (unique)
  description: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  tags: string[]
  timeLimit: number (ms)
  memoryLimit: number (MB)
  inputFormat: string
  outputFormat: string
  constraints: string
  sampleTestCases: TestCase[]
  isPublic: boolean
  createdBy: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Contest
```typescript
{
  id: string (UUID)
  title: string
  slug: string (unique)
  description: string
  startTime: DateTime
  endTime: DateTime
  duration: number (seconds)
  type: "INDIVIDUAL" | "TEAM"
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "ENDED" | "CANCELLED"
  rules: string
  prizes: string
  isPublic: boolean
  maxParticipants: number
  registrationDeadline: DateTime
  createdBy: string (UUID)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Submission
```typescript
{
  id: string (UUID)
  userId: string (UUID)
  problemId: string (UUID)
  contestId: string (UUID, optional)
  sourceCode: string
  language: string
  status: "QUEUED" | "RUNNING" | "ACCEPTED" | "WRONG_ANSWER" | 
          "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | 
          "RUNTIME_ERROR" | "COMPILE_ERROR" | "PARTIAL" | "FAILED"
  time: number (ms)
  memory: number (KB)
  score: number
  testCasesPassed: number
  totalTestCases: number
  errorMessage: string
  createdAt: DateTime
  judgedAt: DateTime
}
```

### Editorial
```typescript
{
  id: string (UUID)
  problemId: string (UUID, unique)
  approach: string
  timeComplexity: string
  spaceComplexity: string
  codeExamples: CodeExample[]
  relatedTopics: string[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Hint
```typescript
{
  id: string (UUID)
  editorialId: string (UUID)
  content: string
  orderIndex: number
  penalty: number (points)
  createdAt: DateTime
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or bad input
- `401 Unauthorized` - Authentication required or token invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (e.g., duplicate email)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Example Error Responses

**Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Unauthorized (401)**
```json
{
  "success": false,
  "message": "Unauthorized - Invalid token"
}
```

**Forbidden (403)**
```json
{
  "success": false,
  "message": "Forbidden - Admin access required"
}
```

**Not Found (404)**
```json
{
  "success": false,
  "message": "Problem not found"
}
```

**Conflict (409)**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Rate Limit (429)**
```json
{
  "success": false,
  "message": "Submission rate limit exceeded. Please wait before submitting again.",
  "retryAfter": 60
}
```

---

## Additional Notes

### Supported Programming Languages
- C++ (cpp)
- Java (java)
- Python (python, python3)
- JavaScript (javascript, nodejs)
- C (c)
- C# (csharp)
- Go (go)
- Rust (rust)
- Kotlin (kotlin)
- Swift (swift)

### Pagination
All paginated endpoints support:
- `page` (default: 1)
- `limit` (default: 20, max varies by endpoint)
- Return format includes: `data`, `total`, `page`, `totalPages`

### Sorting
Most list endpoints support:
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`

### Search & Filtering
- Use `search` for text search (case-insensitive)
- Use specific filters like `difficulty`, `status`, `language` etc.
- Date filters accept ISO 8601 format

### Rate Limiting
- Submissions: 10 per minute, 100 per hour per user
- API calls: 100 requests per minute per IP
- Admin endpoints: 500 requests per minute

### WebSocket Events (Future)
- Submission status updates
- Contest live updates
- Leaderboard real-time changes

---

## Contact & Support

For API questions or issues, please contact:
- **Email:** api-support@codingplatform.com
- **Slack:** #api-support
- **Documentation:** https://docs.codingplatform.com

---

**Last Updated:** December 3, 2025  
**API Version:** 1.0.0
