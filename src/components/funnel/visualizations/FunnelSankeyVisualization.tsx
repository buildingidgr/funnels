import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Sankey, SankeyNodeDatum, SankeyLinkDatum, ResponsiveSankey } from '@nivo/sankey';
import { FunnelStep } from '@/types/funnel';
import ReactDOM from 'react-dom';

interface FunnelSankeyVisualizationProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
}

interface SankeyNodeData {
  name: string;
  id: string;
  value: number;
  isSplit?: boolean;
  isOptional?: boolean;
  column: number;
  // D3 added properties
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  index?: number;
  sourceLinks?: any[];
  targetLinks?: any[];
}

interface SankeyLinkData {
  source: string;
  target: string;
  value: number;
}

const MAIN_COLOR = '#2563eb'; // Professional blue
const SPLIT_COLOR = '#0891b2'; // Professional cyan
const LINK_COLOR = '#94a3b8'; // Muted slate
const HOVER_COLOR = '#1d4ed8'; // Darker blue for hover
const OPTIONAL_COLOR = '#9333ea'; // Professional violet
const LINK_GRADIENT_START = '#e2e8f0'; // Light slate
const LINK_GRADIENT_END = '#94a3b8'; // Medium slate

// Create a color scheme object for the Sankey component
const colorScheme = {
  main: MAIN_COLOR,
  split: SPLIT_COLOR,
  optional: OPTIONAL_COLOR,
  start: '#2563eb',
  end: '#2563eb'
};

// Helper: hardcoded mapping for split-to-next values for content-platform-funnel-001
const splitToNextMap: Record<string, Record<string, number>> = {
  'content-platform-funnel-001': {
    // Homepage Visit splits
    'Homepage Visit|New Users|Content Discovery': 12000,
    'Homepage Visit|Returning Users|Content Discovery': 8000,
    // Content Discovery splits
    'Content Discovery|Search|Content View': 5000,
    'Content Discovery|Recommendations|Content View': 7000,
    // Content View splits
    'Content View|Articles|Engagement': 2000,
    'Content View|Videos|Engagement': 1500,
    'Content View|Podcasts|Engagement': 500,
    // Engagement splits
    'Engagement|Comments|Subscription': 1000,
    'Engagement|Shares|Subscription': 500,
    'Engagement|Bookmarks|Subscription': 500,
  }
};

function getNodeColor(node: any) {
  // Check for split steps first
  if (node.id.includes('split-variation')) {
    return colorScheme.split;
  }
  // Then check for optional steps
  if (node.isOptional) {
    return colorScheme.optional;
  }
  // Then check for start/end
  if (node.id.startsWith('Start')) {
    return colorScheme.start;
  }
  if (node.id.startsWith('End')) {
    return colorScheme.end;
  }
  // Default to main color
  return colorScheme.main;
}

function getLinkColor(link: any) {
  // Main to split: green, split to next: blue, else: slate
  if (link.source.id && (link.source.id.startsWith('split') || link.source.id.includes(' '))) {
    return SPLIT_COLOR;
  }
  if (link.target.id && (link.target.id.startsWith('split') || link.target.id.includes(' '))) {
    return MAIN_COLOR;
  }
  return LINK_COLOR;
}

const getNodeStats = (node: any, links: any[]) => {
  // Find incoming links to this node
  const incoming = links.filter(l => l.target && l.target.id === node.id);
  if (incoming.length === 0) return { prevValue: null, conv: null, drop: null };
  
  // Use the incoming link with the highest value (main flow)
  const mainLink = incoming.reduce((a, b) => (a.value > b.value ? a : b));
  const prevValue = mainLink.source && typeof mainLink.source.value !== 'undefined' ? mainLink.source.value : 0;
  const nodeValue = node.value || 0;
  const conv = prevValue > 0 ? ((nodeValue / prevValue) * 100).toFixed(1) : null;
  const drop = prevValue - nodeValue;
  return { prevValue, conv, drop };
};

