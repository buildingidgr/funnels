import { mockFunnelCalculationService } from './mockFunnelCalculationService';
import { Funnel } from '@/types/funnel';

/**
 * DEMONSTRATION: How the Mock Service Works with NO Visitor Counts
 * 
 * This shows how you can create a funnel with only steps and conditions,
 * and the service will automatically calculate all visitor counts and metrics.
 */

export const demonstrateNoVisitorCounts = async () => {
  console.log('🎯 DEMONSTRATION: Creating Funnel with NO Visitor Counts\n');

  // Create a funnel with ONLY steps and conditions - NO visitor counts!
  const funnelWithNoVisitorCounts: Funnel = {
    id: 'demo-funnel-no-counts',
    name: 'Demo E-commerce Funnel',
    description: 'This funnel has NO visitor counts - service will calculate everything!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null,
    timeframe: {
      from: Date.now() - 30 * 24 * 60 * 60 * 1000,
      to: Date.now()
    },
    performedBy: 'all_contacts',
    steps: [
      {
        id: 'landing-page',
        name: 'Landing Page Visit',
        order: 1,
        // NO visitorCount - service will calculate it!
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
                  value: 'landing',
                  type: 'string'
                }
              ]
            }
          ]
        }
      },
      {
        id: 'product-view',
        name: 'Product Page View',
        order: 2,
        // NO visitorCount - service will calculate it!
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
        id: 'add-to-cart',
        name: 'Add to Cart',
        order: 3,
        // NO visitorCount - service will calculate it!
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
            id: 'quick-add',
            name: 'Quick Add Button',
            // NO visitorCount - service will calculate it!
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
            id: 'standard-add',
            name: 'Standard Add to Cart',
            // NO visitorCount - service will calculate it!
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
        id: 'checkout',
        name: 'Checkout Started',
        order: 4,
        // NO visitorCount - service will calculate it!
        isEnabled: true,
        isRequired: true,
        conditions: {
          orEventGroups: [
            {
              eventName: 'checkout_started',
              operator: 'equals',
              count: 1
            }
          ]
        }
      },
      {
        id: 'purchase',
        name: 'Purchase Completed',
        order: 5,
        // NO visitorCount - service will calculate it!
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

  console.log('📋 Funnel created with NO visitor counts:');
  console.log('   - 5 steps defined');
  console.log('   - 1 step has split variations (A/B test)');
  console.log('   - All visitor counts will be calculated automatically\n');

  try {
    // Let the service calculate everything!
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: funnelWithNoVisitorCounts,
      initialValue: 15000, // Starting point
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    console.log('✅ SERVICE CALCULATED ALL VISITOR COUNTS AUTOMATICALLY!\n');

    // Show what was calculated
    console.log('📊 CALCULATED RESULTS:');
    console.log('======================');
    
    results.stepMetrics.forEach((step, index) => {
      console.log(`${index + 1}. ${step.name}:`);
      console.log(`   Visitors: ${step.visitorCount.toLocaleString()}`);
      console.log(`   Conversion: ${step.conversionRate.toFixed(1)}%`);
      console.log(`   Drop-off: ${step.dropOffRate.toFixed(1)}%`);
      console.log('');
    });

    // Show split variations
    if (results.splitVariationMetrics.length > 0) {
      console.log('🔄 SPLIT VARIATIONS:');
      console.log('===================');
      results.splitVariationMetrics.forEach((split, index) => {
        console.log(`${index + 1}. ${split.name}:`);
        console.log(`   Visitors: ${split.visitorCount.toLocaleString()}`);
        console.log(`   Proportion: ${split.proportionOfParent.toFixed(1)}% of parent`);
        console.log('');
      });
    }

    // Show insights
    console.log('💡 BUSINESS INSIGHTS:');
    console.log('=====================');
    console.log(`Overall Conversion: ${results.insights.overallConversionRate.toFixed(2)}%`);
    console.log(`Total Drop-off: ${results.insights.totalDropOff.toLocaleString()} users`);
    console.log(`Potential Revenue Lost: $${results.insights.potentialRevenueLost?.toLocaleString()}`);
    console.log(`Highest Drop-off Step: ${results.insights.highestDropOffStep.name}`);
    console.log(`Best Converting Step: ${results.insights.bestConvertingStep.name}`);
    console.log('');
    console.log('📋 RECOMMENDATIONS:');
    results.insights.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Show Sankey data structure
    console.log('\n📈 SANKEY VISUALIZATION DATA:');
    console.log('============================');
    console.log(`Nodes: ${results.sankeyData.nodes.length}`);
    console.log(`Links: ${results.sankeyData.links.length}`);
    console.log('Sample nodes:', results.sankeyData.nodes.slice(0, 3));
    console.log('Sample links:', results.sankeyData.links.slice(0, 3));

    console.log('\n🎉 DEMONSTRATION COMPLETE!');
    console.log('The service successfully calculated all visitor counts and metrics');
    console.log('from funnel data that contained only steps and conditions.');

    return results;

  } catch (error) {
    console.error('❌ Demonstration failed:', error);
    throw error;
  }
};

// Export for easy testing
if (typeof window !== 'undefined') {
  (window as any).demonstrateNoVisitorCounts = demonstrateNoVisitorCounts;
  console.log('🚀 Demo function available: demonstrateNoVisitorCounts()');
}
