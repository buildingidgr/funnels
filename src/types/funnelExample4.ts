import { Funnel } from './funnel';

export const exampleFunnel4: Funnel = {
  id: 'saas-onboarding-funnel-001',
  name: "SaaS Onboarding Funnel",
  description: "Tracks users through the SaaS onboarding process with multiple split paths for different user types and feature adoption",
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
      id: "step-1-signup",
      name: "Account Signup",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 8000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "accountCreated",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-2-user-type",
      name: "User Type Selection",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 7000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "userTypeSelected",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-individual",
          name: "Individual User",
          visitorCount: 4000,
          conditions: {
            orEventGroups: [
              {
                eventName: "userTypeSelected",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "userType",
                    operator: "equals",
                    value: "individual",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-team",
          name: "Team User",
          visitorCount: 3000,
          conditions: {
            orEventGroups: [
              {
                eventName: "userTypeSelected",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "userType",
                    operator: "equals",
                    value: "team",
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
      id: "step-3-onboarding-path",
      name: "Onboarding Path",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 6000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "onboardingStarted",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-guided",
          name: "Guided Tour",
          visitorCount: 3500,
          conditions: {
            orEventGroups: [
              {
                eventName: "guidedTourStarted",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-self-guided",
          name: "Self-Guided",
          visitorCount: 2500,
          conditions: {
            orEventGroups: [
              {
                eventName: "selfGuidedStarted",
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
      id: "step-4-feature-adoption",
      name: "Feature Adoption",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 5000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "featureUsed",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-core",
          name: "Core Features",
          visitorCount: 3000,
          conditions: {
            orEventGroups: [
              {
                eventName: "coreFeatureUsed",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-advanced",
          name: "Advanced Features",
          visitorCount: 2000,
          conditions: {
            orEventGroups: [
              {
                eventName: "advancedFeatureUsed",
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
      id: "step-5-subscription",
      name: "Subscription Selection",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 4000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "subscriptionSelected",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-monthly",
          name: "Monthly Plan",
          visitorCount: 2500,
          conditions: {
            orEventGroups: [
              {
                eventName: "monthlyPlanSelected",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-annual",
          name: "Annual Plan",
          visitorCount: 1500,
          conditions: {
            orEventGroups: [
              {
                eventName: "annualPlanSelected",
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
      id: "step-6-payment",
      name: "Payment Completion",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 3000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "paymentCompleted",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "status",
                operator: "equals",
                value: "success",
                type: "string"
              }
            ]
          }
        ]
      }
    }
  ]
}; 