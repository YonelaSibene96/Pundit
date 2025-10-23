import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, FileText, Plus, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    career_goal: "",
    desired_title: "",
    desired_start_date: null as Date | null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchProfile();
    };
    checkAuth();
  }, [navigate]);

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
      setFormData({
        career_goal: data.career_goal || "",
        desired_title: data.desired_title || "",
        desired_start_date: data.desired_start_date ? new Date(data.desired_start_date) : null,
      });
    } catch (error: any) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          career_goal: formData.career_goal,
          desired_title: formData.desired_title,
          desired_start_date: formData.desired_start_date?.toISOString().split('T')[0],
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Career goals updated!");
      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error("Error updating profile");
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {profile?.full_name || "User"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your career journey with Pundit
            </p>
          </div>
          <Button onClick={() => navigate("/generate")} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Resume
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Career Goals</CardTitle>
                </div>
                {!editing && (
                  <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>Track and update your career objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="career_goal">Career Goal</Label>
                    <Input
                      id="career_goal"
                      placeholder="Your career aspirations..."
                      value={formData.career_goal}
                      onChange={(e) =>
                        setFormData({ ...formData, career_goal: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desired_title">Desired Title</Label>
                    <Input
                      id="desired_title"
                      placeholder="Senior Software Engineer"
                      value={formData.desired_title}
                      onChange={(e) =>
                        setFormData({ ...formData, desired_title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desired Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.desired_start_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.desired_start_date ? (
                            format(formData.desired_start_date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.desired_start_date || undefined}
                          onSelect={(date) =>
                            setFormData({ ...formData, desired_start_date: date || null })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          career_goal: profile.career_goal || "",
                          desired_title: profile.desired_title || "",
                          desired_start_date: profile.desired_start_date
                            ? new Date(profile.desired_start_date)
                            : null,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground">Career Goal</div>
                    <div className="font-medium">
                      {profile?.career_goal || "Not set"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Desired Title</div>
                    <div className="font-medium">
                      {profile?.desired_title || "Not set"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Target Start Date</div>
                    <div className="font-medium">
                      {profile?.desired_start_date
                        ? format(new Date(profile.desired_start_date), "PPP")
                        : "Not set"}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <CardDescription>Jump into resume creation and management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate("/generate")}
              >
                <div className="text-left">
                  <div className="font-semibold">Generate New Resume</div>
                  <div className="text-sm text-muted-foreground">
                    Create a resume with AI assistance
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate("/history")}
              >
                <div className="text-left">
                  <div className="font-semibold">View Resume History</div>
                  <div className="text-sm text-muted-foreground">
                    Access your saved templates
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => navigate("/career-hub")}
              >
                <div className="text-left">
                  <div className="font-semibold">Explore Career Hub</div>
                  <div className="text-sm text-muted-foreground">
                    Search for job opportunities
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
