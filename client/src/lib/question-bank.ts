import type { Question } from "@shared/schema";

// This file contains the client-side question bank data structure
// In a real application, this would be fetched from the API

export const ROLES = {
  "software-developer": "Software Developer",
  "tech-lead": "Tech Lead", 
  "architect": "Solution Architect",
  "principal": "Principal Engineer",
} as const;

export const CATEGORIES = {
  "communication": "Communication",
  "collaboration": "Collaboration", 
  "leadership": "Leadership",
  "problem-solving": "Problem Solving",
  "technical-mentoring": "Technical Mentoring",
} as const;

export const DIFFICULTIES = {
  "junior": "Junior",
  "mid": "Mid-Level",
  "senior": "Senior",
} as const;

export type Role = keyof typeof ROLES;
export type Category = keyof typeof CATEGORIES;
export type Difficulty = keyof typeof DIFFICULTIES;

export interface QuestionFilter {
  role?: Role;
  category?: Category;
  difficulty?: Difficulty;
}

export function filterQuestions(questions: Question[], filter: QuestionFilter): Question[] {
  return questions.filter(question => {
    if (filter.role && question.role !== filter.role) return false;
    if (filter.category && question.category !== filter.category) return false;
    if (filter.difficulty && question.difficulty !== filter.difficulty) return false;
    return true;
  });
}

export function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getQuestionsByRole(questions: Question[], role: Role): Question[] {
  return questions.filter(q => q.role === role);
}

export function getQuestionsByCategory(questions: Question[], category: Category): Question[] {
  return questions.filter(q => q.category === category);
}
