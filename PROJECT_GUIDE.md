# MockAI Project Guide

## What this project is

MockAI is an AI-powered technical mock-interview website. A candidate uploads a resume, selects the technologies they want to be tested on, and receives a personalized interview test. After submitting the test, the app evaluates the answers and shows a detailed result report with improvement suggestions.

The project has two separate applications:

- **Client**: the website people see and use. It is built with React, Vite, Tailwind CSS, Framer Motion, and Recharts.
- **Server**: the API that accepts resumes, talks to Gemini AI, saves interview sessions, and calculates results. It is built with Node.js, Express, and MongoDB.

## Main features

- Upload a resume in PDF or DOCX format.
- Extract text and use AI to identify skills, experience, education, projects, and companies.
- Choose interview technologies, level, question count, question types, difficulty, timing, and interview style.
- Generate personalized technical questions with Gemini AI.
- Support MCQ, true/false, fill-in-the-blank, short-answer, and code-output questions.
- Show a timer, answer progress, question navigation, and flagged questions during the test.
- Evaluate objective answers automatically and short answers with AI.
- Show scores by technology, difficulty, and question type.
- Generate a personal improvement plan and achievement badges.

## Folder structure

```text
MockInterviewAI/
├── client/                         # React website
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Home page
│   │   │   ├── Upload.jsx          # Resume upload and test configuration
│   │   │   ├── Test.jsx            # Interview test screen
│   │   │   └── Results.jsx         # Score report and improvement plan
│   │   ├── services/api.js         # Browser API calls
│   │   ├── App.jsx                 # Website routes
│   │   └── index.css               # Global styles and effects
│   └── vite.config.js              # Vite development server and API proxy
│
├── server/                         # Node.js API
│   ├── controllers/
│   │   ├── resumeController.js     # Resume extraction and AI analysis
│   │   ├── testController.js       # Question generation and answer scoring
│   │   └── resultsController.js    # Result-report data
│   ├── routes/                     # API URL definitions
│   ├── models/TestSession.js       # MongoDB interview-session structure
│   ├── uploads/                    # Temporary uploaded files; not committed
│   ├── server.js                   # Express server startup file
│   └── .env.example                # Environment-variable template
│
└── PROJECT_GUIDE.md                # This guide
```

## Technology used

| Part | Technology | Why it is used |
| --- | --- | --- |
| Frontend | React | Builds the interactive website interface. |
| Frontend tooling | Vite | Runs the client quickly during development and creates a production build. |
| Styling | Tailwind CSS | Provides responsive styling, cards, buttons, gradients, and layout utilities. |
| Animation | Framer Motion | Adds page, card, and loading animations. |
| Charts | Recharts | Draws the score charts in the results page. |
| Backend | Node.js + Express | Provides the API used by the website. |
| Database | MongoDB + Mongoose | Stores generated tests, answers, scores, and feedback. |
| AI | Google Gemini | Reads resumes, generates questions, grades short answers, and creates improvement plans. |
| File handling | Multer, pdf-parse, Mammoth | Uploads files and extracts text from PDF and DOCX resumes. |

## Requirements before running

Install these first:

1. **Node.js** (recommended: current LTS version).
2. **MongoDB** running locally, or a free MongoDB Atlas database.
3. A **Google Gemini API key**.

The Gemini key is required because the project uses AI to analyze resumes and create interview content. MongoDB is required because interview sessions and results need to be saved between pages.

## First-time setup

### 1. Install dependencies

Open two terminal windows.

In the first terminal:

```bash
cd server
npm install
```

In the second terminal:

```bash
cd client
npm install
```

### 2. Create server environment settings

Inside the `server` folder, copy the template file:

```bash
cp .env.example .env
```

Open `server/.env` and add your real values:

```env
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
MONGO_URI=mongodb://127.0.0.1:27017/mock-interview
PORT=5001
```

Important:

- Never commit `.env` to GitHub because it contains a private API key.
- If you use MongoDB Atlas, replace `MONGO_URI` with the Atlas connection string.
- `PORT=5001` is used because port `5000` may already be occupied by another application on this computer.

### 3. Start MongoDB

If using local MongoDB, start its service before starting the server. If using MongoDB Atlas, make sure your internet connection and Atlas network access rules allow your IP address.

### 4. Start the backend

From the `server` folder:

```bash
npm run dev
```

Expected message:

```text
MongoDB connected
Server running on http://localhost:5001
```

### 5. Start the frontend

From the `client` folder:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

```text
http://localhost:5173
```

## How the application works

### Step 1: Resume upload

The user selects a **PDF** or **DOCX** file, up to 5 MB.

1. `Upload.jsx` sends the file to `POST /api/resume/parse`.
2. Multer temporarily saves the file in `server/uploads`.
3. `pdf-parse` reads text from PDFs. Mammoth reads text from DOCX files.
4. Gemini converts the resume text into useful structured data such as skills and experience.
5. The temporary file is deleted after processing.
6. The detected details appear in the browser and can be reviewed before test generation.

