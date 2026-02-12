# AstroBharatAI Resume Checker

## 📋 Project Overview

**AstroBharatAI Resume Checker** is an intelligent recruitment platform that automates candidate assessment using ATS (Applicant Tracking System) scoring. The system allows candidates to apply for jobs, validates their email using OTP verification, parses their resumes (PDF/DOCX), calculates an ATS compatibility score, and notifies HR for qualified candidates—all in real-time.

### Key Features

- ✅ **Multi-step Application Flow** with email verification (OTP)
- 📄 **Resume Parsing** for PDF and DOCX files  
- 🎯 **Automated ATS Scoring** (0-100 scale) based on skills, experience, education
- 📧 **Email Notifications** for both candidates (OTP) and HR (qualified profiles)
- 🗄️ **Cloud Storage** using MongoDB GridFS for resume files
- 🔒 **Submission Limits** (max 3 applications per email)
- 🌐 **Project Status**: Local Development Only

---



## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.3.1** | UI library |
| **Vite 5.1.0** | Build tool & dev server |
| **React Router Dom 6.22.0** | Client-side routing |
| **Axios 1.6.7** | HTTP client for API calls |
| **React Toastify 10.0.4** | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express 4.18.2** | Web server framework |
| **MongoDB 6.3.0** | NoSQL database (Atlas cloud) |
| **GridFS** | Binary file storage (resumes) |
| **Nodemailer 6.9.8** | Email service (Gmail SMTP) |
| **Multer 1.4.5** | File upload middleware |
| **bcryptjs 2.4.3** | OTP hashing |
| **pdf-parse 1.1.1** | PDF resume parsing |
| **mammoth 1.6.0** | DOCX resume parsing |
| **dotenv 16.4.1** | Environment variable management |
| **CORS 2.8.5** | Cross-origin resource sharing |



---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│  React Frontend │ (Vite + React Router)
│  Port: 5173     │
└────────┬────────┘
         │ REST API (Axios)
         │
         ▼
┌─────────────────┐
│  Express Server │ (Node.js)
│  Port: 5000     │
└────────┬────────┘
         │
         ├─────────► MongoDB Atlas (candidates, otps)
         │
         ├─────────► GridFS (resume storage)
         │
         └─────────► Nodemailer (Gmail SMTP)
```

**Data Flow:**
1. Candidate fills form → Frontend validates → Checks submission limit
2. Send OTP → Candidate verifies email
3. Upload resume → Parse PDF/DOCX → Calculate ATS score
4. Save to MongoDB → If score ≥ 70, send HR email with resume attachment
5. Display result to candidate

---

## 📁 Folder Structure

```
parashari-job-portal/
├── src/                          # Frontend source
│   ├── components/               # Reusable React components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/                    # Route pages
│   │   ├── LandingPage.jsx       # Home/hero page
│   │   ├── ApplicationPage.jsx   # Multi-step application form
│   │   └── SuccessPage.jsx       # Post-submission result
│   ├── utils/                    # Helper utilities
│   │   └── api.js                # Axios API client
│   ├── data/                     # Static data
│   │   └── indianLocations.js    # State/city dropdown data
│   ├── App.jsx                   # Main app component + routing
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── server/                       # Backend source
│   ├── config/
│   │   └── database.js           # MongoDB connection + GridFS setup
│   ├── routes/                   # API route handlers
│   │   ├── otp.js                # POST /api/otp/send, /api/otp/verify
│   │   ├── candidates.js         # POST /api/candidates/check-duplicate
│   │   └── applications.js       # POST /api/applications/submit
│   ├── services/                 # Business logic
│   │   ├── emailService.js       # Nodemailer (OTP, HR notification)
│   │   ├── resumeParser.js       # Extract text + metadata from resume
│   │   └── atsScoring.js         # Calculate ATS score (0-100)
│   ├── middleware/
│   │   └── upload.js             # Multer (memory storage, file validation)
│   ├── server.js                 # Express app entry point
│   └── .env                      # Environment variables (NOT in repo)
├── vercel.json                   # Vercel deployment config
├── package.json                  # Frontend dependencies
└── server/package.json           # Backend dependencies
```

---

## 🔄 How It Works (User Flow)

### Step 1: Personal Information
- Candidate enters: name, email, phone, state/city, college, job category, LinkedIn (optional)
- Frontend validates and checks submission limit (max 3 per email)

### Step 2: Email Verification (OTP)
- System sends 6-digit OTP to candidate's email (hashed with bcrypt, 10-minute expiry)
- Candidate enters OTP to proceed

### Step 3: Resume Upload
- Candidate uploads PDF or DOCX resume (max 5MB)
- Backend parses resume → extracts text, email, phone, skills, experience, education
- **ATS Score Calculation:**
  - Contact info: 10 points
  - Skills match: 30 points  
  - Experience: 25 points
  - Education: 20 points
  - Resume completeness: 15 points
- **Qualification Logic:**
  - Score ≥ 70 → Qualified → HR email sent
  - Score < 70 → Not qualified → No HR email
  - Job category = "Other/Custom" → ATS skipped → HR email sent (manual review)

### Step 4: Result Display
- Frontend shows success page with:
  - Application ID
  - ATS score (if applicable)
  - Qualification status

---

## 📡 API Documentation

- **Development**: `http://localhost:5000/api`

