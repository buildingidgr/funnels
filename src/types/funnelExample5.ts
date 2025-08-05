import { Funnel } from './funnel';

export const exampleFunnel5: Funnel = {
  id: 'mobile-app-engagement-funnel-001',
  name: "Mobile App Engagement Funnel",
  description: "Tracks users through mobile app engagement with realistic conversion rates and detailed mobile-specific event tracking",
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
      id: "step-1-app-store-visit",
      name: "App Store Visit",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 20000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "app_store_page_view",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "store_type",
                operator: "contains",
                value: ["ios_app_store", "google_play"],
                type: "string"
              },
              {
                name: "view_duration",
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
      id: "step-2-app-install",
      name: "App Installation",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 4000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "app_installed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "installation_source",
                operator: "contains",
                value: ["app_store", "google_play", "direct_link"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-3-first-open",
      name: "First App Open",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 3200,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "app_opened",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "session_type",
                operator: "equals",
                value: "first_open",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-4-permissions",
      name: "Permissions Granted",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 2560,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "permissions_granted",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "permission_type",
                operator: "contains",
                value: ["notifications", "location", "camera", "contacts"],
                type: "string"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-critical",
          name: "Critical Permissions",
          visitorCount: 1792,
          conditions: {
            orEventGroups: [
              {
                eventName: "permissions_granted",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "permission_type",
                    operator: "contains",
                    value: ["notifications", "location"],
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-optional",
          name: "Optional Permissions",
          visitorCount: 768,
          conditions: {
            orEventGroups: [
              {
                eventName: "permissions_granted",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "permission_type",
                    operator: "contains",
                    value: ["camera", "contacts"],
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
      id: "step-5-onboarding",
      name: "Onboarding Completed",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 1920,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "onboarding_completed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "onboarding_steps_completed",
                operator: "greaterThanNumeric",
                value: 3,
                type: "number"
              },
              {
                name: "onboarding_duration",
                operator: "greaterThanNumeric",
                value: 60,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-6-feature-usage",
      name: "Core Feature Used",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 1344,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "feature_used",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "feature_category",
                operator: "contains",
                value: ["core", "primary"],
                type: "string"
              },
              {
                name: "usage_duration",
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
          id: "variation-1-social",
          name: "Social Features",
          visitorCount: 672,
          conditions: {
            orEventGroups: [
              {
                eventName: "feature_used",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "feature_name",
                    operator: "contains",
                    value: ["share", "like", "comment", "follow"],
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-content",
          name: "Content Features",
          visitorCount: 672,
          conditions: {
            orEventGroups: [
              {
                eventName: "feature_used",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "feature_name",
                    operator: "contains",
                    value: ["view", "create", "edit", "upload"],
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
      id: "step-7-daily-active",
      name: "Daily Active User",
      displayColor: "#FF6B6B",
      order: 7,
      visitorCount: 940,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "daily_active",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "session_count",
                operator: "greaterThanNumeric",
                value: 1,
                type: "number"
              },
              {
                name: "total_session_time",
                operator: "greaterThanNumeric",
                value: 120,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-8-monetization",
      name: "Monetization Action",
      displayColor: "#FFD93D",
      order: 8,
      visitorCount: 470,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "monetization_action",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "action_type",
                operator: "contains",
                value: ["subscription", "in_app_purchase", "premium_upgrade"],
                type: "string"
              },
              {
                name: "transaction_status",
                operator: "equals",
                value: "success",
                type: "string"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-subscription",
          name: "Subscription",
          visitorCount: 282,
          conditions: {
            orEventGroups: [
              {
                eventName: "subscription_purchased",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "plan_type",
                    operator: "contains",
                    value: ["monthly", "annual"],
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-inapp",
          name: "In-App Purchase",
          visitorCount: 188,
          conditions: {
            orEventGroups: [
              {
                eventName: "in_app_purchase",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "purchase_type",
                    operator: "contains",
                    value: ["premium_feature", "virtual_currency", "ad_removal"],
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