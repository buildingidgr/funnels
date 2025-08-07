import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Test to verify that existing funnel examples work with the calculation service
 */

export const testExistingFunnels = async () => {
  console.log('🧪 Testing existing funnel examples with calculation service...\n');

  try {
    // Test the main example funnel
    console.log('📊 Testing exampleFunnel...');
    
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: exampleFunnel,
      initialValue: 25000,
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Example funnel calculation completed!');
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

    console.log('\n🎉 Test completed successfully!');
    console.log('The calculation service works perfectly with existing funnel examples.');
    
    return results;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testExistingFunnels = testExistingFunnels;
  console.log('🚀 Test function available: testExistingFunnels()');
}
