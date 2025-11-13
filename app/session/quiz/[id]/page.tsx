"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
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

  const startSession = async () => {
    setStarting(true);
    setError("");

    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start session");
      }

      const data = await response.json();

      // Navigate to session page
      router.push(`/session/${data.sessionId}?quiz_id=${quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-xl font-medium">Loading quiz...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error || "Quiz not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Quiz Ready!</h1>
              <p className="text-gray-600 mt-1">
                Quiz ID: <span className="font-mono font-bold text-blue-600">{quiz.id}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Ready to start? Click the button below to begin the quiz session!
              </p>
            </div>

            <button
              onClick={startSession}
              disabled={starting}
              className="w-full px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-bold text-xl shadow-lg"
            >
              {starting ? "Starting..." : "Start Quiz"}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Questions Preview</h2>

          {quiz.questions.map((q, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {q.type}
                </span>
                <h3 className="text-lg font-semibold mt-1">
                  {index + 1}. {q.question}
                </h3>
              </div>

              <div className="space-y-2 mb-4">
                {q.options.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg ${
                      option.value === q.answer
                        ? "bg-red-50 border-2 border-red-300"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{option.value}.</span>{" "}
                    {option.label}
                    {option.value === q.answer && (
                      <span className="ml-2 text-xs text-red-600 font-semibold">
                        (Incorrect Answer)
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                <strong>Answer:</strong> {q.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
