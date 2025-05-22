import { Funnel } from './funnel';

export const exampleFunnel5: Funnel = {
  id: 'mobile-app-engagement-funnel-001',
  name: "Mobile App Engagement Funnel",
  description: "Tracks users through mobile app engagement with multiple split paths for different app features and user segments",
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
      id: "step-1-app-install",
      name: "App Installation",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 12000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "appInstalled",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-2-platform",
      name: "Platform Selection",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 11000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "platformSelected",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-ios",
          name: "iOS Users",
          visitorCount: 6000,
          conditions: {
            orEventGroups: [
              {
                eventName: "platformSelected",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "platform",
                    operator: "equals",
                    value: "ios",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-android",
          name: "Android Users",
          visitorCount: 5000,
          conditions: {
            orEventGroups: [
              {
                eventName: "platformSelected",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "platform",
                    operator: "equals",
                    value: "android",
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
      id: "step-3-onboarding",
      name: "Onboarding Completion",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 9000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "onboardingCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-full",
          name: "Full Onboarding",
          visitorCount: 6000,
          conditions: {
            orEventGroups: [
              {
                eventName: "fullOnboardingCompleted",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-quick",
          name: "Quick Onboarding",
          visitorCount: 3000,
          conditions: {
            orEventGroups: [
              {
                eventName: "quickOnboardingCompleted",
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
      id: "step-4-feature-usage",
      name: "Feature Usage",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 8000,
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
          id: "variation-1-social",
          name: "Social Features",
          visitorCount: 4000,
          conditions: {
            orEventGroups: [
              {
                eventName: "socialFeatureUsed",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-content",
          name: "Content Features",
          visitorCount: 4000,
          conditions: {
            orEventGroups: [
              {
                eventName: "contentFeatureUsed",
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
      id: "step-5-engagement",
      name: "User Engagement",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 7000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "userEngaged",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-daily",
          name: "Daily Active Users",
          visitorCount: 4000,
          conditions: {
            orEventGroups: [
              {
                eventName: "dailyActive",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-weekly",
          name: "Weekly Active Users",
          visitorCount: 3000,
          conditions: {
            orEventGroups: [
              {
                eventName: "weeklyActive",
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
      id: "step-6-monetization",
      name: "Monetization",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 5000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "monetizationAction",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-subscription",
          name: "Subscription",
          visitorCount: 3000,
          conditions: {
            orEventGroups: [
              {
                eventName: "subscriptionPurchased",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-inapp",
          name: "In-App Purchase",
          visitorCount: 2000,
          conditions: {
            orEventGroups: [
              {
                eventName: "inAppPurchase",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        }
      ]
    }
  ]
}; 