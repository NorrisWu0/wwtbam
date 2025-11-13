"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface QuizSummary {
  id: string;
  questionCount: number;
  createdAt: string;
}

export default function SessionPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quiz/list");

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    router.push("/session/quiz");
  };

  const handleViewQuiz = (quizId: string) => {
    router.push(`/session/quiz/${quizId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quiz Sessions</h1>
          <button
            onClick={handleCreateQuiz}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
          >
            Create New Quiz
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-xl font-medium">Loading quizzes...</span>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && quizzes.length === 0 && (
          <div className="p-12 bg-white border border-gray-200 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">No quizzes yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first quiz to get started!
            </p>
            <button
              onClick={handleCreateQuiz}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Quiz
            </button>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Total quizzes: {quizzes.length}
            </p>

            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewQuiz(quiz.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-blue-600 mb-1">
                        Quiz {quiz.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {quiz.questionCount} question{quiz.questionCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {formatDate(quiz.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
