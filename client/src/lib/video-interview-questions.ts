import type { VideoQuestion } from "@shared/schema";

export function getRandomVideoQuestions(count: number): VideoQuestion[] {
  const shuffled = [...VIDEO_INTERVIEW_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, VIDEO_INTERVIEW_QUESTIONS.length));
}

export interface VideoEvaluation {
  keywords: string[];
  expectedDuration: number;
  sampleVideoUrl?: string;
  evaluationCriteria: {
    technicalAccuracy: string[];
    communication: string[];
    structure: string[];
  };
}

export const VIDEO_INTERVIEW_QUESTIONS: VideoQuestion[] = [
  // System Design (30 questions)
  {
    id: 1,
    category: "System Design",
    question: "Design a real-time collaboration system like Google Docs",
    timeLimit: 300,
    tips: ["Consider operational transforms", "Discuss conflict resolution", "Address scalability"],
    difficulty: "senior",
    role: "architect",
    evaluation: {
      keywords: ["CRDT", "WebSocket", "eventual consistency", "operational transform"],
      expectedDuration: 270,
      sampleVideoUrl: "/samples/system-design/google-docs.mp4",
      evaluationCriteria: {
        technicalAccuracy: [
          "Explains conflict resolution strategy",
          "Addresses real-time sync mechanism",
          "Considers scaling challenges"
        ],
        communication: [
          "Clear problem breakdown",
          "Logical flow of ideas",
          "Effective use of diagrams"
        ],
        structure: [
          "Requirements gathering",
          "High-level design",
          "Component deep-dive"
        ]
      }
    }
  },
  // Next 29 system design questions...

  // Coding & Algorithms (30 questions)
  {
    id: 31,
    category: "Algorithms",
    question: "Explain how you would implement rate limiting in a distributed system",
    timeLimit: 240,
    tips: ["Consider token bucket algorithm", "Discuss Redis implementation", "Address edge cases"],
    difficulty: "senior",
    role: "software-developer",
    evaluation: {
      keywords: ["token bucket", "sliding window", "Redis", "distributed systems"],
      expectedDuration: 210,
      evaluationCriteria: {
        technicalAccuracy: [
          "Algorithm explanation",
          "Implementation approach",
          "Performance analysis"
        ],
        communication: [
          "Clear explanation of complex concepts",
          "Use of relevant examples",
          "Structured response"
        ],
        structure: [
          "Problem definition",
          "Solution approach",
          "Trade-off analysis"
        ]
      }
    }
  },
  // Next 29 algorithm questions...

  // Architecture & Patterns (30 questions)
  {
    id: 61,
    category: "Architecture",
    question: "Describe how you would implement event sourcing in a microservices architecture",
    timeLimit: 270,
    tips: ["Discuss event store", "Consider replay capability", "Address consistency"],
    difficulty: "senior",
    role: "architect",
    evaluation: {
      keywords: ["event store", "CQRS", "event replay", "eventual consistency"],
      expectedDuration: 240,
      evaluationCriteria: {
        technicalAccuracy: [
          "Understanding of event sourcing",
          "Implementation details",
          "Scalability considerations"
        ],
        communication: [
          "Clear architectural explanation",
          "Use of examples",
          "Trade-off discussion"
        ],
        structure: [
          "Pattern overview",
          "Implementation approach",
          "Challenges and solutions"
        ]
      }
    }
  },
  // Next 29 architecture questions...

  // Cloud & DevOps (30 questions)
  {
    id: 91,
    category: "DevOps",
    question: "Explain your approach to implementing zero-downtime deployments",
    timeLimit: 240,
    tips: ["Discuss blue-green deployment", "Consider database migrations", "Address monitoring"],
    difficulty: "senior",
    role: "devops",
    evaluation: {
      keywords: ["blue-green", "canary", "rolling updates", "health checks"],
      expectedDuration: 210,
      evaluationCriteria: {
        technicalAccuracy: [
          "Deployment strategy understanding",
          "Risk mitigation approach",
          "Monitoring considerations"
        ],
        communication: [
          "Clear process explanation",
          "Real-world examples",
          "Best practices discussion"
        ],
        structure: [
          "Strategy overview",
          "Implementation steps",
          "Validation process"
        ]
      }
    }
  },
  // Next 29 DevOps questions...

  // Security (30 questions)
  {
    id: 121,
    category: "Security",
    question: "How would you implement a secure authentication system with OAuth 2.0?",
    timeLimit: 240,
    tips: ["Discuss flow types", "Consider token management", "Address security risks"],
    difficulty: "senior",
    role: "security-engineer",
    evaluation: {
      keywords: ["OAuth", "JWT", "refresh tokens", "PKCE"],
      expectedDuration: 210,
      evaluationCriteria: {
        technicalAccuracy: [
          "OAuth flow understanding",
          "Security considerations",
          "Implementation approach"
        ],
        communication: [
          "Clear flow explanation",
          "Security risk discussion",
          "Best practices coverage"
        ],
        structure: [
          "Flow overview",
          "Implementation details",
          "Security measures"
        ]
      }
    }
  }
  // Next 29 security questions...
];

export function evaluateVideoResponse(questionId: number, response: {
  duration: number;
  transcript: string;
  confidence: number;
}): {
  score: number;
  feedback: string[];
  improvements: string[];
} {
  const question = VIDEO_INTERVIEW_QUESTIONS.find(q => q.id === questionId);
  if (!question || !question.evaluation) {
    return { score: 0, feedback: [], improvements: [] };
  }

  const eval = question.evaluation;
  const keywordMatches = eval.keywords.filter(kw => 
    response.transcript.toLowerCase().includes(kw.toLowerCase())
  ).length;

  const durationScore = Math.max(0, 1 - Math.abs(response.duration - eval.expectedDuration) / eval.expectedDuration);
  const keywordScore = keywordMatches / eval.keywords.length;
  const confidenceScore = response.confidence;

  const score = (durationScore + keywordScore + confidenceScore) / 3;

  return {
    score: Math.round(score * 100),
    feedback: [
      `Covered ${keywordMatches} out of ${eval.keywords.length} key concepts`,
      `Response duration was ${Math.abs(response.duration - eval.expectedDuration)}s ${
        response.duration > eval.expectedDuration ? 'longer' : 'shorter'
      } than ideal`
    ],
    improvements: [
      ...eval.evaluationCriteria.technicalAccuracy,
      ...eval.evaluationCriteria.communication,
      ...eval.evaluationCriteria.structure
    ].filter(criteria => !response.transcript.toLowerCase().includes(criteria.toLowerCase()))
  };
}

export function getVideoQuestionsByCategory(category: string): VideoQuestion[] {
  return VIDEO_INTERVIEW_QUESTIONS.filter(q => q.category === category);
}

export function getVideoQuestionsByDifficulty(difficulty: string): VideoQuestion[] {
  return VIDEO_INTERVIEW_QUESTIONS.filter(q => q.difficulty === difficulty);
}

export function getVideoQuestionsByRole(role: string): VideoQuestion[] {
  return VIDEO_INTERVIEW_QUESTIONS.filter(q => q.role === role);
}