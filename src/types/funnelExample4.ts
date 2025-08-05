import { Funnel } from './funnel';

export const exampleFunnel4: Funnel = {
  id: 'saas-onboarding-funnel-001',
  name: "SaaS Onboarding Funnel",
  description: "Tracks users through the SaaS onboarding process with realistic conversion rates and detailed user behavior tracking",
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
      id: "step-1-landing-visit",
      name: "Landing Page Visit",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 15000,
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
              },
              {
                name: "session_duration",
                operator: "greaterThanNumeric",
                value: 15,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-2-signup-start",
      name: "Signup Started",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 3000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "signup_started",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "signup_method",
                operator: "contains",
                value: ["email", "google", "github"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-3-account-created",
      name: "Account Created",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 2400,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "account_created",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "verification_status",
                operator: "equals",
                value: "verified",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-4-onboarding-start",
      name: "Onboarding Started",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 1920,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "onboarding_started",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "onboarding_type",
                operator: "contains",
                value: ["guided", "self_guided"],
                type: "string"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-guided",
          name: "Guided Tour",
          visitorCount: 1152,
          conditions: {
            orEventGroups: [
              {
                eventName: "guided_tour_started",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "user_type",
                    operator: "equals",
                    value: "new",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-self-guided",
          name: "Self-Guided",
          visitorCount: 768,
          conditions: {
            orEventGroups: [
              {
                eventName: "self_guided_started",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "user_type",
                    operator: "equals",
                    value: "experienced",
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
      id: "step-5-first-feature",
      name: "First Feature Used",
      displayColor: "#9013FE",
      order: 5,
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
                value: ["core", "basic"],
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
      }
    },
    {
      id: "step-6-weekly-active",
      name: "Weekly Active User",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 940,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "weekly_active",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "session_count",
                operator: "greaterThanNumeric",
                value: 2,
                type: "number"
              },
              {
                name: "total_session_time",
                operator: "greaterThanNumeric",
                value: 300,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-7-subscription",
      name: "Subscription Started",
      displayColor: "#FF6B6B",
      order: 7,
      visitorCount: 470,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "subscription_started",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "plan_type",
                operator: "contains",
                value: ["pro", "business", "enterprise"],
                type: "string"
              },
              {
                name: "payment_status",
                operator: "equals",
                value: "active",
                type: "string"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-monthly",
          name: "Monthly Plan",
          visitorCount: 282,
          conditions: {
            orEventGroups: [
              {
                eventName: "subscription_started",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "billing_cycle",
                    operator: "equals",
                    value: "monthly",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-annual",
          name: "Annual Plan",
          visitorCount: 188,
          conditions: {
            orEventGroups: [
              {
                eventName: "subscription_started",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "billing_cycle",
                    operator: "equals",
                    value: "annual",
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