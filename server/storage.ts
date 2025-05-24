import { 
  users, questions, practiceServices, questionResponses, userProgress,
  type User, type InsertUser, type Question, type InsertQuestion,
  type PracticeSession, type InsertPracticeSession,
  type QuestionResponse, type InsertQuestionResponse,
  type UserProgress, type InsertUserProgress,
  ROLES, CATEGORIES
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Question methods
  getQuestions(role?: string, category?: string): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getRandomQuestions(role: string, category: string, limit: number): Promise<Question[]>;

  // Practice session methods
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  getPracticeSession(id: number): Promise<PracticeSession | undefined>;
  updatePracticeSession(id: number, updates: Partial<PracticeSession>): Promise<PracticeSession | undefined>;
  getUserActiveSessions(userId: number): Promise<PracticeSession[]>;

  // Question response methods
  createQuestionResponse(response: InsertQuestionResponse): Promise<QuestionResponse>;
  getSessionResponses(sessionId: number): Promise<QuestionResponse[]>;
  updateQuestionResponse(id: number, updates: Partial<QuestionResponse>): Promise<QuestionResponse | undefined>;

  // Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(userId: number, role: string, category: string, updates: Partial<UserProgress>): Promise<UserProgress>;
  getUserStats(userId: number): Promise<{
    questionsCompleted: number;
    practiceHours: number;
    skillsImproved: number;
    currentStreak: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private practiceSessions: Map<number, PracticeSession>;
  private questionResponses: Map<number, QuestionResponse>;
  private userProgress: Map<string, UserProgress>; // key: userId-role-category
  
  private currentUserId: number;
  private currentQuestionId: number;
  private currentSessionId: number;
  private currentResponseId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.practiceSessions = new Map();
    this.questionResponses = new Map();
    this.userProgress = new Map();
    
    this.currentUserId = 1;
    this.currentQuestionId = 1;
    this.currentSessionId = 1;
    this.currentResponseId = 1;
    this.currentProgressId = 1;

    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "alexchen",
      password: "password",
      name: "Alex Chen",
      email: "alex.chen@example.com",
      currentRole: "software-developer",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Seed questions
    this.seedQuestions();
  }

  private seedQuestions() {
    const questionData = [
      {
        title: "Explaining Technical Concepts to Non-Technical Stakeholders",
        description: "You're a senior developer working on a complex microservices architecture. During a sprint review, the product manager asks you to explain why the recent API response times have increased and what your team is doing to address it. How would you communicate this technical issue in a way that's accessible to non-technical stakeholders while maintaining accuracy?",
        category: "communication",
        role: "software-developer",
        difficulty: "senior",
        sampleAnswer: "I would start by setting context and using analogies. For example, 'Think of our system like a busy restaurant. Recently, we've had more customers (traffic) than usual, and our kitchen (servers) is taking longer to prepare orders. The issue isn't with the quality of food, but with how we're handling the increased volume.' Then I'd explain the business impact: 'This translates to users waiting an extra 2-3 seconds for pages to load, which could impact user satisfaction and potentially conversions.' Finally, I'd provide a clear solution and timeline: 'We're implementing two solutions: optimizing our kitchen workflow (code optimization) by next sprint, and adding more cooking stations (server capacity) within two weeks. This should reduce response times by 60%.'",
        tips: ["Use analogies or real-world comparisons", "Focus on business impact rather than technical details", "Provide clear next steps and timelines", "Acknowledge concerns and show empathy"],
        keywords: ["communication", "stakeholder management", "technical translation", "business impact"]
      },
      {
        title: "Code Review Feedback",
        description: "A junior developer on your team has submitted a pull request with code that works but doesn't follow best practices. The code is poorly structured, lacks proper error handling, and doesn't include tests. How would you provide constructive feedback that helps them improve without discouraging them?",
        category: "collaboration",
        role: "software-developer",
        difficulty: "mid",
        sampleAnswer: "I would start by acknowledging what they did well: 'Great job getting the feature working and handling the edge cases in the user interface.' Then I'd frame improvements as learning opportunities: 'I see some areas where we can make this code even more robust and maintainable.' I'd provide specific, actionable feedback with examples: 'For error handling, we could add try-catch blocks around the API calls. Here's how we typically structure that...' I'd also offer to pair program: 'Would you like to hop on a call tomorrow to refactor this together? I can show you some patterns we use for testing these types of components.'",
        tips: ["Start with positive feedback", "Be specific and actionable", "Offer to help and teach", "Frame as learning opportunities"],
        keywords: ["code review", "mentoring", "constructive feedback", "team collaboration"]
      },
      {
        title: "Handling Conflicting Priorities",
        description: "You're working as a tech lead and receive conflicting priorities from two different stakeholders. The product manager wants you to focus on a new feature for an upcoming demo, while the engineering manager wants you to prioritize fixing technical debt that's slowing down the team. How do you handle this situation?",
        category: "leadership",
        role: "tech-lead",
        difficulty: "senior",
        sampleAnswer: "I would first gather all the information I need by speaking with both stakeholders separately to understand their reasoning and constraints. Then I'd schedule a meeting with both stakeholders together to facilitate a transparent discussion. I'd present the trade-offs clearly: 'If we focus on the demo feature, we'll hit the deadline but the technical debt will continue to slow our velocity by about 30%. If we address the technical debt first, we'll increase our long-term velocity but might need to push the demo by one week.' I'd also propose a compromise if possible: 'Could we scope down the demo feature to address the most critical technical debt issues first, then deliver a simplified version for the demo?'",
        tips: ["Gather information from all parties", "Facilitate transparent discussions", "Present clear trade-offs", "Look for compromise solutions"],
        keywords: ["conflict resolution", "stakeholder management", "prioritization", "leadership"]
      },
      {
        title: "Cross-Team Collaboration",
        description: "Your development team needs to integrate with an API developed by another team, but their API doesn't meet your requirements and they're reluctant to make changes. How do you approach this situation to find a solution that works for both teams?",
        category: "collaboration",
        role: "software-developer",
        difficulty: "mid",
        sampleAnswer: "I would start by understanding their perspective and constraints. I'd schedule a meeting to discuss our requirements and ask about their concerns with making changes. I'd come prepared with specific examples: 'We need the user data to include the email field for our notifications feature. Could we explore adding this to the response?' If they can't make changes, I'd look for alternative solutions: 'If modifying the API isn't possible right now, could we set up a separate endpoint for this data, or would you be open to a webhook approach?' I'd also consider if we could adapt our approach: 'We could potentially call two endpoints and merge the data on our side if that's easier for your team.'",
        tips: ["Understand their constraints", "Come with specific requirements", "Explore alternative solutions", "Be willing to adapt your approach"],
        keywords: ["cross-team collaboration", "API integration", "problem-solving", "compromise"]
      },
      {
        title: "Technical Architecture Decisions",
        description: "As a solution architect, you need to recommend whether to build a new feature using microservices or add it to the existing monolith. The team is split on the decision. How do you evaluate the options and communicate your recommendation?",
        category: "technical-mentoring",
        role: "architect",
        difficulty: "senior",
        sampleAnswer: "I would start by defining the evaluation criteria with the team: scalability needs, team structure, timeline, complexity, and maintenance overhead. Then I'd analyze each option systematically: 'For the monolith approach, we can deliver faster (2-3 weeks vs 4-5 weeks), leverage existing code, but we'll increase coupling and deployment risk. For microservices, we get better scalability and team autonomy, but we add network complexity and operational overhead.' I'd present data: 'Based on our traffic projections, we won't need the scalability benefits of microservices for at least 18 months.' Finally, I'd make a clear recommendation with reasoning: 'I recommend starting with the monolith approach for speed, with a clear plan to extract it to a microservice when we hit 10x current traffic or when we have a dedicated team for this domain.'",
        tips: ["Define clear evaluation criteria", "Analyze systematically with data", "Consider team and business context", "Provide clear reasoning for recommendations"],
        keywords: ["architecture decisions", "technical strategy", "trade-off analysis", "team alignment"]
      }
    ];

    questionData.forEach(q => {
      const question: Question = {
        id: this.currentQuestionId++,
        ...q
      };
      this.questions.set(question.id, question);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getQuestions(role?: string, category?: string): Promise<Question[]> {
    let filtered = Array.from(this.questions.values());
    
    if (role) {
      filtered = filtered.filter(q => q.role === role);
    }
    
    if (category) {
      filtered = filtered.filter(q => q.category === category);
    }
    
    return filtered;
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const question: Question = {
      ...insertQuestion,
      id: this.currentQuestionId++,
    };
    this.questions.set(question.id, question);
    return question;
  }

  async getRandomQuestions(role: string, category: string, limit: number): Promise<Question[]> {
    const filtered = await this.getQuestions(role, category);
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const session: PracticeSession = {
      ...insertSession,
      id: this.currentSessionId++,
      startedAt: new Date(),
      completedAt: null,
    };
    this.practiceSessions.set(session.id, session);
    return session;
  }

  async getPracticeSession(id: number): Promise<PracticeSession | undefined> {
    return this.practiceSessions.get(id);
  }

  async updatePracticeSession(id: number, updates: Partial<PracticeSession>): Promise<PracticeSession | undefined> {
    const session = this.practiceSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.practiceSessions.set(id, updated);
    return updated;
  }

  async getUserActiveSessions(userId: number): Promise<PracticeSession[]> {
    return Array.from(this.practiceSessions.values())
      .filter(session => session.userId === userId && session.isActive);
  }

  async createQuestionResponse(insertResponse: InsertQuestionResponse): Promise<QuestionResponse> {
    const response: QuestionResponse = {
      ...insertResponse,
      id: this.currentResponseId++,
      answeredAt: new Date(),
    };
    this.questionResponses.set(response.id, response);
    return response;
  }

  async getSessionResponses(sessionId: number): Promise<QuestionResponse[]> {
    return Array.from(this.questionResponses.values())
      .filter(response => response.sessionId === sessionId);
  }

  async updateQuestionResponse(id: number, updates: Partial<QuestionResponse>): Promise<QuestionResponse | undefined> {
    const response = this.questionResponses.get(id);
    if (!response) return undefined;
    
    const updated = { ...response, ...updates };
    this.questionResponses.set(id, updated);
    return updated;
  }

  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async updateUserProgress(userId: number, role: string, category: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const key = `${userId}-${role}-${category}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...updates, lastPracticed: new Date() };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      const newProgress: UserProgress = {
        id: this.currentProgressId++,
        userId,
        role,
        category,
        questionsCompleted: 0,
        totalPracticeTime: 0,
        averageScore: 0,
        lastPracticed: new Date(),
        ...updates,
      };
      this.userProgress.set(key, newProgress);
      return newProgress;
    }
  }

  async getUserStats(userId: number): Promise<{
    questionsCompleted: number;
    practiceHours: number;
    skillsImproved: number;
    currentStreak: number;
  }> {
    const responses = Array.from(this.questionResponses.values())
      .filter(response => {
        const session = Array.from(this.practiceSessions.values())
          .find(s => s.id === response.sessionId);
        return session?.userId === userId;
      });

    const progress = await this.getUserProgress(userId);
    const totalPracticeTime = progress.reduce((sum, p) => sum + p.totalPracticeTime, 0);
    
    return {
      questionsCompleted: responses.length,
      practiceHours: Math.floor(totalPracticeTime / 60),
      skillsImproved: progress.filter(p => p.questionsCompleted > 0).length,
      currentStreak: 12, // This would be calculated based on consecutive days of practice
    };
  }
}

export const storage = new MemStorage();
