import { useMemo } from "react";
import { FunnelStep } from "@/types/funnel";
import { SankeyData, SankeyNode, SankeyLink } from "./types";

export const useSankeyData = (enabledSteps: FunnelStep[], initialValue: number): SankeyData => {
  return useMemo(() => {
    console.log("[DEBUG] useSankeyData called with:", {
      enabledStepsCount: enabledSteps.length,
      initialValue,
      steps: enabledSteps.map(step => ({
        name: step.name,
        value: step.value,
        visitorCount: step.visitorCount,
        hasSplit: step.split && step.split.length > 0
      }))
    });

    if (enabledSteps.length === 0) {
      console.log("[DEBUG] No enabled steps, returning empty data");
      return { nodes: [], links: [] };
    }
    
    // Define colors for different steps - make them more distinct
    const nodeColors = [
      "#3b82f6", // Blue
      "#10b981", // Green
      "#8b5cf6", // Purple
      "#f59e0b", // Amber
      "#ef4444", // Red
      "#06b6d4", // Cyan
    ];
    
    // Prepare nodes data
    const nodes: SankeyNode[] = [];
    let previousValue = initialValue;
    
    // Create nodes for main steps
    enabledSteps.forEach((step, index) => {
      const currentValue = step.value || 0;
      const color = nodeColors[index % nodeColors.length];
      
      console.log(`[DEBUG] Creating node for step ${step.name}:`, {
        id: `step-${index}`,
        value: currentValue,
        color
      });
      
      nodes.push({
        id: `step-${index}`,
        name: step.name,
        value: currentValue,
        color,
        mainStepColor: color, // Store color for reference by split steps
        x: 0, // Will be calculated later
        y: 0, // Will be calculated later
        width: 0,
        height: 0
      });
      
      // Handle split steps if they exist - add null check for step.split
      if (step.split && step.split.length > 0) {
        console.log(`[DEBUG] Processing splits for step ${step.name}:`, step.split);
        step.split.forEach((splitStep, splitIndex) => {
          const splitValue = splitStep.value || 0;
          // Only add split steps with values
          if (splitValue > 0) {
            // Create a lighter version of the parent color for the split
            const baseColor = color;
            // Add the split step with distinctive styling
            nodes.push({
              id: `step-${index}-split-${splitIndex}`,
              name: splitStep.name,
              value: splitValue,
              // Make split step use a lighter/transparent version of parent color
              color: baseColor + "80", // Add transparency to parent color
              mainStepColor: color, // Reference to parent color
              x: 0,
              y: 0,
              width: 0,
              height: 0
            });
            console.log(`[DEBUG] Created split node:`, {
              id: `step-${index}-split-${splitIndex}`,
              name: splitStep.name,
              value: splitValue
            });
          }
        });
      }
      
      previousValue = currentValue;
    });
    
    // Prepare links data
    const links: SankeyLink[] = [];
    previousValue = initialValue;
    
    console.log("[DEBUG] Creating links between nodes");
    
    // Create links between nodes
    for (let i = 0; i < enabledSteps.length; i++) {
      const currentStep = enabledSteps[i];
      const currentValue = currentStep.value || 0;
      
      // Add link from previous step to current step
      if (i === 0) {
        // This is the first step, link from initialValue
        console.log(`[DEBUG] Creating initial link to step ${currentStep.name}:`, {
          source: "initial",
          target: `step-${i}`,
          value: currentValue,
          sourceValue: initialValue
        });
        links.push({
          source: "initial",
          target: `step-${i}`,
          value: currentValue,
          sourceValue: initialValue, // Add source value for percentage calculation
          path: "", // Will be calculated later
          color: nodes[i].color + "90", // Add transparency
          sourceColor: "#9b87f5" + "90", // Color for initial node
          targetColor: nodes[i].color + "90", // Add target color for gradient
          labelPercentage: `${((currentValue / initialValue) * 100).toFixed(1)}%` // Add formatted percentage
        });
      } else {
        const prevStep = enabledSteps[i - 1];
        const prevValue = prevStep.value || 0;
        
        // Skip links from zero value nodes
        if (prevValue === 0) {
          console.log(`[DEBUG] Skipping link from step ${prevStep.name} (zero value)`);
          // Use continue to skip to the next iteration
          continue;
        }
        
        // Check for zero or undefined values to avoid NaN
        const percentage = prevValue > 0 ? ((currentValue / prevValue) * 100) : 0;
        // Format percentage safely
        const formattedPercentage = isNaN(percentage) ? "0.0" : percentage.toFixed(1);
        
        // Only create the direct link from previous -> current if the previous step is required
        // (or if there is no step before the previous one to form a bypass).
        if (prevStep.isRequired || i < 2) {
          console.log(`[DEBUG] Creating link from ${prevStep.name} to ${currentStep.name}:`, {
            source: `step-${i - 1}`,
            target: `step-${i}`,
            value: currentValue,
            sourceValue: prevValue,
            percentage: formattedPercentage
          });
          links.push({
            source: `step-${i - 1}`,
            target: `step-${i}`,
            value: currentValue,
            sourceValue: prevValue, // Add source value for percentage calculation
            path: "", 
            color: nodes[i].color + "90",
            labelValue: `${currentValue.toLocaleString()}`,
            labelPercentage: `${formattedPercentage}%`,
            // Add source and target colors for gradient
            sourceColor: nodes[i-1].color + "90",
            targetColor: nodes[i].color + "90"
          });
        }
        
        // Handle links from previous step splits to current step if they exist
        // Add null check for prevStep.split
        if (prevStep.split && prevStep.split.length > 0) {
          prevStep.split.forEach((splitStep, splitIndex) => {
            // Link from each split to the current step
            const splitValue = splitStep.value || 0;
            if (splitValue > 0) {
              const splitPercentage = prevValue > 0 ? ((splitValue / prevValue) * 100) : 0;
              const formattedSplitPercentage = isNaN(splitPercentage) ? "0.0" : splitPercentage.toFixed(1);
              
              const sourceNode = nodes.find(n => n.id === `step-${i-1}-split-${splitIndex}`);
              if (sourceNode) {
                console.log(`[DEBUG] Creating split link from ${splitStep.name} to ${currentStep.name}:`, {
                  source: `step-${i-1}-split-${splitIndex}`,
                  target: `step-${i}`,
                  value: splitValue,
                  percentage: formattedSplitPercentage
                });
                links.push({
                  source: `step-${i-1}-split-${splitIndex}`,
                  target: `step-${i}`,
                  value: splitValue,
                  sourceValue: splitValue, // Use the split value as source for percentage
                  path: "",
                  color: (sourceNode?.color || "#cccccc") + "90",
                  labelValue: `${splitValue.toLocaleString()}`,
                  labelPercentage: `${formattedSplitPercentage}%`,
                  sourceColor: (sourceNode?.color || "#cccccc") + "90",
                  targetColor: nodes[i].color + "90"
                });
              }
            }
          });
        }
      }
      
      // Handle splits if they exist for the current step
      // Add null check for currentStep.split
      if (currentStep.split && currentStep.split.length > 0) {
        currentStep.split.forEach((splitStep, splitIndex) => {
          const splitValue = splitStep.value || 0;
          
          // Skip links to zero value nodes - fixed to properly scope the continue
          if (currentValue === 0) {
            return; // Use return in forEach instead of continue
          }
          
          // Check for zero or undefined values to avoid NaN
          const splitPercentage = currentValue > 0 ? ((splitValue / currentValue) * 100) : 0;
          // Format percentage safely
          const formattedSplitPercentage = isNaN(splitPercentage) ? "0.0" : splitPercentage.toFixed(1);
          
          const targetNode = nodes.find(n => n.id === `step-${i}-split-${splitIndex}`);
          
          console.log(`[DEBUG] Creating link from ${currentStep.name} to split ${splitStep.name}:`, {
            source: `step-${i}`,
            target: `step-${i}-split-${splitIndex}`,
            value: splitValue,
            percentage: formattedSplitPercentage
          });
          
          links.push({
            source: `step-${i}`,
            target: `step-${i}-split-${splitIndex}`,
            value: splitValue,
            sourceValue: currentValue, // Add source value for percentage calculation
            path: "",
            color: (targetNode?.color || "#cccccc") + "90",
            labelValue: `${splitValue.toLocaleString()}`,
            labelPercentage: `${formattedSplitPercentage}%`,
            // Add source and target colors for gradient
            sourceColor: nodes[i].color + "90",
            targetColor: (targetNode?.color || "#cccccc") + "90"
          });
        });
      }
      
      // Check for optional step logic (bypass link generation)
      if (i >= 2) {
        const prevStep = enabledSteps[i - 1];
        const prevValue = prevStep.value || 0;
        
        if (!prevStep.isRequired) {
          // The previous step is optional – create two links:
          // 1. From the optional step to the current step (scaled value)
          // 2. A bypass link that skips the optional step (from the step before the optional one)

          const prevPrevStep = enabledSteps[i - 2];
          const prevPrevValue = prevPrevStep.value || 0;
          const optionalStepValue = prevValue;

          // Proportion of users that went through the optional step relative to the step before it
          const optionalShare = prevPrevValue > 0 ? optionalStepValue / prevPrevValue : 0;

          // Allocate current step visitors proportionally between the two incoming paths
          const valueFromOptional = Math.round(currentValue * optionalShare);
          const valueBypassing   = currentValue - valueFromOptional;

          // --- Link from optional step -> current step --- //
          if (valueFromOptional > 0) {
            const formattedPercOpt = optionalStepValue > 0 ? ((valueFromOptional / optionalStepValue) * 100).toFixed(1) : "0.0";
            links.push({
              source: `step-${i - 1}`,
              target: `step-${i}`,
              value: valueFromOptional,
              sourceValue: optionalStepValue,
              path: "",
              color: nodes[i - 1].color + "90",
              labelValue: `${valueFromOptional.toLocaleString()}`,
              labelPercentage: `${formattedPercOpt}%`,
              sourceColor: nodes[i - 1].color + "90",
              targetColor: nodes[i].color + "90"
            });
          }

          // --- Bypass link prevPrev -> current step --- //
          if (valueBypassing > 0) {
            const formattedPercBypass = prevPrevValue > 0 ? ((valueBypassing / prevPrevValue) * 100).toFixed(1) : "0.0";
            links.push({
              source: `step-${i - 2}`,
              target: `step-${i}`,
              value: valueBypassing,
              sourceValue: prevPrevValue,
              path: "",
              // Use a semi-transparent grey to visually distinguish the bypass link
              color: "#6b7280" + "80", // Tailwind slate-500 with transparency
              labelValue: `${valueBypassing.toLocaleString()}`,
              labelPercentage: `${formattedPercBypass}%`,
              sourceColor: nodes[i - 2].color + "90",
              targetColor: nodes[i].color + "90"
            });
          }
        }
      }
      
      previousValue = currentValue;
    }
    
    console.log("[DEBUG] Generated Sankey data:", { 
      nodes: nodes.length, 
      links: links.length,
      nodeIds: nodes.map(n => n.id),
      linkDetails: links.map(l => ({ source: l.source, target: l.target, value: l.value }))
    });
    return { nodes, links };
  }, [enabledSteps, initialValue]);
};

export default useSankeyData;
