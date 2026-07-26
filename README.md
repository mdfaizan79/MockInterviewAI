# 🚀 MockAI - AI Powered Technical Mock Interview Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/Vite-Fast-purple?logo=vite" />
  <img src="https://img.shields.io/badge/Node.js-Backend-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-API-black?logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" />
  <img src="https://img.shields.io/badge/Google-Gemini-blue?logo=google" />
  <img src="https://img.shields.io/badge/TailwindCSS-Styling-38BDF8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/License-MIT-success" />
</p>

---

# 🤖 About MockAI

**MockAI** is an AI-powered technical mock interview platform that generates personalized interview questions from your resume.

Instead of answering generic interview questions, candidates receive questions based on:

- 📄 Resume
- 💻 Technical Skills
- 🎯 Experience Level
- 🏢 Previous Companies
- 📚 Projects
- 🛠 Selected Technologies

After the interview, MockAI evaluates the answers using **Google Gemini AI** and provides an intelligent performance report with personalized improvement suggestions.

---

# ✨ Features

## 📄 Resume Analysis

- Upload PDF Resume
- Upload DOCX Resume
- AI Resume Parsing
- Skills Extraction
- Experience Detection
- Education Detection
- Projects Detection
- Company Detection

---

## 🎯 Smart Interview Generator

Generate interviews based on

- Java
- Python
- JavaScript
- React
- Node.js
- Express
- MongoDB
- SQL
- HTML
- CSS
- Data Structures
- Algorithms
- Operating System
- DBMS
- System Design
- Any Custom Technology

---

## ⚙️ Interview Configuration

Candidates can customize

- 👨‍💻 Beginner
- 🚀 Intermediate
- 🔥 Advanced

Question Count

- 10 Questions
- 15 Questions
- 20 Questions

Question Types

- ✅ MCQ
- ✅ True / False
- ✅ Fill in the Blank
- ✅ Short Answer
- ✅ Code Output

Difficulty

- 🟢 Easy
- 🟡 Medium
- 🔴 Hard

Interview Style

- Standard
- Technical
- FAANG
- Practical

Timer

- ⏰ Timed Interview
- ♾ Untimed Interview

---

# 🧠 AI Powered Evaluation

MockAI automatically evaluates

✅ Objective Questions

AND

🤖 AI evaluates

- Short Answers
- Concept Understanding
- Explanation Quality
- Technical Accuracy

Finally it generates

- 📊 Score
- 📈 Technology-wise Analysis
- 📉 Weak Areas
- 🏆 Strengths
- 🎯 Personalized Learning Plan

---

# 📊 Result Dashboard

The report contains

- Overall Score
- Technology Score
- Difficulty Analysis
- Question Type Analysis
- Accuracy Percentage
- Time Taken
- AI Suggestions
- Improvement Roadmap
- Achievement Badges

---

# 🏗 Project Architecture

```
                Resume Upload
                       │
                       ▼
            Resume Parser (PDF/DOCX)
                       │
                       ▼
                Google Gemini AI
                       │
      Extract Skills + Experience
                       │
                       ▼
          Interview Question Generator
                       │
                       ▼
              MongoDB Database
                       │
                       ▼
              Candidate Takes Test
                       │
                       ▼
               AI Evaluation Engine
                       │
                       ▼
              Personalized Report
```

---

# 🛠 Tech Stack

## 🎨 Frontend

| Technology | Purpose |
|------------|----------|
| ⚛ React | UI Development |
| ⚡ Vite | Fast Build Tool |
| 🎨 Tailwind CSS | Styling |
| 🎬 Framer Motion | Animations |
| 📈 Recharts | Charts |
| 🌐 Axios | API Calls |

---

## ⚙ Backend

| Technology | Purpose |
|------------|----------|
| 🟢 Node.js | Runtime |
| 🚂 Express.js | REST API |
| 🍃 MongoDB | Database |
| 📦 Mongoose | ODM |
| 📤 Multer | File Upload |
| 📄 pdf-parse | PDF Parsing |
| 📃 Mammoth | DOCX Parsing |

---

## 🤖 AI

| Technology | Purpose |
|------------|----------|
| 🧠 Google Gemini AI | Resume Analysis |
| 🤖 Gemini API | Question Generation |
| 📝 Gemini | AI Evaluation |
| 🎯 Gemini | Improvement Suggestions |

---

# 📂 Project Structure

```
MockInterviewAI
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   ├── assets
│   │   └── App.jsx
│   │
│   └── vite.config.js
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── uploads
│   ├── services
│   ├── utils
│   └── server.js
│
├── README.md
└── LICENSE
```

---

# 🔄 Workflow

```
Resume Upload
      │
      ▼
Resume Parsing
      │
      ▼
Gemini Resume Analysis
      │
      ▼
Technology Selection
      │
      ▼
Interview Generation
      │
      ▼
Take Test
      │
      ▼
Submit Answers
      │
      ▼
AI Evaluation
      │
      ▼
Result Dashboard
```

---

# 🌐 REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Server Status |
| POST | `/api/resume/parse` | Parse Resume |
| POST | `/api/test/generate` | Generate Interview |
| GET | `/api/test/:id` | Fetch Questions |
| POST | `/api/test/:id/submit` | Submit Interview |
| GET | `/api/results/:id` | Get Result |

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/MockAI.git

cd MockAI
```

---

## Backend

```bash
cd server

npm install

npm run dev
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# 🔐 Environment Variables

Create

```
server/.env
```

```env
PORT=5001

MONGO_URI=your_mongodb_uri

GEMINI_API_KEY=your_gemini_key

GEMINI_MODEL=gemini-2.5-flash
```

---

# 📦 Dependencies

## Frontend

- React
- Vite
- TailwindCSS
- Framer Motion
- Recharts
- Axios

## Backend

- Express
- MongoDB
- Mongoose
- Multer
- pdf-parse
- Mammoth
- dotenv
- cors

---

# 🔒 Security

✔ API Keys stay on the server

✔ Temporary uploads deleted

✔ Correct answers hidden before submission

✔ MongoDB secured

✔ Environment variables protected

---

# 🚀 Future Enhancements

- 🔐 User Authentication
- 📧 Email Reports
- 🌍 Multi-language Support
- 🎙 Voice Interviews
- 💻 Live Coding Editor
- 🎥 Video Interviews
- 📱 Mobile App
- 🏢 Company-specific Interview Templates
- 📊 Admin Dashboard
- 🧠 AI Career Guidance

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

---

# 👨‍💻 Developed By

**Your Name**

Made with ❤️ using **React**, **Node.js**, **MongoDB**, and **Google Gemini AI**.

---

## 🎉 Happy Coding!
