import { useState, useEffect } from 'react';
import { Funnel, FunnelStep } from '@/types/funnel';
import { mockFunnelCalculationService } from '@/services/mockFunnelCalculationService';

interface UseFunnelCalculationProps {
  steps: FunnelStep[];
  initialValue: number;
  funnelId?: string;
  autoCalculate?: boolean;
}

interface UseFunnelCalculationReturn {
  calculatedSteps: FunnelStep[];
  isLoading: boolean;
  error: string | null;
  calculateFunnel: () => Promise<void>;
}

/**
 * Hook that automatically calculates visitor counts for funnel steps when they're missing
 */
export const useFunnelCalculation = ({
  steps,
  initialValue,
  funnelId,
  autoCalculate = true
}: UseFunnelCalculationProps): UseFunnelCalculationReturn => {
  const [calculatedSteps, setCalculatedSteps] = useState<FunnelStep[]>(steps);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if steps need calculation (have no visitor counts)
  const needsCalculation = steps.some(step => 
    step.isEnabled && (step.value === undefined || step.value === 0)
  );

  const calculateFunnel = async () => {
    if (!needsCalculation) {
      console.log('[DEBUG] No calculation needed - steps already have visitor counts');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[DEBUG] Calculating funnel with mock service...');
      
      // Create a temporary funnel object for calculation
      const tempFunnel: Funnel = {
        id: funnelId || 'temp-funnel',
        name: 'Temporary Funnel',
        description: 'Temporary funnel for calculation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastCalculatedAt: null,
        timeframe: {
          from: Date.now() - 30 * 24 * 60 * 60 * 1000,
          to: Date.now()
        },
        performedBy: 'all_contacts',
        steps: steps
      };

      // Calculate using mock service
      const results = await mockFunnelCalculationService.calculateFunnel({
        funnel: tempFunnel,
        initialValue,
        options: {
          includeSplitVariations: true,
          includeMetrics: true,
          includeInsights: true
        }
      });

      console.log('[DEBUG] Calculation results:', results);

      // Update steps with calculated visitor counts and split variations
      const updatedSteps = steps.map(step => {
        const calculatedValue = results.calculatedResults[step.id];
        let updatedStep = { ...step };
        
        if (calculatedValue !== undefined) {
          updatedStep = {
            ...updatedStep,
            value: calculatedValue,
            visitorCount: calculatedValue
          };
        }
        
        // Handle split variations - convert to the format expected by frontend
        if (step.splitVariations && step.splitVariations.length > 0) {
          const splitData = step.splitVariations.map((variation, index) => {
            const variationId = `${step.id}-variation-${index + 1}`;
            const calculatedVariationValue = results.calculatedResults[variationId];
            
            return {
              id: variation.id,
              name: variation.name,
              value: calculatedVariationValue || 0,
              visitorCount: calculatedVariationValue || 0
            };
          });
          
          // Update both split and splitVariations with calculated values
          updatedStep = {
            ...updatedStep,
            split: splitData, // Convert splitVariations to split format
            splitVariations: step.splitVariations.map((variation, index) => ({
              ...variation,
              visitorCount: results.calculatedResults[`${step.id}-variation-${index + 1}`] || 0
            }))
          };
        }
        
        return updatedStep;
      });

      setCalculatedSteps(updatedSteps);
      console.log('[DEBUG] Updated steps with calculated values:', updatedSteps);
      
      // Debug split variations
      updatedSteps.forEach((step, index) => {
        if (step.split && step.split.length > 0) {
          console.log(`[DEBUG] Step ${index} (${step.name}) has ${step.split.length} splits:`, 
            step.split.map(split => ({ name: split.name, value: split.value }))
          );
        }
      });

    } catch (err) {
      console.error('[ERROR] Failed to calculate funnel:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate funnel');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-calculate when needed
  useEffect(() => {
    if (autoCalculate && needsCalculation && steps.length > 0) {
      console.log('[DEBUG] Auto-calculating funnel...');
      calculateFunnel();
    }
  }, [steps, initialValue, autoCalculate, needsCalculation]);

  // Update calculated steps when input steps change
  useEffect(() => {
    setCalculatedSteps(steps);
  }, [steps]);

  return {
    calculatedSteps,
    isLoading,
    error,
    calculateFunnel
  };
};

export default useFunnelCalculation;
