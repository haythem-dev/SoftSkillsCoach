import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import RoleSelector from "@/components/RoleSelector";
import PracticeSession from "@/components/PracticeSession";
import StatsOverview from "@/components/StatsOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Users, Sword, Laptop } from "lucide-react";
import type { User } from "@shared/schema";

const roleInfo = {
  "software-developer": {
    title: "Software Developer",
    subtitle: "Junior → Senior",
    icon: Code,
    description: "Individual contributor track"
  },
  "tech-lead": {
    title: "Tech Lead",
    subtitle: "Team Leadership",
    icon: Users,
    description: "Leading development teams"
  },
  "architect": {
    title: "Solution Architect",
    subtitle: "System Design",
    icon: Sword,
    description: "Technical architecture"
  },
  "principal": {
    title: "Principal Engineer",
    subtitle: "Technical Strategy",
    icon: Laptop,
    description: "Senior technical leadership"
  }
} as const;

export default function Dashboard() {
  const [selectedRole, setSelectedRole] = useState<string>("software-developer");
  const [selectedCategory, setSelectedCategory] = useState<string>("communication");
  const [isSessionActive, setIsSessionActive] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const handleStartPractice = () => {
    setIsSessionActive(true);
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
  };

  if (isSessionActive) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <Header user={user} />
        <PracticeSession
          role={selectedRole}
          category={selectedCategory}
          onEndSession={handleEndSession}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="tech-gradient text-white border-none">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-2">Master Your Technical Soft Skills</h2>
              <p className="text-blue-100 text-lg mb-6">
                Practice interview scenarios tailored to your role and seniority level
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Laptop className="h-8 w-8 mb-2" />
                  <h3 className="font-semibold mb-1">Individual Contributors</h3>
                  <p className="text-sm text-blue-100">Junior to Senior Developer tracks</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Users className="h-8 w-8 mb-2" />
                  <h3 className="font-semibold mb-1">Team Leadership</h3>
                  <p className="text-sm text-blue-100">Tech Lead and Engineering Manager</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <Sword className="h-8 w-8 mb-2" />
                  <h3 className="font-semibold mb-1">Technical Strategy</h3>
                  <p className="text-sm text-blue-100">Principal Engineer and Architect</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RoleSelector
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="tech-card p-6 mb-6">
              <div className="text-center mb-6">
                <div className="mb-4">
                  {(() => {
                    const role = roleInfo[selectedRole as keyof typeof roleInfo];
                    const Icon = role.icon;
                    return (
                      <div className="flex items-center justify-center mb-4">
                        <Icon className="h-12 w-12 text-primary mr-3" />
                        <div className="text-left">
                          <h3 className="text-2xl font-bold text-foreground">{role.title}</h3>
                          <p className="text-muted-foreground">{role.subtitle}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="mb-6">
                  <Badge className="question-badge success mb-2">
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Skills
                  </Badge>
                  <p className="text-muted-foreground">
                    Practice {selectedCategory} scenarios for {roleInfo[selectedRole as keyof typeof roleInfo].title.toLowerCase()} role
                  </p>
                </div>

                <Button 
                  onClick={handleStartPractice}
                  size="lg"
                  className="tech-button-primary text-lg px-8 py-4"
                >
                  Start Practice Session
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">5-8</div>
                  <div className="text-sm text-muted-foreground">Questions per session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">30-60</div>
                  <div className="text-sm text-muted-foreground">Minutes duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">Real</div>
                  <div className="text-sm text-muted-foreground">Interview scenarios</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview userId={user?.id} />
      </div>
    </div>
  );
}
