// In-memory quiz store
interface QuizQuestion {
  type: string;
  question: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  answer: string;
}

interface Quiz {
  id: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

// Global singleton pattern to persist across hot reloads in dev mode
declare global {
  var quizStore: Map<string, Quiz> | undefined;
}

// In-memory store - persists across hot reloads
const quizStore = globalThis.quizStore ?? new Map<string, Quiz>();

if (process.env.NODE_ENV !== "production") {
  globalThis.quizStore = quizStore;
}

// Generate random quiz ID
export function generateQuizId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Save quiz to store
export function saveQuiz(questions: QuizQuestion[]): string {
  const id = generateQuizId();
  const quiz: Quiz = {
    id,
    questions,
    createdAt: new Date(),
  };
  quizStore.set(id, quiz);
  console.log(`[QuizStore] Saved quiz ${id}. Total quizzes: ${quizStore.size}`);
  return id;
}

// Get quiz from store
export function getQuiz(id: string): Quiz | undefined {
  const quiz = quizStore.get(id);
  console.log(`[QuizStore] Get quiz ${id}: ${quiz ? "found" : "not found"}. Total quizzes: ${quizStore.size}`);
  return quiz;
}

// Check if quiz exists
export function quizExists(id: string): boolean {
  return quizStore.has(id);
}

// Get all quizzes
export function getAllQuizzes(): Quiz[] {
  return Array.from(quizStore.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
