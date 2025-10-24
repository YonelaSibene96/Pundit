import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Loader2, Plus, Trash2, FileText, Save, Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CardDescription } from "@/components/ui/card";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { templates, TemplateCard, ResumeTemplate } from "@/components/ResumeTemplates";

const getTemplateStyles = (template: ResumeTemplate) => {
  const templateConfig = templates.find(t => t.id === template) || templates[0];
  
  return StyleSheet.create({
    page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
    header: { marginBottom: 20 },
    name: { fontSize: 24, fontWeight: "bold", marginBottom: 5, color: templateConfig.colors.primary },
    contact: { fontSize: 10, color: "#666", marginBottom: 3 },
    section: { marginBottom: 15 },
    sectionTitle: { 
      fontSize: 14, 
      fontWeight: "bold", 
      marginBottom: 8, 
      color: templateConfig.colors.primary, 
      borderBottom: `2 solid ${templateConfig.colors.primary}`, 
      paddingBottom: 3 
    },
    text: { marginBottom: 5, lineHeight: 1.4, color: templateConfig.colors.text },
    listItem: { marginBottom: 3, paddingLeft: 15, color: templateConfig.colors.text },
    experienceItem: { marginBottom: 10 },
    bold: { fontWeight: "bold", color: templateConfig.colors.text },
    coverLetterHeader: { fontSize: 16, fontWeight: "bold", marginBottom: 4, color: templateConfig.colors.primary },
    coverLetterContact: { fontSize: 10, color: "#666", marginBottom: 2 },
    coverLetterSpacer: { fontSize: 10, marginBottom: 15 },
    coverLetterBody: { fontSize: 11, lineHeight: 1.6, textAlign: "justify", color: templateConfig.colors.text },
  });
};

