import { NextRequest, NextResponse } from "next/server";
import { saveQuiz } from "@/app/lib/quiz-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Questions array is required" },
        { status: 400 }
      );
    }

    // Save quiz and get generated ID
    const quizId = saveQuiz(questions);

    return NextResponse.json({
      quizId,
      message: "Quiz saved successfully",
    });
  } catch (error) {
    console.error("Error saving quiz:", error);
    return NextResponse.json(
      { error: "Failed to save quiz" },
      { status: 500 }
    );
  }
}
