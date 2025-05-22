import { Funnel } from './funnel';

export const exampleFunnel: Funnel = {
  id: 'ecommerce-funnel-001',
  name: "E-commerce Conversion Funnel",
  description: "Tracks users from product discovery to purchase completion, including optional engagement steps and A/B testing variations",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastCalculatedAt: null,
  timeframe: {
    from: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
    to: Date.now()
  },
  performedBy: "all_contacts",
  steps: [
    {
      id: "step-1-view-product",
      name: "Viewed Product Page",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 10000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "pageViewed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "urlPath",
                operator: "contains",
                value: "/products/",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-2-optional-reviews",
      name: "Read Product Reviews (Optional)",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 4500,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "reviewSectionViewed",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-3-add-to-cart",
      name: "Added to Cart",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 1800,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "addToCart",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-quick-add",
          name: "Quick Add Button",
          visitorCount: 4000,
          conditions: {
            orEventGroups: [
              {
                eventName: "quickAddToCart",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-product-page",
          name: "Product Page Add",
          visitorCount: 2000,
          conditions: {
            orEventGroups: [
              {
                eventName: "productPageAddToCart",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        }
      ]
    },
    {
      id: "step-4-checkout",
      name: "Started Checkout",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 900,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "checkoutStarted",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-5-purchase",
      name: "Completed Purchase",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 450,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "purchaseCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    }
  ]
}; 