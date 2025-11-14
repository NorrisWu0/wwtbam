"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ParticipantManager from "@/app/components/ParticipantManager";
import Scoreboard from "@/app/components/Scoreboard";
import type { Participant } from "@/app/lib/session-store";

interface QuestionOption {
  label: string;
  value: string;
}

interface Question {
  type: string;
  question: string;
  options: QuestionOption[];
  answer: string;
}

interface Quiz {
  id: string;
  questions: Question[];
  createdAt: string;
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.session_id as string;
  const quizId = searchParams.get("quiz_id");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) {
        setError("Quiz ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/quiz/${quizId}`);

        if (!response.ok) {
          throw new Error("Quiz not found");
        }

        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  // Fetch session participants when quiz starts
  useEffect(() => {
    if (!quizStarted) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (response.ok) {
          const session = await response.json();
          setParticipants(session.participants || []);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    };

    fetchSession();
  }, [quizStarted, sessionId]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleNext = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setRevealed(false);
    } else {
      // Last question - redirect to results/end screen
      router.push(`/session/results/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
            <span className="text-xl font-medium">Loading session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || "Failed to load session"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show participant manager before quiz starts
  if (!quizStarted) {
    return (
      <ParticipantManager
        sessionId={sessionId}
        onQuizStart={() => setQuizStarted(true)}
      />
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Question */}
          <div className="lg:col-span-2">
            {/* Session Header */}
            <div className="mb-8 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Session: <span className="font-mono font-bold">{sessionId}</span>
              </p>
              <p className="text-lg font-semibold text-purple-700">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>

            {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          {/* Question Type */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full uppercase">
              {currentQuestion.type}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option) => {
              const isCorrect = option.value !== currentQuestion.answer;
              const isIncorrect = option.value === currentQuestion.answer;

              let optionClass = "p-5 rounded-xl border-2 transition-all";

              if (!revealed) {
                optionClass += " bg-gray-50 border-gray-300 hover:border-purple-400 hover:bg-purple-50";
              } else {
                if (isCorrect) {
                  optionClass += " bg-green-100 border-green-500 shadow-lg";
                } else if (isIncorrect) {
                  optionClass += " bg-red-100 border-red-500 shadow-lg";
                }
              }

              return (
                <div key={option.value} className={optionClass}>
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white border-2 border-gray-300 font-bold text-lg">
                      {option.value}
                    </span>
                    <span className="text-lg font-medium flex-1">{option.label}</span>
                    {revealed && isCorrect && (
                      <span className="flex-shrink-0 text-green-700 font-bold text-sm">
                        ✓ CORRECT
                      </span>
                    )}
                    {revealed && isIncorrect && (
                      <span className="flex-shrink-0 text-red-700 font-bold text-sm">
                        ✗ INCORRECT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!revealed ? (
              <button
                onClick={handleReveal}
                className="flex-1 px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-bold text-lg shadow-lg"
              >
                Reveal Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg"
              >
                {isLastQuestion ? "Finish Quiz" : "Next Question"}
              </button>
            )}
          </div>
        </div>

            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Sidebar - Scoreboard */}
          <div className="lg:col-span-1">
            <Scoreboard participants={participants} />
          </div>
        </div>
      </div>
    </div>
  );
}
