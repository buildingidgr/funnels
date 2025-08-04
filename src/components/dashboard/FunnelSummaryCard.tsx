import { FunnelSummary } from "@/types/funnel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { formatDate } from "@/services/api";
import { BarChart, Users, TrendingUp, Calendar, Clock } from "lucide-react";

interface FunnelSummaryCardProps {
  funnel: FunnelSummary;
}

export default function FunnelSummaryCard({ funnel }: FunnelSummaryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{funnel.name}</CardTitle>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-3 w-3 mr-2" />
              Created: {formatDate(funnel.createdAt)}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {funnel.performance?.steps.length || 0} steps
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-2" />
            Last calculated: {formatDate(funnel.lastCalculatedAt)}
          </div>
        </div>
        
        {/* Performance Metrics */}
        {funnel.performance && (
          <div className="space-y-4 pt-4">
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{funnel.performance.totalVisitors.toLocaleString()} visitors</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span>{funnel.performance.conversionRate.toFixed(1)}% conversion</span>
                </div>
              </div>
              
              {/* Conversion Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Conversion Rate</span>
                  <span>{funnel.performance.conversionRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={funnel.performance.conversionRate} 
                  className="h-2"
                />
              </div>
              
              {funnel.performance.steps.length > 0 && (
                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span>{funnel.performance.steps.length} steps</span>
                  {funnel.performance.steps.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {funnel.performance.steps[1]?.conversionRate.toFixed(1)}% first step
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3 pt-6 border-t">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/funnels/${funnel.id}/analysis`} className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Analysis
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
