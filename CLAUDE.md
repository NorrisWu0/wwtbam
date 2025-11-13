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

## Implementation Considerations

- Real-time multiplayer requires WebSocket/real-time communication layer (not yet implemented)
- Session state management for host and players
- Question pool management and randomization
- Player capacity calculations for answer slots
- Animation timing coordination across clients
- Vercel deployment configuration required
