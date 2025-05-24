import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Flag, Lightbulb, Mic } from "lucide-react";
import type { Question } from "@shared/schema";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  response: string;
  onResponseChange: (response: string) => void;
  onFlag?: () => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  response,
  onResponseChange,
  onFlag,
}: QuestionCardProps) {
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <Card className="tech-card">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className="question-badge primary">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge className="question-badge success">
              {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onFlag}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
        
        <CardTitle className="text-xl text-foreground">
          {question.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-foreground leading-relaxed mb-6">
          {question.description}
        </p>

        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Consider These Points:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              {question.tips.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Response Area */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-foreground">
            Your Response
          </label>
          <Textarea 
            value={response}
            onChange={(e) => onResponseChange(e.target.value)}
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

        {/* Sample Answer */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Sample Answer</h4>
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
          
          {showSampleAnswer && (
            <div>
              <div className="prose prose-sm max-w-none text-foreground mb-4">
                <div dangerouslySetInnerHTML={{ 
                  __html: question.sampleAnswer.replace(/\n/g, '<br/>') 
                }} />
              </div>
              
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Why This Works:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    {question.keywords.map((keyword, index) => (
                      <li key={index}>• Demonstrates {keyword}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