const CustomNodeLabel = ({ node, links }: { node: any; links: any[] }) => {
  const nodeValue = node.value || 0;
  const incomingLinks = links.filter(l => l.target === node.id);
  const prevValue = incomingLinks.length > 0 
    ? incomingLinks.reduce((sum, l) => sum + (l.value || 0), 0)
    : nodeValue;
  const conv = prevValue > 0 ? ((nodeValue / prevValue) * 100).toFixed(1) : null;
  
  return (
    <g transform={`translate(${node.x0 < node.x1 ? node.x0 : node.x1},${(node.y0 + node.y1) / 2})`}>
      <foreignObject
        x={node.x0 < node.x1 ? 20 : -220}
        y={-40}
        width={200}
        height={80}
        style={{ overflow: 'visible' }}
      >
        <div style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          fontFamily: 'Inter, sans-serif',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {node.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontWeight: 500 }}>{nodeValue.toLocaleString()}</span>
            <span>users</span>
          </div>
          {conv !== null && (
            <div style={{
              fontSize: '12px',
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'inline-block',
              marginTop: '4px'
            }}>
              {conv}% conversion
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
};

const CustomLinkLabel = ({ link }: { link: any }) => {
  const { sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, targetWidth, targetHeight, value, percentage } = link;
  
  // Calculate the middle point of the link
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  return (
    <g transform={`translate(${midX},${midY})`}>
      <foreignObject
        x={-100}
        y={-20}
        width={200}
        height={40}
        style={{ overflow: 'visible' }}
      >
        <div style={{
          background: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <span style={{ fontWeight: 500, color: '#1e293b' }}>{value.toLocaleString()}</span>
            <span>users</span>
            {percentage && (
              <>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ 
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontSize: '11px'
                }}>
                  {percentage}%
                </span>
              </>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

const Legend = () => (
  <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 12 }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, background: colorScheme.main, display: 'inline-block' }} />
      <span style={{ fontSize: 13, color: '#334155' }}>Main Funnel Step</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, background: colorScheme.split, display: 'inline-block' }} />
      <span style={{ fontSize: 13, color: '#334155' }}>Split Path</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, background: colorScheme.optional, display: 'inline-block', border: '2px dashed #7e22ce' }} />
      <span style={{ fontSize: 13, color: '#334155' }}>Optional Step</span>
    </span>
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: 4, background: LINK_COLOR, display: 'inline-block' }} />
      <span style={{ fontSize: 13, color: '#334155' }}>Flow Connection</span>
    </span>
  </div>
);

