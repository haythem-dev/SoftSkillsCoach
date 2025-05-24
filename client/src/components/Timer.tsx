import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimerProps {
  onTimeUpdate?: (timeInSeconds: number) => void;
  duration?: number; // in minutes
}

export default function Timer({ onTimeUpdate, duration = 45 }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (onTimeUpdate) {
            onTimeUpdate((selectedDuration * 60) - newTime);
          }
          
          if (newTime <= 0) {
            setIsRunning(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate, selectedDuration]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(selectedDuration * 60);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

  const handleDurationChange = (newDuration: string) => {
    const duration = parseInt(newDuration);
    setSelectedDuration(duration);
    setTimeRemaining(duration * 60);
    setIsRunning(false);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="timer-display">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-muted-foreground">Time Remaining</div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleStart}
          disabled={isRunning || timeRemaining === 0}
          className="tech-button-primary"
        >
          <Play className="h-4 w-4 mr-1" />
          Start
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePause}
          disabled={!isRunning}
          className="tech-button-secondary"
        >
          <Pause className="h-4 w-4 mr-1" />
          Pause
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="tech-button-secondary"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
      
      <Select value={selectedDuration.toString()} onValueChange={handleDurationChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="30">30 minutes</SelectItem>
          <SelectItem value="45">45 minutes</SelectItem>
          <SelectItem value="60">60 minutes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
