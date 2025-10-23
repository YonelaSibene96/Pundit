import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function Generate() {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!bio.trim()) {
      toast.error("Please enter your bio");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: {
          bio,
          profile: profile || {},
        },
      });

      if (error) throw error;

      const { data: resume, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: `Resume - ${new Date().toLocaleDateString()}`,
          content: data.resume,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Resume generated successfully!");
      navigate(`/edit/${resume.id}`);
    } catch (error: any) {
      console.error("Generate error:", error);
      toast.error(error.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Generate Resume with AI</CardTitle>
            </div>
            <CardDescription>
              Tell us about your experience, skills, and career goals. Our AI will create a professional resume for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Your Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="I'm a software engineer with 5 years of experience in full-stack development. I've worked with React, Node.js, and AWS. I led a team that built a scalable e-commerce platform serving 100k+ users. I'm passionate about clean code and user experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={12}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Include your work experience, education, skills, projects, and anything else relevant to your career.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !bio.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating your resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
