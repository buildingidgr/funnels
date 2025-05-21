
import { FunnelStep } from "@/types/funnel";
import { SankeyNode, StepDetails } from "./types";

export const getStepDetails = (
  node: SankeyNode, 
  enabledSteps: FunnelStep[], 
  initialValue: number
): StepDetails => {
  // Find step details
  let stepDetails: StepDetails = {
    name: node.name,
    value: node.value,
    percentage: 0,
    dropOff: 0,
    previousValue: initialValue
  };
  
  // If this is not the initial node, find the corresponding step data
  if (node.id !== "initial") {
    const stepId = node.id.split("-")[1];
    const isSplit = node.id.includes("split");
    
    // For main funnel step
    if (!isSplit && enabledSteps[parseInt(stepId)]) {
      const step = enabledSteps[parseInt(stepId)];
      const prevStep = stepId === "0" ? null : enabledSteps[parseInt(stepId) - 1];
      const prevValue = prevStep ? prevStep.value || 0 : initialValue;
      
      stepDetails = {
        name: step.name,
        value: step.value || 0,
        percentage: prevValue > 0 ? ((step.value || 0) / prevValue) * 100 : 0,
        dropOff: prevValue - (step.value || 0),
        previousValue: prevValue
      };
    }
    // For split steps
    else if (isSplit) {
      const mainStepId = node.id.split("-")[1];
      const splitId = node.id.split("-")[3];
      
      // Convert string IDs to numbers for array access
      const mainStepIndex = parseInt(mainStepId);
      const splitIndex = parseInt(splitId);
      
      const mainStep = enabledSteps[mainStepIndex];
      
      if (mainStep && mainStep.split && mainStep.split[splitIndex]) {
        const splitStep = mainStep.split[splitIndex];
        stepDetails = {
          name: splitStep.name,
          value: splitStep.value || 0,
          percentage: (mainStep.value || 0) > 0 ? ((splitStep.value || 0) / (mainStep.value || 1)) * 100 : 0,
          dropOff: (mainStep.value || 0) - (splitStep.value || 0),
          previousValue: mainStep.value || 0
        };
      }
    }
  }
  
  return stepDetails;
};
