import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  initialTime?: number; // in seconds
  onComplete?: () => void;
  onTick?: (timeRemaining: number) => void;
}

export function useTimer({ 
  initialTime = 0, 
  onComplete, 
  onTick 
}: UseTimerOptions = {}) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(newTime ?? initialTime);
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          const newTime = prevTime - 1;
          
          if (onTick) {
            onTick(newTime);
          }
          
          if (newTime <= 0) {
            setIsRunning(false);
            if (onComplete) {
              onComplete();
            }
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onComplete, onTick]);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    start,
    pause,
    reset,
    stop,
    formatTime: () => formatTime(timeRemaining),
  };
}
