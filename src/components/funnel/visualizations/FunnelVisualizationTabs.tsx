import React from 'react';
import FunnelGraphVisualization from './funnel-graph/FunnelGraphVisualization';
import { FunnelStep } from '@/types/funnel';

interface FunnelVisualizationTabsProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
}

const FunnelVisualizationTabs: React.FC<FunnelVisualizationTabsProps> = ({ steps, initialValue, funnelId }) => {
  // Filter out disabled steps using the correct property name
  const enabledSteps = steps.filter(step => step.isEnabled);

  // Debug logging
  console.log('[DEBUG] FunnelVisualizationTabs rendered:', {
    stepsCount: steps.length,
    enabledStepsCount: enabledSteps.length,
    initialValue
  });

  console.log('[DEBUG] Rendering Enhanced Sankey Diagram');

  return (
    <div className="space-y-4">
      {/* Enhanced Sankey Diagram */}
      <FunnelGraphVisualization
        steps={enabledSteps}
        initialValue={initialValue}
      />
    </div>
  );
};

export default FunnelVisualizationTabs; 