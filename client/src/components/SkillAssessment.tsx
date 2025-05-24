import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, 
  Trophy, 
  TrendingUp, 
  Clock, 
  Star,
  CheckCircle,
  AlertCircle,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface SkillMetric {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  lastPracticed: string;
}

interface AssessmentQuestion {
  id: string;
  scenario: string;
  criteria: string[];
  expectedBehaviors: string[];
}

export default function SkillAssessment() {
  const [selectedSkill, setSelectedSkill] = useState<string>("communication");
  const [selfAssessment, setSelfAssessment] = useState<Record<string, number>>({});
  const [reflectionNotes, setReflectionNotes] = useState<string>("");
  const { toast } = useToast();

  const skillMetrics: SkillMetric[] = [
    {
      skill: "Technical Communication",
      currentLevel: 7,
      targetLevel: 9,
      progress: 78,
      lastPracticed: "2 days ago"
    },
    {
      skill: "Stakeholder Management", 
      currentLevel: 6,
      targetLevel: 8,
      progress: 60,
      lastPracticed: "1 week ago"
    },
    {
      skill: "Team Leadership",
      currentLevel: 5,
      targetLevel: 8,
      progress: 45,
      lastPracticed: "3 days ago"
    },
    {
      skill: "Conflict Resolution",
      currentLevel: 4,
      targetLevel: 7,
      progress: 35,
      lastPracticed: "2 weeks ago"
    },
    {
      skill: "Cross-functional Collaboration",
      currentLevel: 8,
      targetLevel: 9,
      progress: 88,
      lastPracticed: "1 day ago"
    }
  ];

  const assessmentCriteria = {
    communication: [
      "Clarity of technical explanations",
      "Use of appropriate analogies",
      "Audience awareness and adaptation",
      "Active listening and feedback incorporation",
      "Non-verbal communication effectiveness"
    ],
    leadership: [
      "Decision-making under uncertainty",
      "Team motivation and inspiration",
      "Delegation and empowerment",
      "Strategic thinking and vision",
      "Emotional intelligence in management"
    ],
    collaboration: [
      "Cross-team relationship building",
      "Conflict mediation skills",
      "Consensus building abilities",
      "Cultural sensitivity",
      "Remote collaboration effectiveness"
    ],
    "problem-solving": [
      "Systematic problem breakdown",
      "Creative solution generation",
      "Risk assessment and mitigation",
      "Data-driven decision making",
      "Implementation planning"
    ]
  };

  const getSkillColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getSkillStatus = (progress: number) => {
    if (progress >= 80) return { label: "Proficient", icon: CheckCircle, color: "bg-green-100 text-green-800" };
    if (progress >= 60) return { label: "Developing", icon: TrendingUp, color: "bg-blue-100 text-blue-800" };
    if (progress >= 40) return { label: "Learning", icon: Clock, color: "bg-yellow-100 text-yellow-800" };
    return { label: "Needs Focus", icon: AlertCircle, color: "bg-red-100 text-red-800" };
  };

  const handleSelfAssessment = (criterion: string, value: number[]) => {
    setSelfAssessment(prev => ({
      ...prev,
      [criterion]: value[0]
    }));
  };

  const submitAssessment = async () => {
    // Here you would typically submit to an API
    toast({
      title: "Assessment Saved",
      description: "Your self-assessment has been recorded and will influence your personalized learning path.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Skills Overview */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>Soft Skills Assessment Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillMetrics.map((metric, index) => {
              const status = getSkillStatus(metric.progress);
              const StatusIcon = status.icon;
              
              return (
                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">{metric.skill}</h4>
                    <Badge className={`text-xs ${status.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-medium">{metric.currentLevel}/10</span>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Target: {metric.targetLevel}/10</span>
                      <span className={`font-medium ${getSkillColor(metric.progress)}`}>
                        {metric.progress}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last practiced: {metric.lastPracticed}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Self-Assessment Section */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-primary" />
            <CardTitle>Self-Assessment Tool</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Rate yourself on key criteria for each skill area to get personalized recommendations.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Skill Selection */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(assessmentCriteria).map((skill) => (
                <Button
                  key={skill}
                  variant={selectedSkill === skill ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSkill(skill)}
                  className="capitalize"
                >
                  {skill.replace('-', ' ')}
                </Button>
              ))}
            </div>

            {/* Assessment Criteria */}
            <div className="space-y-4">
              <h4 className="font-medium capitalize">
                {selectedSkill.replace('-', ' ')} Assessment
              </h4>
              
              {assessmentCriteria[selectedSkill as keyof typeof assessmentCriteria]?.map((criterion, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">{criterion}</label>
                    <span className="text-sm text-muted-foreground">
                      {selfAssessment[criterion] || 0}/10
                    </span>
                  </div>
                  <Slider
                    value={[selfAssessment[criterion] || 0]}
                    onValueChange={(value) => handleSelfAssessment(criterion, value)}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Reflection Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reflection Notes</label>
              <Textarea
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="What are your main challenges in this skill area? What situations do you want to improve in?"
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={submitAssessment} className="w-full">
              Save Assessment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Learning Path */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary" />
            <CardTitle>Personalized Learning Path</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: "Focus on Conflict Resolution",
                description: "Based on your assessment, this area needs the most attention",
                priority: "High",
                estimatedTime: "2-3 weeks",
                color: "border-red-200 bg-red-50"
              },
              {
                title: "Enhance Stakeholder Management",
                description: "Good foundation, work on advanced negotiation techniques",
                priority: "Medium", 
                estimatedTime: "1-2 weeks",
                color: "border-yellow-200 bg-yellow-50"
              },
              {
                title: "Master Technical Communication",
                description: "You're close to your target - focus on advanced presentations",
                priority: "Low",
                estimatedTime: "1 week",
                color: "border-green-200 bg-green-50"
              }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{item.title}</h4>
                  <Badge variant={item.priority === "High" ? "destructive" : item.priority === "Medium" ? "default" : "secondary"}>
                    {item.priority} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estimated time: {item.estimatedTime}
                  </span>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Start Practice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}