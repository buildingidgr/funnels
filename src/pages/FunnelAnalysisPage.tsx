import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { Funnel } from "@/types/funnel";
import { toast } from "sonner";
import FunnelVisualization from "@/components/funnel/FunnelVisualization";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Loader2, RefreshCw, Settings } from "lucide-react";
import { SlidingConfigPanel } from '@/components/funnel/SlidingConfigPanel';

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
    <>
      <DashboardLayout>
        <div 
          className={`space-y-6 transition-all duration-300 ease-in-out ${
            configPanelOpen ? 'mr-[var(--panel-width,600px)]' : 'mr-0'
          } ${configPanelOpen ? 'border-r border-gray-200' : ''}`}
          style={configPanelOpen ? { '--panel-width': 'min(600px, 90vw)' } as React.CSSProperties : undefined}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {funnel.name}
              </h1>
              <p className="text-gray-600">
                {funnel.description || "No description provided"}
              </p>
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

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setConfigPanelOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Funnel
              </Button>
            </div>
          </div>

          {/* Graph Visualization */}
          <FunnelVisualization funnel={funnel} />
        </div>
      </DashboardLayout>

      {/* Sliding Config Panel */}
      <SlidingConfigPanel
        isOpen={configPanelOpen}
        onClose={() => setConfigPanelOpen(false)}
        funnel={funnel}
        onSave={(updatedFunnel) => {
          setFunnel(updatedFunnel);
          toast.success("Funnel configuration updated!");
        }}
      />
    </>
  );
}
