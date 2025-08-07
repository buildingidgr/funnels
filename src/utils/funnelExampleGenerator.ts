import { Funnel } from '@/types/funnel';
import { mockFunnelCalculationService } from '@/services/mockFunnelCalculationService';

/**
 * Utility to generate realistic funnel examples using the calculation service
 * This ensures all examples have consistent, realistic visitor counts
 */

export const generateRealisticFunnelExample = async (
  baseFunnel: Omit<Funnel, 'visitorCount' | 'value'>,
  initialValue: number = 10000
): Promise<Funnel> => {
  try {
    // Remove any existing visitor counts to let the service calculate them
    const funnelWithoutVisitorCounts: Funnel = {
      ...baseFunnel,
      steps: baseFunnel.steps.map(step => ({
        ...step,
        visitorCount: undefined, // Remove hardcoded visitor counts
        value: undefined,
        splitVariations: step.splitVariations?.map(variation => ({
          ...variation,
          visitorCount: undefined // Remove hardcoded visitor counts
        }))
      }))
    };

    // Calculate realistic visitor counts using the mock service
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: funnelWithoutVisitorCounts,
      initialValue,
      options: {
        includeSplitVariations: true,
        includeMetrics: true,
        includeInsights: true
      }
    });

    // Update the funnel with calculated visitor counts
    const realisticFunnel: Funnel = {
      ...baseFunnel,
      steps: baseFunnel.steps.map(step => {
        const calculatedValue = results.calculatedResults[step.id];
        
        // Update split variations with calculated values
        const updatedSplitVariations = step.splitVariations?.map((variation, index) => {
          const variationId = `${step.id}-variation-${index + 1}`;
          const calculatedVariationValue = results.calculatedResults[variationId];
          
          return {
            ...variation,
            visitorCount: calculatedVariationValue || 0
          };
        });

        return {
          ...step,
          visitorCount: calculatedValue || 0,
          value: calculatedValue || 0,
          splitVariations: updatedSplitVariations
        };
      })
    };

    console.log(`[DEBUG] Generated realistic funnel: ${realisticFunnel.name}`);
    console.log(`[DEBUG] Calculated visitor counts:`, realisticFunnel.steps.map(step => ({
      name: step.name,
      visitorCount: step.visitorCount
    })));

    return realisticFunnel;
  } catch (error) {
    console.error('[ERROR] Failed to generate realistic funnel example:', error);
    // Return the original funnel as fallback
    return baseFunnel as Funnel;
  }
};

/**
 * Generate multiple realistic funnel examples
 */
