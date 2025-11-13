// In-memory session store
interface Session {
  id: string;
  quizId: string;
  createdAt: Date;
  currentQuestionIndex: number;
}

// Global singleton pattern to persist across hot reloads in dev mode
declare global {
  var sessionStore: Map<string, Session> | undefined;
}

// In-memory store - persists across hot reloads
const sessionStore = globalThis.sessionStore ?? new Map<string, Session>();

if (process.env.NODE_ENV !== "production") {
  globalThis.sessionStore = sessionStore;
}

// Generate random session ID
export function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Create new session
export function createSession(quizId: string): string {
  const id = generateSessionId();
  const session: Session = {
    id,
    quizId,
    createdAt: new Date(),
    currentQuestionIndex: 0,
  };
  sessionStore.set(id, session);
  console.log(`[SessionStore] Created session ${id} for quiz ${quizId}. Total sessions: ${sessionStore.size}`);
  return id;
}

// Get session from store
export function getSession(id: string): Session | undefined {
  const session = sessionStore.get(id);
  console.log(`[SessionStore] Get session ${id}: ${session ? "found" : "not found"}. Total sessions: ${sessionStore.size}`);
  return session;
}

// Update session's current question index
export function updateSessionQuestion(id: string, questionIndex: number): boolean {
  const session = sessionStore.get(id);
  if (!session) {
    return false;
  }
  session.currentQuestionIndex = questionIndex;
  sessionStore.set(id, session);
  console.log(`[SessionStore] Updated session ${id} to question ${questionIndex}`);
  return true;
}

// Check if session exists
export function sessionExists(id: string): boolean {
  return sessionStore.has(id);
}
