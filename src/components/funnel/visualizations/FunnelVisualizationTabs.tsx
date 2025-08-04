import React, { useState } from 'react';
import FunnelSankeyVisualization from './FunnelSankeyVisualization';
import FunnelGraphVisualization from './FunnelGraphVisualization';
import { FunnelStep } from '@/types/funnel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <Tabs defaultValue="sankey" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sankey">Sankey Flow</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Graph</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sankey" className="mt-4">
          <FunnelSankeyVisualization
            steps={enabledSteps}
            initialValue={initialValue}
            funnelId={funnelId}
          />
        </TabsContent>
        
        <TabsContent value="funnel" className="mt-4">
          <FunnelGraphVisualization
            steps={enabledSteps}
            initialValue={initialValue}
            funnelId={funnelId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FunnelVisualizationTabs; 