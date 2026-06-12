

1. Auth APIs
Login
POST http://localhost:3000/api/admin/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "Admin@123"
}

Expected:
{
  "success": true,
  "accessToken": "eyJhbGc...",  ← copy this
  "admin": {
    "fullName": "Clubin Admin",
    "role": "ADMIN"
  }
}
Refresh Token
POST http://localhost:3000/api/admin/auth/refresh

No body — reads jwt_refresh cookie automatically

Expected:
{
  "success": true,
  "accessToken": "eyJhbGc..."
}
Get Me
GET http://localhost:3000/api/admin/auth/me
Headers:
  Authorization: Bearer <accessToken>

Expected:
{
  "success": true,
  "admin": {
    "fullName": "Clubin Admin",
    "username": "superadmin",
    "role": "ADMIN"
  }
}
Logout
POST http://localhost:3000/api/admin/auth/logout
Headers:
  Authorization: Bearer <accessToken>

Expected:
{
  "success": true,
  "message": "Logged out successfully"
}

2. User Submission APIs (Mobile App)
Submit KYC
POST http://localhost:3000/api/user/submit
Content-Type: multipart/form-data

Body (form-data):
  deviceId    Text    test-device-001
  name        Text    John Doe
  dob         Text    2000-01-21
  idType      Text    AADHAAR
  idNumber    Text    123456789012
  idDocument  File    [select any image]
  selfie      File    [select any image]

Expected:
{
  "success": true,
  "message": "Submission received. Please wait for admin approval.",
  "submissionId": "e1e502a1-..."
}
Check Approval Status
GET http://localhost:3000/api/user/status/test-device-001

Expected (PENDING):
{
  "success": true,
  "isVerified": false,
  "status": "PENDING",
  "userName": "JOHN DOE",
  "deviceId": "test-device-001",
  "submissionId": "e1e502a1-..."
}

Expected (APPROVED):
{
  "success": true,
  "isVerified": true,
  "status": "APPROVED",
  "tokenId": "CLB-A3F8B2C1D4E5",
  "ticketNumber": "TKT-AAD-8F9B2A",
  "age": 24,
  "userName": "JOHN DOE",
  "selfieUrl": "https://..."
}

Expected (REJECTED):
{
  "success": true,
  "isVerified": false,
  "status": "REJECTED",
  "userName": "JOHN DOE"
}

Expected (BANNED):
{
  "success": false,
  "isVerified": false,
  "status": "BANNED",
  "message": "You have been permanently banned from this venue."
}

3. Admin Submission APIs (Dashboard)
Get All Submissions
GET http://localhost:3000/api/admin/submissions
Headers:
  Authorization: Bearer <accessToken>

# Filter by status
GET http://localhost:3000/api/admin/submissions?status=PENDING
GET http://localhost:3000/api/admin/submissions?status=APPROVED
GET http://localhost:3000/api/admin/submissions?status=REJECTED
GET http://localhost:3000/api/admin/submissions?status=BANNED

# Pagination
GET http://localhost:3000/api/admin/submissions?status=PENDING&page=1&limit=20

Expected:
{
  "success": true,
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "submissions": [...]
}
Get Single Submission
GET http://localhost:3000/api/admin/submissions/<submissionMongoId>
Headers:
  Authorization: Bearer <accessToken>

Expected:
{
  "success": true,
  "submission": {
    "name": "JOHN DOE",
    "dob": "2000-01-21",
    "age": 24,
    "idType": "AADHAAR",
    "idNumber": "123456789012",
    "idDocumentUrl": "https://...",   ← only shown here
    "selfieUrl": "https://...",
    "status": "PENDING",
    ...
  }
}
Approve Submission
POST http://localhost:3000/api/admin/submissions/<submissionMongoId>/approve
Headers:
  Authorization: Bearer <accessToken>

No body needed

Expected:
{
  "success": true,
  "message": "User approved successfully",
  "submission": {
    "name": "JOHN DOE",
    "status": "APPROVED",
    "tokenId": "CLB-A3F8B2C1D4E5",
    "ticketNumber": "TKT-AAD-8F9B2A",
    "approvedAt": "2026-06-07T..."
  }
}
Reject Submission
POST http://localhost:3000/api/admin/submissions/<submissionMongoId>/reject
Headers:
  Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "reason": "ID document is blurry, please resubmit"
}

Expected:
{
  "success": true,
  "message": "User rejected successfully",
  "submission": {
    "name": "JOHN DOE",
    "status": "REJECTED",
    "rejectionReason": "ID document is blurry, please resubmit",
    "rejectedAt": "2026-06-07T..."
  }
}
Ban User
POST http://localhost:3000/api/admin/submissions/<submissionMongoId>/ban
Headers:
  Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "reason": "Attempted entry with fake ID"
}

Expected:
{
  "success": true,
  "message": "User banned successfully",
  "submission": {
    "name": "JOHN DOE",
    "status": "BANNED",
    "reason": "Attempted entry with fake ID"
  }
}

Complete Test Flow in Order

1. POST /api/admin/auth/login         → get accessToken

2. POST /api/user/submit              → submit KYC (mobile)

3. GET  /api/admin/submissions        → see pending list

4. GET  /api/admin/submissions/:id    → view selfie + ID side by side

5. POST /api/admin/submissions/:id/approve  → approve

6. GET  /api/user/status/:deviceId    → confirm tokenId returned

7. POST /api/admin/submissions/:id/ban → test ban

8. GET  /api/user/status/:deviceId    → confirm banned response

9. POST /api/admin/auth/refresh      → test token refresh

10. POST /api/admin/auth/logout       → test logout
