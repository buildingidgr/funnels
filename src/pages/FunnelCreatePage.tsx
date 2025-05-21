import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import FunnelForm from "@/components/funnel/FunnelForm";
import { Funnel } from "@/types/funnel";
import { StepEditSidebar } from "@/components/funnel/step-edit-sidebar";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

export default function FunnelCreatePage() {
  const [funnel, setFunnel] = useState<Funnel>({
    name: "",
    description: "",
    timeframe: {
      from: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      to: Date.now(),
    },
    performed: "all",
    steps: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFunnelChange = (updatedFunnel: Funnel) => {
    setFunnel(updatedFunnel);
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <div className="mb-4 flex justify-end">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PanelLeft className="h-4 w-4" />
                Edit Steps
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] max-w-2xl overflow-y-auto">
              <StepEditSidebar 
                funnel={funnel} 
                onSave={handleFunnelChange}
                onClose={() => setSidebarOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
        <FunnelForm 
          existingFunnel={funnel}
          onFunnelChange={handleFunnelChange}
        />
      </div>
    </DashboardLayout>
  );
}
