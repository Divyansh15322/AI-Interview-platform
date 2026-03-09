# 🤖 InterviewAI — AI-Powered Interview Platform

A production-ready, full-stack AI interview simulation platform that generates role-specific questions, evaluates answers in real-time, and generates comprehensive performance reports.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat&logo=openai)

---

## 🚀 Features

### Core Features
- **🔐 JWT Authentication** — Secure signup/login with bcrypt password hashing
- **🤖 AI Question Generation** — GPT-4o-mini generates role/difficulty-specific questions
- **💬 Chat-Style Interview** — Real-time conversational interview experience
- **⏱️ Question Timer** — 2-minute countdown per question with auto-submit
- **📊 AI Evaluation** — Scores on technical accuracy, communication, problem-solving
- **📋 Performance Reports** — Detailed reports with strengths, weaknesses, recommendations
- **📄 Resume Analyzer** — Upload PDF resume for AI-powered skill analysis
- **🎤 Voice Input** — Web Speech API for microphone-based answers
- **📥 PDF Export** — Download interview reports as PDF
- **🛡️ Admin Dashboard** — User management, analytics, platform stats
- **📈 Interview History** — Full history with filtering and pagination

### Job Roles Supported
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Data Scientist
- AI Engineer
- DevOps Engineer
- Mobile Developer

### Interview Types
- Technical (Coding, algorithms)
- HR (Behavioral, culture fit)
- System Design (Architecture, scalability)
- Behavioral (STAR method)

### Difficulty Levels
- Easy (Junior)
- Medium (Mid-level)
- Hard (Senior)

---

## 📁 Folder Structure

```
ai-interview-platform/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StartInterviewPage.jsx
│   │   │   ├── InterviewChatPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   ├── ResumeAnalyzerPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── interviewController.js
│   │   ├── reportController.js
│   │   ├── resumeController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Interview.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── interview.js
│   │   ├── report.js
│   │   ├── resume.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── openai.js
│   ├── index.js
│   └── package.json
│
└── package.json                # Root with concurrently
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-interview-platform.git
cd ai-interview-platform
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Environment Variables

**Server** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-interview-platform
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your-openai-api-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Create Admin User
After starting the server, create an admin via MongoDB or temporarily add this to `server/index.js`:
```javascript
// Run once, then remove
const User = require('./models/User');
User.create({ name: 'Admin', email: 'admin@interviewai.com', password: 'admin123', role: 'admin' });
```

### 5. Run Development Server
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### Interviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/interviews` | Create interview | ✅ |
| GET | `/api/interviews` | Get user interviews | ✅ |
| GET | `/api/interviews/:id` | Get interview | ✅ |
| POST | `/api/interviews/:id/answer` | Submit answer | ✅ |
| POST | `/api/interviews/:id/complete` | Complete interview | ✅ |
| POST | `/api/interviews/:id/abandon` | Abandon interview | ✅ |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports` | Get all user reports | ✅ |
| GET | `/api/reports/:interviewId` | Get specific report | ✅ |

### Resume
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/resume/analyze` | Analyze PDF resume | ✅ |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Platform stats | 👑 Admin |
| GET | `/api/admin/users` | All users | 👑 Admin |
| DELETE | `/api/admin/users/:id` | Delete user | 👑 Admin |
| GET | `/api/admin/interviews` | All interviews | 👑 Admin |

---

## 🚀 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import project at vercel.com
3. Set Root Directory: `client`
4. Add env var: `VITE_API_URL=https://your-backend.railway.app/api`
5. Deploy

### Backend → Railway
1. Connect GitHub repo at railway.app
2. Set Root Directory: `server`
3. Add all environment variables from `server/.env`
4. Set Start Command: `npm start`
5. Deploy

### Backend → Render
1. New Web Service at render.com
2. Connect GitHub, set Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables
6. Deploy

---

## 🗄️ Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  interviews: [ObjectId],
  totalInterviews: Number,
  averageScore: Number
}
```

### Interview
```javascript
{
  userId: ObjectId,
  role: String,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  type: 'Technical' | 'HR' | 'System Design' | 'Behavioral',
  status: 'in-progress' | 'completed' | 'abandoned',
  questions: [{ question, answer, timeTaken, evaluation }],
  score: { technicalScore, communicationScore, problemSolvingScore, overallScore },
  feedback: { strengths, weaknesses, recommendations, summary }
}
```

### Report
```javascript
{
  interviewId: ObjectId,
  userId: ObjectId,
  scores: { technicalScore, communicationScore, problemSolvingScore, overallScore },
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  aiFeedback: String,
  questionBreakdown: [{ question, answer, score, feedback }]
}
```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | JWT signing secret (32+ chars) | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `PORT` | Server port (default 5000) | ❌ |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |
| `JWT_EXPIRE` | Token expiry (default 7d) | ❌ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ using React, Node.js, MongoDB, and OpenAI GPT-4o-mini
