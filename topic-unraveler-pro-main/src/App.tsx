import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Logo from "./components/Logo";
import Navigation from "./components/Navigation";
import Planning from "./pages/Planning";
import Analysis from "./pages/Analysis";
import Citations from "./pages/Citations";
import Synthesis from "./pages/Synthesis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="container mx-auto px-6 py-4">
              <Logo />
            </div>
          </header>
          
          <Navigation />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Planning />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/citations" element={<Citations />} />
              <Route path="/synthesis" element={<Synthesis />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
