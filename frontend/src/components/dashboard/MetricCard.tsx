import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricCard({ title, value, icon: Icon, className }: any) {
  return (
    <Card className={className}>
      <CardHeader className="flex justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
