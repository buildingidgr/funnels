import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { Funnel } from "@/types/funnel";
import { toast } from "sonner";
import FunnelVisualization from "@/components/funnel/FunnelVisualization";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertCircle, Home, Loader2, BarChart3, RefreshCw, Edit, Settings, TrendingUp, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StepEditSidebar } from "@/components/funnel/step-edit-sidebar";
import { FunnelConfigEditor } from '@/components/funnel/FunnelConfigEditor';

// Add some CSS for the funnel visualization
import "./FunnelAnalysisPage.css";

export default function FunnelAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);

  useEffect(() => {
    const loadFunnel = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await FunnelApi.getFunnel(id);
        setFunnel(data);
        setError(null);
      } catch (err) {
        console.error('Error loading funnel:', err);
        setError(err instanceof Error ? err.message : 'Failed to load funnel data');
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [id]);

  const handleRefresh = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await FunnelApi.getFunnel(id);
      setFunnel(data);
      toast.success("Funnel data refreshed successfully!");
    } catch (err) {
      console.error('Error refreshing funnel:', err);
      toast.error("Failed to refresh funnel data");
    } finally {
      setLoading(false);
    }
  };

  // Utility to compute best converting and highest drop-off steps
  function getFunnelOptimizationTip(funnel: Funnel) {
    const enabledSteps = funnel.steps.filter(s => s.isEnabled);
    if (enabledSteps.length < 2) return null;
    const stepMetrics = enabledSteps.map((step, index) => {
      const currentValue = step.visitorCount || 0;
      const previousValue = index === 0 ? (enabledSteps[0].visitorCount || 0) : (enabledSteps[index - 1].visitorCount || 0);
      const conversionRate = previousValue > 0 ? (currentValue / previousValue) * 100 : 0;
      const dropOff = previousValue - currentValue;
      const dropOffRate = previousValue > 0 ? (dropOff / previousValue) * 100 : 0;
      return { step, conversionRate, dropOff, dropOffRate };
    });
    const bestConvertingStep = stepMetrics.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best
    );
    const highestDropOffStep = stepMetrics.reduce((worst, current) =>
      current.dropOffRate > worst.dropOffRate ? current : worst
    );
    return (
      <div className="flex flex-wrap gap-6 items-center mt-2">
        <div className="flex items-center gap-2 text-sm bg-green-50 px-3 py-1 rounded">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-gray-600">Best Converting:</span>
          <span className="font-medium text-green-700">
            {bestConvertingStep.step.name} ({bestConvertingStep.conversionRate.toFixed(1)}%)
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm bg-red-50 px-3 py-1 rounded">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <span className="text-gray-600">Highest Drop-off:</span>
          <span className="font-medium text-red-700">
            {highestDropOffStep.step.name} ({highestDropOffStep.dropOffRate.toFixed(1)}%)
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading funnel data...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Funnel</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link to="/funnels">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Funnels
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!funnel) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Funnel Not Found</h2>
            <p className="text-gray-600 mb-4">The funnel you're looking for doesn't exist or has been deleted.</p>
            <Link to="/funnels">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Back to Funnels
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {funnel.name}
            </h1>
            <p className="text-gray-600">
              {funnel.description || "No description provided"}
            </p>
            {/* Optimization Tip (now rendered here) */}
            {getFunnelOptimizationTip(funnel)}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="default" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>

            <Sheet open={configPanelOpen} onOpenChange={setConfigPanelOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Funnel
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[1400px] xl:w-[1600px] max-w-none overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Funnel Configuration</SheetTitle>
                  <SheetDescription>
                    Configure your funnel steps, conditions, and split variations. Changes are saved automatically.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FunnelConfigEditor 
                    funnel={funnel} 
                    onSave={(updatedFunnel) => {
                      setFunnel(updatedFunnel);
                      toast.success("Funnel configuration updated!");
                    }} 
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Graph Visualization */}
        <FunnelVisualization funnel={funnel} />
      </div>
    </DashboardLayout>
  );
}
