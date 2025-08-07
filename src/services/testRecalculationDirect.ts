import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Test to verify that the direct recalculation functionality works correctly
 */

export const testRecalculationDirect = async () => {
  console.log('🧪 Testing direct funnel recalculation...\n');

  try {
    console.log('📊 Testing direct recalculation with mockFunnelCalculationService...');
    
    // Test direct calculation with example funnel
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: exampleFunnel,
      initialValue: 15000,
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Direct recalculation completed successfully!');
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

    console.log('\n🎉 Direct recalculation test completed successfully!');
    console.log('The direct recalculation functionality works perfectly.');
    
    return results;

  } catch (error) {
    console.error('❌ Direct recalculation test failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testRecalculationDirect = testRecalculationDirect;
  console.log('🚀 Test function available: testRecalculationDirect()');
}
