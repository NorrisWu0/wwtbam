import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/app/lib/session-store";
import { quizExists } from "@/app/lib/quiz-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizId } = body;

    if (!quizId || typeof quizId !== "string") {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // Verify quiz exists
    if (!quizExists(quizId)) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Create session
    const sessionId = createSession(quizId);

    return NextResponse.json({
      sessionId,
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
