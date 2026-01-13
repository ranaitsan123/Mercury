import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
interface ThreatsOverTimeChartProps {
  data: Array<{ date: string; threats: number }>;
  className?: string;
}

export default function ThreatsOverTimeChart({ data, className }: ThreatsOverTimeChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        {/* ... existing header content ... */}
        <CardTitle>Threats Detected</CardTitle>
        <CardDescription>Last 7 Days</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="threats"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: "hsl(var(--primary))",
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}