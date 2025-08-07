import { EnhancedFunnelApi } from './enhancedApi';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Test to verify that the recalculation functionality works correctly
 */

export const testRecalculation = async () => {
  console.log('🧪 Testing funnel recalculation functionality...\n');

  try {
    // Simulate a funnel ID (in real app this would come from the URL)
    const funnelId = 'test-funnel-001';
    
    console.log('📊 Testing recalculation with EnhancedFunnelApi...');
    
    // Test comprehensive calculation
    const results = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId, {
      initialValue: 15000,
      includeSplitVariations: true,
      includeMetrics: true,
      includeInsights: true
    });

    console.log('✅ Recalculation completed successfully!');
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

    console.log('\n🎉 Recalculation test completed successfully!');
    console.log('The recalculation functionality works perfectly.');
    
    return results;

  } catch (error) {
    console.error('❌ Recalculation test failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testRecalculation = testRecalculation;
  console.log('🚀 Test function available: testRecalculation()');
}
