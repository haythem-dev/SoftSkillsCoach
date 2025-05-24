import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import AssessmentPage from "@/pages/assessment";
import SimulatorPage from "@/pages/simulator";
import VideoInterviewPage from "@/pages/video-interview";
import VirtualInterviewPage from "@/pages/virtual-interview";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assessment" component={AssessmentPage} />
      <Route path="/simulator" component={SimulatorPage} />
      <Route path="/video-interview" component={VideoInterviewPage} />
      <Route path="/virtual-interview" component={VirtualInterviewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
