# Session Quiz Flow

## Overview
Session quiz flow manages the live quiz gameplay where users answer questions in sequence with real-time feedback.

## Route Structure

### Quiz Preparation: `/session/quiz/[quiz_id]`
- **Purpose**: Pre-game staging area
- **Components**:
  - Quiz details display
  - Start button
- **Action**: Clicking "Start" navigates to `/session/[session_id]?quiz_id=<quiz_id>`

### Live Session: `/session/[session_id]?quiz_id=<quiz_id>`
- **Purpose**: Active gameplay interface
- **Question Display**:
  - Shows one question at a time
  - Displays all 4 options (A, B, C, D)
  - Sequential progression through questions

## Gameplay Mechanics

### Question Display Phase
1. Question text shown prominently
2. All 4 options displayed
3. Options are visible but not yet interactive/revealed

### Answer Reveal Phase
1. **Reveal Button**: User clicks to show correct answer
2. **Highlight Behavior**:
   - Correct answers highlighted (green)
   - Incorrect answer highlighted (red)
3. **Next Button**: Appears after reveal
   - Clicking advances to next question
   - Last question: redirects to results/end screen

## User Flow
```
Generate Questions → Confirm Quiz → Quiz Prep → Start Session → Question 1
→ Reveal → Next → Question 2 → Reveal → Next → ... → Question N → End
```

## Implementation Notes
- Session ID generated when user clicks "Start"
- Quiz ID passed as URL parameter to maintain quiz state
- Questions loaded sequentially (one at a time)
- Progress tracking needed for question sequence
- Final question shows different CTA (e.g., "Finish" instead of "Next")
