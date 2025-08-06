import { Funnel } from './funnel';

export const exampleFunnel: Funnel = {
  id: 'ecommerce-funnel-001',
  name: "E-commerce Conversion Funnel",
  description: "Tracks users from product discovery to purchase completion with realistic conversion rates and detailed event tracking",
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
      id: "step-1-product-visit",
      name: "Product Page Visit",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 25000,
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
              },
              {
                name: "session_duration",
                operator: "greaterThanNumeric",
                value: 10,
                type: "number"
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
      visitorCount: 5000,
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
                value: ["image_zoom", "size_selector", "color_selector", "reviews_view"],
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
      visitorCount: 500,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "add_to_cart",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "product_available",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-quick-add",
          name: "Quick Add (Mobile)",
          visitorCount: 140,
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
                  },
                  {
                    name: "add_method",
                    operator: "equals",
                    value: "quick_add",
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
          visitorCount: 100,
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
                  },
                  {
                    name: "add_method",
                    operator: "equals",
                    value: "standard",
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
      id: "step-4-cart-review",
      name: "Cart Review",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 192,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "cart_view",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "cart_value",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-5-checkout-start",
      name: "Checkout Started",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 115,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "checkout_started",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "checkout_method",
                operator: "contains",
                value: ["guest", "account"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-6-payment-info",
      name: "Payment Information Entered",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 86,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "payment_info_entered",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "payment_method",
                operator: "contains",
                value: ["credit_card", "paypal", "apple_pay", "google_pay"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-7-purchase-complete",
      name: "Purchase Completed",
      displayColor: "#FF6B6B",
      order: 7,
      visitorCount: 60,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "purchase",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "transaction_status",
                operator: "equals",
                value: "success",
                type: "string"
              },
              {
                name: "order_value",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              }
            ]
          }
        ]
      }
    }
  ]
}; 