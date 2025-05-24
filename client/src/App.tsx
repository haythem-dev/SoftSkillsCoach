import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthSystem from "@/components/AuthSystem";
import Dashboard from "@/pages/dashboard";
import AssessmentPage from "@/pages/assessment";
import SimulatorPage from "@/pages/simulator";
import VideoInterviewPage from "@/pages/video-interview";
import VirtualInterviewPage from "@/pages/virtual-interview";
import NotFound from "@/pages/not-found";

function Router({ user }: { user: any }) {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard user={user} />} />
      <Route path="/assessment" component={() => <AssessmentPage user={user} />} />
      <Route path="/simulator" component={() => <SimulatorPage user={user} />} />
      <Route path="/video-interview" component={() => <VideoInterviewPage user={user} />} />
      <Route path="/virtual-interview" component={() => <VirtualInterviewPage user={user} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('authenticatedUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleAuthSuccess = (user: any) => {
    localStorage.setItem('authenticatedUser', JSON.stringify(user));
    setAuthenticatedUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('authenticatedUser');
    setAuthenticatedUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {!authenticatedUser ? (
          <AuthSystem onAuthSuccess={handleAuthSuccess} />
        ) : (
          <Router user={authenticatedUser} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
