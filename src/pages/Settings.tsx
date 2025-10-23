import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User, HelpCircle, Trash2 } from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all user data
      await supabase.from("resumes").delete().eq("user_id", user.id);
      await supabase.from("cover_letters").delete().eq("user_id", user.id);
      await supabase.from("job_searches").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("user_id", user.id);

      // Sign out
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error deleting account");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile?.full_name || "Not set"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Desired Role</Label>
              <Input value={profile?.desired_role || "Not set"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Career Motivation</Label>
              <Input value={profile?.career_motivation || "Not set"} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>FAQs & Support</CardTitle>
            </div>
            <CardDescription>Get help with using Pundit</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I generate a resume?</AccordionTrigger>
                <AccordionContent>
                  Click on "Create Resume" from the dashboard or navigate to the Generate page. Enter your professional bio, and our AI will create a comprehensive resume for you.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I edit my resume after generating it?</AccordionTrigger>
                <AccordionContent>
                  Yes! After generating a resume, you can edit all sections, change fonts and colors, and choose different layouts.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I download my resume?</AccordionTrigger>
                <AccordionContent>
                  In the resume editor, you'll find download and copy options to save your resume in various formats.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What is the Career Hub?</AccordionTrigger>
                <AccordionContent>
                  The Career Hub helps you search for job opportunities based on your desired role and location. It provides links to popular job boards.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                Need more help? Contact us at{" "}
                <a href="mailto:support@pundit.com" className="text-primary hover:underline">
                  support@pundit.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data including resumes, cover letters, and profile information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
