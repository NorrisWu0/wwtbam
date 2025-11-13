"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function QuestionGenerator() {
  const router = useRouter();
  const [count, setCount] = useState<number>(6);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>("");
  const [rerolling, setRerolling] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const generateQuestions = async () => {
    setLoading(true);
    setError("");
    setLoadingProgress("Connecting to AI...");

    try {
      const startTime = Date.now();

      // Update progress message after 1 second
      const progressTimer = setTimeout(() => {
        setLoadingProgress("AI is thinking...");
      }, 1000);

      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count }),
      });

      clearTimeout(progressTimer);
      setLoadingProgress("Processing response...");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setLoadingProgress("Complete!");

      // Clear progress message after a brief moment
      setTimeout(() => setLoadingProgress(""), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setLoadingProgress("");
    } finally {
      setLoading(false);
    }
  };

  const rerollQuestion = async (index: number) => {
    setRerolling((prev) => new Set(prev).add(index));
    setError("");

    try {
      const response = await fetch("/api/questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count: 1 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reroll question");
      }

      const data = await response.json();
      const newQuestion = data.questions[0];

      setQuestions((prev) => {
        const updated = [...prev];
        updated[index] = newQuestion;
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setRerolling((prev) => {
        const updated = new Set(prev);
        updated.delete(index);
        return updated;
      });
    }
  };

  const confirmQuiz = async () => {
    setConfirming(true);
    setError("");

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save quiz");
      }

      const data = await response.json();

      // Redirect to quiz page
      router.push(`/session/quiz/${data.quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setConfirming(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Question Generator</h1>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="count" className="block text-sm font-medium mb-2">
              How many questions do you want to generate?
            </label>
            <input
              id="count"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            onClick={generateQuestions}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {loading && loadingProgress && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-700 font-medium">{loadingProgress}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {questions.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Generated Questions</h2>
            <button
              onClick={confirmQuiz}
              disabled={confirming}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-md"
            >
              {confirming ? "Confirming..." : "Confirm Quiz"}
            </button>
          </div>

          {questions.map((q, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {q.type}
                  </span>
                  <h3 className="text-lg font-semibold mt-1">
                    {index + 1}. {q.question}
                  </h3>
                </div>

                <button
                  onClick={() => rerollQuestion(index)}
                  disabled={rerolling.has(index)}
                  className="ml-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {rerolling.has(index) ? "Rerolling..." : "Reroll"}
                </button>
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
      )}
    </div>
  );
}