const ResumePDF = ({ content, template }: any) => {
  const styles = getTemplateStyles(template);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{content.fullName}</Text>
          <Text style={styles.contact}>{content.location}</Text>
          <Text style={styles.contact}>{content.contact.email} | {content.contact.phone}</Text>
          {content.contact.linkedin && <Text style={styles.contact}>{content.contact.linkedin}</Text>}
        </View>

        {content.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.text}>{content.summary}</Text>
          </View>
        )}

        {content.skills?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            <Text style={styles.text}>{content.skills.join(" • ")}</Text>
          </View>
        )}

        {content.experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            {content.experience.map((exp: any, idx: number) => (
              <View key={idx} style={styles.experienceItem}>
                <Text style={styles.bold}>{exp.title} - {exp.company}</Text>
                <Text style={styles.text}>{exp.period}</Text>
                {exp.description?.map((desc: string, i: number) => (
                  <Text key={i} style={styles.listItem}>• {desc}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {content.education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {content.education.map((edu: any, idx: number) => (
              <View key={idx} style={styles.experienceItem}>
                <Text style={styles.bold}>{edu.degree}</Text>
                <Text style={styles.text}>{edu.institution} - {edu.year}</Text>
              </View>
            ))}
          </View>
        )}

        {content.certifications?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
            {content.certifications.map((cert: string, idx: number) => (
              <Text key={idx} style={styles.listItem}>• {cert}</Text>
            ))}
          </View>
        )}

        {content.projects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {content.projects.map((proj: any, idx: number) => (
              <View key={idx} style={styles.experienceItem}>
                <Text style={styles.bold}>{proj.name}</Text>
                <Text style={styles.text}>{proj.description}</Text>
                <Text style={styles.text}>Technologies: {proj.technologies.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("modern");

  useEffect(() => {
    fetchResume();
    fetchProfile();
    fetchCoverLetter();
  }, [id]);

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
      console.error("Profile fetch error:", error);
    }
  };

  const fetchCoverLetter = async () => {
    try {
      const { data, error } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("resume_id", id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCoverLetter(data.content);
      }
    } catch (error: any) {
      console.error("Cover letter fetch error:", error);
    }
  };

  const fetchResume = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setResume(data);
    } catch (error: any) {
      toast.error("Failed to load resume");
      navigate("/history");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("resumes")
        .update({ content: resume.content })
        .eq("id", id);

      if (error) throw error;
      toast.success("Resume saved successfully!");
    } catch (error: any) {
      toast.error("Failed to save resume");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!profile?.full_name) {
      toast.error("Please complete your profile with your full name first");
      navigate("/settings");
      return;
    }

    setGeneratingCoverLetter(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          resumeContent: resume.content,
          profile: profile,
        },
      });

      if (error) throw error;

      const coverLetterText = data.coverLetter;
      setCoverLetter(coverLetterText);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("cover_letters")
        .upsert({
          resume_id: id,
          user_id: user.id,
          content: coverLetterText,
        }, {
          onConflict: "resume_id",
        });

      toast.success("Cover letter generated successfully!");
    } catch (error: any) {
      console.error("Generate cover letter error:", error);
      toast.error(error.message || "Failed to generate cover letter");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const updateContent = (path: string[], value: any) => {
    setResume((prev: any) => {
      const newContent = { ...prev.content };
      let current = newContent;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return { ...prev, content: newContent };
    });
  };

  const addExperience = () => {
    const newExp = { title: "", company: "", period: "", description: [""] };
    updateContent(["experience"], [...(resume.content.experience || []), newExp]);
  };

  const removeExperience = (idx: number) => {
    updateContent(["experience"], resume.content.experience.filter((_: any, i: number) => i !== idx));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const CoverLetterPDF = () => {
    const styles = getTemplateStyles(selectedTemplate);
    
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.coverLetterHeader}>{profile?.full_name || ""}</Text>
            {resume?.content?.contact?.email && (
              <Text style={styles.coverLetterContact}>{resume.content.contact.email}</Text>
            )}
            {resume?.content?.contact?.phone && (
              <Text style={styles.coverLetterContact}>{resume.content.contact.phone}</Text>
            )}
            {resume?.content?.location && (
              <Text style={styles.coverLetterContact}>{resume.content.location}</Text>
            )}
            <Text style={styles.coverLetterSpacer}> </Text>
            <Text style={styles.coverLetterBody}>{coverLetter}</Text>
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{resume.title}</h1>
            <p className="text-muted-foreground">Edit and export your resume</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
            <PDFDownloadLink
              document={<ResumePDF content={resume.content} template={selectedTemplate} />}
              fileName={`${resume.content.fullName}_Resume.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button variant="outline">
                  {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PDF
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-6 w-6 text-primary" />
              <CardTitle>Design Templates</CardTitle>
            </div>
            <CardDescription>
              Choose a template design for your resume and cover letter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={selectedTemplate === template.id}
                  onSelect={setSelectedTemplate}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={resume.content.fullName}
                    onChange={(e) => updateContent(["fullName"], e.target.value)}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={resume.content.location}
                    onChange={(e) => updateContent(["location"], e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={resume.content.contact.email}
                    onChange={(e) => updateContent(["contact", "email"], e.target.value)}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={resume.content.contact.phone}
                    onChange={(e) => updateContent(["contact", "phone"], e.target.value)}
                  />
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <Input
                    value={resume.content.contact.linkedin || ""}
                    onChange={(e) => updateContent(["contact", "linkedin"], e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resume.content.summary}
                  onChange={(e) => updateContent(["summary"], e.target.value)}
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resume.content.skills?.join(", ") || ""}
                  onChange={(e) => updateContent(["skills"], e.target.value.split(",").map((s: string) => s.trim()))}
                  placeholder="Separate skills with commas"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Experience</CardTitle>
                  <Button size="sm" onClick={addExperience}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.content.experience?.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <Label>Experience {idx + 1}</Label>
                      <Button size="sm" variant="ghost" onClick={() => removeExperience(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].title = e.target.value;
                        updateContent(["experience"], newExp);
                      }}
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].company = e.target.value;
                        updateContent(["experience"], newExp);
                      }}
                    />
                    <Input
                      placeholder="Period (e.g., 2020-2023)"
                      value={exp.period}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].period = e.target.value;
                        updateContent(["experience"], newExp);
                      }}
                    />
                    <Textarea
                      placeholder="Description (one point per line)"
                      value={exp.description?.join("\n") || ""}
                      onChange={(e) => {
                        const newExp = [...resume.content.experience];
                        newExp[idx].description = e.target.value.split("\n");
                        updateContent(["experience"], newExp);
                      }}
                      rows={3}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/50 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Resume Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-background rounded-lg border shadow-sm">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h2 
                        className="text-2xl font-bold" 
                        style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                      >
                        {resume.content.fullName}
                      </h2>
                      <p className="text-sm text-muted-foreground">{resume.content.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {resume.content.contact.email} | {resume.content.contact.phone}
                      </p>
                      {resume.content.contact.linkedin && (
                        <p className="text-sm text-muted-foreground">{resume.content.contact.linkedin}</p>
                      )}
                    </div>

                    {resume.content.summary && (
                      <div>
                        <h3 
                          className="font-bold mb-2" 
                          style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                        >
                          PROFESSIONAL SUMMARY
                        </h3>
                        <p className="text-sm">{resume.content.summary}</p>
                      </div>
                    )}

                    {resume.content.skills?.length > 0 && (
                      <div>
                        <h3 
                          className="font-bold mb-2" 
                          style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                        >
                          SKILLS
                        </h3>
                        <p className="text-sm">{resume.content.skills.join(" • ")}</p>
                      </div>
                    )}

                    {resume.content.experience?.length > 0 && (
                      <div>
                        <h3 
                          className="font-bold mb-2" 
                          style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                        >
                          EXPERIENCE
                        </h3>
                        {resume.content.experience.map((exp: any, idx: number) => (
                          <div key={idx} className="mb-3">
                            <p className="font-semibold text-sm">{exp.title} - {exp.company}</p>
                            <p className="text-xs text-muted-foreground">{exp.period}</p>
                            {exp.description?.map((desc: string, i: number) => (
                              <p key={i} className="text-sm ml-4">• {desc}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {resume.content.education?.length > 0 && (
                      <div>
                        <h3 
                          className="font-bold mb-2" 
                          style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                        >
                          EDUCATION
                        </h3>
                        {resume.content.education.map((edu: any, idx: number) => (
                          <div key={idx} className="mb-2">
                            <p className="font-semibold text-sm">{edu.degree}</p>
                            <p className="text-xs text-muted-foreground">{edu.institution} - {edu.year}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {resume.content.certifications?.length > 0 && (
                      <div>
                        <h3 
                          className="font-bold mb-2" 
                          style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                        >
                          CERTIFICATIONS
                        </h3>
                        {resume.content.certifications.map((cert: string, idx: number) => (
                          <p key={idx} className="text-sm ml-4">• {cert}</p>
                        ))}
                      </div>
                    )}

                    {resume.content.projects?.length > 0 && (
                      <div>
                        <h3 
                          className="font-bold mb-2" 
                          style={{ color: templates.find(t => t.id === selectedTemplate)?.colors.primary }}
                        >
                          PROJECTS
                        </h3>
                        {resume.content.projects.map((proj: any, idx: number) => (
                          <div key={idx} className="mb-2">
                            <p className="font-semibold text-sm">{proj.name}</p>
                            <p className="text-sm">{proj.description}</p>
                            <p className="text-xs text-muted-foreground">Technologies: {proj.technologies.join(", ")}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>Cover Letter</CardTitle>
              </div>
              {!coverLetter ? (
                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCoverLetter}
                >
                  {generatingCoverLetter ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              ) : (
                <PDFDownloadLink
                  document={<CoverLetterPDF />}
                  fileName={`${profile?.full_name || "cover"}_CoverLetter.pdf`}
                >
                  {({ loading: pdfLoading }) => (
                    <Button>
                      {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                      Download Cover Letter
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
            <CardDescription>
              {coverLetter
                ? "Your AI-generated cover letter with personal details"
                : "Generate a professional cover letter matching your resume"}
            </CardDescription>
          </CardHeader>
          {coverLetter && (
            <CardContent className="space-y-4">
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                <div className="font-semibold text-lg">{profile?.full_name}</div>
                {resume?.content?.contact?.email && (
                  <div className="text-sm text-muted-foreground">
                    {resume.content.contact.email}
                  </div>
                )}
                {resume?.content?.contact?.phone && (
                  <div className="text-sm text-muted-foreground">
                    {resume.content.contact.phone}
                  </div>
                )}
                {resume?.content?.location && (
                  <div className="text-sm text-muted-foreground">
                    {resume.content.location}
                  </div>
                )}
              </div>
              <Separator />
              <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-background rounded-lg border">
                {coverLetter}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCoverLetter}
                  variant="outline"
                  size="sm"
                >
                  {generatingCoverLetter ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate"
                  )}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
}
