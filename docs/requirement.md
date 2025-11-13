# WWTBAM

Online trivia game where people can join a live session to answer a series of quizze. score will be accumulated if they pick the wrong answer of the question. at the end the top 3 player will be announced and then show a scoreboard of everyone who joined the game

## How to play the game?

### Step 1 - starting/joining a session

Any user can start the session after fulfilling the following condition

- Question "Looking at the team page, how many people leave moustache in the office? " Answer "5"

Once a session started, the user (becomes host) will be given a session code where they can share with people.

Any user can join an existing session via entering the session code as a player

Host: user who started the session
Player: user who join the session via session code

### Step 2 - preparing a session

The host can review or modify a pregenerated list of question before starting a session.

Format of the question looks like

Question: What is not the top 3 tallest building in the world?
Options: A. Merdeka 118; B. Burj Khalifa; C. Shanghai Tower; D. The Clock Towers
Answer: D. The Clock Towers

The host can click a button to generate a random question.


## How questions are generated?

Questions will be generated via an API call using @langchain/deepseek with system prompt
"Generate a list of 6 quiz questions that has 3 correct answer and 1 incorrect answer. Provide the response in the following format"

the structure output should match
```json
{
  "type": "architecture",
  "question": "What is not the top 3 tallest building in the world?",
  "options": [
    {
      "label": "Burj Khalifa",
      "value": "A"
    },
    {
      "label": "Shanghai Tower",
      "value": "B"
    },
    {
      "label": "Abraj Al-Bait Clock Tower",
      "value": "C"
    },
    {
      "label": "One World Trade Center",
      "value": "D"
    }
  ],
  "answer": "D"
}
```

### step 3 - playing the game.

The session window will have all the player joined listed in as a floating bubble.

once all player joined the game, the host can start the session.

Once host hit the start button. a question from the pool will shows up, the host will read the question to the players.
Once the host is ready, the host will start a 5 seconds count down where player can select answer to pick from.

once player selects a question, they first name will be added next to the selected slot.
each question can only be selected by maximum `playerCount*0.6` of player.

after 5 seconds ends, the answer will be announced and confetti will show up on the screen of the player who pick the correct answer. the other player will have bananas fly out from their screen.

the host hits continue button to show the next question.

this iterates until all the questions for this session is exhausted.

### end of the game

once all questions has been exhausted, the host will hit a "Finish" button, which plays back the progress of scoring during the session in a bar chart format. 
when the animation ends, the top 3 player will be announced, and huge confetti pops up on everyone's screen.

###

IMPORTANT this server deploy on vercel