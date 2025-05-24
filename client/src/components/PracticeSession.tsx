import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Flag, Eye, EyeOff, Lightbulb, Mic, X } from "lucide-react";
import Timer from "@/components/Timer";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Question, PracticeSession as PracticeSessionType, QuestionResponse } from "@shared/schema";

interface PracticeSessionProps {
  role: string;
  category: string;
  onEndSession: () => void;
}

export default function PracticeSession({ role, category, onEndSession }: PracticeSessionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const { toast } = useToast();

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/random", { role, category, limit: "8" }],
    queryFn: async () => {
      const response = await fetch(`/api/questions/random?role=${role}&category=${category}&limit=8`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/sessions", sessionData);
      return response.json();
    },
    onSuccess: (session: PracticeSessionType) => {
      setSessionId(session.id);
    },
  });

  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: any) => {
      const response = await apiRequest("POST", "/api/responses", responseData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Response saved",
        description: "Your answer has been recorded.",
      });
    },
  });

  const flagQuestionMutation = useMutation({
    mutationFn: async ({ responseId, flagged }: { responseId: number; flagged: boolean }) => {
      const response = await apiRequest("PATCH", `/api/responses/${responseId}`, { isFlagged: flagged });
      return response.json();
    },
  });

  useEffect(() => {
    if (questions.length > 0 && !sessionId) {
      createSessionMutation.mutate({
        role,
        category,
        duration: 45,
        totalQuestions: questions.length,
      });
    }
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleNextQuestion = () => {
    if (response.trim() && sessionId && currentQuestion) {
      submitResponseMutation.mutate({
        sessionId,
        questionId: currentQuestion.id,
        response: response.trim(),
        timeSpent,
      });
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setResponse("");
      setShowSampleAnswer(false);
      setTimeSpent(0);
    } else {
      handleEndSession();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setResponse("");
      setShowSampleAnswer(false);
      setTimeSpent(0);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setResponse("");
      setShowSampleAnswer(false);
      setTimeSpent(0);
    }
  };

  const handleEndSession = async () => {
    if (sessionId) {
      try {
        await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
          isActive: false,
          completedAt: new Date().toISOString(),
          questionsCompleted: currentQuestionIndex + 1,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/users/1/progress"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users/1/stats"] });
        
        toast({
          title: "Session completed!",
          description: "Your practice session has been saved.",
        });
      } catch (error) {
        console.error("Failed to end session:", error);
      }
    }
    onEndSession();
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onEndSession}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-2" />
          End Session
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Practice Session</h1>
          <p className="text-sm text-muted-foreground">
            {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} - {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
        
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Timer and Progress */}
      <Card className="tech-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className="question-badge primary">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </Badge>
            <Badge className="question-badge success">
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </Badge>
          </div>
          
          <Timer 
            onTimeUpdate={setTimeSpent}
            duration={45}
          />
        </div>
      </Card>

      {/* Current Question */}
      <Card className="tech-card p-6 mb-6">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge className="question-badge primary">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Badge>
            </div>
            <Button variant="ghost" size="icon">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
          
          <CardTitle className="text-xl text-foreground mb-3">
            {currentQuestion.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-0">
          <p className="text-foreground leading-relaxed mb-6">
            {currentQuestion.description}
          </p>

          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Consider These Points:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                {currentQuestion.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Response Area */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Your Response
            </label>
            <Textarea 
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[128px] resize-none tech-input"
              placeholder="Type your response here... Think about how you would structure your explanation, what analogies you might use, and how you'd address stakeholder concerns."
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Mic className="h-4 w-4 mr-1" />
                Tip: Practice speaking your answer aloud
              </div>
              <div>{getWordCount(response)} words</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Answer */}
      <Card className="tech-card p-6 mb-6">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">Sample Answer</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSampleAnswer(!showSampleAnswer)}
            >
              {showSampleAnswer ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide Answer
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show Answer
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {showSampleAnswer && (
          <CardContent className="px-0">
            <div className="prose prose-sm max-w-none text-foreground mb-4">
              <div dangerouslySetInnerHTML={{ 
                __html: currentQuestion.sampleAnswer.replace(/\n/g, '<br/>') 
              }} />
            </div>
            
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Why This Works:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  {currentQuestion.keywords.map((keyword, index) => (
                    <li key={index}>• Demonstrates {keyword}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="tech-button-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Question
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={handleSkipQuestion}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-accent"
          >
            <Flag className="h-4 w-4 mr-1" />
            Flag for Review
          </Button>
        </div>
        
        <Button
          onClick={handleNextQuestion}
          className="tech-button-primary"
        >
          {currentQuestionIndex === totalQuestions - 1 ? "Finish Session" : "Next Question"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