function buildSankeyData(steps: FunnelStep[], initialValue: number, funnelId?: string) {
  console.log('Building Sankey data with steps:', steps);
  
  const nodes: SankeyNodeData[] = [];
  const links: SankeyLinkData[] = [];

  // Add initial node
  nodes.push({
    name: 'Start',
    id: 'start',
    value: initialValue || 0,
    column: 0
  });
  console.log('Added initial node:', nodes[0]);

  // Process each step to create nodes and links
  steps.forEach((step, index) => {
    console.log('\nProcessing step:', step.name);
    
    // Use the step's visitorCount directly for the main node
    const stepValue = step.visitorCount;
    const mainNodeId = `step-${step.id}`;
    nodes.push({
      name: step.name,
      id: mainNodeId,
      value: stepValue,
      isOptional: !step.isRequired,
      column: index + 1
    });
    console.log('Added main step node:', nodes[nodes.length - 1]);

    // Add main link from previous step
    if (index === 0) {
      links.push({
        source: 'start',
        target: mainNodeId,
        value: stepValue
      });
      console.log('Added main link:', links[links.length - 1]);
    } else {
      const prevStep = steps[index - 1];
      const prevNodeId = `step-${prevStep.id}`;
      if (!step.isRequired) {
        // Optional step: link from previous step to this optional step
        links.push({
          source: prevNodeId,
          target: mainNodeId,
          value: stepValue
        });
        console.log('Added optional step link:', links[links.length - 1]);
        // Add direct link from previous step to next step (for users who skip optional)
        if (index < steps.length - 1) {
          const nextStep = steps[index + 1];
          const nextNodeId = `step-${nextStep.id}`;
          // Only users who skipped this optional step
          const skippedValue = prevStep.visitorCount - step.visitorCount;
          if (skippedValue > 0) {
            links.push({
              source: prevNodeId,
              target: nextNodeId,
              value: skippedValue
            });
            console.log('Added skip optional link:', links[links.length - 1]);
          }
        }
      } else {
        // Only add main link if the previous step doesn't have split variations
        if (!prevStep.splitVariations || prevStep.splitVariations.length === 0) {
          links.push({
            source: prevNodeId,
            target: mainNodeId,
            value: stepValue
          });
          console.log('Added main link:', links[links.length - 1]);
        }
      }
    }

    // Handle split steps
    if (step.splitVariations && step.splitVariations.length > 0) {
      console.log('Processing splits for step:', step.name);
      step.splitVariations.forEach((split, splitIndex) => {
        const splitNodeId = `step-${step.id}-split-variation-${splitIndex + 1}-${split.name.toLowerCase().replace(/\s+/g, '-')}`;
        const splitValue = split.visitorCount;
        nodes.push({
          name: split.name,
          id: splitNodeId,
          value: splitValue,
          isSplit: true,
          column: index + 1
        });
        console.log('Added split node:', nodes[nodes.length - 1]);
        // Add link from main step to split
        links.push({
          source: mainNodeId,
          target: splitNodeId,
          value: splitValue
        });
        console.log('Added split link:', links[links.length - 1]);
        // Add link from split to next step
        if (index < steps.length - 1) {
          const nextStep = steps[index + 1];
          const nextNodeId = `step-${nextStep.id}`;
          // For demo, assume all split users go to next step
          links.push({
            source: splitNodeId,
            target: nextNodeId,
            value: splitValue
          });
          console.log('Added split-to-next link:', links[links.length - 1]);
        }
      });
    }
  });

  // Add final node
  const lastStep = steps[steps.length - 1];
  const lastValue = Math.min(lastStep.visitorCount, steps[steps.length - 2]?.visitorCount || initialValue, initialValue);
  nodes.push({
    name: 'End',
    id: 'end',
    value: lastValue,
    column: steps.length + 1
  });
  console.log('\nAll nodes created:', nodes);

  // Add final link to end node
  const lastNodeId = `step-${lastStep.id}`;
  links.push({
    source: lastNodeId,
    target: 'end',
    value: lastValue
  });
  console.log('Added final link:', links[links.length - 1]);

  return { nodes, links };
}

const CustomLink = ({ link }: { link: any }) => {
  const { sourceX, sourceY, sourceWidth, sourceHeight, targetX, targetY, targetWidth, targetHeight, value, percentage } = link;
  
  // Calculate the middle point of the link
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  return (
    <>
      <path
        d={`M${sourceX},${sourceY + sourceHeight / 2} C${sourceX + (targetX - sourceX) / 3},${sourceY + sourceHeight / 2} ${targetX - (targetX - sourceX) / 3},${targetY + targetHeight / 2} ${targetX},${targetY + targetHeight / 2}`}
        fill="none"
        stroke={link.color}
        strokeWidth={link.width}
        strokeOpacity={link.opacity}
      />
      {percentage && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#666"
          fontSize={12}
          style={{ pointerEvents: 'none' }}
        >
          {percentage}
        </text>
      )}
    </>
  );
};

const formatNodeLabel = (node: any) => {
  const nodeValue = node.value || 0;
  return `${node.name} (${nodeValue.toLocaleString()} users)`;
};

const formatLinkLabel = (link: any) => {
  const value = link.value || 0;
  const percentage = link.percentage ? `${link.percentage}%` : '';
  return `${value.toLocaleString()} users${percentage ? ` • ${percentage}` : ''}`;
};

