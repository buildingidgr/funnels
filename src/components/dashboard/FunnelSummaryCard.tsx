
import { FunnelSummary } from "@/types/funnel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDate } from "@/services/api";
import { BarChart } from "lucide-react";

interface FunnelSummaryCardProps {
  funnel: FunnelSummary;
}

export default function FunnelSummaryCard({ funnel }: FunnelSummaryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{funnel.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>Created: {formatDate(funnel.created)}</div>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Last calculated: {formatDate(funnel.calculated)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4 border-t">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/funnels/${funnel.id}`}>View Details</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to={`/funnels/${funnel.id}/analysis`} className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Analysis
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
