import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Threat } from "@/services/email.service";
import { ShieldAlert } from "lucide-react";

interface LatestThreatsProps {
  threats: Threat[];
  onView: (threat: Threat) => void;
  className?: string;
}

export default function LatestThreats({ threats, onView, className }: LatestThreatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Latest Critical Threats</CardTitle>
        <CardDescription>Recently identified high-priority threats.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {threats.map((threat) => (
          <div key={threat.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-2 rounded-md">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{threat.subject}</p>
                <p className="text-xs text-muted-foreground truncate">{threat.from}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Confidence</p>
                <p className="text-sm font-mono text-destructive">{Math.round((threat.confidence || 0) * 100)}%</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(threat)}
                className="hover:bg-primary hover:text-primary-foreground transition-all"
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}