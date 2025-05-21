import React, { useState } from 'react';
import FunnelSankeyVisualization from './FunnelSankeyVisualization';
import { FunnelStep } from '@/types/funnel';

interface FunnelVisualizationTabsProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
}

const FunnelVisualizationTabs: React.FC<FunnelVisualizationTabsProps> = ({ steps, initialValue, funnelId }) => {
  // Filter out disabled steps using the correct property name
  const enabledSteps = steps.filter(step => step.isEnabled);

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <FunnelSankeyVisualization
          steps={enabledSteps}
          initialValue={initialValue}
          funnelId={funnelId}
        />
      </div>
    </div>
  );
};

export default FunnelVisualizationTabs; 