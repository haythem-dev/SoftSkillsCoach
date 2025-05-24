import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Play,
  Square,
  MessageSquare,
  Clock,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  User,
  Bot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InterviewMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

interface InterviewerProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  personality: string;
  specialties: string[];
}

export default function VirtualInterviewer() {
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>("sarah");
  const [interviewLevel, setInterviewLevel] = useState<string>("mid");
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [showBetaForm, setShowBetaForm] = useState(false);
  const [betaFormData, setBetaFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    experience: "",
    motivation: ""
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const interviewers: InterviewerProfile[] = [
    {
      id: "sarah",
      name: "Sarah Chen",
      role: "Senior Technical Recruiter",
      company: "TechCorp",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      personality: "Friendly but thorough, focuses on behavioral questions",
      specialties: ["Communication", "Teamwork", "Problem-solving"]
    },
    {
      id: "marcus",
      name: "Marcus Rodriguez", 
      role: "Engineering Manager",
      company: "InnovateLabs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      personality: "Direct and analytical, emphasizes technical leadership",
      specialties: ["Technical Leadership", "System Design", "Mentoring"]
    },
    {
      id: "aisha",
      name: "Dr. Aisha Patel",
      role: "VP of Engineering",
      company: "Global Solutions",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      personality: "Strategic thinker, focuses on high-level impact",
      specialties: ["Strategic Planning", "Cross-functional Leadership", "Innovation"]
    }
  ];

  const questionsByLevel = {
    junior: [
      "Tell me about yourself and why you're interested in this role.",
      "Describe a challenging bug you fixed and how you approached it.",
      "How do you handle feedback from senior developers?",
      "Tell me about a time you had to learn a new technology quickly."
    ],
    mid: [
      "Walk me through a project where you had to collaborate with multiple teams.",
      "Describe a situation where you had to make a technical decision with incomplete information.",
      "How do you approach mentoring junior developers?",
      "Tell me about a time when you had to push back on a product requirement."
    ],
    senior: [
      "How would you architect a system to handle 10x current traffic?",
      "Describe a time when you had to lead a technical decision that was controversial.",
      "How do you balance technical debt with feature delivery?",
      "Tell me about a time you had to influence stakeholders without direct authority."
    ]
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = (isDemo = false) => {
    setIsInterviewActive(true);
    setIsDemoMode(isDemo);
    setTimeElapsed(0);
    setMessages([]);
    setOverallScore(0);
    
    const interviewer = interviewers.find(i => i.id === selectedInterviewer)!;
    const openingMessage: InterviewMessage = {
      role: 'interviewer',
      content: isDemo 
        ? `Hi! Welcome to the demo version of our AI interview system. I'm ${interviewer.name}, and I'll give you a quick 2.5-minute preview of what our full interview experience offers. Ready to see how it works?`
        : `Hi! I'm ${interviewer.name}, ${interviewer.role} at ${interviewer.company}. Thank you for taking the time to interview with us today. I'm excited to learn more about your experience and how you approach technical challenges. Shall we get started?`,
      timestamp: new Date()
    };
    
    setMessages([openingMessage]);
    
    // Simulate asking first question after a brief pause
    setTimeout(() => {
      const questions = questionsByLevel[interviewLevel as keyof typeof questionsByLevel];
      const firstQuestion = isDemo 
        ? "For this demo, tell me briefly about a recent project you worked on and what role you played in it."
        : questions[0];
      const questionMessage: InterviewMessage = {
        role: 'interviewer',
        content: firstQuestion,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, questionMessage]);
    }, 2000);
    
    toast({
      title: isDemo ? "Demo Started" : "Interview Started",
      description: isDemo ? "Experience a 2.5-minute preview of our AI interview system!" : "Your virtual interview has begun. Good luck!",
    });
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setIsListening(false);
    
    const finalScore = Math.round(overallScore / Math.max(messages.filter(m => m.role === 'candidate').length, 1));
    
    const closingMessage: InterviewMessage = {
      role: 'interviewer',
      content: isDemoMode 
        ? `Great demo session! You've experienced our AI interview system. Your demo score is ${finalScore}/10. To access the full 30-minute interviews and advanced features, please request beta access. We'd love to have you join our platform!`
        : `Thank you for your time today! Based on our conversation, I'd say you demonstrated strong technical communication skills. Your overall performance score is ${finalScore}/10. We'll be in touch soon with next steps.`,
      timestamp: new Date(),
      score: finalScore
    };
    
    setMessages(prev => [...prev, closingMessage]);
    
    // Auto-end demo after 2.5 minutes
    if (isDemoMode && timeElapsed >= 150) {
      setTimeout(() => {
        setShowBetaForm(true);
      }, 3000);
    }
    
    toast({
      title: isDemoMode ? "Demo Completed" : "Interview Completed",
      description: isDemoMode 
        ? `Demo finished! Score: ${finalScore}/10. Request beta access for full features.`
        : `Your final score: ${finalScore}/10. Check the feedback for areas to improve.`,
    });
  };

  const simulateInterviewerResponse = (candidateResponse: string) => {
    // Simulate AI analysis of response
    const responseLength = candidateResponse.length;
    const hasSpecificExample = candidateResponse.toLowerCase().includes('example') || candidateResponse.toLowerCase().includes('time when');
    const mentionsTeamwork = candidateResponse.toLowerCase().includes('team') || candidateResponse.toLowerCase().includes('collaborate');
    
    // Calculate score based on response quality
    let score = 5; // baseline
    if (responseLength > 100) score += 1;
    if (responseLength > 200) score += 1;
    if (hasSpecificExample) score += 2;
    if (mentionsTeamwork) score += 1;
    
    score = Math.min(10, score);
    
    // Generate feedback
    let feedback = "Good response. ";
    if (!hasSpecificExample) feedback += "Try to include specific examples next time. ";
    if (responseLength < 100) feedback += "Consider providing more detail. ";
    if (score >= 8) feedback = "Excellent response with good structure and specific examples!";
    
    // Update candidate message with score and feedback
    setMessages(prev => prev.map((msg, index) => 
      index === prev.length - 1 && msg.role === 'candidate' 
        ? { ...msg, score, feedback }
        : msg
    ));
    
    // Update overall score
    setOverallScore(prev => prev + score);
    
    // Generate follow-up question or interviewer response
    setTimeout(() => {
      const questions = questionsByLevel[interviewLevel as keyof typeof questionsByLevel];
      const candidateResponses = messages.filter(m => m.role === 'candidate').length;
      
      let interviewerResponse = "";
      
      if (candidateResponses < questions.length) {
        // Ask next question
        interviewerResponse = `That's interesting. ${questions[candidateResponses]}`;
      } else {
        // Wrap up or ask follow-up
        const followUps = [
          "Can you elaborate on that a bit more?",
          "What would you do differently if you faced that situation again?",
          "How did that experience change your approach to similar challenges?",
          "What did you learn from that experience?"
        ];
        interviewerResponse = followUps[Math.floor(Math.random() * followUps.length)];
      }
      
      const responseMessage: InterviewMessage = {
        role: 'interviewer',
        content: interviewerResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const submitResponse = () => {
    if (!currentResponse.trim()) return;
    
    const responseMessage: InterviewMessage = {
      role: 'candidate',
      content: currentResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, responseMessage]);
    setCurrentResponse("");
    
    // Simulate interviewer processing the response
    setTimeout(() => {
      simulateInterviewerResponse(currentResponse);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8) return CheckCircle;
    if (score >= 6) return TrendingUp;
    if (score >= 4) return Star;
    return AlertTriangle;
  };

  const submitBetaRequest = async () => {
    const emailContent = `
Beta Access Request for TechSkills Platform

Name: ${betaFormData.name}
Email: ${betaFormData.email}
Company: ${betaFormData.company}
Current Role: ${betaFormData.role}
Years of Experience: ${betaFormData.experience}
Motivation: ${betaFormData.motivation}

Submitted at: ${new Date().toLocaleString()}
    `;

    try {
      toast({
        title: "Beta Request Submitted!",
        description: "Thank you! Please email this info to contact.beta.zbenyasystems@gmail.com. We'll send an invitation within 48 hours.",
      });
      
      setShowBetaForm(false);
      setBetaFormData({
        name: "",
        email: "",
        company: "",
        role: "",
        experience: "",
        motivation: ""
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please contact us directly at contact.beta.zbenyasystems@gmail.com",
        variant: "destructive"
      });
    }
  };

  const interviewer = interviewers.find(i => i.id === selectedInterviewer)!;

  // Beta Access Form
  if (showBetaForm) {
    return (
      <Card className="tech-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Request Beta Access</CardTitle>
          <p className="text-muted-foreground">
            Join our exclusive beta program to access the full AI interview platform
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <input
                type="text"
                value={betaFormData.name}
                onChange={(e) => setBetaFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Address *</label>
              <input
                type="email"
                value={betaFormData.email}
                onChange={(e) => setBetaFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                placeholder="john@company.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Company</label>
              <input
                type="text"
                value={betaFormData.company}
                onChange={(e) => setBetaFormData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                placeholder="TechCorp"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <input
                type="text"
                value={betaFormData.role}
                onChange={(e) => setBetaFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                placeholder="Senior Developer"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Years of Experience</label>
            <select
              value={betaFormData.experience}
              onChange={(e) => setBetaFormData(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
            >
              <option value="">Select experience level</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Why do you want to join our beta program? *</label>
            <Textarea
              value={betaFormData.motivation}
              onChange={(e) => setBetaFormData(prev => ({ ...prev, motivation: e.target.value }))}
              className="mt-1"
              rows={4}
              placeholder="Tell us about your interest in improving your soft skills and how you plan to use our platform..."
              required
            />
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Note:</strong> Please send the form details to <strong>contact.beta.zbenyasystems@gmail.com</strong> after submission. We'll review your application and send an invitation within 48 hours.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => setShowBetaForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitBetaRequest}
              disabled={!betaFormData.name || !betaFormData.email || !betaFormData.motivation}
            >
              Submit Beta Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isInterviewActive) {
    return (
      <div className="space-y-6">
        {/* Setup Section */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle>Virtual Interview Setup</CardTitle>
            <p className="text-muted-foreground">
              Configure your 30-minute virtual interview session with AI-powered real-time evaluation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interviewer Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Your Interviewer</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {interviewers.map((interviewer) => (
                  <Card 
                    key={interviewer.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedInterviewer === interviewer.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedInterviewer(interviewer.id)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar>
                        <AvatarImage src={interviewer.avatar} alt={interviewer.name} />
                        <AvatarFallback>{interviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">{interviewer.name}</h4>
                        <p className="text-xs text-muted-foreground">{interviewer.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{interviewer.personality}</p>
                    <div className="flex flex-wrap gap-1">
                      {interviewer.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Level Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Interview Level</label>
              <Select value={interviewLevel} onValueChange={setInterviewLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior Level (1-3 years experience)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-7 years experience)</SelectItem>
                  <SelectItem value="senior">Senior Level (7+ years experience)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Interview */}
            <div className="text-center pt-4 space-y-3">
              <Button onClick={() => startInterview(true)} size="lg" className="w-full max-w-md" variant="outline">
                <Play className="h-5 w-5 mr-2" />
                Try 2.5-Minute Demo (Free)
              </Button>
              <Button onClick={() => setShowBetaForm(true)} size="lg" className="w-full max-w-md">
                <User className="h-5 w-5 mr-2" />
                Request Beta Access for Full Interview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <Card className="tech-card">
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Real-time Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Interactive conversation with AI interviewer</li>
                  <li>• Instant response evaluation and scoring</li>
                  <li>• Personalized feedback after each answer</li>
                  <li>• Adaptive follow-up questions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Evaluation Criteria:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Communication clarity and structure</li>
                  <li>• Use of specific examples (STAR method)</li>
                  <li>• Technical depth and accuracy</li>
                  <li>• Leadership and collaboration skills</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interview Header */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={interviewer.avatar} alt={interviewer.name} />
                <AvatarFallback>{interviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{interviewer.name}</h3>
                <p className="text-sm text-muted-foreground">{interviewer.role} at {interviewer.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)} / 30:00</span>
              </div>
              <Badge variant="outline">
                {interviewLevel.charAt(0).toUpperCase() + interviewLevel.slice(1)} Level
              </Badge>
              <Button onClick={endInterview} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-1" />
                End Interview
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="tech-card">
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'candidate' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {message.role === 'candidate' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="text-xs font-medium">
                      {message.role === 'candidate' ? 'You' : interviewer.name}
                    </span>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Score and Feedback for candidate responses */}
                  {message.role === 'candidate' && message.score && (
                    <div className="mt-2 pt-2 border-t border-primary-foreground/20">
                      <div className="flex items-center space-x-2 mb-1">
                        {(() => {
                          const ScoreIcon = getScoreIcon(message.score);
                          return <ScoreIcon className={`h-4 w-4 ${getScoreColor(message.score)}`} />;
                        })()}
                        <span className={`text-xs font-medium ${getScoreColor(message.score)}`}>
                          Score: {message.score}/10
                        </span>
                      </div>
                      {message.feedback && (
                        <p className="text-xs opacity-90">{message.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Response Input */}
          <div className="border-t p-4 space-y-3">
            <Textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response here... Remember to use specific examples and be detailed in your answer."
              className="min-h-[100px] resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <Mic className="h-4 w-4 mr-1" />
                  Voice Response (Coming Soon)
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentResponse.length} characters
                </span>
              </div>
              <Button 
                onClick={submitResponse} 
                disabled={!currentResponse.trim()}
                className="min-w-24"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Performance Metrics */}
      <Card className="tech-card">
        <CardHeader>
          <CardTitle className="text-lg">Live Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {messages.filter(m => m.role === 'candidate').length}
              </div>
              <div className="text-sm text-muted-foreground">Responses Given</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {Math.round(overallScore / Math.max(messages.filter(m => m.role === 'candidate').length, 1)) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg Score /10</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">
                {Math.round(timeElapsed / 60)}
              </div>
              <div className="text-sm text-muted-foreground">Minutes Elapsed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Math.round((30 - timeElapsed / 60))}
              </div>
              <div className="text-sm text-muted-foreground">Minutes Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}