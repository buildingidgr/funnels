import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FunnelSummary } from "@/types/funnel";
import { FunnelApi, formatDate, resetFunnels } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BarChart, Plus, RefreshCw, Download, Users, TrendingUp, Calendar, Clock } from "lucide-react";

export default function FunnelList() {
  const [funnels, setFunnels] = useState<FunnelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFunnels = async () => {
    try {
      setIsLoading(true);
      const data = await FunnelApi.listFunnels();
      setFunnels(data);
    } catch (error) {
      console.error("Error loading funnels:", error);
      toast.error("Failed to load funnels");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFunnels();
  }, []);

  const handleReset = async () => {
    try {
      await resetFunnels();
      await loadFunnels();
      toast.success("Funnels reset successfully");
    } catch (error) {
      console.error("Error resetting funnels:", error);
      toast.error("Failed to reset funnels");
    }
  };

  const handleExportJson = async (funnelId: string, funnelName: string) => {
    try {
      const funnel = await FunnelApi.getFunnel(funnelId);
      
      // Create a clean export object with all funnel details
      const exportData = {
        ...funnel,
        exportedAt: new Date().toISOString(),
        exportVersion: "1.0"
      };
      
      // Create and download the JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${funnelName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_funnel_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${funnelName} configuration`);
    } catch (error) {
      console.error("Error exporting funnel:", error);
      toast.error("Failed to export funnel");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="space-y-6 w-full max-w-md">
          <div className="flex flex-col items-center">
            <Skeleton className="h-12 w-12 rounded-full mb-6" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (funnels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-1">No funnels found</h3>
        <p className="text-gray-500 mb-6">Create your first funnel to start analyzing user conversions</p>
        <Button asChild>
          <Link to="/funnels/create" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Funnel
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Funnels</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Funnels
          </Button>
          <Button asChild>
            <Link to="/funnels/create" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create New Funnel
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {funnels.map((funnel) => (
          <Card key={funnel.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{funnel.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Clock className="h-3 w-3 mr-2" />
                    Last calculated: {formatDate(funnel.lastCalculatedAt)}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {funnel.performance?.steps.length || 0} steps
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-2" />
                  Created: {formatDate(funnel.createdAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-2" />
                  Updated: {formatDate(funnel.updatedAt)}
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
                  View Analysis
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportJson(funnel.id, funnel.name)}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
