import { NextResponse } from "next/server";
import { getAllQuizzes } from "@/app/lib/quiz-store";

export async function GET() {
  try {
    const quizzes = getAllQuizzes();

    // Return summary of quizzes (not full questions)
    const quizSummaries = quizzes.map((quiz) => ({
      id: quiz.id,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt,
    }));

    return NextResponse.json({
      quizzes: quizSummaries,
      total: quizSummaries.length,
    });
  } catch (error) {
    console.error("Error listing quizzes:", error);
    return NextResponse.json(
      { error: "Failed to list quizzes" },
      { status: 500 }
    );
  }
}
