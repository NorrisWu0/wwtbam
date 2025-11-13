# Question Generator

AI-powered trivia question generator using DeepSeek LLM with quiz management system.

## Architecture

```
User Input (count)
       ↓
  UI Component (/session)
       ↓
  POST /api/questions/generate
       ↓
  DeepSeek LLM (JSON mode)
       ↓
  Return Questions Array
       ↓
  UI displays w/ reroll option
       ↓
  User clicks "Confirm Quiz"
       ↓
  POST /api/quiz
       ↓
  Generate Quiz ID (6-char)
       ↓
  Store in Memory
       ↓
  Redirect to /session/quiz/[id]
       ↓
  GET /api/quiz/[id]
       ↓
  Display Quiz w/ shareable ID
```

## API Endpoints

### POST `/api/questions/generate`

Generate N trivia questions using DeepSeek AI.

**Request:**
```json
{
  "count": 6
}
```

**Response:**
```json
{
  "questions": [
    {
      "type": "architecture",
      "question": "What is not the top 3 tallest building in the world?",
      "options": [
        { "label": "Burj Khalifa", "value": "A" },
        { "label": "Shanghai Tower", "value": "B" },
        { "label": "Abraj Al-Bait Clock Tower", "value": "C" },
        { "label": "One World Trade Center", "value": "D" }
      ],
      "answer": "D"
    }
  ],
  "count": 6
}
```

**Validation:**
- `count` must be number between 1-20
- Returns 400 if invalid
- Returns 500 if API key missing or generation fails

### POST `/api/quiz`

Save generated questions as a quiz and get shareable ID.

**Request:**
```json
{
  "questions": [
    {
      "type": "geography",
      "question": "Which is NOT a capital city?",
      "options": [
        { "label": "Paris", "value": "A" },
        { "label": "London", "value": "B" },
        { "label": "New York", "value": "C" },
        { "label": "Berlin", "value": "D" }
      ],
      "answer": "C"
    }
  ]
}
```

**Response:**
```json
{
  "quizId": "A3B9K2",
  "message": "Quiz saved successfully"
}
```

**Validation:**
- `questions` must be non-empty array
- Returns 400 if invalid
- Returns 500 on save failure

### GET `/api/quiz/[id]`

Retrieve a saved quiz by ID.

**Response:**
```json
{
  "id": "A3B9K2",
  "questions": [...],
  "createdAt": "2025-01-14T12:34:56.789Z"
}
```

**Errors:**
- Returns 404 if quiz not found
- Returns 500 on fetch failure

### GET `/api/quiz/list`

Get list of all quizzes (summary only, not full questions).

**Response:**
```json
{
  "quizzes": [
    {
      "id": "A3B9K2",
      "questionCount": 6,
      "createdAt": "2025-01-14T12:34:56.789Z"
    }
  ],
  "total": 1
}
```

**Notes:**
- Returns quizzes sorted by creation date (newest first)
- Only includes summary data to optimize performance
- Returns 500 on fetch failure

## Question Schema

Each question:
- **4 options** labeled A, B, C, D
- **3 correct answers** + **1 incorrect answer**
- Question asks "which is NOT" / "which does NOT belong"
- Type field categorizes topic (geography, science, architecture, etc.)

## Environment Setup

1. Get DeepSeek API key from https://platform.deepseek.com/api_keys
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Add your API key to `.env.local`:
   ```
   DEEPSEEK_API_KEY=your_actual_key_here
   ```

## Usage

### Importing Component

```tsx
import QuestionGenerator from "@/app/components/QuestionGenerator";

export default function Page() {
  return <QuestionGenerator />;
}
```

### Features

1. **Generate Questions**
   - Input desired count (1-20)
   - Click "Generate" button
   - Loading states with progress messages:
     - "Connecting to AI..."
     - "AI is thinking..."
     - "Processing response..."
     - "Complete!"
   - Animated spinner during generation

2. **Reroll Individual Questions**
   - Each question has "Reroll" button
   - Calls API with count=1
   - Replaces question in-place in state
   - Shows "Rerolling..." state

3. **Confirm Quiz**
   - Big green "Confirm Quiz" button appears after generation
   - Saves quiz to in-memory store
   - Generates unique 6-character quiz ID (e.g., "A3B9K2")
   - Redirects to `/session/quiz/[id]`
   - Shows "Confirming..." state during save

