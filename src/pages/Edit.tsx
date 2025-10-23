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
import { Download, Loader2, Plus, Trash2 } from "lucide-react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 20 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  contact: { fontSize: 10, color: "#666", marginBottom: 3 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 8, color: "#059669", borderBottom: "2 solid #059669", paddingBottom: 3 },
  text: { marginBottom: 5, lineHeight: 1.4 },
  listItem: { marginBottom: 3, paddingLeft: 15 },
  experienceItem: { marginBottom: 10 },
  bold: { fontWeight: "bold" },
});

const ResumePDF = ({ content }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.name}>{content.fullName}</Text>
        <Text style={pdfStyles.contact}>{content.location}</Text>
        <Text style={pdfStyles.contact}>{content.contact.email} | {content.contact.phone}</Text>
        {content.contact.linkedin && <Text style={pdfStyles.contact}>{content.contact.linkedin}</Text>}
      </View>

      {content.summary && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
          <Text style={pdfStyles.text}>{content.summary}</Text>
        </View>
      )}

      {content.skills?.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>SKILLS</Text>
          <Text style={pdfStyles.text}>{content.skills.join(" • ")}</Text>
        </View>
      )}

      {content.experience?.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>EXPERIENCE</Text>
          {content.experience.map((exp: any, idx: number) => (
            <View key={idx} style={pdfStyles.experienceItem}>
              <Text style={pdfStyles.bold}>{exp.title} - {exp.company}</Text>
              <Text style={pdfStyles.text}>{exp.period}</Text>
              {exp.description?.map((desc: string, i: number) => (
                <Text key={i} style={pdfStyles.listItem}>• {desc}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {content.education?.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>EDUCATION</Text>
          {content.education.map((edu: any, idx: number) => (
            <View key={idx} style={pdfStyles.experienceItem}>
              <Text style={pdfStyles.bold}>{edu.degree}</Text>
              <Text style={pdfStyles.text}>{edu.institution} - {edu.year}</Text>
            </View>
          ))}
        </View>
      )}

      {content.certifications?.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>CERTIFICATIONS</Text>
          {content.certifications.map((cert: string, idx: number) => (
            <Text key={idx} style={pdfStyles.listItem}>• {cert}</Text>
          ))}
        </View>
      )}

      {content.projects?.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>PROJECTS</Text>
          {content.projects.map((proj: any, idx: number) => (
            <View key={idx} style={pdfStyles.experienceItem}>
              <Text style={pdfStyles.bold}>{proj.name}</Text>
              <Text style={pdfStyles.text}>{proj.description}</Text>
              <Text style={pdfStyles.text}>Technologies: {proj.technologies.join(", ")}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<any>(null);

  useEffect(() => {
    fetchResume();
  }, [id]);

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
              document={<ResumePDF content={resume.content} />}
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
                      <h2 className="text-2xl font-bold">{resume.content.fullName}</h2>
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
                        <h3 className="font-bold text-primary mb-2">PROFESSIONAL SUMMARY</h3>
                        <p className="text-sm">{resume.content.summary}</p>
                      </div>
                    )}

                    {resume.content.skills?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-primary mb-2">SKILLS</h3>
                        <p className="text-sm">{resume.content.skills.join(" • ")}</p>
                      </div>
                    )}

                    {resume.content.experience?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-primary mb-2">EXPERIENCE</h3>
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
                        <h3 className="font-bold text-primary mb-2">EDUCATION</h3>
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
                        <h3 className="font-bold text-primary mb-2">CERTIFICATIONS</h3>
                        {resume.content.certifications.map((cert: string, idx: number) => (
                          <p key={idx} className="text-sm ml-4">• {cert}</p>
                        ))}
                      </div>
                    )}

                    {resume.content.projects?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-primary mb-2">PROJECTS</h3>
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
      </div>
    </Layout>
  );
}
