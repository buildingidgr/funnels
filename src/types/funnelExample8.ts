import { Funnel } from './funnel';

export const exampleFunnel8: Funnel = {
  id: 'product-purchase-dropoff-funnel-001',
  name: "Product Purchase Drop-off Analysis",
  description: "Comprehensive funnel tracking product drop-off during the purchase process with detailed abandonment analysis and conversion optimization insights",
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
      id: "step-1-product-discovery",
      name: "Product Discovery",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 50000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "product_viewed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "source",
                operator: "contains",
                value: ["search", "social", "email", "direct", "referral"],
                type: "string"
              },
              {
                name: "session_duration",
                operator: "greaterThanNumeric",
                value: 5,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-2-product-detail-engagement",
      name: "Product Detail Engagement",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 7200, 
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
                value: ["image_gallery", "size_selector", "color_selector", "reviews_read", "specifications_view"],
                type: "string"
              },
              {
                name: "time_on_page",
                operator: "greaterThanNumeric",
                value: 30,
                type: "number"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-high-engagement",
          name: "High Engagement (2+ interactions)",
          visitorCount: 1470,
          conditions: {
            orEventGroups: [
              {
                eventName: "product_interaction",
                operator: "greaterThanNumeric",
                count: 2,
                properties: [
                  {
                    name: "interaction_count",
                    operator: "greaterThanNumeric",
                    value: 2,
                    type: "number"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-low-engagement",
          name: "Low Engagement (1 interaction)",
              visitorCount: 2205,
          conditions: {
            orEventGroups: [
              {
                eventName: "product_interaction",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "interaction_count",
                    operator: "equals",
                    value: 1,
                    type: "number"
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      id: "step-3-add-to-cart-intent",
      name: "Add to Cart Intent",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 525,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "add_to_cart_clicked",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "product_available",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              },
              {
                name: "inventory_status",
                operator: "equals",
                value: "in_stock",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-4-add-to-cart-success",
      name: "Successfully Added to Cart",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 315,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "add_to_cart_success",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "cart_value",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              },
              {
                name: "items_in_cart",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-single-item",
          name: "Single Item Cart",
          visitorCount: 154,
          conditions: {
            orEventGroups: [
              {
                eventName: "add_to_cart_success",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "items_in_cart",
                    operator: "equals",
                    value: 1,
                    type: "number"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-multiple-items",
          name: "Multiple Items Cart",
          visitorCount: 67,
          conditions: {
            orEventGroups: [
              {
                eventName: "add_to_cart_success",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "items_in_cart",
                    operator: "greaterThanNumeric",
                    value: 1,
                    type: "number"
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      id: "step-5-cart-review",
      name: "Cart Review & Optimization",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 176,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "cart_viewed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "cart_value",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              },
              {
                name: "time_on_cart_page",
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
      id: "step-6-checkout-initiation",
      name: "Checkout Process Started",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 114,
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
                value: ["guest", "account", "social_login"],
                type: "string"
              },
              {
                name: "cart_value",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-guest-checkout",
          name: "Guest Checkout",
          visitorCount: 48,
          conditions: {
            orEventGroups: [
              {
                eventName: "checkout_started",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "checkout_method",
                    operator: "equals",
                    value: "guest",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-account-checkout",
          name: "Account Checkout",
          visitorCount: 31,
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
                    value: ["account", "social_login"],
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
      id: "step-7-shipping-info",
      name: "Shipping Information Entered",
      displayColor: "#FF6B6B",
      order: 7,
      visitorCount: 64,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "shipping_info_entered",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "shipping_address_complete",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              },
              {
                name: "shipping_method_selected",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-8-payment-method",
      name: "Payment Method Selected",
      displayColor: "#9B59B6",
      order: 8,
      visitorCount: 48,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "payment_method_selected",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "payment_method",
                operator: "contains",
                value: ["credit_card", "paypal", "apple_pay", "google_pay", "amazon_pay"],
                type: "string"
              },
              {
                name: "payment_method_valid",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-9-payment-info",
      name: "Payment Information Entered",
      displayColor: "#E74C3C",
      order: 9,
      visitorCount: 29,
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
                name: "payment_info_complete",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              },
              {
                name: "payment_validation_passed",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-10-order-review",
      name: "Order Review & Confirmation",
      displayColor: "#F39C12",
      order: 10,
      visitorCount: 18,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "order_review_viewed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "order_summary_complete",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              },
              {
                name: "terms_accepted",
                operator: "isTrue",
                value: "true",
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-11-purchase-complete",
      name: "Purchase Completed",
      displayColor: "#27AE60",
      order: 11,
      visitorCount: 8,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [  
          {
            eventName: "purchase_completed",
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
                name: "order_confirmation_sent",
                operator: "isTrue",
                value: "true",
                type: "boolean"
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
      },
      splitVariations: [
        {
          id: "variation-1-first-time",
          name: "First-Time Purchase",
          visitorCount: 6,
          conditions: {
            orEventGroups: [
              {
                eventName: "purchase_completed",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "customer_type",
                    operator: "equals",
                    value: "first_time",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-returning",
          name: "Returning Customer",
          visitorCount: 4,
          conditions: {
            orEventGroups: [
              {
                eventName: "purchase_completed",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "customer_type",
                    operator: "equals",
                    value: "returning",
                    type: "string"
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
}; 