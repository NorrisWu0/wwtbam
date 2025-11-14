"use client";

import type { Participant } from "@/app/lib/session-store";

interface ScoreboardProps {
  participants: Participant[];
}

export default function Scoreboard({ participants }: ScoreboardProps) {
  // Sort participants by score (descending)
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Scoreboard</h2>

      {sortedParticipants.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No participants yet</p>
      ) : (
        <div className="space-y-3">
          {sortedParticipants.map((participant, index) => {
            const isTop3 = index < 3;
            const medals = ["🥇", "🥈", "🥉"];

            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  isTop3
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{participant.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      {isTop3 && (
                        <span className="text-xl">{medals[index]}</span>
                      )}
                      <span className="font-semibold text-gray-900">
                        {participant.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {participant.score}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
