import React, { useState } from "react";
import { Funnel } from "@/types/funnel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StepAccordionList } from "./StepAccordionList";
import { toast } from "sonner";
import { X } from "lucide-react";

interface StepEditSidebarProps {
  funnel: Funnel;
  onSave: (updatedFunnel: Funnel) => void;
  onClose?: () => void;
}

export function StepEditSidebar({ funnel, onSave, onClose }: StepEditSidebarProps) {
  const [editedFunnel, setEditedFunnel] = useState<Funnel>({...funnel});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset to original funnel on cancel
  const handleCancel = () => {
    setEditedFunnel({ ...funnel });
    if (onClose) onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSave(editedFunnel);
      toast.success("Funnel steps updated successfully");
      if (onClose) onClose();
    } catch (error) {
      toast.error("Failed to save funnel steps");
      console.error("Error saving funnel steps:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Edit Funnel Steps</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update your funnel steps and step conditions
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close sidebar"
          className="ml-auto"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Separator className="my-2" />

      {/* Step List */}
      <ScrollArea className="flex-1 pr-4">
        <StepAccordionList 
          steps={editedFunnel.steps}
          onChange={(updatedSteps) => {
            setEditedFunnel({
              ...editedFunnel,
              steps: updatedSteps,
            });
          }}
        />
      </ScrollArea>

      {/* Sticky Actions */}
      <div className="sticky bottom-0 z-10 bg-background border-t px-4 py-3 flex gap-2 justify-end mt-4">
        <Button 
          onClick={handleCancel} 
          variant="outline"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
