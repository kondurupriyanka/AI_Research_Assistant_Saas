import { Sparkles } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-[var(--shadow-medium)]">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Research Assistant
        </h1>
        <p className="text-xs text-muted-foreground -mt-1">Streamline your research with AI-powered tools</p>
      </div>
    </div>
  );
};

export default Logo;
