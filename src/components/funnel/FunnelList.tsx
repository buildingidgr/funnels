import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FunnelSummary } from "@/types/funnel";
import { FunnelApi, formatDate, resetFunnels } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { BarChart, Plus, RefreshCw, Users, TrendingUp, Trash } from "lucide-react";

export default function FunnelList() {
  const [funnels, setFunnels] = useState<FunnelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleCreateEmptyFunnel = async () => {
    try {
      const newFunnel = await FunnelApi.createFunnel({
        name: "Untitled Funnel",
        description: "",
        timeframe: {
          from: Date.now() - 30 * 24 * 60 * 60 * 1000,
          to: Date.now(),
        },
        performedBy: "all",
        steps: [],
      });
      toast.success("New funnel created");
      navigate(`/funnels/${newFunnel.id}/analysis?openConfig=1`);
    } catch (error) {
      console.error("Error creating funnel:", error);
      toast.error("Failed to create funnel");
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

  

  const handleDeleteFunnel = async (funnelId: string, funnelName: string) => {
    const confirmed = window.confirm(`Delete funnel "${funnelName}"? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      setIsDeletingId(funnelId);
      await FunnelApi.deleteFunnel(funnelId);
      setFunnels((prev) => prev.filter((f) => f.id !== funnelId));
      toast.success("Funnel deleted");
    } catch (error) {
      console.error("Error deleting funnel:", error);
      toast.error("Failed to delete funnel");
    } finally {
      setIsDeletingId(null);
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
        <Button onClick={handleCreateEmptyFunnel}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Funnel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Funnels</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Funnels
          </Button>
          <Button onClick={handleCreateEmptyFunnel}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Funnel
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Steps</th>
              <th className="px-4 py-3 font-medium">Visitors</th>
              <th className="px-4 py-3 font-medium">Conversion</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Last Calculated</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {funnels.map((funnel) => {
              const stepsCount = funnel.performance?.steps.length || 0;
              const totalVisitors = funnel.performance?.totalVisitors ?? 0;
              const conversionRate = funnel.performance?.conversionRate ?? 0;
              return (
                <tr key={funnel.id} className="border-t hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{funnel.name}</span>
                      {funnel.description && (
                        <span className="text-xs text-gray-500 line-clamp-1">{funnel.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{stepsCount} steps</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center text-gray-700">
                      <Users className="h-4 w-4 mr-2" />
                      {totalVisitors.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-32"><Progress value={conversionRate} className="h-2" /></div>
                      <div className="flex items-center text-gray-700">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(funnel.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(funnel.updatedAt)}</td>
                  <td className="px-4 py-3 text-gray-700">{funnel.lastCalculatedAt ? formatDate(funnel.lastCalculatedAt) : 'Never'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/funnels/${funnel.id}/analysis`} className="flex items-center"><BarChart className="mr-1 h-4 w-4" />View</Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isDeletingId === funnel.id}
                        onClick={() => handleDeleteFunnel(funnel.id, funnel.name)}
                        className="flex items-center"
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        {isDeletingId === funnel.id ? 'Deleting...' : 'Delete'}
                      </Button>
                      
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
