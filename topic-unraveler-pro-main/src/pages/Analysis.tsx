import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  insights: Array<{ title: string; summary: string }>;
  comparisons: Array<{ aspect: string; options: string[]; details: string[] }>;
  visualizations: Array<{ type: string; description: string; purpose: string }>;
}

const Analysis = () => {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a research topic to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-research", {
        body: { topic },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Your research analysis has been generated successfully",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze research topic",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Research Analysis
        </h1>
        <p className="text-muted-foreground text-lg">
          Dive deep into your research with AI-powered analysis and insights
        </p>
      </div>

      <Card className="shadow-[var(--shadow-medium)] mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Analyze Research Topic
          </CardTitle>
          <CardDescription>
            Get insights, comparisons, and visualization suggestions for your research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Research Topic</label>
            <Textarea
              placeholder="Enter your research topic or paste your research context..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="gradient-primary text-white hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analyze Research
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.insights.map((insight, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                  <p className="text-muted-foreground">{insight.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Comparisons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold">Aspect</th>
                      <th className="text-left p-3 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparisons.map((comp, idx) => (
                      <tr key={idx} className="border-b border-border">
                        <td className="p-3 font-medium">{comp.aspect}</td>
                        <td className="p-3">
                          <div className="space-y-2">
                            {comp.options.map((opt, i) => (
                              <div key={i}>
                                <span className="font-medium">{opt}:</span>{" "}
                                <span className="text-muted-foreground">{comp.details[i]}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Visualization Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.visualizations.map((viz, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg gradient-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{viz.type}</h3>
                      <p className="text-muted-foreground mb-2">{viz.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Purpose:</span> {viz.purpose}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analysis;
