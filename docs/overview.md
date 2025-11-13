# WWTBAM Project Overview

## Project Summary
Who Wants To Be A Millionaire (WWTBAM) - An online trivia quiz application built with Next.js 16, featuring AI-powered question generation and interactive gameplay.

## Technology Stack
- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **AI**: @langchain/deepseek for question generation
- **Package Manager**: pnpm
- **Deployment**: Vercel-ready

## Features Implemented

### 1. Landing Page (`/`)
- Clean, centered layout
- Heading: "Who wants to be a m______?"
- "Start Game" button navigating to `/session`
- Dark mode support
- **File**: `app/page.tsx`

### 2. Question Generator (`/session/quiz`)
- **AI-Powered Generation**:
  - Configurable question count (1-20)
  - Custom requirements via textarea input
  - DeepSeek AI integration with structured output
  - Questions have 4 options: 3 correct, 1 incorrect

- **Question Management**:
  - Preview all generated questions
  - Individual question reroll functionality
  - Question type categorization
  - Answer highlighting (incorrect answers in red)

- **UI Features**:
  - Loading states with progress messages
  - Error handling
  - "Confirm Quiz" button to save and proceed

- **Files**:
  - `app/session/quiz/page.tsx` (wrapper)
  - `app/components/QuestionGenerator.tsx` (main component)
  - `app/api/questions/generate/route.ts` (AI endpoint)

### 3. Quiz Preparation (`/session/quiz/[id]`)
- Display quiz ID and question count
- Preview all questions before starting
- **"Start Quiz" button**:
  - Creates new session via API
  - Navigates to live session page
  - Passes quiz_id as URL parameter

- **Files**:
  - `app/session/quiz/[id]/page.tsx`

### 4. Live Session Gameplay (`/session/[session_id]?quiz_id=xxx`)
- **Question Display**:
  - One question at a time (sequential)
  - Shows question text and type
  - Displays all 4 options (A, B, C, D)

- **Interactive Controls**:
  - **Reveal Button**: Shows correct/incorrect answers
    - Correct answers: green highlight + ✓ CORRECT
    - Incorrect answer: red highlight + ✗ INCORRECT
  - **Next Button**: Advances to next question (appears after reveal)
  - Last question shows "Finish Quiz" button

- **Visual Features**:
  - Progress bar showing completion percentage
  - Session ID display
  - Question counter (X of Y)
  - Purple/pink gradient theme
  - Card-based layout with shadows

- **Files**:
  - `app/session/[session_id]/page.tsx`

### 5. Data Management

#### Quiz Store (`app/lib/quiz-store.ts`)
- In-memory storage using global singleton pattern
- Persists across hot reloads in development
- Functions:
  - `generateQuizId()`: 6-character alphanumeric ID
  - `saveQuiz()`: Store questions and return ID
  - `getQuiz()`: Retrieve quiz by ID
  - `quizExists()`: Check if quiz exists
  - `getAllQuizzes()`: List all quizzes

#### Session Store (`app/lib/session-store.ts`)
- In-memory session management
- Tracks session-to-quiz relationship
- Functions:
  - `generateSessionId()`: 8-character alphanumeric ID
  - `createSession()`: Create session for quiz
  - `getSession()`: Retrieve session by ID
  - `updateSessionQuestion()`: Track current question
  - `sessionExists()`: Check if session exists

### 6. API Routes

#### Question Generation (`/api/questions/generate`)
- **Method**: POST
- **Parameters**:
  - `count`: Number of questions (1-20)
  - `userMessage`: Optional custom requirements
- **Response**: Array of generated questions
- **Features**:
  - DeepSeek AI integration
  - Temperature: 0.7 for creative responses
  - JSON schema validation with Zod
  - Error handling with detailed messages

#### Quiz Management
- **Create Quiz** (`/api/quiz`):
  - POST: Save questions, return quiz ID

- **Get Quiz** (`/api/quiz/[id]`):
  - GET: Retrieve quiz by ID

- **List Quizzes** (`/api/quiz/list`):
  - GET: Get all quizzes sorted by creation date

#### Session Management (`/api/session`)
- **Method**: POST
- **Parameters**: `quizId`
- **Response**: `sessionId`
- **Validation**: Checks if quiz exists before creating session

## User Flow

```
1. Landing Page (/)
   ↓ Click "Start Game"

2. Question Generator (/session/quiz)
   ↓ Enter count + optional custom requirements
   ↓ Click "Generate Questions"
   ↓ [Optional] Reroll individual questions
   ↓ Click "Confirm Quiz"

3. Quiz Preparation (/session/quiz/[id])
   ↓ Review questions
   ↓ Click "Start Quiz"

4. Live Session (/session/[session_id]?quiz_id=xxx)
   ↓ Read question
   ↓ Click "Reveal Answer"
   ↓ See correct/incorrect highlights
   ↓ Click "Next Question"
   ↓ Repeat for all questions
   ↓ Last question: "Finish Quiz"

5. Results Page (not yet implemented)
```

## Question Format

Each question follows this schema:
```typescript
{
  type: string;        // Category (e.g., "architecture", "geography")
  question: string;    // Question text (usually "What is NOT...")
  options: [
    { label: string, value: "A" },
    { label: string, value: "B" },
    { label: string, value: "C" },
    { label: string, value: "D" }
  ];
  answer: string;      // The INCORRECT option (e.g., "D")
}
```

**Important**: The `answer` field contains the INCORRECT option, while the other 3 are correct.

## Design Patterns

### Color Schemes by Section
- **Landing**: Zinc/neutral tones
- **Generator**: Blue gradient (blue-50 to indigo-100)
- **Live Session**: Purple gradient (purple-50 to pink-100)

### State Management
- React hooks (`useState`, `useEffect`)
- No external state management library
- In-memory stores for data persistence

### Routing
- Next.js App Router with dynamic routes
- URL parameters for data passing
- Client-side navigation with `useRouter`

## Environment Variables Required

```env
DEEPSEEK_API_KEY=your_api_key_here
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Future Enhancements (Not Yet Implemented)

### Multiplayer Features
- Real-time WebSocket layer
- Player joining with session code
- Player avatar management (floating bubbles)
- Player name display next to answers
- Answer slot limiting (60% of player count)

### Gameplay Enhancements
- 5-second countdown timer
- Animations:
  - Confetti for correct answers
  - Banana animation for wrong answers
- Host controls for question progression

### Scoring & Results
- Results page (`/session/results/[session_id]`)
- Score calculation and tracking
- Progress bar chart animation
- Top 3 winner announcement
- Confetti celebration for winners

### Security & Verification
- Host verification question
- Session authentication
- Player capacity limits

## Documentation Files
- `CLAUDE.md`: Project guidance for AI assistance
- `docs/overview.md`: This file
- `docs/session.md`: Session flow details
- `docs/question-generator.md`: Question generation details
- `docs/requirement.md`: Original requirements

## Notes
- In-memory stores will reset on server restart (production will need database)
- No authentication/authorization implemented yet
- Single-player mode currently functional
- Multiplayer requires WebSocket implementation
