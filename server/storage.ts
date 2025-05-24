import { 
  users, questions, practiceSessions, questionResponses, userProgress,
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
      },
      // Leadership & Mentorship questions
      {
        title: "Mentoring Junior Engineers",
        description: "You've led teams and founded ZBENYA SYSTEMS. Describe a situation where you mentored a junior engineer or resolved a conflict within your team. How did you balance guidance with allowing them to learn independently?",
        category: "leadership",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "I had a junior engineer struggling with embedded system debugging who was spending days on issues that could be resolved in hours. Instead of just giving solutions, I introduced a structured approach: 'Let's establish a debugging methodology together.' I showed them how to use systematic isolation - checking power rails, signal integrity, then software layers. I paired with them for the first few sessions, then gradually stepped back. When they got stuck, I'd ask guiding questions: 'What does the oscilloscope tell us here?' rather than pointing out the issue directly. After two weeks, they successfully debugged a complex timing issue independently. The key was building their confidence while teaching transferable skills.",
        tips: ["Use guided discovery rather than direct instruction", "Establish systematic approaches", "Gradually reduce support", "Ask questions to develop critical thinking"],
        keywords: ["mentoring", "skill development", "leadership", "knowledge transfer"]
      },
      {
        title: "Balancing Technical and Leadership Responsibilities",
        description: "How do you balance being a hands-on developer with your responsibilities as a leader/consultant? Share a specific example where you had to manage both technical delivery and team coordination.",
        category: "leadership",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "During a critical automotive project, I was simultaneously architecting the embedded communication stack and managing a team of five engineers. I established clear time boundaries: mornings for deep technical work, afternoons for team coordination. I used time-boxing - dedicating 2 hours daily to code review and architecture decisions, and 1.5 hours to team meetings and mentoring. When the team needed immediate technical guidance, I would document my thought process in real-time, turning problem-solving into teaching moments. This way, urgent technical issues became learning opportunities rather than interruptions to leadership duties.",
        tips: ["Establish clear time boundaries", "Use time-boxing for different responsibilities", "Turn interruptions into teaching moments", "Document decision-making processes"],
        keywords: ["time management", "technical leadership", "delegation", "role balance"]
      },
      {
        title: "Handling Technical Disagreements with Stakeholders",
        description: "As an expert, how do you handle disagreements with stakeholders (e.g., clients or team members) over technical decisions? Provide a specific example from your consulting experience.",
        category: "leadership",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "A client insisted on using a specific microcontroller for a smart home project despite my recommendation for a more suitable alternative. Instead of dismissing their preference, I prepared a detailed comparison: power consumption, development costs, future scalability, and vendor support. I presented three scenarios: their preferred solution, my recommendation, and a hybrid approach. I quantified the trade-offs: 'Your solution saves $2 per unit now but will cost $50,000 more in development time and limit future features.' I also acknowledged their constraints: 'I understand the existing vendor relationship is valuable.' We agreed on a compromise that used their preferred vendor but with a different chip family that met our technical requirements.",
        tips: ["Prepare data-driven comparisons", "Quantify trade-offs clearly", "Acknowledge stakeholder constraints", "Seek compromise solutions"],
        keywords: ["stakeholder management", "technical advocacy", "negotiation", "compromise"]
      },
      // Teamwork & Collaboration questions
      {
        title: "Cross-Functional Hardware-Software Integration",
        description: "Share an example of a cross-functional project (e.g., hardware/software integration) where collaboration was critical. How did you ensure all teams stayed aligned?",
        category: "collaboration",
        role: "architect",
        difficulty: "senior",
        sampleAnswer: "On a automotive infotainment system project, we had hardware engineers designing the PCB, embedded developers writing firmware, and application developers creating the UI. I established weekly integration meetings with representatives from each team. We created shared documentation in Confluence detailing interface specifications, timing requirements, and test procedures. Most importantly, I implemented 'demo Fridays' where each team showed their progress using the actual hardware. When the audio team discovered latency issues, having all teams present allowed us to quickly identify it was a buffer size mismatch between firmware and application layers. This collaborative approach reduced integration time from 6 weeks to 2 weeks.",
        tips: ["Establish regular cross-team meetings", "Create shared documentation", "Use real hardware for demos", "Include all stakeholders in problem-solving"],
        keywords: ["cross-functional collaboration", "integration management", "communication", "alignment"]
      },
      {
        title: "Remote Team Communication",
        description: "How do you ensure effective communication between remote teams or departments (e.g., hardware vs. software teams)? Describe specific tools and strategies you've used.",
        category: "collaboration",
        role: "tech-lead",
        difficulty: "senior",
        sampleAnswer: "Managing remote hardware and software teams required structured communication protocols. I implemented daily async standups using Slack with specific channels for #hardware-blockers and #software-blockers. For complex technical discussions, I used collaborative whiteboards during video calls, recording sessions for team members in different time zones. I established 'bridge documentation' - hardware specs that software could understand, and software requirements that hardware could implement. Weekly 'show and tell' sessions where teams demonstrated working prototypes helped maintain shared understanding and catch integration issues early.",
        tips: ["Use structured async communication", "Record important technical discussions", "Create bridge documentation", "Regular cross-team demonstrations"],
        keywords: ["remote collaboration", "async communication", "documentation", "cross-team alignment"]
      },
      {
        title: "Communicating with Non-Technical Stakeholders",
        description: "Describe a time you had to adapt your communication style to work with a non-technical audience (e.g., clients or managers). How did you explain complex technical concepts?",
        category: "communication",
        role: "architect",
        difficulty: "mid",
        sampleAnswer: "I needed to explain why our embedded system required more memory than initially budgeted to a client's finance team. Instead of discussing RAM specifications, I used analogies: 'Think of memory like storage space in a warehouse. We initially estimated we'd need 1000 square feet, but as we added security features and user interface improvements, we now need 1500 square feet. The extra cost is $0.50 per unit, but it prevents system crashes and ensures smooth operation.' I provided visual charts showing the relationship between memory usage and system reliability, and offered three options with clear cost-benefit analysis. The finance team approved the upgrade because they understood both the necessity and the business impact.",
        tips: ["Use relatable analogies", "Focus on business impact", "Provide visual aids", "Offer clear options with trade-offs"],
        keywords: ["technical communication", "stakeholder management", "business translation", "visual presentation"]
      },
      // Problem-Solving & Innovation questions
      {
        title: "Complex Hardware-Software Problem Solving",
        description: "Walk us through a complex technical problem you solved creatively (e.g., in embedded systems or architectural design). What was your systematic approach?",
        category: "problem-solving",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "We had intermittent system crashes in an automotive ECU that only occurred after 4-6 hours of operation in specific temperature conditions. Standard debugging couldn't reproduce the issue. I implemented a multi-layered approach: hardware logging using unused GPIO pins to track power rail fluctuations, software logging with minimal memory footprint to avoid affecting the issue, and thermal imaging during extended test runs. The breakthrough came when I correlated the timing with thermal expansion data - a capacitor was losing capacitance at high temperatures, causing voltage ripples that corrupted memory. The creative solution was implementing software-based voltage monitoring that could detect early signs of hardware degradation and gracefully handle the condition.",
        tips: ["Use systematic multi-layered debugging", "Consider environmental factors", "Implement non-intrusive monitoring", "Correlate multiple data sources"],
        keywords: ["systematic debugging", "hardware-software integration", "root cause analysis", "creative problem solving"]
      },
      {
        title: "Debugging Across Hardware-Software Boundaries",
        description: "How do you approach debugging a system where the root cause spans both hardware and software? Provide a specific methodology and example.",
        category: "problem-solving",
        role: "architect",
        difficulty: "senior",
        sampleAnswer: "My approach follows a systematic boundary analysis method. First, I isolate software variables by running identical code on known-good hardware. Then I test hardware independently using simple, proven software. For a recent project where sensor readings were inconsistent, I: 1) Verified sensor functionality with basic test firmware, 2) Confirmed communication protocol timing with oscilloscope, 3) Tested software algorithms with simulated perfect data, 4) Used boundary scanning to check PCB connections. The issue was discovered at the interface level - the ADC reference voltage had temperature drift that software calibration wasn't accounting for. The solution required both a hardware fix (better voltage reference) and software enhancement (dynamic calibration algorithm).",
        tips: ["Isolate hardware and software variables", "Test at interface boundaries", "Use independent verification methods", "Address both hardware and software aspects"],
        keywords: ["system debugging", "boundary analysis", "hardware-software interface", "systematic methodology"]
      },
      {
        title: "Adapting to Changing Requirements",
        description: "Give an example of a project where you had to pivot due to changing requirements (e.g., in automotive or smart home applications). How did you manage the technical and team impacts?",
        category: "problem-solving",
        role: "tech-lead",
        difficulty: "senior",
        sampleAnswer: "Midway through a smart home security system project, the client requested voice control integration, which wasn't in the original scope. This required additional processing power, different microcontroller selection, and new software architecture. I immediately called a team meeting to assess impact: hardware changes would delay delivery by 3 weeks, software architecture needed restructuring, and we'd need additional expertise. I presented three options: 1) Full integration with timeline extension, 2) Phased delivery with voice control in version 2, 3) Cloud-based voice processing to minimize hardware changes. We chose option 3, which required restructuring our communication protocols but kept hardware changes minimal. I managed team concerns by clearly communicating the new timeline and redistributing tasks based on each member's strengths.",
        tips: ["Assess impact immediately", "Present multiple options", "Consider cloud-based alternatives", "Redistribute tasks based on team strengths"],
        keywords: ["requirement changes", "project pivoting", "team management", "solution alternatives"]
      },
      // Adaptability & Client Management questions
      {
        title: "Managing Impractical Client Requests",
        description: "As a consultant, how do you handle a client who insists on an impractical solution? How do you guide them toward a better approach while maintaining the relationship?",
        category: "collaboration",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "A client wanted to implement real-time video processing on a low-power embedded device that simply couldn't handle the computational load. Instead of directly saying 'no,' I demonstrated the limitations: 'Let me show you what happens when we try to process video at the frame rate you need.' I ran benchmarks that clearly showed the performance gap. Then I reframed the conversation around their core business goal: 'What you really need is reliable motion detection, right?' I proposed an edge-computing solution where basic detection happened locally, with detailed analysis in the cloud. This met their functional requirements while staying within hardware constraints. The key was focusing on their business outcome rather than their proposed technical solution.",
        tips: ["Demonstrate limitations objectively", "Focus on business goals rather than technical preferences", "Propose alternative solutions", "Use data to support recommendations"],
        keywords: ["client management", "requirement negotiation", "solution guidance", "relationship management"]
      },
      {
        title: "Rapid Technology Learning",
        description: "Describe a time you had to quickly learn a new technology/tool to meet a project deadline. What was your learning strategy?",
        category: "problem-solving",
        role: "software-developer",
        difficulty: "mid",
        sampleAnswer: "I needed to implement BLE (Bluetooth Low Energy) communication for an IoT project with only two weeks to learn and deliver. My strategy was: 1) Identified the core concepts I needed vs. nice-to-know details, 2) Found practical tutorials and worked through them hands-on with our actual hardware, 3) Joined developer communities for quick Q&A support, 4) Implemented a minimal viable version first, then iterated. I spent the first three days on foundational concepts, then built a simple connection demo. By day five, I had basic data transfer working. The remaining time was spent on error handling and optimization. The key was focusing on practical implementation rather than theoretical mastery, and building incrementally rather than trying to understand everything upfront.",
        tips: ["Focus on essential concepts first", "Use hands-on learning with real hardware", "Join developer communities for support", "Build incrementally, starting with minimal viable implementation"],
        keywords: ["rapid learning", "technology adoption", "practical implementation", "incremental development"]
      },
      {
        title: "Multi-Project Prioritization",
        description: "How do you prioritize tasks when juggling multiple client projects or roles (e.g., development, testing, and consulting)? Share your specific framework.",
        category: "collaboration",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "I use a matrix-based prioritization system combining urgency, impact, and resource requirements. Each Monday, I review all active projects and categorize tasks: 1) Critical path items that block others, 2) High-impact deliverables with fixed deadlines, 3) Important but flexible tasks, 4) Learning/improvement activities. I time-box each category and use calendar blocking to protect deep work time. For example, I reserve mornings for complex development work when my focus is peak, afternoons for meetings and collaboration, and Friday afternoons for documentation and planning. I also maintain a 'parking lot' for important but non-urgent items. When conflicts arise, I communicate early with clients about trade-offs and negotiate adjusted timelines rather than compromising quality.",
        tips: ["Use matrix-based prioritization", "Time-box different types of work", "Protect deep work time", "Communicate early about conflicts"],
        keywords: ["project management", "prioritization", "time management", "client communication"]
      },
      // Communication & Influence questions
      {
        title: "Explaining Technical Constraints to Clients",
        description: "How do you explain highly technical constraints (e.g., embedded system limitations) to a client who prioritizes feature speed over feasibility?",
        category: "communication",
        role: "principal",
        difficulty: "senior",
        sampleAnswer: "When a client wanted to add machine learning features to a microcontroller-based device, I used a capacity analogy: 'Imagine your device as a small office building. You're asking to add a data center's worth of computing in the same space. The physics simply don't allow it.' I then showed concrete numbers: 'Your current processor can handle 1 million calculations per second. Machine learning needs 100 million. That's like asking a bicycle to go highway speeds.' I offered alternatives: 'We can either move to a more powerful processor (which increases cost and power consumption) or implement a hybrid approach where the device handles basic functions and sends complex data to the cloud for ML processing.' I always frame constraints as engineering challenges with solutions, not roadblocks.",
        tips: ["Use physical analogies for abstract concepts", "Provide concrete numbers to illustrate scale", "Frame constraints as engineering challenges", "Always offer alternative solutions"],
        keywords: ["technical communication", "constraint explanation", "client education", "solution alternatives"]
      },
      {
        title: "Persuading Resistant Stakeholders",
        description: "Share a time you had to persuade your team or a client to adopt a solution they were initially resistant to. What approach did you use?",
        category: "communication",
        role: "tech-lead",
        difficulty: "senior",
        sampleAnswer: "My team was resistant to adopting automated testing for embedded systems, arguing it would slow down development. I understood their concern - writing tests for hardware interactions is complex. Instead of mandating it, I proposed a pilot: 'Let's try it on just the communication module for two weeks.' I handled the initial test setup myself and showed them how it caught a race condition that would have taken hours to debug manually. I quantified the benefit: 'This 30-minute test investment saved us 4 hours of debugging time.' I gradually expanded the testing scope, always demonstrating value before adding new requirements. By month three, the team was voluntarily writing tests because they experienced the benefits firsthand. The key was starting small, proving value, and letting them reach the conclusion themselves.",
        tips: ["Start with small pilots to prove value", "Handle initial setup to reduce friction", "Quantify benefits in time/cost savings", "Let stakeholders reach conclusions through experience"],
        keywords: ["stakeholder persuasion", "change management", "pilot programs", "value demonstration"]
      },
      {
        title: "Documenting Architectural Decisions",
        description: "What strategies do you use to document and present architectural decisions to stakeholders? How do you ensure buy-in and understanding?",
        category: "communication",
        role: "architect",
        difficulty: "senior",
        sampleAnswer: "I use a structured ADR (Architecture Decision Record) format that captures: the context, considered options, decision made, and consequences. For stakeholder presentations, I create layered documentation: executive summary for leadership, technical details for engineering teams, and implementation guides for developers. I use visual diagrams extensively - system architecture diagrams, data flow charts, and decision trees. Before presenting, I validate understanding by asking stakeholders to explain the decision back to me in their own words. I also create 'decision artifacts' - prototypes or proof-of-concepts that demonstrate key architectural choices. This makes abstract decisions tangible and helps stakeholders understand implications viscerally rather than just intellectually.",
        tips: ["Use structured decision recording formats", "Create layered documentation for different audiences", "Use visual diagrams extensively", "Validate understanding through stakeholder feedback"],
        keywords: ["architectural documentation", "stakeholder communication", "visual presentation", "decision validation"]
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
