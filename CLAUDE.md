# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WWTBAM (Who Wants To Be A Millionaire) - Online multiplayer trivia game where players join live sessions to answer quiz questions. Players accumulate scores based on correct answers, with top 3 winners announced at the end. Built with Next.js 16 and deployed on Vercel.

## Common Commands

```bash
# Development
pnpm dev              # Start dev server at http://localhost:3000

# Build & Production
pnpm build            # Build production bundle
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript (strict mode)
- **Package Manager**: pnpm
- **Deployment**: Vercel
- **AI Integration**: @langchain/deepseek for question generation

### Application Structure
- Uses Next.js App Router (`app/` directory)
- Path alias `@/*` maps to root directory
- Geist font family (Sans & Mono) loaded via next/font

## Game Flow

### 1. Session Creation/Joining
- **Host**: User who starts session after answering verification question
  - Question: "Looking at the team page, how many people leave moustache in the office?"
  - Answer: "5"
- **Players**: Join via session code shared by host
- Host receives shareable session code

### 2. Question Preparation
- Host reviews/modifies pre-generated questions before starting
- Questions generated via @langchain/deepseek API with structured output
- Question format: 4 options (A-D), 3 correct + 1 incorrect answer
- Host can generate random questions on demand

### 3. Gameplay
- Player avatars shown as floating bubbles
- Host reads question, starts 5-second countdown
- Each answer slot limited to `playerCount * 0.6` players
- Player names appear next to selected answers
- Correct answers: confetti animation
- Wrong answers: banana animation
- Host controls progression to next question

### 4. End Game
- "Finish" button plays scoring progress bar chart animation
- Top 3 players announced with confetti celebration

## Question Generation Schema

```json
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
```

System prompt: "Generate a list of 6 quiz questions that has 3 correct answer and 1 incorrect answer. Provide the response in the following format"

## Current Implementation Status

### Completed Features
- ✅ Landing page with game entry point (`/`)
- ✅ Question generator with AI integration (`/session/quiz`)
  - Configurable question count (1-20)
  - Custom requirements via text input
  - Individual question reroll functionality
  - DeepSeek AI integration for generation
- ✅ Quiz preparation page (`/session/quiz/[id]`)
  - Question preview
  - Start button to create session
- ✅ Live session gameplay (`/session/[session_id]?quiz_id=xxx`)
  - Sequential question display
  - Reveal answer functionality
  - Correct/incorrect answer highlighting
  - Next question progression
  - Progress bar indicator
- ✅ In-memory stores (quiz & session management)
- ✅ API routes for quiz and session operations

### Not Yet Implemented
- ⏳ Real-time multiplayer WebSocket layer
- ⏳ Player joining/avatar management
- ⏳ Countdown timer (5-second)
- ⏳ Answer slot limiting (playerCount * 0.6)
- ⏳ Animations (confetti/banana)
- ⏳ Results/scoring page
- ⏳ Top 3 winner announcement
- ⏳ Host verification question

## File Structure

```
app/
├── page.tsx                           # Landing page
├── session/
│   ├── page.tsx                       # Question generator page
│   ├── quiz/[id]/page.tsx            # Quiz prep (start button)
│   └── [session_id]/page.tsx         # Live gameplay
├── components/
│   └── QuestionGenerator.tsx         # Question generation UI
├── api/
│   ├── questions/generate/route.ts   # AI question generation
│   ├── quiz/
│   │   ├── route.ts                  # Create quiz
│   │   ├── [id]/route.ts            # Get quiz by ID
│   │   └── list/route.ts            # List all quizzes
│   └── session/route.ts              # Create session
└── lib/
    ├── quiz-store.ts                 # In-memory quiz storage
    └── session-store.ts              # In-memory session storage
docs/
├── session.md                         # Session flow documentation
└── question-generator.md             # Question generation docs
```