---

### 1. Check Email Submission Limit

**Endpoint:** `POST /api/candidates/check-duplicate`

**Request Body:**
```json
{
  "email": "candidate@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "canSubmit": true,
  "count": 1,
  "limit": 3,
  "remaining": 2
}
```

---

### 2. Send OTP

**Endpoint:** `POST /api/otp/send`

**Request Body:**
```json
{
  "email": "candidate@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Notes:**
- OTP is 6 digits, valid for 10 minutes
- Hashed (bcrypt) before storing in database
- Auto-deletes after expiry via MongoDB TTL index

---

### 3. Verify OTP

**Endpoint:** `POST /api/otp/verify`

**Request Body:**
```json
{
  "email": "candidate@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "verified": false,
  "message": "Invalid or expired OTP"
}
```

---

### 4. Submit Application

**Endpoint:** `POST /api/applications/submit`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
fullName: "John Doe"
email: "john@example.com"
phone: "9876543210"
city: "Mumbai"
state: "Maharashtra"
linkedin: "https://linkedin.com/in/johndoe" (optional)
collegeName: "IIT Bombay"
currentCompany: "TechCorp" (optional)
jobCategory: "Web Developers (Frontend / Backend / Full Stack)"
customJobRole: "DevOps Engineer" (if jobCategory = "Custom")
description: "Passionate developer..." (optional)
resume: [Binary file - PDF or DOCX]
```

**Response (Qualified):**
```json
{
  "success": true,
  "message": "Congratulations! Your profile meets our requirements.",
  "applicationId": "A1B2C3D4",
  "atsScore": 85,
  "atsStatus": "COMPLETED",
  "jobCategory": "Web Developers (Frontend / Backend / Full Stack)",
  "result": "QUALIFIED",
  "qualified": true
}
```

**Response (Not Qualified):**
```json
{
  "success": true,
  "message": "Unfortunately, your profile does not meet our current requirements.",
  "applicationId": "E5F6G7H8",
  "atsScore": 55,
  "atsStatus": "COMPLETED",
  "result": "REJECTED_BY_ATS",
  "qualified": false
}
```

**Response (Manual Review - Other/Custom Category):**
```json
{
  "success": true,
  "message": "Application received. Your profile will be reviewed manually.",
  "applicationId": "I9J0K1L2",
  "atsScore": null,
  "atsStatus": "SKIPPED",
  "result": "RECEIVED_MANUAL_REVIEW",
  "qualified": true
}
```

---

## 💾 Database Schema

### MongoDB Collections

#### 1. **candidates** Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,                    // Indexed
  phone: String,
  city: String,
  state: String,
  linkedin: String (optional),
  collegeName: String,
  currentCompany: String (optional),
  description: String (optional),
  jobCategory: String,
  customJobRole: String (if jobCategory = "Custom"),
  resumeFileId: ObjectId,           // Reference to GridFS file
  resumeFileName: String,
  parsedData: {
    email: String,
    phone: String,
    skills: Array<String>,
    experience: String,
    education: String
  },
  atsScore: Number (0-100) | null,
  atsStatus: "COMPLETED" | "SKIPPED",
  status: "qualified" | "pending",
  emailSentToHR: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **otps** Collection
