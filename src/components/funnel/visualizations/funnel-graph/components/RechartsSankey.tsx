import React from 'react';
import { ResponsiveContainer, Sankey } from 'recharts';

type SankeyData = {
  nodes: Array<{ name: string; value?: number; color?: string; index?: number; conversionRate?: number }>;
  links: Array<{
    source: number;
    target: number;
    value: number;
    sourceId?: string;
    targetId?: string;
    conversionRate?: number;
    sourceValue?: number;
  }>;
};

interface RechartsSankeyProps {
  data: SankeyData;
  renderNode: (props: any) => React.ReactNode;
  renderLink: (props: any) => React.ReactNode;
  nodePadding?: number;
  nodeWidth?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  iterations?: number;
}

const RechartsSankey: React.FC<RechartsSankeyProps> = ({
  data,
  renderNode,
  renderLink,
  nodePadding = 80,
  nodeWidth = 20,
  margin = { top: 80, right: 200, bottom: 80, left: 200 },
  iterations = 64,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={data}
        node={renderNode}
        link={renderLink}
        nodePadding={nodePadding}
        nodeWidth={nodeWidth}
        margin={margin}
        iterations={iterations}
      />
    </ResponsiveContainer>
  );
};

export default RechartsSankey;


