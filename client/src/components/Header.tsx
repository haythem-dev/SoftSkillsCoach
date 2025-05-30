import { Bell, Code, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
  onLogout?: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">TechSkills</h1>
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Interview Preparation Platform
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/'}>
              Dashboard
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/assessment'}>
              Assessment
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/simulator'}>
              Simulator
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/video-interview'}>
              Video Practice
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/virtual-interview'}>
              AI Interview
            </Button>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt="User avatar" />
                <AvatarFallback>
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "AC"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden sm:block">
                {user?.name || "User"}
              </span>
              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
