import { EnhancedFunnelApi } from './enhancedApi';
import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { Funnel } from '@/types/funnel';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Example usage of the Mock Funnel Calculation Service
 * This demonstrates how to use the comprehensive calculation service
 * 
 * IMPORTANT: The service now works with funnel data that has NO visitor counts
 * It calculates all visitor counts automatically based on realistic conversion rates
 */

// Example 1: Basic funnel calculation with NO visitor counts
export const exampleBasicCalculation = async () => {
  try {
    // Create a simple funnel for testing - NO visitor counts provided!
    const testFunnel: Funnel = {
      id: 'test-funnel-001',
      name: 'Test E-commerce Funnel',
      description: 'A simple test funnel for demonstration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCalculatedAt: null,
      timeframe: {
        from: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
        to: Date.now()
      },
      performedBy: 'all_contacts',
      steps: [
        {
          id: 'step-1',
          name: 'Product Page Visit',
          order: 1,
          // NO visitorCount provided - service will calculate it!
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: 'page_view',
                operator: 'equals',
                count: 1,
                properties: [
                  {
                    name: 'page_type',
                    operator: 'equals',
                    value: 'product',
                    type: 'string'
                  }
                ]
              }
            ]
          }
        },
        {
          id: 'step-2',
          name: 'Add to Cart',
          order: 2,
          // NO visitorCount provided - service will calculate it!
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: 'add_to_cart',
                operator: 'equals',
                count: 1
              }
            ]
          },
          splitVariations: [
            {
              id: 'variation-1',
              name: 'Quick Add',
              // NO visitorCount provided - service will calculate it!
              conditions: {
                orEventGroups: [
                  {
                    eventName: 'add_to_cart',
                    operator: 'equals',
                    count: 1,
                    properties: [
                      {
                        name: 'add_method',
                        operator: 'equals',
                        value: 'quick_add',
                        type: 'string'
                      }
                    ]
                  }
                ]
              }
            },
            {
              id: 'variation-2',
              name: 'Standard Add',
              // NO visitorCount provided - service will calculate it!
              conditions: {
                orEventGroups: [
                  {
                    eventName: 'add_to_cart',
                    operator: 'equals',
                    count: 1,
                    properties: [
                      {
                        name: 'add_method',
                        operator: 'equals',
                        value: 'standard',
                        type: 'string'
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          id: 'step-3',
          name: 'Purchase Complete',
          order: 3,
          // NO visitorCount provided - service will calculate it!
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: 'purchase',
                operator: 'equals',
                count: 1
              }
            ]
          }
        }
      ]
    };

    // Calculate comprehensive results - service will calculate ALL visitor counts!
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: testFunnel,
      initialValue: 10000, // Starting point
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Service calculated all visitor counts automatically!');
    console.log('📊 Results:', results);
    
    // Show what the service calculated
    console.log('📈 Calculated visitor counts:');
    results.stepMetrics.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.name}: ${step.visitorCount.toLocaleString()} visitors`);
      console.log(`     Conversion rate: ${step.conversionRate.toFixed(1)}%`);
    });
    
    return results;

  } catch (error) {
    console.error('Error in basic calculation:', error);
    throw error;
  }
};

// Example 2: Using the enhanced API service
export const exampleEnhancedApiUsage = async () => {
  try {
    // This would typically come from your actual API
    const funnelId = 'test-funnel-001';
    
    // Get comprehensive calculation results
    const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId, {
      initialValue: 15000,
      includeSplitVariations: true,
      includeMetrics: true,
      includeInsights: true
    });

    console.log('Enhanced API results:', comprehensiveResults);
    return comprehensiveResults;

  } catch (error) {
    console.error('Error in enhanced API usage:', error);
    throw error;
  }
};

// Example 3: Getting specific metrics
export const exampleGetSpecificMetrics = async () => {
  try {
    const funnelId = 'test-funnel-001';
    
    // Get step metrics
    const stepMetrics = await EnhancedFunnelApi.getStepMetrics(funnelId);
    console.log('Step metrics:', stepMetrics);
    
    // Get split variation metrics
    const splitMetrics = await EnhancedFunnelApi.getSplitVariationMetrics(funnelId);
    console.log('Split variation metrics:', splitMetrics);
    
    // Get funnel insights
    const insights = await EnhancedFunnelApi.getFunnelInsights(funnelId);
    console.log('Funnel insights:', insights);
    
    // Get Sankey data
    const sankeyData = await EnhancedFunnelApi.getSankeyData(funnelId);
    console.log('Sankey data:', sankeyData);
    
    return {
      stepMetrics,
      splitMetrics,
      insights,
      sankeyData
    };

  } catch (error) {
    console.error('Error getting specific metrics:', error);
    throw error;
  }
};

// Example 4: Integration with existing funnel data (but without visitor counts)
export const exampleWithExistingFunnel = async () => {
  try {
    // Create a copy of the example funnel but remove all visitor counts
    const funnelWithoutVisitorCounts: Funnel = {
      ...exampleFunnel,
      steps: exampleFunnel.steps.map(step => ({
        ...step,
        visitorCount: undefined, // Remove visitor count - service will calculate it
        splitVariations: step.splitVariations?.map(variation => ({
          ...variation,
          visitorCount: undefined // Remove visitor count - service will calculate it
        }))
      }))
    };
    
    // Calculate comprehensive results - service will calculate ALL visitor counts!
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: funnelWithoutVisitorCounts,
      initialValue: 25000, // Match the original first step's visitor count
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Service calculated all visitor counts automatically!');
    console.log('Results with existing funnel:', results);
    
    // Access specific parts of the results
    console.log('📈 Overall conversion rate:', results.insights.overallConversionRate.toFixed(2) + '%');
    console.log('🎯 Highest drop-off step:', results.insights.highestDropOffStep.name);
    console.log('⭐ Best converting step:', results.insights.bestConvertingStep.name);
    console.log('💰 Potential revenue lost:', '$' + results.insights.potentialRevenueLost?.toLocaleString());
    console.log('📋 Recommendations:', results.insights.recommendations);
    
    return results;

  } catch (error) {
    console.error('Error with existing funnel:', error);
    throw error;
  }
};

// Example 5: Validation and error handling
export const exampleValidationAndErrors = async () => {
  try {
    // Test with invalid funnel data
    const invalidFunnel: Funnel = {
      id: 'invalid-funnel',
      name: '', // Invalid: empty name
      description: 'Test invalid funnel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCalculatedAt: null,
      timeframe: {
        from: Date.now() - 30 * 24 * 60 * 60 * 1000,
        to: Date.now()
      },
      performedBy: 'all_contacts',
      steps: [] // Invalid: no steps
    };

    // Validate the funnel data
    const validation = mockFunnelCalculationService.validateFunnelData(invalidFunnel);
    console.log('Validation result:', validation.isValid ? '✅ Valid' : '❌ Invalid');
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
    }
    
    return { isValid: false, errors: validation.errors };

  } catch (error) {
    console.error('Error in validation example:', error);
    return { isValid: false, error: error.message };
  }
};

// Example 6: Real-world usage pattern
export const exampleRealWorldUsage = async (funnelId: string) => {
  try {
    // Step 1: Get comprehensive calculation results
    const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId, {
      initialValue: 10000,
      includeSplitVariations: true,
      includeMetrics: true,
      includeInsights: true
    });

    // Step 2: Extract data for different visualizations
    const visualizationData = {
      // For Sankey visualization
      sankey: comprehensiveResults.sankeyData,
      
      // For step flow visualization
      stepFlow: comprehensiveResults.stepMetrics,
      
      // For drop-off analysis
      dropOff: comprehensiveResults.stepMetrics.map(step => ({
        name: step.name,
        dropOffRate: step.dropOffRate,
        dropOffCount: step.dropOffCount,
        conversionRate: step.conversionRate
      })),
      
      // For insights and recommendations
      insights: comprehensiveResults.insights,
      
      // For split variation analysis
      splits: comprehensiveResults.splitVariationMetrics
    };

    // Step 3: Return structured data for frontend components
    return {
      success: true,
      data: visualizationData,
      metadata: comprehensiveResults.metadata
    };

  } catch (error) {
    console.error('Error in real-world usage:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Export all examples for easy testing
export const examples = {
  basicCalculation: exampleBasicCalculation,
  enhancedApiUsage: exampleEnhancedApiUsage,
  getSpecificMetrics: exampleGetSpecificMetrics,
  withExistingFunnel: exampleWithExistingFunnel,
  validationAndErrors: exampleValidationAndErrors,
  realWorldUsage: exampleRealWorldUsage
};
