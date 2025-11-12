import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, FileText, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Generate() {
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, DOC, or TXT file");
      return;
    }

    setUploadedFile(file);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Read file as base64 for parsing
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string;
          
          // For text files, extract directly
          if (file.type === "text/plain") {
            const text = await file.text();
            setExtractedText(text);
            toast.success("Resume uploaded successfully!");
          } else {
            // For PDF/DOCX, we'll send to backend for parsing
            const { data, error } = await supabase.functions.invoke("parse-resume", {
              body: { fileData: base64, fileName: file.name }
            });

            if (error) throw error;
            setExtractedText(data.text || "");
            toast.success("Resume uploaded and parsed successfully!");
          }
        } catch (error: any) {
          console.error("Parse error:", error);
          toast.error("Failed to parse resume. Please try writing your bio manually.");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume");
      setLoading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedText("");
  };

  const handleGenerate = async () => {
    const contentToGenerate = extractedText || bio;
    if (!contentToGenerate.trim()) {
      toast.error("Please enter your bio or upload a resume");
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
          bio: contentToGenerate,
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
              Upload your existing resume or write your bio. Our AI will create a beautiful professional resume for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="write" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write Bio</TabsTrigger>
                <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              </TabsList>
              
              <TabsContent value="write" className="space-y-4 mt-4">
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
              </TabsContent>

              <TabsContent value="upload" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <Label>Upload Your Resume</Label>
                  
                  {!uploadedFile ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, DOCX, DOC, or TXT (MAX. 20MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={handleFileUpload}
                        disabled={loading}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {extractedText && (
                    <div className="space-y-2">
                      <Label>Extracted Content Preview</Label>
                      <Textarea
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        rows={8}
                        className="resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        You can edit the extracted text before generating
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleGenerate}
              disabled={loading || (!bio.trim() && !extractedText.trim())}
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
                  Generate Beautiful Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
