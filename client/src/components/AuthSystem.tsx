import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  Briefcase, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  currentRole: string;
  experience: string;
  motivation: string;
}

interface AuthSystemProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthSystem({ onAuthSuccess }: AuthSystemProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [registerData, setRegisterData] = useState<AuthFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    currentRole: "",
    experience: "",
    motivation: ""
  });
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login logic - in real app this would call your authentication API
      if (loginData.email && loginData.password) {
        const mockUser = {
          id: 1,
          name: "Test User",
          email: loginData.email,
          status: "approved"
        };
        
        toast({
          title: "Login Successful",
          description: "Welcome back! You can now access all platform features.",
        });
        
        onAuthSuccess(mockUser);
      } else {
        throw new Error("Please fill all fields");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or account not approved. Please check your email and password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both password fields match.",
        variant: "destructive"
      });
      return;
    }

    if (!registerData.name || !registerData.email || !registerData.password || !registerData.motivation) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, this would create a user with "pending" status
      const applicationData = {
        ...registerData,
        submittedAt: new Date().toISOString(),
        status: "pending"
      };

      toast({
        title: "Application Submitted!",
        description: "Your registration has been sent for admin approval. You'll receive an email within 48 hours with your invitation.",
      });
      
      // Switch to pending status view
      setActiveTab("pending");
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendToAdmin = () => {
    const emailBody = `
New Registration Request - TechSkills Platform

Applicant Details:
- Name: ${registerData.name}
- Email: ${registerData.email}
- Company: ${registerData.company}
- Current Role: ${registerData.currentRole}
- Experience Level: ${registerData.experience}

Motivation:
${registerData.motivation}

Submitted: ${new Date().toLocaleString()}

Please review and approve/reject this application.
    `;

    toast({
      title: "Admin Notification",
      description: "Please send the above details to contact.beta.zbenyasystems@gmail.com for approval.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">TechSkills Platform</CardTitle>
          <p className="text-muted-foreground">
            Advanced Soft Skills Interview Preparation
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Apply for Access</TabsTrigger>
              <TabsTrigger value="pending" disabled={activeTab !== "pending"}>
                Status
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Access Required:</strong> You need admin approval to access this platform. 
                  If you don't have an account, please apply for access first.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@company.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleLogin} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register" className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Admin Approval Required:</strong> All applications are reviewed manually. 
                  You'll receive an email invitation within 48 hours if approved.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@company.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Create password"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={registerData.company}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your Company"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={registerData.currentRole}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, currentRole: e.target.value }))}
                      placeholder="Senior Developer"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Years of Experience</label>
                <select
                  value={registerData.experience}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg"
                >
                  <option value="">Select experience level</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Why do you want to join our platform? *</label>
                <Textarea
                  value={registerData.motivation}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, motivation: e.target.value }))}
                  rows={3}
                  placeholder="Tell us about your goals for improving soft skills and how you plan to use our platform..."
                />
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleRegister} 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting Application..." : "Submit Application"}
                </Button>
                
                <Button 
                  onClick={sendToAdmin} 
                  variant="outline" 
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send to Admin (contact.beta.zbenyasystems@gmail.com)
                </Button>
              </div>
            </TabsContent>

            {/* Pending Status Tab */}
            <TabsContent value="pending" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Application Under Review</h3>
                  <p className="text-muted-foreground">
                    Your application has been submitted and is being reviewed by our admin team.
                  </p>
                </div>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Next Steps:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Your application is in the review queue</li>
                      <li>• Admin team will review within 48 hours</li>
                      <li>• You'll receive an email with login credentials if approved</li>
                      <li>• Check your spam folder for the invitation email</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("login")}
                    className="w-full"
                  >
                    Already have an invitation? Sign In
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}