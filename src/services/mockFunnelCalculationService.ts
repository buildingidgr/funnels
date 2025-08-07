import { Funnel, FunnelStep, SplitVariation } from '@/types/funnel';

// Types for the calculation service
export interface FunnelCalculationRequest {
  funnel: Funnel;
  timeframe?: {
    from: number;
    to: number;
  };
  initialValue?: number;
  options?: {
    includeSplitVariations?: boolean;
    includeMetrics?: boolean;
    includeInsights?: boolean;
  };
}

export interface StepMetrics {
  id: string;
  name: string;
  visitorCount: number;
  conversionRate: number;
  dropOffRate: number;
  dropOffCount: number;
  previousStepValue: number;
  isOptional: boolean;
  isSplit?: boolean;
  parentStepId?: string;
}

export interface SplitVariationMetrics {
  id: string;
  name: string;
  visitorCount: number;
  conversionRate: number;
  dropOffRate: number;
  dropOffCount: number;
  parentStepId: string;
  proportionOfParent: number;
}

export interface FunnelInsights {
  overallConversionRate: number;
  totalDropOff: number;
  highestDropOffStep: StepMetrics;
  bestConvertingStep: StepMetrics;
  potentialRevenueLost?: number;
  improvementOpportunity: number;
  funnelType: 'ecommerce' | 'saas' | 'lead-gen' | 'mobile-app' | 'content' | 'support';
  recommendations: string[];
}

export interface FunnelCalculationResponse {
  // Core calculation results
  calculatedResults: Record<string, number>;
  
  // Step-by-step metrics
  stepMetrics: StepMetrics[];
  
  // Split variation metrics
  splitVariationMetrics: SplitVariationMetrics[];
  
  // Overall funnel insights
  insights: FunnelInsights;
  
  // Sankey visualization data
  sankeyData: {
    nodes: Array<{
      id: string;
      name: string;
      value: number;
      isOptional?: boolean;
      isSplit?: boolean;
      parentId?: string;
    }>;
    links: Array<{
      source: string;
      target: string;
      value: number;
    }>;
  };
  
  // Metadata
  metadata: {
    calculatedAt: string;
    timeframe: {
      from: number;
      to: number;
    };
    totalSteps: number;
    enabledSteps: number;
    initialValue: number;
  };
}

class MockFunnelCalculationService {
  private static instance: MockFunnelCalculationService;
  
  private constructor() {}
  
  public static getInstance(): MockFunnelCalculationService {
    if (!MockFunnelCalculationService.instance) {
      MockFunnelCalculationService.instance = new MockFunnelCalculationService();
    }
    return MockFunnelCalculationService.instance;
  }

