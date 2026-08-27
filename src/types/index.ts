export type SubjectDomain = 'A: Measurement' | 'B: Assessment' | 'C: Skill Acquisition' | 'D: Behavior Reduction' | 'E: Documentation' | 'F: Professional Conduct';
export type SubjectCategory = SubjectDomain;
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type Difficulty = DifficultyLevel;

export interface UserPreferences {
  theme: 'light' | 'dark';
  dailyGoal: number;
  soundEnabled: boolean;
}

export interface Domain {
  id: string;
  code: string;
  name: string;
  description?: string;
  orderIndex: number;
}

export interface Topic {
  id: string;
  domainId: string;
  code: string;
  name: string;
  description?: string;
  orderIndex: number;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionKey: 'A' | 'B' | 'C' | 'D';
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export type QuestionStatus = 'active' | 'archived' | 'deleted' | 'published' | 'review_required';

export interface Question {
  id: string;
  code: string;
  certification?: string; // e.g. 'RBT'
  certificationVersion?: string; // e.g. '6th Edition'
  domainId: string;
  domainName: string;
  topicId: string;
  topicName: string;
  difficulty: DifficultyLevel;
  content: string;
  options: string[];
  correctAnswer: number; // 0-based index for client
  explanation: string;
  hint?: string;
  referenceSource?: string;
  tags: string[];
  status?: QuestionStatus;
  deletedAt?: number;
  deletedBy?: string;
  deletionReason?: string;
}

export interface QuestionAttempt {
  id: string;
  questionId: string;
  domain: string;
  subject?: string;
  topic: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  timestamp: number;
}

export interface Bookmark {
  questionId: string;
  savedAt: number;
  notes?: string;
}

export interface Flashcard {
  id: string;
  sourceQuestionId?: string;
  certification?: string;
  certificationVersion?: string;
  domain: string;
  topic: string;
  front: string;
  back: string;
  explanation?: string;
  status?: 'active' | 'archived' | 'deleted';
  deletedAt?: number;
  deletedBy?: string;
  deletionReason?: string;
}

export interface FlashcardSRSState {
  cardId: string;
  interval: number; // days
  repetition: number;
  easeFactor: number;
  dueDate: number; // timestamp
  lastReviewed: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface MockExam {
  id: string;
  code: string;
  certification?: string;
  certificationVersion?: string;
  title: string;
  description: string;
  domain: string;
  durationMinutes: number;
  passingScorePercent: number;
  totalQuestions: number;
  questionIds: string[];
}

export interface MockExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  startedAt: number;
  completedAt: number;
  timeSpentSeconds: number;
  totalQuestions: number;
  score: number;
  accuracy: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface StudyGuide {
  id: string;
  slug: string;
  certification?: string;
  certificationVersion?: string;
  title: string;
  domain: string;
  readTimeMinutes: number;
  summary: string;
  sections: {
    title: string;
    content: string;
    keyFormulasOrPoints?: string[];
  }[];
}

export interface RateLimitConfig {
  aiQueriesPerHourPerIp: number;
  aiQueriesPerDayPerIp: number;
  maxBatchGeneration: number;
  aiTutorEnabled: boolean;
  rateLimitWindowMs: number;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  model: string;
  timeoutMs: number;
}

export interface Article {
  id: string;
  slug: string;
  certification?: string;
  certificationVersion?: string;
  title: string;
  domain: string;
  content: string;
  summary: string;
  readTimeMinutes: number;
  publishedAt: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedTopicIds?: string[];
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  orderIndex: number;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isActive: boolean;
  createdAt: string;
}

export interface SiteBrandingConfig {
  siteName: string;
  brandTagline: string;
  supportEmail: string;
  copyrightText: string;
  headerAnnouncement?: string;
}
