import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import InterviewSimulator from "@/components/InterviewSimulator";
import type { User } from "@shared/schema";

export default function SimulatorPage() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Header user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Interview Simulator</h1>
          <p className="text-muted-foreground text-lg">
            Practice with realistic interview scenarios and get instant feedback
          </p>
        </div>
        
        <InterviewSimulator />
      </div>
    </div>
  );
}