const FunnelSankeyVisualization: React.FC<FunnelSankeyVisualizationProps> = ({ steps, initialValue, funnelId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipState, setTooltipState] = useState<{
    x: number;
    y: number;
    content: React.ReactNode | null;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    content: null,
    visible: false
  });
  const lastTooltipUpdate = useRef<number>(0);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();
  const isHoveringRef = useRef(false);
  const [sankeyWidth, setSankeyWidth] = useState(800);

  // Return early if no steps are provided
  if (!steps || steps.length === 0) {
    return (
      <div style={{ 
        height: '50vh',
        minHeight: '400px',
        maxHeight: '600px',
        background: '#f8fafc', 
        borderRadius: 12, 
        padding: '24px 16px',
        boxShadow: '0 2px 12px rgba(30,41,59,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center',
          color: '#64748b',
          fontSize: '14px'
        }}>
          No funnel steps available to visualize
        </div>
      </div>
    );
  }

  const sankeyData = buildSankeyData(steps, initialValue, funnelId);

  // Calculate validated step values
  const validatedSteps = steps.map((step, index) => {
    const maxValue = index === 0 ? initialValue : steps[index - 1].visitorCount;
    return {
      ...step,
      validatedCount: Math.min(step.visitorCount, maxValue, initialValue)
    };
  });

  // Update sankeyWidth on container resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Scale down the width by 25%
        setSankeyWidth((containerRef.current.offsetWidth || 800) * 0.75);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate summary metrics
  const totalSteps = steps.length;
  const optionalSteps = steps.filter(step => !step.isRequired).length;
  const splitSteps = steps.filter(step => step.splitVariations && step.splitVariations.length > 0).length;
  const finalConversion = ((steps[steps.length - 1].visitorCount || 0) / initialValue * 100).toFixed(1);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current || !isHoveringRef.current) return;

    // Throttle tooltip position updates to prevent excessive recalculations
    const now = Date.now();
    if (now - lastTooltipUpdate.current < 32) return; // ~30fps
    lastTooltipUpdate.current = now;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;

    // Calculate tooltip position to keep it within viewport
    const tooltipWidth = 280;
    const tooltipHeight = 150;
    const padding = 20;

    let tooltipX = x + 16;
    let tooltipY = y - 12;

    // Ensure tooltip doesn't go off the right edge
    if (tooltipX + tooltipWidth + padding > containerRect.width) {
      tooltipX = x - tooltipWidth - 16;
    }

    // Ensure tooltip doesn't go off the bottom edge
    if (tooltipY + tooltipHeight + padding > containerRect.height) {
      tooltipY = y - tooltipHeight - 12;
    }

    // Ensure tooltip doesn't go off the top edge
    if (tooltipY < padding) {
      tooltipY = padding;
    }

    // Ensure tooltip doesn't go off the left edge
    if (tooltipX < padding) {
      tooltipX = padding;
    }

    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate(${tooltipX}px, ${tooltipY}px)`;
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  const updateTooltipContent = useCallback((link: any, node?: any) => {
    if (!link && !node) return;

    isHoveringRef.current = true;

    let content;
    if (node) {
      // Node tooltip: conversion = node.value / sum of all incoming links
      const nodeValue = node.value || 0;
      const allIncomingLinks = sankeyData.links.filter(l => l.target === node.id);
      const firstStepNode = sankeyData.nodes.find(n => n.name === steps[0].name);
      const isFirstStep = firstStepNode && node.id === firstStepNode.id;
      let prevValue;
      if (allIncomingLinks.length > 0) {
        prevValue = allIncomingLinks.reduce((sum, l) => sum + (l.value || 0), 0);
      } else if (isFirstStep) {
        prevValue = initialValue;
      } else {
        prevValue = 0;
      }
      const conv = prevValue > 0 ? ((nodeValue / prevValue) * 100).toFixed(1) : null;

      // Find the original step to check if value was adjusted
      const originalStep = steps.find(s => `step-${s.id}` === node.id);
      const wasAdjusted = originalStep && originalStep.visitorCount > nodeValue;

      content = (
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(30,41,59,0.10)',
          minWidth: 280,
          border: '1px solid #e2e8f0',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          zIndex: 1000
        }}>
          <div style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: node.isOptional ? '#fef3c7' : node.isSplit ? '#dcfce7' : '#dbeafe',
              color: node.isOptional ? '#92400e' : node.isSplit ? '#166534' : '#1e40af',
              fontSize: 16,
              marginRight: 12
            }}>
              {node.isOptional ? '⚡' : node.isSplit ? '↳' : '●'}
            </span>
            <div>
              <div style={{
                fontWeight: 600,
                fontSize: 15,
                color: '#1e293b',
                marginBottom: 4
              }}>
                {node.name}
              </div>
              <div style={{
                fontSize: 13,
                color: '#64748b'
              }}>
                {node.isOptional ? 'Optional Step' : node.isSplit ? 'Split Path' : 'Main Step'}
              </div>
            </div>
          </div>
          <div style={{ 
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '6px',
            marginBottom: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#f1f5f9',
                color: '#2563eb',
                fontSize: 15,
                marginRight: 6
              }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-6 1.57-6 3.5V18h12v-2.5c0-1.93-2.69-3.5-6-3.5z" fill="#2563eb"/></svg>
              </span>
              <span style={{ fontSize: 14, color: '#334155' }}>
                <b>{nodeValue.toLocaleString()}</b> users
              </span>
            </div>
            {wasAdjusted && (
              <div style={{ 
                fontSize: 12, 
                color: '#ef4444',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span>⚠️</span>
                <span>Adjusted from {originalStep.visitorCount.toLocaleString()}</span>
              </div>
            )}
            {conv !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: '#e0f2fe',
                  color: '#0284c7',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.2
                }}>
                  {conv}%
                </span>
                <span style={{ fontSize: 13, color: '#64748b' }}>conversion</span>
              </div>
            )}
          </div>
          {node.isOptional && (
            <div style={{ 
              padding: '8px 12px',
              background: '#fef3c7',
              borderRadius: '6px',
              fontSize: 13,
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>⚡</span>
              <span>Users can skip this step and still proceed</span>
            </div>
          )}
        </div>
      );
    } else if (link) {
      // Link tooltip: conversion = link.value / source node value
      const sourceNode = sankeyData.nodes.find(n => n.id === (link.source.id || link.source));
      const sourceValue = sourceNode ? sourceNode.value : 0;
      const conv = sourceValue > 0 ? ((link.value / sourceValue) * 100).toFixed(1) : null;

      content = (
        <div style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(30,41,59,0.10)',
          minWidth: 280,
          border: '1px solid #e2e8f0',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          zIndex: 1000
        }}>
          <div style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid white'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{
              fontWeight: 600,
              fontSize: 15,
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              {link.source.name}
              <span style={{ fontSize: 18, color: '#64748b', margin: '0 6px' }}>→</span>
              {link.target.name}
            </span>
            {link.source.id !== 'start' && !steps.find(s => `step-${s.id}` === link.source.id)?.isRequired && (
              <span style={{
                marginLeft: 8,
                padding: '2px 8px',
                background: '#fef3c7',
                color: '#92400e',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500
              }}>
                Skip Path
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#f1f5f9',
              color: '#2563eb',
              fontSize: 15,
              marginRight: 6
            }}>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-6 1.57-6 3.5V18h12v-2.5c0-1.93-2.69-3.5-6-3.5z" fill="#2563eb"/></svg>
            </span>
            <span style={{ fontSize: 14, color: '#334155' }}>
              <b>{link.value.toLocaleString()}</b> users
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '6px',
              background: '#e0f2fe',
              color: '#0284c7',
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 0.2
            }}>
              {conv}%
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>conversion</span>
          </div>
          {link.source.id !== 'start' && !steps.find(s => `step-${s.id}` === link.source.id)?.isRequired && (
            <div style={{ 
              marginTop: 8,
              padding: '8px',
              background: '#fef3c7',
              borderRadius: 4,
              fontSize: 12,
              color: '#92400e'
            }}>
              Users can skip this optional step and still proceed to the next step
            </div>
          )}
        </div>
      );
    }

    if (tooltipRef.current) {
      tooltipRef.current.innerHTML = '';
      const root = document.createElement('div');
      ReactDOM.render(content, root);
      tooltipRef.current.appendChild(root);
      tooltipRef.current.style.display = 'block';
    }
  }, [steps, initialValue, sankeyData]);

  const CustomTooltip = useCallback(({ node, link }: { node?: any; link?: any }) => {
    if (node || link) {
      updateTooltipContent(link, node);
    }
    return null;
  }, [updateTooltipContent]);

  return (
    <div style={{ 
      height: '90vh',
      minHeight: '800px',
      maxHeight: '1200px',
      background: '#f8fafc', 
      borderRadius: 12, 
      padding: '24px 16px',
      boxShadow: '0 2px 12px rgba(30,41,59,0.04)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Summary Section */}
      <div style={{ 
        display: 'flex', 
        gap: 24, 
        marginBottom: 16,
        padding: '12px 16px',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Total Steps</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
            {totalSteps}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Optional Steps</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f59e0b' }}>
            {optionalSteps}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Split Paths</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981' }}>
            {splitSteps}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Final Conversion</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
            {finalConversion}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 16,
        marginBottom: 16,
        padding: '16px',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: '#1e293b',
          marginBottom: 8
        }}>
          Funnel Steps
        </div>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 12
        }}>
          {validatedSteps.map((step, index) => (
            <div key={step.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px',
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: step.isRequired ? MAIN_COLOR : OPTIONAL_COLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
                fontSize: 12,
                border: step.isRequired ? 'none' : '1px solid #854d0e'
              }}>
                {index + 1}
              </div>
              <div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: 2
                }}>
                  {step.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>{step.validatedCount.toLocaleString()} users</span>
                  {!step.isRequired && (
                    <span style={{
                      padding: '2px 6px',
                      background: '#fef3c7',
                      color: '#854d0e',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 500
                    }}>
                      Optional
                    </span>
                  )}
                </div>
                {step.validatedCount < step.visitorCount && (
                  <div style={{
                    fontSize: 11,
                    color: '#ef4444',
                    marginTop: 4
                  }}>
                    Adjusted from {step.visitorCount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div style={{ 
        fontSize: 13, 
        color: '#64748b', 
        marginBottom: 16,
        lineHeight: 1.5,
        padding: '12px',
        background: '#f1f5f9',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong style={{ color: '#1e293b' }}>How to read this visualization:</strong>
        </p>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          listStyleType: 'disc'
        }}>
          <li>The width of each node represents the number of users at that step</li>
          <li>Main steps are shown in blue, split paths in green, and optional steps in amber</li>
          <li>Optional steps can be skipped - look for the dashed border and skip paths</li>
          <li>Hover over any node or connection to see detailed metrics</li>
          <li>Split paths show how users branch into different flows and rejoin the main funnel</li>
        </ul>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          minHeight: 0, 
          overflowX: 'auto', 
          overflowY: 'hidden',
          position: 'relative',
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ 
          minWidth: '100%',
          height: '100%',
          padding: '40px 0',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Sankey
              width={sankeyWidth}
              height={750}
              data={sankeyData}
              margin={{ top: 100, right: 10, bottom: 60, left: 10 }}
              align="justify"
              colors={node => {
                console.log('Node:', node.id, 'Color:', getNodeColor(node)); // Add logging to debug
                return getNodeColor(node);
              }}
              nodeOpacity={0.95}
              nodeThickness={12}
              nodeInnerPadding={3}
              nodeBorderWidth={1}
              nodeBorderColor={node => {
                if (node.id.includes('split-variation')) return '#0e7490'; // Darker cyan for splits
                if (node.isOptional) return '#7e22ce'; // Darker violet
                return '#1e40af'; // Darker blue
              }}
              linkOpacity={0.5}
              linkHoverOpacity={0.7}
              linkContract={2}
              enableLinkGradient={true}
              label={null}
              nodeSpacing={2}
              layout="horizontal"
              sort="input"
              nodeTooltip={CustomTooltip}
              linkTooltip={CustomTooltip}
              theme={{
                tooltip: {
                  container: {
                    display: 'none'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Custom Tooltip */}
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1000,
            pointerEvents: 'none',
            display: 'none',
            transform: 'translate(0, 0)',
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  );
};

export default FunnelSankeyVisualization;
export { FunnelSankeyVisualization }; 