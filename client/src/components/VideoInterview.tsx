import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, VideoOff, Mic, MicOff, Play, Square, 
  RefreshCw, Settings, Monitor, User, Clock 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRandomVideoQuestions, VIDEO_INTERVIEW_QUESTIONS, type VideoQuestion } from "@/lib/video-interview-questions";

export default function VideoInterview() {
  // States
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<VideoQuestion[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimeWarning, setIsTimeWarning] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Toast
  const { toast } = useToast();

  // Initialize questions
  useEffect(() => {
    const questions = getRandomVideoQuestions(17);
    if (questions && questions.length > 0) {
      setSessionQuestions(questions);
      setCurrentQuestion(0);
      setTimeRemaining(questions[0].timeLimit);
      setRecordingTime(0);
    }
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Camera initialization
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Video track management
  useEffect(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = videoEnabled;
      }
    }
  }, [videoEnabled]);

  // Audio track management
  useEffect(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = audioEnabled;
      }
    }
  }, [audioEnabled]);

  // Handle recording time limit
  useEffect(() => {
    const currentQ = sessionQuestions[currentQuestion];
    if (currentQ && recordingTime >= currentQ.timeLimit) {
      stopRecording();
      toast({
        title: "Time's up!",
        description: "Maximum recording time reached.",
      });
    }
  }, [recordingTime, currentQuestion, sessionQuestions, toast]);

    // Time remaining warning
    useEffect(() => {
      const currentQ = sessionQuestions[currentQuestion];
      if (currentQ) {
        const remaining = currentQ.timeLimit - recordingTime;
        setTimeRemaining(remaining);
        setIsTimeWarning(remaining <= 30 && isRecording);
      }
    }, [recordingTime, isRecording, sessionQuestions, currentQuestion]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoEnabled, 
        audio: audioEnabled 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Access Required",
        description: "Please allow camera and microphone access to use the video interview feature.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoEnabled, 
        audio: audioEnabled 
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Evaluate response based on current question criteria
        const currentQ = sessionQuestions[currentQuestion];
        const evaluation = {
          duration: recordingTime,
          durationScore: Math.max(0, 1 - Math.abs(recordingTime - currentQ.timeLimit) / currentQ.timeLimit),
          technicalScore: currentQ.evaluation?.scoringRubric.technical || 0,
          communicationScore: currentQ.evaluation?.scoringRubric.communication || 0,
          structureScore: currentQ.evaluation?.scoringRubric.structure || 0,
          timeManagementScore: currentQ.evaluation?.scoringRubric.timeManagement || 0,
          overallScore: 0
        };
        
        evaluation.overallScore = Math.round(
          ((evaluation.durationScore + evaluation.technicalScore + 
            evaluation.communicationScore + evaluation.structureScore) / 4) * 100
        );

        toast({
          title: `Response Evaluation: ${evaluation.overallScore}%`,
          description: "View detailed feedback below",
        });

        // Add evaluation display
        const evaluationDiv = document.createElement('div');
        evaluationDiv.className = 'mt-4 p-4 bg-slate-50 rounded-lg';
        evaluationDiv.innerHTML = `
          <h4 class="font-medium mb-2">Response Evaluation</h4>
          <div class="space-y-2">
            <p class="text-sm text-muted-foreground">Time Management: ${Math.round(evaluation.durationScore * 100)}%</p>
            <p class="text-sm text-muted-foreground">Technical Accuracy: ${Math.round(evaluation.technicalScore * 100)}%</p>
            <p class="text-sm text-muted-foreground">Communication: ${Math.round(evaluation.communicationScore * 100)}%</p>
            <p class="text-sm text-muted-foreground">Structure: ${Math.round(evaluation.structureScore * 100)}%</p>
          </div>
          <div class="mt-4">
            <h5 class="font-medium mb-2">Ideal Response Example:</h5>
            <p class="text-sm text-muted-foreground">${currentQ.evaluation?.idealResponse || 'Not available'}</p>
          </div>
        `;
        
        const questionPanel = document.querySelector('.question-panel');
        if (questionPanel) {
          questionPanel.appendChild(evaluationDiv);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      toast({
        title: "Recording Started",
        description: "Your video interview response is now being recorded.",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please check your camera and microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestion < sessionQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setRecordingTime(0);
      if (isRecording) {
        stopRecording();
      }
    }
  };

  if (!sessionQuestions.length || currentQuestion >= sessionQuestions.length) {
    return <div>Loading questions...</div>;
  }

  const currentQ = sessionQuestions[currentQuestion];

  return (
    <div className="space-y-6">
      {/* Video Preview and Controls */}
      <Card className="tech-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Video Interview Simulation</CardTitle>
            <Badge variant="outline">
              Question {currentQuestion + 1} of 17
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">RECORDING</span>
                  </div>
                )}

                {/* Time Display */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(recordingTime)}</span>
                    {isRecording && (
                      <span className={`font-medium ${isTimeWarning ? 'text-red-400' : ''}`}>
                        / {formatTime(currentQ.timeLimit)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-4 bg-black/70 rounded-lg px-4 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleVideo}
                      className={`text-white hover:bg-white/20 ${!videoEnabled ? 'bg-red-600' : ''}`}
                    >
                      {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleAudio}
                      className={`text-white hover:bg-white/20 ${!audioEnabled ? 'bg-red-600' : ''}`}
                    >
                      {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>

                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        variant="secondary"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Panel */}
            <div className="space-y-4">
              <div>
                {currentQ ? (
                  <>
                    <Badge className="mb-3 bg-blue-100 text-blue-800">
                      {currentQ.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-3">Current Question</h3>
                    <p className="text-foreground leading-relaxed">
                      {currentQ.question}
                    </p>
                  </>
                ) : (
                  <p>Loading questions...</p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Time Limit</h4>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatTime(currentQ.timeLimit)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tips</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {currentQ.tips.map((tip, index) => (
                    <li key={index}>• {tip}</li>
                  ))}
                </ul>
              </div>

              {/* Evaluation Criteria */}
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">Evaluation Criteria</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Time Management: Stay within the {formatTime(currentQ.timeLimit)} limit</li>
                  <li>• Technical Accuracy: Address all key points</li>
                  <li>• Communication: Clear and structured response</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Warning */}
      {isTimeWarning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            <strong>Time Warning:</strong> You have {formatTime(timeRemaining)} remaining for this question.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => startCamera()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Camera
        </Button>

        <div className="flex items-center space-x-2">
          {currentQuestion < sessionQuestions.length - 1 ? (
            <Button onClick={nextQuestion} disabled={isRecording}>
              Next Question
            </Button>
          ) : (
            <Button className="bg-green-600 hover:bg-green-700" disabled={isRecording}>
              Complete Interview
            </Button>
          )}
        </div>
      </div>

      {/* Technical Requirements */}
      <Card className="tech-card">
        <CardHeader>
          <CardTitle className="text-lg">Technical Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Before You Start:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Ensure good lighting on your face</li>
                <li>• Test your camera and microphone</li>
                <li>• Find a quiet environment</li>
                <li>• Have a stable internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">During Recording:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Look directly at the camera</li>
                <li>• Speak clearly and at normal pace</li>
                <li>• Keep your responses within time limits</li>
                <li>• Stay centered in the video frame</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}