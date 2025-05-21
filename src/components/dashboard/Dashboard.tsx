import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FunnelSummary } from "@/types/funnel";
import { FunnelApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { BarChart, Plus, FileCheck } from "lucide-react";
import FunnelSummaryCard from "./FunnelSummaryCard";

export default function Dashboard() {
  const [recentFunnels, setRecentFunnels] = useState<FunnelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecentFunnels = async () => {
      try {
        setIsLoading(true);
        const funnels = await FunnelApi.listFunnels();
        // Sort by most recently updated
        const sorted = funnels.sort((a, b) => b.updated - a.updated);
        setRecentFunnels(sorted.slice(0, 3));
      } catch (error) {
        console.error("Error loading recent funnels:", error);
        toast.error("Failed to load recent funnels");
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentFunnels();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/funnels/create" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create New Funnel
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funnels</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 
                <div className="animate-pulse h-8 w-8 bg-gray-200 rounded"></div> : 
                "2"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Funnels</h2>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="animate-pulse h-6 w-3/4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4 border-t">
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                  <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : recentFunnels.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <BarChart className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-1">No funnels created yet</h3>
              <p className="text-gray-500 mb-6">Create your first funnel to track user conversions</p>
              <Button asChild>
                <Link to="/funnels/create" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Funnel
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentFunnels.map((funnel) => (
              <FunnelSummaryCard key={funnel.id} funnel={funnel} />
            ))}
          </div>
        )}

        {recentFunnels.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/funnels">View All Funnels</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
