import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutMock } from "@/lib/auth";

export default function Header() {
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMock();
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-30 bg-opacity-75 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <img src="https://mgx-backend-cdn.metadl.com/generate/images/761500/2025-12-27/0bbfa984-7dc5-4dd4-a9e8-38afbcc957d1.png" alt="Logo" className="h-8 w-8" />
        <h1 className="text-lg font-semibold text-foreground/90 hidden md:block">
          Intelligent Mail Server
        </h1>
      </div>
      <div className="flex-1 text-center">
        <h2 className="text-xl font-bold text-foreground">AI Email Security Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}