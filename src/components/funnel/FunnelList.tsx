import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FunnelSummary } from "@/types/funnel";
import { FunnelApi, formatDate, resetFunnels } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BarChart, Plus, RefreshCw } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your Funnels</h2>
        <div className="flex gap-2">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {funnels.map((funnel) => (
          <Card key={funnel.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{funnel.name}</CardTitle>
              <CardDescription>Last calculated: {formatDate(funnel.lastCalculatedAt)}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Created: {formatDate(funnel.createdAt)}</div>
                <div>Updated: {formatDate(funnel.updatedAt)}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/funnels/${funnel.id}`}>View Details</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`/funnels/${funnel.id}/analysis`} className="flex items-center">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analysis
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
