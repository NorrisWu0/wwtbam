import { NextRequest, NextResponse } from "next/server";
import { removeParticipant } from "@/app/lib/session-store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id, participantId } = await params;

    const removed = removeParticipant(id, participantId);

    if (!removed) {
      return NextResponse.json(
        { error: "Session or participant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}
