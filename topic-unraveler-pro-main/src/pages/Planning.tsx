import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SubtopicCard from "@/components/SubtopicCard";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Subtopic {
  title: string;
  description: string;
  importance: string;
  actionSteps: string[];
  category: string;
}

const Planning = () => {
  const [topic, setTopic] = useState("");
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSubtopics = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a research topic");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-subtopics", {
        body: { topic },
      });

      if (error) throw error;

      setSubtopics(data.subtopics);
      toast.success("Research plan generated successfully!");
    } catch (error) {
      console.error("Error generating subtopics:", error);
      toast.error("Failed to generate research plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Research Planning
        </h1>
        <p className="text-muted-foreground text-lg">
          Enter your research topic and let AI break it down into actionable subtopics
        </p>
      </div>

      <Card className="mb-8 shadow-[var(--shadow-medium)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Define Your Research Topic
          </CardTitle>
          <CardDescription>
            Be specific about what you want to research. The more detailed your topic, the better the AI can help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., The impact of AI-powered SaaS platforms on enterprise productivity and revenue models (2023-2025)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <Button
            onClick={handleGenerateSubtopics}
            disabled={isLoading}
            className="w-full sm:w-auto gradient-primary border-0"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Research Plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Research Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {subtopics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Research Subtopics</h2>
          <div className="grid gap-4">
            {subtopics.map((subtopic, index) => (
              <SubtopicCard key={index} {...subtopic} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && subtopics.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <p className="text-muted-foreground text-lg">
            Enter a research topic above to get started with your research plan
          </p>
        </div>
      )}
    </div>
  );
};

export default Planning;
