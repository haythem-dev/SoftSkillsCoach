import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video, 
  Mic, 
  Camera, 
  StopCircle, 
  Play,
  RotateCcw,
  Star,
  Clock,
  User,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InterviewerProfile {
  name: string;
  role: string;
  company: string;
  avatar: string;
  specialty: string[];
  interviewStyle: string;
}

export default function InterviewSimulator() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [response, setResponse] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selectedInterviewer, setSelectedInterviewer] = useState(0);
  const [confidenceLevel, setConfidenceLevel] = useState([5]);
  const { toast } = useToast();

  const interviewers: InterviewerProfile[] = [
    {
      name: "Sarah Chen",
      role: "Senior Engineering Manager",
      company: "Tech Corp",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      specialty: ["Team Leadership", "Communication", "Technical Strategy"],
      interviewStyle: "Collaborative and detail-oriented"
    },
    {
      name: "Marcus Rodriguez",
      role: "Principal Architect",
      company: "Innovation Labs",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      specialty: ["System Design", "Problem Solving", "Stakeholder Management"],
      interviewStyle: "Direct and problem-focused"
    },
    {
      name: "Dr. Aisha Patel",
      role: "VP of Engineering",
      company: "Global Solutions",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      specialty: ["Leadership", "Cross-functional Collaboration", "Strategic Planning"],
      interviewStyle: "Strategic and big-picture thinking"
    }
  ];

  const simulationQuestions = [
    {
      category: "Leadership Challenge",
      question: "Tell me about a time when you had to lead a project with unclear requirements and a tight deadline. How did you navigate the ambiguity?",
      followUp: "What would you do differently if faced with a similar situation again?",
      evaluationCriteria: ["Problem-solving approach", "Leadership style", "Communication", "Adaptability"]
    },
    {
      category: "Conflict Resolution",
      question: "Describe a situation where you had to resolve a technical disagreement between team members. How did you facilitate the resolution?",
      followUp: "How do you typically prevent such conflicts from escalating?",
      evaluationCriteria: ["Mediation skills", "Technical judgment", "Team dynamics", "Communication"]
    },
    {
      category: "Stakeholder Management", 
      question: "Walk me through how you would explain a critical system outage to both technical and non-technical stakeholders in a crisis situation.",
      followUp: "How would you maintain stakeholder confidence during extended downtimes?",
      evaluationCriteria: ["Crisis communication", "Audience adaptation", "Transparency", "Leadership under pressure"]
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeElapsed(0);
    toast({
      title: "Interview Started",
      description: "Your simulation interview has begun. Take your time to think through your response.",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast({
      title: "Response Recorded",
      description: "Your answer has been captured. You can review it before moving to the next question.",
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < simulationQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setResponse("");
      setTimeElapsed(0);
      setConfidenceLevel([5]);
    }
  };

  const resetSimulation = () => {
    setCurrentQuestion(0);
    setResponse("");
    setTimeElapsed(0);
    setIsRecording(false);
    setConfidenceLevel([5]);
  };

  const currentQ = simulationQuestions[currentQuestion];
  const interviewer = interviewers[selectedInterviewer];

  return (
    <div className="space-y-6">
      {/* Interviewer Selection */}
      <Card className="tech-card">
        <CardHeader>
          <CardTitle>Choose Your Interviewer</CardTitle>
          <p className="text-muted-foreground">
            Select an interviewer profile to customize the simulation experience
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {interviewers.map((interviewer, index) => (
              <Card 
                key={index}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedInterviewer === index ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedInterviewer(index)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar>
                    <AvatarImage src={interviewer.avatar} alt={interviewer.name} />
                    <AvatarFallback>{interviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{interviewer.name}</h4>
                    <p className="text-sm text-muted-foreground">{interviewer.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{interviewer.company}</p>
                  <div className="flex flex-wrap gap-1">
                    {interviewer.specialty.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Style: {interviewer.interviewStyle}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interview Simulation */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={interviewer.avatar} alt={interviewer.name} />
                <AvatarFallback>{interviewer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{interviewer.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{interviewer.role} at {interviewer.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Question {currentQuestion + 1}/{simulationQuestions.length}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <Badge className="bg-blue-100 text-blue-800">
                {currentQ.category}
              </Badge>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-foreground leading-relaxed mb-3">
                "{currentQ.question}"
              </p>
              {currentQ.followUp && (
                <p className="text-sm text-muted-foreground italic">
                  Follow-up: {currentQ.followUp}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Evaluation criteria:</span>
              {currentQ.evaluationCriteria.map((criteria, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {criteria}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Start Response</span>
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" size="lg" className="flex items-center space-x-2">
                <StopCircle className="h-5 w-5" />
                <span>Stop Recording</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <span>{isRecording ? 'Recording...' : 'Ready'}</span>
            </div>
          </div>

          {/* Response Area */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Response Notes</label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Write your key points here as you speak, or detailed notes after recording..."
              className="min-h-[120px]"
            />
          </div>

          {/* Self-Assessment */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Response Confidence Level</label>
            <div className="space-y-2">
              <Slider
                value={confidenceLevel}
                onValueChange={setConfidenceLevel}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not confident</span>
                <span className="font-medium">{confidenceLevel[0]}/10</span>
                <span>Very confident</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Simulation
            </Button>
            
            <div className="flex items-center space-x-2">
              {currentQuestion < simulationQuestions.length - 1 ? (
                <Button onClick={nextQuestion}>
                  Next Question
                </Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Interview
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Panel */}
      <Card className="tech-card">
        <CardHeader>
          <CardTitle className="text-lg">Interview Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Before You Start:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Take 30 seconds to think before speaking</li>
                <li>• Structure your answer (Situation, Task, Action, Result)</li>
                <li>• Prepare specific examples from your experience</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">During the Response:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Speak clearly and at a measured pace</li>
                <li>• Make eye contact with the camera</li>
                <li>• Use specific examples and quantify results</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}