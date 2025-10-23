import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    desired_role: "",
    career_motivation: "",
  });
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && (!formData.full_name || !formData.desired_role)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (step === 2 && !formData.career_motivation) {
      toast.error("Please select your career motivation");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleComplete = async (method: "upload" | "generate") => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile created successfully!");
      
      if (method === "generate") {
        navigate("/generate");
      } else {
        navigate("/upload");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">Step {step} of 3</div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-12 rounded-full transition-colors ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Tell us about yourself"}
            {step === 2 && "What's driving your career move?"}
            {step === 3 && "Choose your approach"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's start with the basics"}
            {step === 2 && "Help us understand your goals"}
            {step === 3 && "How would you like to create your resume?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desired_role">Desired Role</Label>
                <Input
                  id="desired_role"
                  placeholder="Software Engineer"
                  value={formData.desired_role}
                  onChange={(e) =>
                    setFormData({ ...formData, desired_role: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <RadioGroup
              value={formData.career_motivation}
              onValueChange={(value) =>
                setFormData({ ...formData, career_motivation: value })
              }
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="develop_skills" id="develop_skills" />
                <Label htmlFor="develop_skills" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Develop Skills</div>
                  <div className="text-sm text-muted-foreground">
                    Looking to grow and learn new technologies
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="switch_career" id="switch_career" />
                <Label htmlFor="switch_career" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Switch Careers</div>
                  <div className="text-sm text-muted-foreground">
                    Transitioning to a different field or industry
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="new_career" id="new_career" />
                <Label htmlFor="new_career" className="flex-1 cursor-pointer">
                  <div className="font-semibold">New Career Path</div>
                  <div className="text-sm text-muted-foreground">
                    Starting fresh in the professional world
                  </div>
                </Label>
              </div>
            </RadioGroup>
          )}

          {step === 3 && (
            <div className="grid gap-4">
              <Button
                onClick={() => handleComplete("upload")}
                disabled={loading}
                variant="outline"
                className="h-auto p-6 justify-start"
              >
                <div className="text-left">
                  <div className="font-semibold text-lg mb-1">Upload Existing Resume</div>
                  <div className="text-sm text-muted-foreground">
                    Start with your current resume and enhance it with AI
                  </div>
                </div>
              </Button>
              <Button
                onClick={() => handleComplete("generate")}
                disabled={loading}
                className="h-auto p-6 justify-start"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="text-left">
                    <div className="font-semibold text-lg mb-1">Generate New Resume</div>
                    <div className="text-sm opacity-90">
                      Let AI create a professional resume from scratch
                    </div>
                  </div>
                )}
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {step < 3 && (
              <Button onClick={handleNext} className="ml-auto">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
