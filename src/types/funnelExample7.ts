import { Funnel } from './funnel';

export const exampleFunnel7: Funnel = {
  id: 'content-marketing-funnel-001',
  name: "Content Marketing Conversion Funnel",
  description: "Tracks visitors from content discovery to lead generation and conversion with realistic content marketing metrics",
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
      id: "step-1-content-discovery",
      name: "Content Discovery",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 50000,
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
                name: "content_type",
                operator: "contains",
                value: ["blog", "article", "whitepaper", "case_study"],
                type: "string"
              },
              {
                name: "traffic_source",
                operator: "contains",
                value: ["organic", "social", "email", "direct"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-2-content-engagement",
      name: "Content Engagement",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 2500,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "content_engagement",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "engagement_type",
                operator: "contains",
                value: ["scroll_depth", "time_on_page", "social_share", "comment"],
                type: "string"
              },
              {
                name: "engagement_duration",
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
      id: "step-3-email-signup",
      name: "Email Newsletter Signup",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 125,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "email_signup",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "signup_location",
                operator: "contains",
                value: ["popup", "sidebar", "inline", "footer"],
                type: "string"
              },
              {
                name: "email_verified",
                operator: "isTrue",
                value: true,
                type: "boolean"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-popup",
          name: "Popup Signup",
          visitorCount: 1050,
          conditions: {
            orEventGroups: [
              {
                eventName: "email_signup",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "signup_location",
                    operator: "equals",
                    value: "popup",
                    type: "string"
                  }
                ]
              }
            ]
          }
        },
        {
          id: "variation-2-inline",
          name: "Inline Signup",
          visitorCount: 900,
          conditions: {
            orEventGroups: [
              {
                eventName: "email_signup",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "signup_location",
                    operator: "contains",
                    value: ["sidebar", "inline", "footer"],
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
      id: "step-4-content-download",
      name: "Gated Content Download",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 35,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "content_download",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "content_type",
                operator: "contains",
                value: ["whitepaper", "ebook", "template", "checklist"],
                type: "string"
              },
              {
                name: "form_completed",
                operator: "isTrue",
                value: true,
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-5-webinar-registration",
      name: "Webinar Registration",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 15,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "webinar_registration",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "registration_source",
                operator: "contains",
                value: ["email", "social", "website"],
                type: "string"
              },
              {
                name: "calendar_invite_sent",
                operator: "isTrue",
                value: true,
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-6-webinar-attendance",
      name: "Webinar Attendance",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 8,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "webinar_attended",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "attendance_duration",
                operator: "greaterThanNumeric",
                value: 900,
                type: "number"
              },
              {
                name: "interaction_level",
                operator: "contains",
                value: ["viewer", "participant", "question_asked"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-7-demo-request",
      name: "Demo Request",
      displayColor: "#FF6B6B",
      order: 7,
      visitorCount: 4,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "demo_requested",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "request_source",
                operator: "contains",
                value: ["webinar", "email", "website"],
                type: "string"
              },
              {
                name: "company_size",
                operator: "isSet",
                value: "",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-8-demo-completed",
      name: "Demo Completed",
      displayColor: "#FFD93D",
      order: 8,
      visitorCount: 2,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "demo_completed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "demo_duration",
                operator: "greaterThanNumeric",
                value: 1800,
                type: "number"
              },
              {
                name: "demo_quality_score",
                operator: "greaterThanNumeric",
                value: 7,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-9-trial-signup",
      name: "Free Trial Started",
      displayColor: "#A8E6CF",
      order: 9,
      visitorCount: 1,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "trial_started",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "trial_type",
                operator: "contains",
                value: ["free", "limited"],
                type: "string"
              },
              {
                name: "credit_card_required",
                operator: "isFalse",
                value: false,
                type: "boolean"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-10-conversion",
      name: "Paid Conversion",
      displayColor: "#FF8A80",
      order: 10,
      visitorCount: 1,
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
                value: ["starter", "pro", "enterprise"],
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
      }
    }
  ]
}; 