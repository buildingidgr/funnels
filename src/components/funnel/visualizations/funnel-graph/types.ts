export interface SankeyNode {
  id: string;
  name: string;
  value: number;
  color?: string;
  mainStepColor?: string; // Color reference to parent step for split steps
  step?: number;
  previousStep?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  conversionRate?: number; // Add conversion rate property
  // Add additional properties that Recharts might use
  key?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  sourceId?: string;
  targetId?: string;
  path?: string;
  color?: string;
  labelX?: number;
  labelY?: number;
  labelValue?: string;
  labelPercentage?: string;
  originalWidth?: number; // Added for tracking original width during highlighting
  conversionRate?: number; // Add conversion rate property
  
  // Add missing properties that are being used in drawLinkUtils.ts
  width?: number;
  sourceX?: number;
  sourceY?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  targetX?: number;
  targetY?: number;
  targetHeight?: number;
  sourceColor?: string;
  targetColor?: string;
  sourceValue?: number; // Added to help calculate percentage for link width
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Define a separate interface for Recharts compatibility
export interface RechartsSankeyData {
  nodes: Array<{
    name: string;
    value?: number;
    key?: string;
    color?: string;
    index?: number; // Recharts uses this internally
  }>;
  links: Array<{
    source: number; // Must be a number for Recharts
    target: number; // Must be a number for Recharts
    value: number;
    key?: string;
    sourceId?: string; // Our custom property for reference
    targetId?: string; // Our custom property for reference
  }>;
}

export interface StepDetails {
  name: string;
  value: number;
  percentage: number;
  dropOff: number;
  previousValue: number;
}