export const generateRealisticFunnelExamples = async (): Promise<{
  ecommerce: Funnel;
  saas: Funnel;
  leadGen: Funnel;
  mobileApp: Funnel;
  content: Funnel;
  support: Funnel;
}> => {
  // Base funnel templates (without visitor counts)
  const baseFunnels = {
    ecommerce: {
      id: 'ecommerce-funnel-001',
      name: "E-commerce Conversion Funnel",
      description: "Tracks users from product discovery to purchase completion",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCalculatedAt: null,
      timeframe: {
        from: Date.now() - 30 * 24 * 60 * 60 * 1000,
        to: Date.now()
      },
      performedBy: "all_contacts",
      steps: [
        {
          id: "step-1-product-visit",
          name: "Product Page Visit",
          displayColor: "#4A90E2",
          order: 1,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "page_view",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "page_type",
                    operator: "equals",
                    value: "product",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "step-2-product-interaction",
          name: "Product Interaction",
          displayColor: "#7ED321",
          order: 2,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "product_interaction",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "interaction_type",
                    operator: "contains",
                    value: ["image_zoom", "size_selector", "color_selector"],
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "step-3-add-to-cart",
          name: "Add to Cart",
          displayColor: "#F5A623",
          order: 3,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "add_to_cart",
                operator: "equals",
                count: 1
              }
            ]
          },
          splitVariations: [
            {
              id: "variation-1-quick-add",
              name: "Quick Add (Mobile)",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "add_to_cart",
                    operator: "equals",
                    count: 1,
                    properties: [
                      {
                        name: "device_type",
                        operator: "equals",
                        value: "mobile",
                        type: "string"
                      }
                    ]
                  }
                ]
              }
            },
            {
              id: "variation-2-standard-add",
              name: "Standard Add (Desktop)",
              conditions: {
                orEventGroups: [
                  {
                    eventName: "add_to_cart",
                    operator: "equals",
                    count: 1,
                    properties: [
                      {
                        name: "device_type",
                        operator: "equals",
                        value: "desktop",
                        type: "string"
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          id: "step-4-checkout",
          name: "Checkout Started",
          displayColor: "#D0021B",
          order: 4,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "checkout_started",
                operator: "equals",
                count: 1
              }
            ]
          }
        },
        {
          id: "step-5-purchase",
          name: "Purchase Completed",
          displayColor: "#9013FE",
          order: 5,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "purchase",
                operator: "equals",
                count: 1
              }
            ]
          }
        }
      ]
    },
    saas: {
      id: 'saas-funnel-001',
      name: "SaaS Onboarding Funnel",
      description: "Tracks users from signup to feature adoption",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCalculatedAt: null,
      timeframe: {
        from: Date.now() - 30 * 24 * 60 * 60 * 1000,
        to: Date.now()
      },
      performedBy: "all_contacts",
      steps: [
        {
          id: "step-1-landing",
          name: "Landing Page Visit",
          displayColor: "#4A90E2",
          order: 1,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "page_view",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "page_type",
                    operator: "equals",
                    value: "landing",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "step-2-signup",
          name: "Account Signup",
          displayColor: "#7ED321",
          order: 2,
          isEnabled: true,
          isRequired: true,
          conditions: {
            orEventGroups: [
              {
                eventName: "signup",
                operator: "equals",
                count: 1
              }
            ]
          }
        },
        {
          id: "step-3-onboarding",
          name: "Onboarding Complete",
          displayColor: "#F5A623",
          order: 3,
          isEnabled: true,
          isRequired: false,
          conditions: {
            orEventGroups: [
              {
                eventName: "onboarding_complete",
                operator: "equals",
                count: 1
              }
            ]
          }
        },
        {
          id: "step-4-first-feature",
          name: "First Feature Used",
          displayColor: "#D0021B",
          order: 4,
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
          id: "step-5-subscription",
          name: "Subscription Started",
          displayColor: "#9013FE",
          order: 5,
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
          }
        }
      ]
    }
  };

  // Generate realistic versions of all funnels
  const realisticFunnels = {
    ecommerce: await generateRealisticFunnelExample(baseFunnels.ecommerce, 25000),
    saas: await generateRealisticFunnelExample(baseFunnels.saas, 15000),
    leadGen: await generateRealisticFunnelExample({
      ...baseFunnels.saas,
      id: 'lead-gen-funnel-001',
      name: "Lead Generation Funnel",
      description: "Tracks leads from discovery to qualification"
    }, 8000),
    mobileApp: await generateRealisticFunnelExample({
      ...baseFunnels.saas,
      id: 'mobile-app-funnel-001',
      name: "Mobile App Engagement Funnel",
      description: "Tracks app downloads to feature usage"
    }, 12000),
    content: await generateRealisticFunnelExample({
      ...baseFunnels.saas,
      id: 'content-funnel-001',
      name: "Content Marketing Funnel",
      description: "Tracks content discovery to engagement"
    }, 20000),
    support: await generateRealisticFunnelExample({
      ...baseFunnels.saas,
      id: 'support-funnel-001',
      name: "Customer Support Funnel",
      description: "Tracks support requests to resolution"
    }, 5000)
  };

  return realisticFunnels;
};

export default generateRealisticFunnelExamples;
