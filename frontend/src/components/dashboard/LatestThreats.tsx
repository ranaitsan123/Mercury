import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Threat } from "@/lib/data";
import { ShieldAlert } from "lucide-react";

interface LatestThreatsProps {
  threats: Threat[];
}

export default function LatestThreats({ threats }: LatestThreatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Critical Threats</CardTitle>
        <CardDescription>Recently identified high-priority threats.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {threats.map((threat) => (
          <div key={threat.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-destructive/10 p-2 rounded-md">
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{threat.subject}</p>
                <p className="text-sm text-muted-foreground">{threat.from}</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}