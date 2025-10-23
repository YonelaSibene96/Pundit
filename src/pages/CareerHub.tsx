import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, MapPin, Briefcase, ExternalLink } from "lucide-react";

export default function CareerHub() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!jobTitle.trim() || !location.trim()) {
      toast.error("Please enter both job title and location");
      return;
    }

    setSearching(true);
    // This would connect to a job search API in production
    toast.info("Job search feature coming soon! This will integrate with job boards.");
    setSearching(false);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Career Hub</h1>
          <p className="text-muted-foreground mt-1">
            Discover job opportunities tailored to your career goals
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Job Search</CardTitle>
            </div>
            <CardDescription>
              Find your next career opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="w-full"
              size="lg"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Jobs
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Popular Job Boards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "LinkedIn", url: "https://linkedin.com/jobs" },
              { name: "Indeed", url: "https://indeed.com" },
              { name: "Glassdoor", url: "https://glassdoor.com" },
              { name: "ZipRecruiter", url: "https://ziprecruiter.com" },
              { name: "Monster", url: "https://monster.com" },
              { name: "AngelList", url: "https://angel.co/jobs" },
            ].map((board) => (
              <Card key={board.name} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <a
                    href={board.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group"
                  >
                    <span className="font-semibold">{board.name}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
