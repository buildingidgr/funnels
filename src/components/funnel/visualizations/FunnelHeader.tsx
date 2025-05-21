import React from "react";
import { Funnel } from "@/types/funnel";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FunnelHeaderProps {
  funnel: Funnel;
  onRecalculate: () => Promise<void>;
  isCalculating: boolean;
}

export const FunnelHeader: React.FC<FunnelHeaderProps> = ({ 
  funnel,
  onRecalculate,
  isCalculating
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{funnel.name}</h1>
        {funnel.description && (
          <p className="text-gray-500 mt-1">{funnel.description}</p>
        )}
      </div>
      <Button
        onClick={onRecalculate}
        disabled={isCalculating}
        className="flex items-center space-x-2"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calculating...</span>
          </>
        ) : (
          <span>Recalculate</span>
        )}
      </Button>
    </div>
  );
};

export default FunnelHeader;
