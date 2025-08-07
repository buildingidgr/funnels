import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { EnhancedFunnelApi } from './enhancedApi';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Test file to demonstrate the mock funnel calculation service
 * Run this in the browser console or as a test to see the service in action
 */

export const testMockService = async () => {
  console.log('🧪 Testing Mock Funnel Calculation Service...\n');

  try {
    // Test 1: Basic calculation with example funnel
    console.log('📊 Test 1: Basic calculation with example funnel');
    const basicResults = await mockFunnelCalculationService.calculateFunnel({
      funnel: exampleFunnel,
      initialValue: 25000,
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Basic calculation completed');
    console.log('📈 Overall conversion rate:', basicResults.insights.overallConversionRate.toFixed(2) + '%');
    console.log('💰 Potential revenue lost:', '$' + basicResults.insights.potentialRevenueLost?.toLocaleString());
    console.log('🎯 Highest drop-off step:', basicResults.insights.highestDropOffStep.name);
    console.log('⭐ Best converting step:', basicResults.insights.bestConvertingStep.name);
    console.log('📋 Recommendations:', basicResults.insights.recommendations);
    console.log('');

    // Test 2: Step metrics analysis
    console.log('📊 Test 2: Step metrics analysis');
    console.log('Step-by-step breakdown:');
    basicResults.stepMetrics.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.name}:`);
      console.log(`     Visitors: ${step.visitorCount.toLocaleString()}`);
      console.log(`     Conversion: ${step.conversionRate.toFixed(1)}%`);
      console.log(`     Drop-off: ${step.dropOffRate.toFixed(1)}%`);
    });
    console.log('');

    // Test 3: Split variation analysis
    console.log('📊 Test 3: Split variation analysis');
    if (basicResults.splitVariationMetrics.length > 0) {
      console.log('Split variations found:');
      basicResults.splitVariationMetrics.forEach((split, index) => {
        console.log(`  ${index + 1}. ${split.name}:`);
        console.log(`     Visitors: ${split.visitorCount.toLocaleString()}`);
        console.log(`     Proportion: ${split.proportionOfParent.toFixed(1)}% of parent`);
        console.log(`     Conversion: ${split.conversionRate.toFixed(1)}%`);
      });
    } else {
      console.log('No split variations found in this funnel');
    }
    console.log('');

    // Test 4: Sankey data structure
    console.log('📊 Test 4: Sankey data structure');
    console.log('Nodes:', basicResults.sankeyData.nodes.length);
    console.log('Links:', basicResults.sankeyData.links.length);
    console.log('Sample nodes:', basicResults.sankeyData.nodes.slice(0, 3));
    console.log('Sample links:', basicResults.sankeyData.links.slice(0, 3));
    console.log('');

    // Test 5: Validation
    console.log('📊 Test 5: Data validation');
    const validation = mockFunnelCalculationService.validateFunnelData(exampleFunnel);
    console.log('Validation result:', validation.isValid ? '✅ Valid' : '❌ Invalid');
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
    }
    console.log('');

    // Test 6: Metadata
    console.log('📊 Test 6: Calculation metadata');
    console.log('Calculated at:', basicResults.metadata.calculatedAt);
    console.log('Total steps:', basicResults.metadata.totalSteps);
    console.log('Enabled steps:', basicResults.metadata.enabledSteps);
    console.log('Initial value:', basicResults.metadata.initialValue.toLocaleString());
    console.log('');

    console.log('🎉 All tests completed successfully!');
    return basicResults;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Test with invalid data
export const testInvalidData = async () => {
  console.log('🧪 Testing with invalid data...\n');

  const invalidFunnel = {
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

  const validation = mockFunnelCalculationService.validateFunnelData(invalidFunnel);
  console.log('Validation result:', validation.isValid ? '✅ Valid' : '❌ Invalid');
  console.log('Validation errors:', validation.errors);
  
  return validation;
};

// Test performance with multiple calculations
export const testPerformance = async () => {
  console.log('🧪 Testing performance with multiple calculations...\n');

  const startTime = performance.now();
  
  const promises = Array.from({ length: 10 }, (_, i) => 
    mockFunnelCalculationService.calculateFunnel({
      funnel: exampleFunnel,
      initialValue: 10000 + (i * 1000),
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    })
  );

  const results = await Promise.all(promises);
  const endTime = performance.now();
  
  console.log(`✅ Completed ${results.length} calculations in ${(endTime - startTime).toFixed(2)}ms`);
  console.log(`Average time per calculation: ${((endTime - startTime) / results.length).toFixed(2)}ms`);
  
  return results;
};

// Export test functions for easy access
export const testFunctions = {
  basic: testMockService,
  invalidData: testInvalidData,
  performance: testPerformance
};

// Auto-run basic test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - add to window for console access
  (window as any).testMockService = testMockService;
  (window as any).testInvalidData = testInvalidData;
  (window as any).testPerformance = testPerformance;
  (window as any).testFunctions = testFunctions;
  
  console.log('🚀 Mock service test functions available in console:');
  console.log('  - testMockService() - Run basic tests');
  console.log('  - testInvalidData() - Test validation');
  console.log('  - testPerformance() - Test performance');
  console.log('  - testFunctions - Access all test functions');
}
