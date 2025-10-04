import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SubtopicCardProps {
  title: string;
  description: string;
  importance: string;
  actionSteps: string[];
  category?: string;
}

const SubtopicCard = ({ title, description, importance, actionSteps, category }: SubtopicCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="card-hover cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {category && (
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-primary mb-2">Why This Matters</h4>
              <p className="text-sm text-muted-foreground">{importance}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm text-primary mb-2">Action Steps</h4>
              <ul className="space-y-2">
                {actionSteps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-secondary font-semibold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubtopicCard;