  /**
   * Main calculation method that processes funnel data and returns comprehensive results
   * The funnel data should contain only steps and conditions - no visitor counts
   * The service will calculate all visitor counts and metrics automatically
   */
  public async calculateFunnel(request: FunnelCalculationRequest): Promise<FunnelCalculationResponse> {
    const { funnel, timeframe, initialValue = 10000, options = {} } = request;
    
    console.log('Starting funnel calculation for:', funnel.name);
    console.log('Initial value:', initialValue);
    
    // Filter enabled steps
    const enabledSteps = funnel.steps.filter(step => step.isEnabled);
    
    if (enabledSteps.length === 0) {
      throw new Error('No enabled steps found in funnel');
    }

    // Calculate step-by-step results
    const calculatedResults: Record<string, number> = {};
    const stepMetrics: StepMetrics[] = [];
    const splitVariationMetrics: SplitVariationMetrics[] = [];

    let previousValue = initialValue;
    calculatedResults['start'] = initialValue;

    // Process each step - calculate visitor counts automatically
    for (let i = 0; i < enabledSteps.length; i++) {
      const step = enabledSteps[i];
      
      // Calculate visitor count based on step type and conditions
      const stepValue = this.calculateRealisticStepValue(previousValue, step, i);
      
      // Store the calculated value
      calculatedResults[step.id] = stepValue;
      
      // Calculate metrics for this step
      const conversionRate = previousValue > 0 ? (stepValue / previousValue) * 100 : 0;
      const dropOffRate = previousValue > 0 ? ((previousValue - stepValue) / previousValue) * 100 : 0;
      const dropOffCount = previousValue - stepValue;
      
      const stepMetric: StepMetrics = {
        id: step.id,
        name: step.name,
        visitorCount: stepValue,
        conversionRate,
        dropOffRate,
        dropOffCount,
        previousStepValue: previousValue,
        isOptional: !step.isRequired
      };
      
      stepMetrics.push(stepMetric);
      
      // Process split variations if they exist - calculate visitor counts automatically
      if (step.splitVariations && step.splitVariations.length > 0) {
        const totalSplitValue = stepValue;
        
        // Calculate realistic proportions for split variations
        const splitProportions = this.calculateSplitVariationProportions(step.splitVariations);
        
        step.splitVariations.forEach((variation, varIndex) => {
          const variationId = `${step.id}-variation-${varIndex + 1}`;
          
          // Calculate visitor count based on proportion
          const proportion = splitProportions[varIndex];
          const variationValue = Math.round(totalSplitValue * proportion);
          
          calculatedResults[variationId] = variationValue;
          
          const variationConversionRate = totalSplitValue > 0 ? (variationValue / totalSplitValue) * 100 : 0;
          const variationDropOffRate = totalSplitValue > 0 ? ((totalSplitValue - variationValue) / totalSplitValue) * 100 : 0;
          const variationDropOffCount = totalSplitValue - variationValue;
          
          const splitMetric: SplitVariationMetrics = {
            id: variationId,
            name: variation.name,
            visitorCount: variationValue,
            conversionRate: variationConversionRate,
            dropOffRate: variationDropOffRate,
            dropOffCount: variationDropOffCount,
            parentStepId: step.id,
            proportionOfParent: proportion * 100
          };
          
          splitVariationMetrics.push(splitMetric);
        });
      }
      
      previousValue = stepValue;
    }
    
    // Set final step value
    calculatedResults['end'] = previousValue;
    
    // Generate Sankey data
    const sankeyData = this.generateSankeyData(enabledSteps, calculatedResults, initialValue);
    
    // Generate insights
    const insights = this.generateFunnelInsights(stepMetrics, splitVariationMetrics, initialValue, funnel);
    
    // Create metadata
    const metadata = {
      calculatedAt: new Date().toISOString(),
      timeframe: timeframe || funnel.timeframe,
      totalSteps: funnel.steps.length,
      enabledSteps: enabledSteps.length,
      initialValue
    };
    
    const response: FunnelCalculationResponse = {
      calculatedResults,
      stepMetrics,
      splitVariationMetrics,
      insights,
      sankeyData,
      metadata
    };
    
    console.log('Funnel calculation completed:', response);
    return response;
  }

  /**
   * Calculate realistic step values based on funnel characteristics
   */
  private calculateRealisticStepValue(previousValue: number, step: FunnelStep, stepIndex: number): number {
    // Base conversion rates by step type
    const baseRates = {
      'page_view': 0.95,
      'product_interaction': 0.20,
      'add_to_cart': 0.10,
      'cart_view': 0.80,
      'checkout_started': 0.60,
      'payment_info_entered': 0.75,
      'purchase': 0.70,
      'signup': 0.15,
      'login': 0.85,
      'download': 0.25,
      'subscribe': 0.08,
      'contact': 0.05
    };
    
    // Determine step type from conditions
    const stepType = this.determineStepType(step);
    const baseRate = baseRates[stepType] || 0.50;
    
    // Apply modifiers based on step characteristics
    let finalRate = baseRate;
    
    // Optional steps have higher conversion rates
    if (!step.isRequired) {
      finalRate *= 1.2;
    }
    
    // Later steps in funnel have lower conversion rates
    if (stepIndex > 3) {
      finalRate *= 0.9;
    }
    
    // Add some randomness (±10%)
    const randomFactor = 0.9 + (Math.random() * 0.2);
    finalRate *= randomFactor;
    
    // Ensure rate is between 0 and 1
    finalRate = Math.max(0.01, Math.min(0.99, finalRate));
    
    return Math.round(previousValue * finalRate);
  }

