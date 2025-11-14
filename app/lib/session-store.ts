// In-memory session store
export interface Participant {
  id: string;
  name: string;
  avatar: string; // emoji avatar
  score: number;
  addedAt: Date;
}

interface Session {
  id: string;
  quizId: string;
  createdAt: Date;
  currentQuestionIndex: number;
  participants: Participant[];
  isQuizStarted: boolean;
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
    participants: [],
    isQuizStarted: false,
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

// Generate random avatar emoji
function generateRandomAvatar(): string {
  const avatars = [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
    "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆",
    "🦉", "🦅", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋",
    "🐌", "🐞", "🐜", "🦟", "🦗", "🦂", "🐢", "🐍", "🦎", "🦖",
    "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬"
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// Generate unique participant ID
function generateParticipantId(): string {
  return `P${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Add participant to session
export function addParticipant(sessionId: string, name: string): Participant | null {
  const session = sessionStore.get(sessionId);
  if (!session) {
    return null;
  }

  const participant: Participant = {
    id: generateParticipantId(),
    name,
    avatar: generateRandomAvatar(),
    score: 0,
    addedAt: new Date(),
  };

  session.participants.push(participant);
  sessionStore.set(sessionId, session);
  console.log(`[SessionStore] Added participant ${name} to session ${sessionId}. Total participants: ${session.participants.length}`);
  return participant;
}

// Remove participant from session
export function removeParticipant(sessionId: string, participantId: string): boolean {
  const session = sessionStore.get(sessionId);
  if (!session) {
    return false;
  }

  const initialLength = session.participants.length;
  session.participants = session.participants.filter(p => p.id !== participantId);
  sessionStore.set(sessionId, session);

  const removed = session.participants.length < initialLength;
  if (removed) {
    console.log(`[SessionStore] Removed participant ${participantId} from session ${sessionId}. Remaining: ${session.participants.length}`);
  }
  return removed;
}

// Start quiz (lock participant list)
export function startQuiz(sessionId: string): boolean {
  const session = sessionStore.get(sessionId);
  if (!session) {
    return false;
  }

  session.isQuizStarted = true;
  sessionStore.set(sessionId, session);
  console.log(`[SessionStore] Started quiz for session ${sessionId} with ${session.participants.length} participants`);
  return true;
}

// Update participant score
export function updateParticipantScore(sessionId: string, participantId: string, score: number): boolean {
  const session = sessionStore.get(sessionId);
  if (!session) {
    return false;
  }

  const participant = session.participants.find(p => p.id === participantId);
  if (!participant) {
    return false;
  }

  participant.score = score;
  sessionStore.set(sessionId, session);
  console.log(`[SessionStore] Updated score for participant ${participantId} to ${score}`);
  return true;
}
