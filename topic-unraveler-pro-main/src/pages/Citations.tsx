import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, Upload, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Citation {
  reference: string;
  style: string;
}

interface CitationResult {
  citations: Citation[];
  summary?: string;
  chartSuggestion?: string;
}

const Citations = () => {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("APA");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CitationResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim() && !file) {
      toast({
        title: "Input required",
        description: "Please enter a research topic or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let fileContent = "";
      if (file) {
        fileContent = await file.text();
      }

      const { data, error } = await supabase.functions.invoke("generate-citations", {
        body: { topic, style, fileContent, fileName: file?.name },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Citations generated",
        description: "Your citations have been formatted successfully",
      });
    } catch (error) {
      console.error("Citation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate citations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copied",
      description: "Citation copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Citations Manager
        </h1>
        <p className="text-muted-foreground text-lg">
          Organize and format your research citations in APA, MLA, or Chicago style
        </p>
      </div>

      <Card className="shadow-[var(--shadow-medium)] mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Citations
          </CardTitle>
          <CardDescription>
            Format references and extract insights from uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Research Topic</label>
            <Textarea
              placeholder="Enter your research topic or context..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Citation Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Upload Document (Optional)</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".txt,.csv,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Click to upload PDF, CSV, or TXT file"}
                </p>
              </label>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="gradient-primary text-white hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Citations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {result.summary && (
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader>
                <CardTitle>Document Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{result.summary}</p>
                {result.chartSuggestion && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                    <p className="text-sm">
                      <span className="font-semibold">Chart Suggestion:</span> {result.chartSuggestion}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Formatted Citations ({style})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.citations.map((citation, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-muted/30 border border-border flex items-start justify-between gap-3"
                >
                  <p className="text-sm flex-1">{citation.reference}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(citation.reference, idx)}
                    className="flex-shrink-0"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Citations;
