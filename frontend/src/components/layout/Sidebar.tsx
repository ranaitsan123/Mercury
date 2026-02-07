import {
  LayoutDashboard,
  Mail,
  ShieldAlert,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard Overview", href: "#" },
  { icon: Mail, label: "Email Logs", href: "#" },
  { icon: ShieldAlert, label: "Threats Detected", href: "#" },
  { icon: BarChart3, label: "Analytics & Reports", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-border/40 bg-background/60 backdrop-blur-xl sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="/compose"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Compose</span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="right">Compose New Email</TooltipContent>
        </Tooltip>

        <div className="h-px w-8 bg-border/40 my-2" />

        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <a
                href={item.href}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${item.label === "Email Logs"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </aside>
  );
}