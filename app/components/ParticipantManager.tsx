"use client";

import { useState } from "react";
import type { Participant } from "@/app/lib/session-store";

interface ParticipantManagerProps {
  sessionId: string;
  onQuizStart: () => void;
}

export default function ParticipantManager({
  sessionId,
  onQuizStart,
}: ParticipantManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddParticipant = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/session/${sessionId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to add participant");
      }

      const participant: Participant = await response.json();
      setParticipants([...participants, participant]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add participant");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/session/${sessionId}/participants/${participantId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to remove participant");
      }

      setParticipants(participants.filter((p) => p.id !== participantId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove participant"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (participants.length === 0) {
      setError("Please add at least one participant");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/session/${sessionId}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start quiz");
      }

      onQuizStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start quiz");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleAddParticipant();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Participants
          </h1>
          <p className="text-gray-600 mb-6">Session ID: {sessionId}</p>

          {/* Add Participant Input */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter participant name"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={handleAddParticipant}
                disabled={isLoading || !name.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Participants List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Participants ({participants.length})
            </h2>
            {participants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No participants yet. Add someone to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{participant.avatar}</span>
                      <span className="font-medium text-gray-900">
                        {participant.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveParticipant(participant.id)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Quiz Button */}
          <button
            onClick={handleStartQuiz}
            disabled={isLoading || participants.length === 0}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? "Starting..." : "Done & Start Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