  /**
   * Calculate realistic proportions for split variations
   */
  private calculateSplitVariationProportions(splitVariations: SplitVariation[]): number[] {
    const numVariations = splitVariations.length;
    
    if (numVariations === 0) return [];
    
    // Base proportions - typically one variation performs better
    const baseProportions = [0.6, 0.4]; // 60% vs 40% for 2 variations
    const threeWayProportions = [0.5, 0.3, 0.2]; // 50%, 30%, 20% for 3 variations
    const fourWayProportions = [0.4, 0.3, 0.2, 0.1]; // 40%, 30%, 20%, 10% for 4+ variations
    
    let proportions: number[];
    
    if (numVariations === 2) {
      proportions = baseProportions;
    } else if (numVariations === 3) {
      proportions = threeWayProportions;
    } else {
      // For 4+ variations, use the four-way split and extend
      proportions = [...fourWayProportions];
      while (proportions.length < numVariations) {
        proportions.push(0.1 / (numVariations - 3)); // Distribute remaining 10%
      }
    }
    
    // Add some randomness to make it more realistic
    const randomizedProportions = proportions.map(p => {
      const randomFactor = 0.8 + (Math.random() * 0.4); // ±20% variation
      return Math.max(0.05, Math.min(0.95, p * randomFactor));
    });
    
    // Normalize to ensure they sum to 1
    const total = randomizedProportions.reduce((sum, p) => sum + p, 0);
    return randomizedProportions.map(p => p / total);
  }

  /**
   * Determine step type from conditions
   */
  private determineStepType(step: FunnelStep): string {
    if (!step.conditions?.orEventGroups?.length) return 'page_view';
    
    const eventName = step.conditions.orEventGroups[0]?.eventName || 'page_view';
    
    // Map common event names to step types
    const eventMapping: Record<string, string> = {
      'page_view': 'page_view',
      'product_interaction': 'product_interaction',
      'add_to_cart': 'add_to_cart',
      'cart_view': 'cart_view',
      'checkout_started': 'checkout_started',
      'payment_info_entered': 'payment_info_entered',
      'purchase': 'purchase',
      'signup': 'signup',
      'login': 'login',
      'download': 'download',
      'subscribe': 'subscribe',
      'contact': 'contact'
    };
    
    return eventMapping[eventName] || 'page_view';
  }

  /**
   * Generate Sankey visualization data
   */
  private generateSankeyData(
    steps: FunnelStep[], 
    calculatedResults: Record<string, number>, 
    initialValue: number
  ) {
    const nodes = [
      { id: 'start', name: 'Start', value: initialValue }
    ];
    
    const links: Array<{ source: string; target: string; value: number }> = [];
    
    // Add step nodes
    steps.forEach((step, index) => {
      const stepId = `step-${step.id}`;
      const stepValue = calculatedResults[step.id] || 0;
      
      nodes.push({
        id: stepId,
        name: step.name,
        value: stepValue,
        isOptional: !step.isRequired
      } as any);
      
      // Add link from previous step or start
      const sourceId = index === 0 ? 'start' : `step-${steps[index - 1].id}`;
      const linkValue = index === 0 ? stepValue : stepValue;
      
      if (linkValue > 0) {
        links.push({
          source: sourceId,
          target: stepId,
          value: linkValue
        });
      }
      
      // Add split variation nodes and links
      if (step.splitVariations && step.splitVariations.length > 0) {
        step.splitVariations.forEach((variation, varIndex) => {
          const variationId = `${step.id}-variation-${varIndex + 1}`;
          const variationValue = calculatedResults[variationId] || 0;
          
          if (variationValue > 0) {
            nodes.push({
              id: `split-${step.id}-${varIndex}`,
              name: variation.name,
              value: variationValue,
              isSplit: true,
              parentId: stepId
            } as any);
            
            links.push({
              source: stepId,
              target: `split-${step.id}-${varIndex}`,
              value: variationValue
            });
          }
        });
      }
    });
    
    // Add end node
    const finalStepValue = calculatedResults[steps[steps.length - 1].id] || 0;
    nodes.push({ id: 'end', name: 'End', value: finalStepValue });
    
    // Add final link
    if (finalStepValue > 0) {
      links.push({
        source: `step-${steps[steps.length - 1].id}`,
        target: 'end',
        value: finalStepValue
      });
    }
    
    return { nodes, links };
  }

