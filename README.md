# Spookly — AI-Powered Daily English Speaking Practice

Spookly is a minimal, focused English speaking practice platform. It helps learners build confidence, speaking fluency, grammar, vocabulary, sentence structure, and answer relevance through structured 10-question daily conversations with an AI tutor powered by Google Gemini.

---

## Features

- **Minimal, Focused Learning Interface**: Clean, warm off-white background (`#fbf9f5`), charcoal typography, subtle amber accents, small rounded corners, zero dashboard clutter.
- **Device Permission Gate**: Smooth camera and microphone access verification with clear troubleshooting guidance.
- **3 Speaking Categories**:
  - **Professional**: Workplace communication, interview scenarios, team problem solving, and project updates.
  - **Random Conversation**: Engaging hypothetical prompts, life memories, opinions, and personal stories.
  - **Real Life**: Everyday situations like ordering food, asking for directions, transit delays, and customer service.
- **Difficulty Selection**: Beginner, Intermediate, and Advanced tiers.
- **Two-Column Desktop Practice Interface**:
  - **Left Section**: Live camera preview, camera on/off toggle, microphone mute/unmute control, clear recording status badge, and permission error fallbacks.
  - **Right Section**: Segmented progress indicator (1 of 10), current AI prompt with conversational hint, browser speech recognition with real-time transcript, manual edit fallback, retry answer, and submit action.
- **Comprehensive AI Answer Evaluation**:
  - Scores 5 core areas out of 10: Grammar, Vocabulary, Fluency (transcript-based), Sentence Structure, Relevance.
  - Overall speaking score out of 10.
  - Identified grammar mistakes with corrections and clear explanations.
  - Corrected version preserving user intent.
  - Elevated vocabulary alternatives with usage context.
  - Natural native speaker phrasing.
  - Actionable daily speaking tip and encouraging note.
- **Daily 10-Question Limit & Session Persistence**:
  - 10 questions per local calendar day saved in `localStorage`.
  - Resilient to page refreshes — automatically resumes unfinished sessions.
  - Displays local date when the next daily practice session unlocks.
- **Final Results Page**:
  - Overall average score out of 10 across all 10 responses.
  - Average scores for Grammar, Vocabulary, Fluency, Sentence Structure, and Relevance.
  - Strongest area and area to improve.
  - Expandable detailed review for each of the 10 completed answers.
  - "Practice Again Tomorrow" notice.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend / API**: Express, Node.js, `@google/genai` (Official Google Gen AI SDK), `tsx`
- **APIs**: Browser MediaDevices API, Browser Web Speech Recognition API (`SpeechRecognition` / `webkitSpeechRecognition`), `localStorage`

---

## Getting Started

### 1. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your Google Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3001
```

> **Security Note**: `GEMINI_API_KEY` is loaded only on the server side (`server/gemini.ts`) and is never sent or exposed to client-side browser JavaScript.

### 2. Run in Development Mode

Run both the Express backend API and Vite client concurrently:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- Backend API: `http://localhost:3001` (Vite dev server proxies `/api` requests to port 3001)

### 3. Build & Run for Production

```bash
npm run build
npm start
```

Open `http://localhost:3001`. The backend serves both the API endpoints and the compiled React static assets.

---

## Project Structure

```
spookly/
├── server/
│   ├── index.ts              # Express API server (endpoints: /api/generate-questions, /api/evaluate-answer, /api/health)
│   └── gemini.ts             # Google Gemini SDK integration, structured schemas, model fallback
├── src/
│   ├── components/
│   │   ├── LandingPage/      # Initial landing page without header/footer
│   │   ├── CategorySelector/ # Category (Professional, Random, Real Life) and Difficulty picker
│   │   ├── CameraPreview/    # Live camera video, camera toggle, mic mute, recording status
│   │   ├── QuestionCard/     # Current prompt with conversational hints
│   │   ├── ProgressIndicator/# Segmented 10-step progress indicator
│   │   ├── SpeakingControls/ # Speech recognition trigger, live transcript, retry & submit
│   │   ├── AnswerFeedback/   # Detailed evaluation cards with grammar, natural phrasing, and tips
│   │   └── ResultsPage/      # Final 10-question evaluation report with detailed answer breakdown
│   ├── hooks/
│   │   ├── useCamera.ts            # MediaDevices API camera/mic stream management
│   │   ├── useSpeechRecognition.ts # Web Speech API continuous recognition and transcript capture
│   │   └── useDailyProgress.ts     # 10-question daily session state & localStorage persistence
│   ├── services/
│   │   ├── api.ts            # Frontend HTTP client for Spookly backend endpoints
│   │   └── storage.ts        # LocalStorage persistence, daily limit calculation, summary metrics
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces and domain models
│   ├── App.tsx               # Main application controller and responsive layout
│   ├── main.tsx              # React DOM entry point
│   └── index.css             # Tailwind CSS v4 styles & typography
├── .env.example              # Environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Daily Practice Limit & Storage Note

The daily limit tracks 10 questions per local calendar day (`YYYY-MM-DD`) in browser `localStorage`. 

*Note: As this application operates without user accounts or a centralized database, client-side daily limits can be reset by clearing browser storage or opening an incognito session. A dedicated "Reset Today's Session" option is also provided for development and testing convenience.*
# spookly
