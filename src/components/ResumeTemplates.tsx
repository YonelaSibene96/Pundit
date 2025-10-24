import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export type ResumeTemplate = "modern" | "classic" | "creative" | "minimal" | "professional";

interface Template {
  id: ResumeTemplate;
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    text: string;
  };
  previewGradient: string;
}

export const templates: Template[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary with green accents",
    colors: {
      primary: "#059669",
      accent: "#10b981",
      text: "#1f2937",
    },
    previewGradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and professional with blue tones",
    colors: {
      primary: "#1e40af",
      accent: "#3b82f6",
      text: "#1f2937",
    },
    previewGradient: "from-blue-600 to-blue-800",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold and vibrant with purple and pink",
    colors: {
      primary: "#7c3aed",
      accent: "#a855f7",
      text: "#1f2937",
    },
    previewGradient: "from-purple-500 to-pink-600",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant with gray tones",
    colors: {
      primary: "#374151",
      accent: "#6b7280",
      text: "#1f2937",
    },
    previewGradient: "from-gray-600 to-gray-800",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Corporate and refined with navy blue",
    colors: {
      primary: "#1e3a8a",
      accent: "#2563eb",
      text: "#1f2937",
    },
    previewGradient: "from-blue-900 to-indigo-700",
  },
];

interface TemplateCardProps {
  template: Template;
  selected: boolean;
  onSelect: (template: ResumeTemplate) => void;
}

export function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selected ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={() => onSelect(template.id)}
    >
      <CardContent className="p-4 space-y-3">
        <div className={`h-24 rounded-lg bg-gradient-to-br ${template.previewGradient} relative`}>
          {selected && (
            <CheckCircle2 className="absolute top-2 right-2 h-6 w-6 text-white" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-semibold mb-1">A</div>
              <div className="text-[8px] space-y-0.5">
                <div className="h-px bg-white/50 w-12 mx-auto" />
                <div className="h-px bg-white/50 w-10 mx-auto" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm">{template.name}</h3>
          <p className="text-xs text-muted-foreground">{template.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
