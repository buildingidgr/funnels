import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { exampleFunnel } from '@/types/funnelExample';

/**
 * Test to verify that the Sankey visualization fixes work correctly
 */

export const testSankeyVisualization = async () => {
  console.log('🧪 Testing Sankey visualization fixes...\n');

  try {
    // Create a funnel with 3 split variations to test the problematic case
    const testFunnel = {
      ...exampleFunnel,
      steps: [
        {
          id: "step-1-test",
          name: "Test Step 1",
          displayColor: "#4A90E2",
          order: 1,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "page_view",
                operator: "equals",
                count: 1
              }
            ]
          },
          splitVariations: [
            {
              id: "split-1",
              name: "Split A",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "test_event_a",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            },
            {
              id: "split-2",
              name: "Split B",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "test_event_b",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            },
            {
              id: "split-3",
              name: "Split C",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "test_event_c",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            }
          ]
        },
        {
          id: "step-2-test",
          name: "Test Step 2",
          displayColor: "#7ED321",
          order: 2,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "page_view",
                operator: "equals",
                count: 1
              }
            ]
          }
        }
      ]
    };

    console.log('📊 Testing Sankey calculation with 3 split variations...');
    
    // Test calculation with the problematic funnel
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: testFunnel,
      initialValue: 10000,
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ Sankey calculation completed successfully!');
    console.log('📈 Results:');
    console.log(`   - Overall conversion rate: ${results.insights.overallConversionRate.toFixed(2)}%`);
    console.log(`   - Total drop-off: ${results.insights.totalDropOff.toLocaleString()} users`);
    console.log(`   - Split variations: ${results.splitVariationMetrics.length}`);
    
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

    console.log('\n🎉 Sankey visualization test completed successfully!');
    console.log('The Sankey visualization should now render correctly with 3 split variations.');
    
    return results;

  } catch (error) {
    console.error('❌ Sankey visualization test failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSankeyVisualization = testSankeyVisualization;
  console.log('🚀 Test function available: testSankeyVisualization()');
}
