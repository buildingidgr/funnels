import { Funnel, FunnelResults, FunnelSummary } from "@/types/funnel";
import { 
  mockFunnelCalculationService, 
  FunnelCalculationRequest, 
  FunnelCalculationResponse,
  StepMetrics,
  SplitVariationMetrics,
  FunnelInsights
} from "./mockFunnelCalculationService";
import { FunnelApi } from "./api";
import { toast } from "sonner";

// Enhanced API service that integrates with the mock calculation service
const API_BASE_URL = "https://connect.waymore.io/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY || 'development-key';

// Helper to format API errors
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred while communicating with the API');
}

// Enhanced FunnelApi with comprehensive calculation capabilities
export const EnhancedFunnelApi = {
  // Calculate funnel with comprehensive results
  calculateFunnelComprehensive: async (
    funnelId: string, 
    options?: {
      timeframe?: { from: number; to: number };
      initialValue?: number;
      includeSplitVariations?: boolean;
      includeMetrics?: boolean;
      includeInsights?: boolean;
    }
  ): Promise<FunnelCalculationResponse> => {
    try {
      // Get the funnel data from the existing API
      const funnel = await FunnelApi.getFunnel(funnelId);
      
      // Validate funnel data
      const validation = mockFunnelCalculationService.validateFunnelData(funnel);
      if (!validation.isValid) {
        throw new Error(`Invalid funnel data: ${validation.errors.join(', ')}`);
      }
      
      // Prepare calculation request
      const request: FunnelCalculationRequest = {
        funnel,
        timeframe: options?.timeframe,
        initialValue: options?.initialValue || 10000,
        options: {
          includeSplitVariations: options?.includeSplitVariations ?? true,
          includeMetrics: options?.includeMetrics ?? true,
          includeInsights: options?.includeInsights ?? true
        }
      };
      
      // Calculate comprehensive results
      const results = await mockFunnelCalculationService.calculateFunnel(request);
      
      console.log('Comprehensive funnel calculation completed:', results);
      return results;
      
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Calculate funnel with basic results (backward compatibility)
  calculateFunnel: async (funnelId: string): Promise<FunnelResults> => {
    try {
      const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
      
      // Convert to the basic FunnelResults format for backward compatibility
      const basicResults: FunnelResults = {
        calculated: Date.now(),
        ...comprehensiveResults.calculatedResults
      };
      
      return basicResults;
      
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get step-by-step metrics
  getStepMetrics: async (funnelId: string): Promise<StepMetrics[]> => {
    try {
      const results = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
      return results.stepMetrics;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get split variation metrics
  getSplitVariationMetrics: async (funnelId: string): Promise<SplitVariationMetrics[]> => {
    try {
      const results = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
      return results.splitVariationMetrics;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get funnel insights
  getFunnelInsights: async (funnelId: string): Promise<FunnelInsights> => {
    try {
      const results = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
      return results.insights;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get Sankey visualization data
  getSankeyData: async (funnelId: string): Promise<{
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
  }> => {
    try {
      const results = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
      return results.sankeyData;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get funnel summary with enhanced performance metrics
  getFunnelSummary: async (funnelId: string): Promise<FunnelSummary & {
    insights?: FunnelInsights;
    stepMetrics?: StepMetrics[];
  }> => {
    try {
      const funnel = await EnhancedFunnelApi.getFunnel(funnelId);
      const insights = await EnhancedFunnelApi.getFunnelInsights(funnelId);
      const stepMetrics = await EnhancedFunnelApi.getStepMetrics(funnelId);
      
      // Calculate performance metrics
      const enabledSteps = funnel.steps.filter(step => step.isEnabled);
      const totalVisitors = enabledSteps[0]?.visitorCount || 0;
      const finalStep = enabledSteps[enabledSteps.length - 1];
      const finalVisitors = finalStep?.visitorCount || 0;
      const conversionRate = totalVisitors > 0 ? (finalVisitors / totalVisitors) * 100 : 0;

      const performanceSteps = enabledSteps.map((step, index) => {
        const previousStep = index > 0 ? enabledSteps[index - 1] : null;
        const previousVisitors = previousStep?.visitorCount || totalVisitors;
        const stepConversionRate = previousVisitors > 0 ? (step.visitorCount / previousVisitors) * 100 : 0;

        return {
          id: step.id,
          name: step.name,
          visitorCount: step.visitorCount || 0,
          conversionRate: stepConversionRate
        };
      });

      return {
        id: funnel.id!,
        name: funnel.name,
        description: funnel.description,
        createdAt: funnel.createdAt!,
        updatedAt: funnel.updatedAt!,
        lastCalculatedAt: funnel.lastCalculatedAt!,
        performance: {
          totalVisitors,
          conversionRate,
          steps: performanceSteps
        },
        insights,
        stepMetrics
      };
      
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Mock methods for backward compatibility (these would be replaced with actual API calls)
  listFunnels: async (params?: { 
    limit?: number; 
    offset?: number; 
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastCalculatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<FunnelSummary[]> => {
    // This would be replaced with actual API call
    return [];
  },

  getFunnel: async (id: string): Promise<Funnel> => {
    // Delegate to the existing API
    return await FunnelApi.getFunnel(id);
  },

  createFunnel: async (funnel: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt' | 'lastCalculatedAt'>): Promise<Funnel> => {
    // This would be replaced with actual API call
    throw new Error('Create funnel not implemented in mock');
  },

  updateFunnel: async (id: string, funnel: Partial<Funnel>): Promise<Funnel> => {
    // This would be replaced with actual API call
    throw new Error('Update funnel not implemented in mock');
  },

  deleteFunnel: async (id: string): Promise<void> => {
    // This would be replaced with actual API call
    throw new Error('Delete funnel not implemented in mock');
  }
};

// Export types for external use
export type { 
  FunnelCalculationRequest, 
  FunnelCalculationResponse, 
  StepMetrics, 
  SplitVariationMetrics, 
  FunnelInsights 
};