Legacy `.doc` files are intentionally not supported because they use an older binary format that the current text extractor cannot reliably process. Export them as `.docx` first.

### Step 2: Test configuration

The user can choose:

- Technologies to test.
- Experience level.
- Number of questions: 10, 15, or 20.
- Question types.
- Easy, medium, and hard question distribution.
- Timed or untimed test.
- Interview style, for example technical or FAANG style.

The selected settings and resume details are sent to `POST /api/test/generate`.

### Step 3: Question generation

The server asks Gemini to create questions based on the selected technologies and level. The full questions, answers, explanations, and learning resources are saved in MongoDB as a `TestSession`.

The client receives only the question text and options. Correct answers are intentionally not sent to the browser before submission.

### Step 4: Taking the test

`Test.jsx` displays one question at a time. The user can answer, move between questions, flag questions, and submit early. If timing is enabled, the test is submitted when time ends.

### Step 5: Evaluation and results

After submission:

1. Objective answers are checked directly against their correct answer.
2. Short answers are assessed by Gemini.
3. Scores are calculated by technology, difficulty, and question type.
4. Gemini generates a personalized improvement plan.
5. The result page polls the API until evaluation is complete, then displays the report.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Checks that the API server is alive. |
| `POST` | `/api/resume/parse` | Uploads and analyzes a PDF or DOCX resume. |
| `POST` | `/api/test/generate` | Generates an interview and creates a session. |
| `GET` | `/api/test/:sessionId` | Gets safe test data without correct answers. |
| `POST` | `/api/test/:sessionId/submit` | Saves answers and starts evaluation. |
| `GET` | `/api/test/:sessionId/status` | Checks whether evaluation has finished. |
| `GET` | `/api/results/:sessionId` | Returns the completed score report. |

## Important configuration detail: API proxy

The browser sends requests to `/api/...` on port `5173`. In development, Vite forwards those requests to the backend at port `5001`.

This is set in `client/vite.config.js`:

```js
proxy: {
  '/api': { target: 'http://localhost:5001', changeOrigin: true },
}
```

If you change `PORT` in `server/.env`, update this target to the same port and restart the client. If they do not match, uploads and other API requests will fail.

## Common problems and solutions

### `EADDRINUSE: address already in use :::5000`

Another program is using port `5000`. This project is configured to use port `5001`. Use `PORT=5001` in `server/.env`, and make sure `client/vite.config.js` also targets `http://localhost:5001`.

### Resume upload returns `403 Forbidden`

Usually the frontend proxy is targeting the wrong port. Check that both the server port and Vite proxy use `5001`, then restart both servers.

### Resume upload returns `500 Internal Server Error`

The website now reports a more specific message. Common causes are:

- `GEMINI_API_KEY` is missing, invalid, restricted, or has no remaining quota.
- `GEMINI_MODEL` is not available to the API key.
- The PDF is scanned, password-protected, or contains no selectable text.
- The uploaded document is an old `.doc` file instead of `.docx`.

Use a normal text-based PDF or DOCX, verify `server/.env`, and restart the server after changing environment values.

### `MongoDB connection failed`

Start MongoDB locally or correct `MONGO_URI` in `server/.env`. For MongoDB Atlas, verify the connection string, database user, password, and network access list.

### The frontend does not reflect a code change

Restart `npm run dev` in the `client` folder after changing `vite.config.js`. Vite does not reload configuration changes automatically.

### The test never finishes evaluating

Make sure the backend is running, the Gemini key is valid, and `/api/test/:sessionId/status` is reachable. The status route must be registered before the general `/api/test/:sessionId` route, which this project already does.

## Production build

To confirm that the frontend can be built for deployment:

```bash
cd client
npm run build
```

The production files are created in `client/dist`.

For a real deployment, use a hosted MongoDB database, place the Gemini key in the hosting provider's secret/environment settings, configure the backend URL for the deployed frontend, and use HTTPS.

## Security notes

- Keep `GEMINI_API_KEY` only on the server. Never place it in React code or `client/.env` exposed to the browser.
- Keep `server/.env` out of Git.
- Uploaded files are temporary and deleted after text extraction.
- Correct answers are not returned before the user submits the interview.
- For a public production app, add rate limiting, authentication if needed, file-content validation, and tighter CORS settings.

## Useful development commands

```bash
# Start backend with automatic restart
cd server && npm run dev

# Start frontend development server
cd client && npm run dev

# Create frontend production build
cd client && npm run build
```

## Simple project summary

MockAI takes a resume, understands the candidate's technical background using Gemini AI, creates a customized technical interview, checks the answers, and gives the candidate a clear learning plan. The React client handles the experience people see, while the Express server, Gemini API, and MongoDB handle the work behind the scenes.
