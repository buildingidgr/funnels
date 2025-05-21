import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { Funnel } from "@/types/funnel";
import { toast } from "@/components/ui/use-toast";
import FunnelVisualization from "@/components/funnel/FunnelVisualization";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Loader2, BarChart3, RefreshCw, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { StepEditSidebar } from "@/components/funnel/step-edit-sidebar";

// Add some CSS for the funnel visualization
import "./FunnelAnalysisPage.css";

export default function FunnelAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadFunnel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await FunnelApi.getFunnel(id);
        setFunnel(data);
      } catch (err) {
        console.error("Error loading funnel:", err);
        setError("Failed to load funnel. It may have been deleted or you don't have access.");
        toast({
          title: "Error",
          description: "Failed to load funnel analysis",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFunnel();
  }, [id]);

  const handleRecalculate = async () => {
    if (!id || !funnel) return;
    
    try {
      setIsCalculating(true);
      const results = await FunnelApi.calculateFunnel(id);
      
      // Update the funnel's steps with new visitor counts
      const updatedFunnel = {
        ...funnel,
        steps: funnel.steps.map(step => ({
          ...step,
          visitorCount: results[step.id] || 0
        })),
        lastCalculatedAt: new Date(results.calculated).toISOString()
      };
      
      setFunnel(updatedFunnel);
      toast({
        title: "Success",
        description: "Funnel analysis recalculated successfully",
      });
    } catch (err) {
      console.error("Error recalculating funnel:", err);
      toast({
        title: "Error",
        description: "Failed to recalculate funnel analysis",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Loading funnel analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !funnel) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Funnel Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
            {error || "This funnel may have been deleted or you entered an invalid ID."}
          </p>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
            <Link to="/funnels" className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Return to Funnels List
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-bold">{funnel.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRecalculate}
                    disabled={isCalculating}
                    className="transition-all duration-200 hover:bg-primary/10"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                    {isCalculating ? 'Calculating...' : 'Recalculate'}
                  </Button>
                  <Sheet open={isEditing} onOpenChange={setIsEditing}>
                    <SheetTrigger asChild>
                      <Button variant="default" size="sm" className="shadow-sm hover:shadow-md transition-all duration-200">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Steps
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[600px] max-w-2xl overflow-y-auto">
                      <StepEditSidebar 
                        funnel={funnel} 
                        onSave={setFunnel}
                        onClose={() => setIsEditing(false)}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FunnelVisualization funnel={funnel} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
