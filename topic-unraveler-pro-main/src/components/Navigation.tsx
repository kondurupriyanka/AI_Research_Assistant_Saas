import { NavLink } from "react-router-dom";
import { ClipboardList, Search, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/", label: "Planning", icon: ClipboardList },
    { to: "/analysis", label: "Analysis", icon: Search },
    { to: "/citations", label: "Citations", icon: FileText },
    { to: "/synthesis", label: "Synthesis", icon: Lightbulb },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-3">
        <ul className="flex gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    "hover:bg-muted/50",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
