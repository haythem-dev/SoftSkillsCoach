import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Code, Users, Sword, Laptop } from "lucide-react";
import type { UserProgress } from "@shared/schema";

const roles = [
  {
    id: "software-developer",
    title: "Software Developer",
    subtitle: "Junior → Senior",
    icon: Code,
  },
  {
    id: "tech-lead",
    title: "Tech Lead",
    subtitle: "Team Leadership",
    icon: Users,
  },
  {
    id: "architect",
    title: "Solution Architect",
    subtitle: "System Design",
    icon: Sword,
  },
  {
    id: "principal",
    title: "Principal Engineer",
    subtitle: "Technical Strategy",
    icon: Laptop,
  },
];

const categories = [
  { id: "communication", label: "Communication" },
  { id: "collaboration", label: "Collaboration" },
  { id: "leadership", label: "Leadership" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "technical-mentoring", label: "Technical Mentoring" },
];

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function RoleSelector({
  selectedRole,
  onRoleChange,
  selectedCategory,
  onCategoryChange,
}: RoleSelectorProps) {
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ["/api/users/1/progress"],
  });

  const getProgressForCategory = (category: string) => {
    const categoryProgress = progress.find(
      p => p.role === selectedRole && p.category === category
    );
    return categoryProgress?.averageScore || 0;
  };

  const getProgressColor = (score: number) => {
    if (score >= 75) return "bg-accent";
    if (score >= 50) return "bg-primary";
    return "bg-orange-400";
  };

  return (
    <Card className="tech-card sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Select Your Track
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Button
                key={role.id}
                variant="ghost"
                className={`w-full p-3 h-auto justify-start ${
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "role-card"
                }`}
                onClick={() => onRoleChange(role.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="font-medium">{role.title}</div>
                    <div className={`text-sm ${
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}>
                      {role.subtitle}
                    </div>
                  </div>
                  <Icon className={`h-5 w-5 ${
                    isSelected ? "text-primary-foreground" : "text-muted-foreground"
                  }`} />
                </div>
              </Button>
            );
          })}
        </div>

        {/* Category Selection */}
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3">Practice Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-sm ${
                  selectedCategory === category.id
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3">Progress Overview</h4>
          <div className="space-y-3">
            {categories.slice(0, 3).map((category) => {
              const score = getProgressForCategory(category.id);
              return (
                <div key={category.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{category.label}</span>
                    <span className="text-muted-foreground">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${getProgressColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </Progress>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
