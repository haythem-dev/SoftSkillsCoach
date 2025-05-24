import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  userId?: number;
}

interface UserStats {
  questionsCompleted: number;
  practiceHours: number;
  skillsImproved: number;
  currentStreak: number;
}

export default function StatsOverview({ userId = 1 }: StatsOverviewProps) {
  const { data: stats } = useQuery<UserStats>({
    queryKey: [`/api/users/${userId}/stats`],
  });

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      value: stats.questionsCompleted,
      label: "Questions Completed",
      color: "text-primary",
    },
    {
      value: stats.practiceHours,
      label: "Hours Practiced",
      color: "text-accent",
    },
    {
      value: stats.skillsImproved,
      label: "Skills Improved",
      color: "text-orange-500",
    },
    {
      value: stats.currentStreak,
      label: "Day Streak",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="stats-card">
          <CardContent>
            <div className={`stats-number ${stat.color}`}>
              {stat.value}
            </div>
            <div className="stats-label">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