  /**
   * Generate comprehensive funnel insights
   */
  private generateFunnelInsights(
    stepMetrics: StepMetrics[],
    splitVariationMetrics: SplitVariationMetrics[],
    initialValue: number,
    funnel: Funnel
  ): FunnelInsights {
    // Find highest drop-off step
    const highestDropOffStep = stepMetrics.reduce((highest, current) => {
      return current.dropOffRate > highest.dropOffRate ? current : highest;
    }, stepMetrics[0]);
    
    // Find best converting step
    const bestConvertingStep = stepMetrics.reduce((best, current) => {
      return current.conversionRate > best.conversionRate ? current : best;
    }, stepMetrics[0]);
    
    // Calculate overall metrics
    const finalStep = stepMetrics[stepMetrics.length - 1];
    const overallConversionRate = (finalStep.visitorCount / initialValue) * 100;
    const totalDropOff = initialValue - finalStep.visitorCount;
    const improvementOpportunity = (totalDropOff / initialValue) * 100;
    
    // Determine funnel type from name and description
    const funnelType = this.determineFunnelType(funnel);
    
    // Calculate potential revenue lost (mock calculation)
    const revenuePerConversion = this.getRevenuePerConversion(funnelType);
    const potentialRevenueLost = totalDropOff * revenuePerConversion;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(stepMetrics, funnelType);
    
    return {
      overallConversionRate,
      totalDropOff,
      highestDropOffStep,
      bestConvertingStep,
      potentialRevenueLost,
      improvementOpportunity,
      funnelType,
      recommendations
    };
  }

  /**
   * Determine funnel type from funnel data
   */
  private determineFunnelType(funnel: Funnel): 'ecommerce' | 'saas' | 'lead-gen' | 'mobile-app' | 'content' | 'support' {
    const name = funnel.name.toLowerCase();
    const description = funnel.description.toLowerCase();
    
    if (name.includes('ecommerce') || name.includes('purchase') || description.includes('cart') || description.includes('checkout')) {
      return 'ecommerce';
    }
    if (name.includes('saas') || name.includes('signup') || description.includes('subscription')) {
      return 'saas';
    }
    if (name.includes('lead') || name.includes('contact') || description.includes('form')) {
      return 'lead-gen';
    }
    if (name.includes('mobile') || name.includes('app') || description.includes('download')) {
      return 'mobile-app';
    }
    if (name.includes('content') || name.includes('article') || description.includes('read')) {
      return 'content';
    }
    if (name.includes('support') || name.includes('help') || description.includes('ticket')) {
      return 'support';
    }
    
    return 'ecommerce'; // default
  }

  /**
   * Get revenue per conversion based on funnel type
   */
  private getRevenuePerConversion(funnelType: string): number {
    const defaults = {
      'ecommerce': 75,
      'saas': 500,
      'lead-gen': 200,
      'mobile-app': 25,
      'content': 150,
      'support': 100
    };
    return defaults[funnelType as keyof typeof defaults] || 50;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(stepMetrics: StepMetrics[], funnelType: string): string[] {
    const recommendations: string[] = [];
    
    // Find the step with highest drop-off
    const highestDropOff = stepMetrics.reduce((highest, current) => {
      return current.dropOffRate > highest.dropOffRate ? current : highest;
    }, stepMetrics[0]);
    
    recommendations.push(`Focus on improving ${highestDropOff.name} - currently has ${highestDropOff.dropOffRate.toFixed(1)}% drop-off`);
    
    // Find the best performing step
    const bestStep = stepMetrics.reduce((best, current) => {
      return current.conversionRate > best.conversionRate ? current : best;
    }, stepMetrics[0]);
    
    recommendations.push(`Use ${bestStep.name} as a model - it has the best conversion rate at ${bestStep.conversionRate.toFixed(1)}%`);
    
    // Add funnel-type specific recommendations
    const typeRecommendations = {
      'ecommerce': 'Optimize cart abandonment recovery and checkout flow',
      'saas': 'Improve signup flow and onboarding experience',
      'lead-gen': 'Simplify lead capture forms and reduce friction',
      'mobile-app': 'Enhance app onboarding and user engagement',
      'content': 'Improve content discovery and reading experience',
      'support': 'Streamline support ticket creation and resolution'
    };
    
    recommendations.push(typeRecommendations[funnelType as keyof typeof typeRecommendations] || 'Focus on reducing friction in the user journey');
    
    return recommendations;
  }

  /**
   * Validate funnel data before calculation
   */
  public validateFunnelData(funnel: Funnel): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!funnel.name) {
      errors.push('Funnel name is required');
    }
    
    if (!funnel.steps || funnel.steps.length === 0) {
      errors.push('At least one step is required');
    }
    
    const enabledSteps = funnel.steps.filter(step => step.isEnabled);
    if (enabledSteps.length === 0) {
      errors.push('At least one step must be enabled');
    }
    
    // Check for duplicate step IDs
    const stepIds = funnel.steps.map(step => step.id);
    const uniqueIds = new Set(stepIds);
    if (stepIds.length !== uniqueIds.size) {
      errors.push('Step IDs must be unique');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const mockFunnelCalculationService = MockFunnelCalculationService.getInstance();
