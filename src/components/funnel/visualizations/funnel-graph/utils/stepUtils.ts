
import { SankeyNode, StepDetails } from "../types";
import { FunnelStep } from "@/types/funnel";

/**
 * Get details for a specific step in the funnel
 */
export const getStepDetails = (node: SankeyNode, steps: FunnelStep[], initialValue: number): StepDetails => {
  // Find the corresponding step in the steps array
  let stepIndex = -1;
  let stepName = node.name;
  let value = node.value;
  let previousValue = initialValue;
  
  // Special case for initial node
  if (node.id === "initial") {
    return {
      name: stepName,
      value: value,
      percentage: 100,
      dropOff: 0,
      previousValue: value
    };
  }
  
  // Extract step index from node ID (format: step-X or step-X-split-Y)
  const idParts = node.id.split('-');
  if (idParts.length >= 2) {
    stepIndex = parseInt(idParts[1]);
    
    // Set previous step value
    if (stepIndex > 0 && steps[stepIndex - 1]) {
      previousValue = steps[stepIndex - 1].value || initialValue;
    } else if (stepIndex === 0) {
      previousValue = initialValue;
    }
  }
  
  // Ensure we don't divide by zero
  const percentage = previousValue > 0 ? (value / previousValue) * 100 : 0;
  const dropOff = previousValue - value;
  
  return {
    name: stepName,
    value: value,
    percentage: percentage,
    dropOff: dropOff,
    previousValue: previousValue
  };
};