4. **Error Handling**
   - API errors displayed in red alert box
   - User can retry manually
   - No automatic retry/fallback

## DeepSeek Integration

Uses DeepSeek LLM in JSON mode (not structured output due to TypeScript type complexity).

**Implementation:**
1. Calls ChatDeepSeek model with temperature 0.7
2. System prompt instructs JSON-only response
3. Regex extracts JSON from response
4. Zod validates against schema

**System Prompt:**
```
Generate a list of ${count} quiz questions that have 4 options
with 3 correct answers and 1 incorrect answer.

Topics: geography, science, history, architecture, pop culture, etc.

Format: 4 options (A-D), 3 correct + 1 incorrect
Question type: "which is NOT" or "which does NOT belong"

Return ONLY valid JSON (no markdown, no code blocks)
```

## Quiz Storage

**In-Memory Store** (`app/lib/quiz-store.ts`):
- Uses Map<string, Quiz> for storage
- Quiz IDs are 6 random alphanumeric characters
- Data persists only while server is running
- No database required for MVP

**Quiz Interface:**
```typescript
interface Quiz {
  id: string;
  questions: QuizQuestion[];
  createdAt: Date;
}
```

## Routes

- `/session` - Quiz list dashboard (shows all created quizzes)
- `/session/quiz` - Question generator UI
- `/session/quiz/[id]` - Quiz display page with shareable ID

### Route Flow

1. User visits `/session` → sees list of all quizzes
2. Click "Create New Quiz" → navigates to `/session/quiz`
3. Generate questions, reroll as needed
4. Click "Confirm Quiz" → redirects to `/session/quiz/[id]`
5. Can return to `/session` to see quiz in list
6. Click any quiz in list → navigates to `/session/quiz/[id]`

## Testing

### Test Question Generation API

```bash
curl -X POST http://localhost:3000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 3}'
```

### Test Quiz Save API

```bash
curl -X POST http://localhost:3000/api/quiz \
  -H "Content-Type: application/json" \
  -d '{"questions": [...]}'
```

### Test Quiz Retrieval API

```bash
curl http://localhost:3000/api/quiz/A3B9K2
```

### Test Quiz List API

```bash
curl http://localhost:3000/api/quiz/list
```

### Test Full User Flow

1. Start dev server: `pnpm dev`
2. Navigate to http://localhost:3000/session
3. Verify quiz list page shows (empty state or existing quizzes)
4. Click "Create New Quiz" button → navigates to `/session/quiz`
5. Enter question count (e.g., 6)
6. Click "Generate" button
7. Wait for AI to generate questions (see progress messages)
8. Verify questions display correctly
9. Click "Reroll" on any question to regenerate it
10. Click "Confirm Quiz" button
11. Verify redirect to `/session/quiz/[id]`
12. Verify quiz ID is displayed
13. Verify all questions show correctly
14. Navigate back to `/session`
15. Verify new quiz appears in list
16. Click quiz card → navigates to `/session/quiz/[id]`
17. Test direct access to quiz URL in new tab

## Dependencies

- `@langchain/deepseek@^1.0.0` - DeepSeek LLM integration
- `@langchain/core@^1.0.4` - LangChain core functionality
- `@langchain/langgraph@^1.0.2` - Graph-based workflows (installed but not used in current implementation)
- `zod@^3.24.1` - Schema validation

## Project Structure

```
app/
├── api/
│   ├── questions/
│   │   └── generate/
│   │       └── route.ts          # Question generation endpoint
│   └── quiz/
│       ├── route.ts               # Save quiz endpoint
│       ├── list/
│       │   └── route.ts           # List all quizzes endpoint
│       └── [id]/
│           └── route.ts           # Get quiz by ID endpoint
├── components/
│   └── QuestionGenerator.tsx     # Question generator component
├── lib/
│   └── quiz-store.ts             # In-memory quiz storage
└── session/
    ├── page.tsx                   # Quiz list dashboard
    ├── quiz/
    │   ├── page.tsx               # Question generator page
    │   └── [id]/
    │       └── page.tsx           # Quiz display page
```

## Future Considerations

- Database persistence (replace in-memory store)
- Topic/category input for targeted questions
- Question difficulty levels
- Question pool management
- Caching to reduce API calls
- Rate limiting
- Question validation/quality checks
- LangGraph workflow for multi-step validation
- Quiz expiration/cleanup
- Analytics on question generation
