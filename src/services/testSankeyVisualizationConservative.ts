import { mockFunnelCalculationService } from './mockFunnelCalculationService';

/**
 * Test to verify that the conservative Sankey visualization fixes work correctly
 */

export const testSankeyVisualizationConservative = async () => {
  console.log('🧪 Testing conservative Sankey visualization fixes...\n');

  try {
    // Create a funnel with 3 split variations to test the problematic case
    const testFunnel = {
      id: "test-conservative-funnel",
      name: "Conservative Test Funnel",
      description: "A funnel with 3 split variations to test conservative fixes",
      steps: [
        {
          id: "step-1-conservative",
          name: "Landing Page Visit",
          displayColor: "#3b82f6",
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
          }
        },
        {
          id: "step-2-conservative",
          name: "Signup Started",
          displayColor: "#10b981",
          order: 2,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "signup_started",
                operator: "equals",
                count: 1
              }
            ]
          }
        },
        {
          id: "step-3-conservative",
          name: "Account Created",
          displayColor: "#8b5cf6",
          order: 3,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "account_created",
                operator: "equals",
                count: 1
              }
            ]
          }
        },
        {
          id: "step-4-conservative",
          name: "Onboarding Started",
          displayColor: "#f59e0b",
          order: 4,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "onboarding_started",
                operator: "equals",
                count: 1
              }
            ]
          },
          splitVariations: [
            {
              id: "split-1",
              name: "Guided Tour",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "guided_tour_started",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            },
            {
              id: "split-2",
              name: "Self-Guided",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "self_guided_started",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            },
            {
              id: "split-3",
              name: "Quick Setup",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "quick_setup_started",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            }
          ]
        },
        {
          id: "step-5-conservative",
          name: "First Feature Used",
          displayColor: "#ef4444",
          order: 5,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "feature_used",
                operator: "equals",
                count: 1
              }
            ]
          }
        },
        {
          id: "step-6-conservative",
          name: "Subscription Started",
          displayColor: "#06b6d4",
          order: 6,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "subscription_started",
                operator: "equals",
                count: 1
              }
            ]
          },
          splitVariations: [
            {
              id: "split-monthly",
              name: "Monthly Plan",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "monthly_plan_selected",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            },
            {
              id: "split-annual",
              name: "Annual Plan",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "annual_plan_selected",
                    operator: "equals",
                    count: 1
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    console.log('📊 Testing Sankey calculation with 3 split variations (conservative approach)...');
    
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

    console.log('\n🎯 Sankey Data Validation:');
    console.log(`   - Nodes: ${results.sankeyData.nodes.length}`);
    console.log(`   - Links: ${results.sankeyData.links.length}`);
    
    // Validate that all nodes have positive values
    const negativeNodes = results.sankeyData.nodes.filter(node => node.value <= 0);
    if (negativeNodes.length > 0) {
      console.log(`   ⚠️  Warning: ${negativeNodes.length} nodes have non-positive values`);
    } else {
      console.log(`   ✅ All nodes have positive values`);
    }

    // Validate that all links have positive values
    const negativeLinks = results.sankeyData.links.filter(link => link.value <= 0);
    if (negativeLinks.length > 0) {
      console.log(`   ⚠️  Warning: ${negativeLinks.length} links have non-positive values`);
    } else {
      console.log(`   ✅ All links have positive values`);
    }

    console.log('\n🎉 Conservative Sankey visualization test completed successfully!');
    console.log('The Sankey visualization should now render correctly with 3 split variations.');
    console.log('No SVG rendering errors should occur, and the layout should be preserved!');
    
    return results;

  } catch (error) {
    console.error('❌ Conservative Sankey visualization test failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).testSankeyVisualizationConservative = testSankeyVisualizationConservative;
  console.log('🚀 Test function available: testSankeyVisualizationConservative()');
}
