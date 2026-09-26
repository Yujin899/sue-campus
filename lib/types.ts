export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lecture {
  id: string;
  subjectId: string;
  title: string;
  fileName: string;
  objectKey: string;
  size: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

export interface LectureDownload {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
  expiresIn: number;
}

export interface PresignedLectureUpload {
  objectKey: string;
  uploadUrl: string;
  expiresIn: number;
}

export type QuizStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "MULTI_SELECT";

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED";

export interface QuizSubjectRef {
  id: string;
  code: string;
  name: string;
}

export interface Quiz {
  id: string;
  subjectId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  status: QuizStatus;
  reviewNote: string | null;
  createdById: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: QuizSubjectRef;
  _count?: { questions: number };
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  correctAnswerIndices?: number[];
}

export interface AttemptSummary {
  id: string;
  quizId: string;
  status: AttemptStatus;
  score: number | null;
  total: number | null;
  startedAt: string;
  submittedAt: string | null;
}

export interface AttemptAnswerState {
  questionId: string;
  selectedIndices: number[];
}

export interface AttemptSession {
  attempt: AttemptSummary;
  remainingSeconds: number;
  questions: Question[];
  answers: AttemptAnswerState[];
}

export interface AttemptResultItem {
  questionId: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  selectedIndices: number[];
  correctAnswerIndices: number[];
  isCorrect: boolean;
}

export interface AttemptResult {
  attempt: AttemptSummary;
  score: number;
  total: number;
  results: AttemptResultItem[];
}

export type AttemptView = AttemptSession | AttemptResult;

export function isAttemptResult(view: AttemptView): view is AttemptResult {
  return "results" in view;
}

export interface AttemptOverviewItem {
  id: string;
  quizId: string;
  quizTitle: string;
  subjectId: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  score: number;
  total: number;
  percentage: number;
  submittedAt: string | null;
}

export interface InProgressAttempt {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subjectCode: string | null;
  subjectName: string | null;
  startedAt: string;
  remainingSeconds: number;
}

export interface SubjectPerformance {
  id: string;
  code: string;
  name: string;
  attempts: number;
  averagePercentage: number;
}

export interface MyAttemptsOverview {
  stats: {
    attempts: number;
    quizzesTaken: number;
    averagePercentage: number | null;
    bestPercentage: number | null;
  };
  inProgress: InProgressAttempt | null;
  recent: AttemptOverviewItem[];
  bySubject: SubjectPerformance[];
}

export interface QuizStatusStats {
  total: number;
  byStatus: Record<QuizStatus, number>;
}

export type UserRole = "USER" | "ADMIN";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  banned: boolean;
  banReason: string | null;
  bannedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sessions: number;
    quizAttempts: number;
    authoredQuizzes: number;
  };
}

export interface ManagedUserPage {
  items: ManagedUser[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}