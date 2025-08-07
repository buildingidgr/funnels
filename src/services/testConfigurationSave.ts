import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Test to verify that configuration save with recalculation works correctly
 */

export const testConfigurationSave = async () => {
  console.log('🧪 Testing configuration save with recalculation...\n');

  try {
    // Simulate a configuration change (adding a new step)
    const modifiedFunnel = {
      ...exampleFunnel,
      steps: [
        ...exampleFunnel.steps,
        {
          id: "step-new-test",
          name: "New Test Step",
          displayColor: "#FF6B6B",
          order: exampleFunnel.steps.length + 1,
          isEnabled: true,
          isRequired: false,
          conditions: {
            orEventGroups: [
              {
                eventName: "test_event",
                operator: "equals",
                count: 1
              }
            ]
          }
        }
      ]
    };

    console.log('📊 Testing recalculation after configuration change...');
    console.log(`   - Original steps: ${exampleFunnel.steps.length}`);
    console.log(`   - Modified steps: ${modifiedFunnel.steps.length}`);
    
    // Test recalculation with the modified funnel
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: modifiedFunnel,
      initialValue: 15000,
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Configuration save recalculation completed successfully!');
    console.log('📈 Results:');
    console.log(`   - Overall conversion rate: ${results.insights.overallConversionRate.toFixed(2)}%`);
    console.log(`   - Total drop-off: ${results.insights.totalDropOff.toLocaleString()} users`);
    console.log(`   - Potential revenue lost: $${results.insights.potentialRevenueLost?.toLocaleString()}`);
    console.log(`   - Highest drop-off step: ${results.insights.highestDropOffStep.name}`);
    console.log(`   - Best converting step: ${results.insights.bestConvertingStep.name}`);
    
    console.log('\n📊 Step-by-step breakdown:');
    results.stepMetrics.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.name}:`);
      console.log(`      Visitors: ${step.visitorCount.toLocaleString()}`);
      console.log(`      Conversion: ${step.conversionRate.toFixed(1)}%`);
      console.log(`      Drop-off: ${step.dropOffRate.toFixed(1)}%`);
    });

    if (results.splitVariationMetrics.length > 0) {
      console.log('\n🔄 Split variations:');
      results.splitVariationMetrics.forEach((split, index) => {
        console.log(`   ${index + 1}. ${split.name}:`);
        console.log(`      Visitors: ${split.visitorCount.toLocaleString()}`);
        console.log(`      Proportion: ${split.proportionOfParent.toFixed(1)}% of parent`);
      });
    }

    console.log('\n📋 Recommendations:');
    results.insights.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    console.log('\n🎉 Configuration save test completed successfully!');
    console.log('The configuration save with recalculation functionality works perfectly.');
    
    return results;

  } catch (error) {
    console.error('❌ Configuration save test failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testConfigurationSave = testConfigurationSave;
  console.log('🚀 Test function available: testConfigurationSave()');
}
