import { NextRequest, NextResponse } from "next/server";
import { ChatDeepSeek } from "@langchain/deepseek";
import { z } from "zod";

// Question schema matching requirements
const QuestionSchema = z.object({
  type: z.string(),
  question: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  answer: z.string(),
});

const QuestionsArraySchema = z.object({
  questions: z.array(QuestionSchema),
});

type QuestionsArray = z.infer<typeof QuestionsArraySchema>;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { count, userMessage } = body;

    if (!count || typeof count !== "number" || count < 1 || count > 20) {
      return NextResponse.json(
        { error: "Count must be a number between 1 and 20" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY not configured" },
        { status: 500 }
      );
    }

    console.log(`Generating ${count} questions...`);

    // Initialize DeepSeek model
    const model = new ChatDeepSeek({
      apiKey,
      model: "deepseek-chat",
      temperature: 0.7,
    });

    const systemPrompt = `Generate a list of ${count} quiz questions that have 4 options with 3 correct answers and 1 incorrect answer.

The questions should be general knowledge trivia questions covering various topics like geography, science, history, architecture, pop culture, etc.

For each question:
- Provide exactly 4 options labeled A, B, C, D
- 3 options should be correct answers
- 1 option should be the incorrect answer
- The question should ask which one is NOT true or which one does NOT belong
- Assign a topic type to categorize the question

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "questions": [
    {
      "type": "category name",
      "question": "question text",
      "options": [
        {"label": "option text", "value": "A"},
        {"label": "option text", "value": "B"},
        {"label": "option text", "value": "C"},
        {"label": "option text", "value": "D"}
      ],
      "answer": "D"
    }
  ]
}`;

    const userPrompt = userMessage
      ? `Generate ${count} questions with the following requirements: ${userMessage}`
      : `Generate ${count} questions`;

    const result = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Extract JSON from response
    const content = result.content.toString();
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    const validated = QuestionsArraySchema.parse(parsedData);

    console.log(`Successfully generated ${validated.questions.length} questions`);

    return NextResponse.json({
      questions: validated.questions,
      count: validated.questions.length,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
