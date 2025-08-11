import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { EnhancedFunnelApi } from "@/services/enhancedApi";
import { mockFunnelCalculationService } from "@/services/mockFunnelCalculationService";
import { Funnel, FunnelStep } from "@/types/funnel";
import { toast } from "sonner";
import FunnelVisualization from "@/components/funnel/FunnelVisualization";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Loader2, RefreshCw, Settings, Calculator } from "lucide-react";
import { SlidingConfigPanel } from '@/components/funnel/SlidingConfigPanel';

// Add some CSS for the funnel visualization
import "./FunnelAnalysisPage.css";

export default function FunnelAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
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

  // Auto-open configuration panel for empty funnels so users can add steps
  useEffect(() => {
    if (!funnel) return;

    // Open when explicit query param present
    const shouldOpenFromQuery = searchParams.get('openConfig');
    if (shouldOpenFromQuery) {
      setConfigPanelOpen(true);
      return;
    }

    // Fallback: auto-open when no steps
    if (funnel.steps.length === 0) {
      setConfigPanelOpen(true);
    }
  }, [funnel, searchParams]);

  const handleRefresh = async () => {
    if (!id || !funnel) return;
    
    try {
      setLoading(true);
      
      // Recalculate funnel data using the mock calculation service directly
      const results = await mockFunnelCalculationService.calculateFunnel({
        funnel,
        initialValue: 10000, // You can make this configurable
        options: {
          includeSplitVariations: true,
          includeMetrics: true,
          includeInsights: true
        }
      });
      
      // Update the funnel with recalculated visitor counts
      const recalculatedFunnel: Funnel = {
        ...funnel,
        steps: funnel.steps.map(step => {
          const calculatedValue = results.calculatedResults[step.id];
          
          // Update split variations with calculated values
          const updatedSplitVariations = step.splitVariations?.map((variation, index) => {
            const variationId = `${step.id}-variation-${index + 1}`;
            const calculatedVariationValue = results.calculatedResults[variationId];
            
            return {
              ...variation,
              visitorCount: calculatedVariationValue || 0
            };
          });

          return {
            ...step,
            visitorCount: calculatedValue || 0,
            value: calculatedValue || 0,
            splitVariations: updatedSplitVariations
          };
        })
      };
      
      setFunnel(recalculatedFunnel);
      
      // Show success message with calculation details
      const overallConversion = results.insights.overallConversionRate.toFixed(1);
      const totalVisitors = results.metadata.initialValue.toLocaleString();
      toast.success(`Funnel recalculated! ${overallConversion}% conversion rate from ${totalVisitors} visitors`);
      
    } catch (err) {
      console.error('Error recalculating funnel:', err);
      toast.error("Failed to recalculate funnel data");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGeneratedSteps = async (generatedSteps: FunnelStep[]) => {
    if (!funnel) return;

    try {
      setLoading(true);

      // Merge steps and renumber
      const mergedSteps = [...funnel.steps, ...generatedSteps].map((step, index) => ({
        ...step,
        order: index + 1,
      }));

      const updatedFunnel: Funnel = {
        ...funnel,
        steps: mergedSteps,
        lastUpdated: Date.now(),
      };

      // Recalculate funnel data to reflect new steps
      const results = await mockFunnelCalculationService.calculateFunnel({
        funnel: updatedFunnel,
        initialValue: 10000,
        options: {
          includeSplitVariations: true,
          includeMetrics: true,
          includeInsights: true,
        },
      });

      const recalculatedFunnel: Funnel = {
        ...updatedFunnel,
        steps: updatedFunnel.steps.map((step) => {
          const calculatedValue = results.calculatedResults[step.id];
          const updatedSplitVariations = step.splitVariations?.map((variation, index) => {
            const variationId = `${step.id}-variation-${index + 1}`;
            const calculatedVariationValue = results.calculatedResults[variationId];
            return {
              ...variation,
              visitorCount: calculatedVariationValue || 0,
            };
          });
          return {
            ...step,
            visitorCount: calculatedValue || 0,
            value: calculatedValue || 0,
            splitVariations: updatedSplitVariations,
          };
        }),
      };

      setFunnel(recalculatedFunnel);
      setConfigPanelOpen(true);
      await FunnelApi.updateFunnel(recalculatedFunnel.id!, recalculatedFunnel);
      toast.success(`Added ${generatedSteps.length} AI-generated steps to your funnel`);
    } catch (err) {
      console.error('Error applying AI-generated steps:', err);
      toast.error('Failed to apply AI-generated steps');
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
                <Calculator className="h-4 w-4 mr-2" />
                Re-Calculate Data
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
          <div
            className="sticky top-0 z-40 pl-4 pr-4 flex items-center justify-between bg-gray-50/90 backdrop-blur supports-[backdrop-filter]:bg-gray-50/70 py-3 border-b"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {funnel.name}
              </h1>
              <p className="text-gray-600">
                {funnel.description || "No description provided"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/funnels">
                <Button variant="default" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <Calculator className="h-4 w-4 mr-2" />
                Re-Calculate Funnel Data
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
        onSave={async (updatedFunnel) => {
          try {
            setLoading(true);
            
            // Recalculate funnel data using the mock calculation service
            const results = await mockFunnelCalculationService.calculateFunnel({
              funnel: updatedFunnel,
              initialValue: 10000, // You can make this configurable
              options: {
                includeSplitVariations: true,
                includeMetrics: true,
                includeInsights: true
              }
            });
            
            // Update the funnel with recalculated visitor counts
            const recalculatedFunnel: Funnel = {
              ...updatedFunnel,
              steps: updatedFunnel.steps.map(step => {
                const calculatedValue = results.calculatedResults[step.id];
                
                // Update split variations with calculated values
                const updatedSplitVariations = step.splitVariations?.map((variation, index) => {
                  const variationId = `${step.id}-variation-${index + 1}`;
                  const calculatedVariationValue = results.calculatedResults[variationId];
                  
                  return {
                    ...variation,
                    visitorCount: calculatedVariationValue || 0
                  };
                });

                return {
                  ...step,
                  visitorCount: calculatedValue || 0,
                  value: calculatedValue || 0,
                  splitVariations: updatedSplitVariations
                };
              })
            };
            
            setFunnel(recalculatedFunnel);
            
            // Show success message with calculation details
            const overallConversion = results.insights.overallConversionRate.toFixed(1);
            const totalVisitors = results.metadata.initialValue.toLocaleString();
            toast.success(`Configuration saved and data recalculated! ${overallConversion}% conversion rate from ${totalVisitors} visitors`);
            
          } catch (err) {
            console.error('Error recalculating funnel after configuration save:', err);
            // Fallback to just updating the funnel without recalculation
            setFunnel(updatedFunnel);
            toast.success("Funnel configuration updated!");
          } finally {
            setLoading(false);
          }
        }}
      />
    </>
  );
}
