import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { FunnelApi } from "@/services/api";
import { Funnel } from "@/types/funnel";
import { toast } from "sonner";
import FunnelForm from "@/components/funnel/FunnelForm";
import { StepEditSidebar } from "@/components/funnel/step-edit-sidebar";
import { AIFunnelGenerator } from "@/components/funnel/AIFunnelGenerator";
import { 
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PanelLeft, AlertCircle, Home } from "lucide-react";

export default function FunnelEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/funnels");
      return;
    }

    const loadFunnel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await FunnelApi.getFunnel(id);
        setFunnel(data);
      } catch (err) {
        console.error("Error loading funnel:", err);
        setError("Failed to load funnel. It may have been deleted or you don't have access.");
        toast.error("Failed to load funnel for editing");
      } finally {
        setIsLoading(false);
      }
    };

    loadFunnel();
  }, [id, navigate]);

  const handleFunnelChange = (updatedFunnel: Funnel) => {
    setFunnel(updatedFunnel);
  };

  const handleAIGeneratedSteps = (generatedSteps: any[]) => {
    if (!funnel) return;
    
    // Merge with existing steps, ensuring proper ordering
    const updatedSteps = [...funnel.steps, ...generatedSteps];
    
    // Reorder all steps to ensure sequential ordering
    updatedSteps.forEach((step, index) => {
      step.order = index + 1;
    });
    
    const updatedFunnel = { ...funnel, steps: updatedSteps };
    setFunnel(updatedFunnel);
    toast.success(`Added ${generatedSteps.length} AI-generated steps to your funnel!`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !funnel) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Funnel Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "This funnel may have been deleted or you entered an invalid ID."}
          </p>
          <Button asChild>
            <Link to="/funnels" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Return to Funnels List
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative">
        <div className="mb-4 flex justify-end gap-2">
          <AIFunnelGenerator 
            onGenerate={handleAIGeneratedSteps}
            existingSteps={funnel?.steps || []}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PanelLeft className="h-4 w-4" />
                Edit Steps
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
              <StepEditSidebar 
                funnel={funnel} 
                onSave={handleFunnelChange}
                onClose={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <FunnelForm 
          existingFunnel={funnel} 
          isEditing={true} 
          onFunnelChange={handleFunnelChange}
        />
      </div>
    </DashboardLayout>
  );
}
