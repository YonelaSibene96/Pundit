import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Pundit</h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Build Your Professional Resume in Minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            AI-powered resume generation, customizable templates, and career management tools all in one place.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm">AI-Powered Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm">Multiple Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-sm">Career Hub</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <AuthForm mode={mode} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
