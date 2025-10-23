import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, desired_role")
          .eq("user_id", session.user.id)
          .single();

        if (profile?.full_name && profile?.desired_role) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      } else {
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center">
        <div className="animate-pulse text-primary text-2xl font-bold">Loading Pundit...</div>
      </div>
    </div>
  );
};

export default Index;
