import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SynthesisResult {
  executiveSummary: string;
  keyInsights: Array<{ title: string; content: string; visual: string }>;
  implications: string;
  recommendations: string[];
}

const Synthesis = () => {
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const { toast } = useToast();

  const handleSynthesize = async () => {
    if (!context.trim()) {
      toast({
        title: "Input required",
        description: "Please enter your research context",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("synthesize-research", {
        body: { context },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Synthesis complete",
        description: "Your research report has been generated successfully",
      });
    } catch (error) {
      console.error("Synthesis error:", error);
      toast({
        title: "Synthesis failed",
        description: error instanceof Error ? error.message : "Failed to synthesize research",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!result) return;

    const content = `
EXECUTIVE SUMMARY
${result.executiveSummary}

KEY INSIGHTS
${result.keyInsights.map((insight, i) => `
${i + 1}. ${insight.title}
${insight.content}
Visual Suggestion: ${insight.visual}
`).join('\n')}

ETHICAL & REAL-WORLD IMPLICATIONS
${result.implications}

RECOMMENDATIONS
${result.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-synthesis.txt";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Your research synthesis has been downloaded",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Research Synthesis
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your research into comprehensive reports and summaries
        </p>
      </div>

      <Card className="shadow-[var(--shadow-medium)] mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Generate Research Report
          </CardTitle>
          <CardDescription>
            AI-powered synthesis with executive summary and actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Research Context</label>
            <Textarea
              placeholder="Paste your research findings, data, and insights here..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <Button
            onClick={handleSynthesize}
            disabled={isLoading}
            className="gradient-primary text-white hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate Synthesis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={exportReport}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{result.executiveSummary}</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Key Insights with Visuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.keyInsights.map((insight, idx) => (
                <div key={idx} className="p-5 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                      <p className="text-muted-foreground mb-3">{insight.content}</p>
                      <div className="p-3 rounded-md bg-card border border-border">
                        <p className="text-sm">
                          <span className="font-semibold text-primary">Visual:</span> {insight.visual}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Ethical & Real-World Implications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{result.implications}</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full gradient-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-muted-foreground flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Synthesis;