```javascript
{
  _id: ObjectId,
  email: String,
  otpHash: String,                  // bcrypt hashed OTP
  expiresAt: Date,                  // TTL index (auto-delete)
  createdAt: Date
}
```

#### 3. **resumes.files** (GridFS Collection)
```javascript
{
  _id: ObjectId,
  filename: String,
  metadata: {
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: Date
  },
  length: Number,
  chunkSize: Number,
  uploadDate: Date
}
```

---

## 📧 Email Service

### Gmail SMTP Configuration

The system uses **Nodemailer** with Gmail SMTP to send transactional emails.

**Email Types:**

1. **OTP Email** (to candidate)
   - Sender: `AstroBharatAI Careers <EMAIL_USER>`
   - Subject: "Your AstroBharatAI Application OTP"
   - Content: HTML template with 6-digit OTP code
   - Styling: Gradient header, golden OTP box

2. **HR Notification** (to HR)
   - Sender: `AstroBharatAI Recruitment System <EMAIL_USER>`
   - Recipient: `HR_EMAIL`
   - Subject: "New Qualified Candidate - [Name] (ATS Score: X)"
   - Content: HTML table with candidate details + parsed resume data
   - Attachment: Original resume file (PDF/DOCX)

**Email Flow:**
```
OTP Request → Generate 6-digit OTP → Hash with bcrypt → Store in DB → Send email → Expires in 10 mins

Qualified Application → Parse resume → Calculate ATS score → If ≥ 70 → Fetch resume from GridFS → Send HR email with attachment
```

---

## 🔐 Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
HR_EMAIL=hr@company.com
FRONTEND_URL=https://astrobharat-jobs-portal.vercel.app
```



## ⚙️ Installation Guide

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password enabled

### 1. Clone Repository
```bash
git clone https://github.com/imusharrafhussain/parashari-jobs.git
cd parashari-jobs
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

**Backend:**
```bash
cd server
cp .env.example .env
# Edit .env with your actual credentials
```

### 5. Run Development Servers

**Terminal 1 (Backend):**
```bash
cd server
npm start
# → Backend running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
npm run dev
# → Frontend running on http://localhost:5173
```

### 6. Test Locally
- Open browser: `http://localhost:5173`
- Fill application form → Verify OTP → Upload resume → Check result

---



## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **OTP Hashing** | bcrypt with salt rounds = 10 |
| **OTP Expiry** | MongoDB TTL index (10 minutes) |
| **File Validation** | Multer filter (PDF/DOCX only, max 5MB) |
| **CORS Protection** | Whitelist specific origins (frontend URL) |
| **Submission Limit** | Max 3 applications per email |
| **Environment Secrets** | `.env` file excluded from Git via`.gitignore` |
| **Input Validation** | Required field checks on both client and server |
| **Error Handling** | Global Express error middleware |

---

## ⚠️ Known Issues



2. **Email Delivery**
   - Gmail may block emails if sent too frequently
   - Solution: Use professional SMTP (SendGrid, AWS SES)

3. **GridFS File Cleanup**
   - Orphaned files if application submission fails mid-process
   - Fixed: Added automatic cleanup in error handler

---

## 🔮 Future Improvements

- [ ] Add admin dashboard for viewing all applications
- [ ] Implement JWT authentication for protected routes
- [ ] Add rate limiting to prevent API abuse
- [ ] Integrate with LinkedIn API for profile auto-fill
- [ ] Add resume preview feature before submission
- [ ] Implement real-time application status tracking
- [ ] Add export functionality (CSV/Excel) for HR
- [ ] Integrate with ATS platforms (Lever, Greenhouse)
- [ ] Add multi-language support (i18n)
- [ ] Implement analytics dashboard (charts for ATS scores)

---

## 🤝 Contribution Guide

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

**Code Style:**
- Use ES6+ syntax
- Follow existing code formatting
- Add comments for complex logic
- Write descriptive commit messages

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 AstroBharatAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

For issues or questions:
- **Email**: mohitdhanuka01@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/imusharrafhussain/parashari-jobs/issues)

---

**Built with ❤️ by AstroBharatAI Team**
