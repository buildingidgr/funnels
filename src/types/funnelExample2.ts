import { Funnel } from './funnel';

export const exampleFunnel2: Funnel = {
  id: 'content-engagement-funnel-001',
  name: "Content Engagement Funnel",
  description: "Tracks user engagement with content from initial view to conversion, including optional engagement steps and A/B testing variations",
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
      id: "step-1-view-content",
      name: "Viewed Content Page",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 15000,
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
                value: "/blog/",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-2-optional-share",
      name: "Shared Content (Optional)",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 5000,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "contentShared",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "platform",
                operator: "equals",
                value: "twitter",
                type: "string"
              }
            ]
          },
          {
            eventName: "contentShared",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "platform",
                operator: "equals",
                value: "facebook",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-3-newsletter-signup",
      name: "Newsletter Signup",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 3000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "newsletterSignup",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "source",
                operator: "equals",
                value: "content",
                type: "string"
              }
            ]
          }
        ],
        andAlsoEvents: [
          {
            eventName: "pageViewed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "urlPath",
                operator: "contains",
                value: "/blog/",
                type: "string"
              }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-popup",
          name: "Popup Form",
          visitorCount: 2000,
          conditions: {
            orEventGroups: [
              {
                eventName: "newsletterSignup",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "formType",
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
          name: "Inline Form",
          visitorCount: 1000,
          conditions: {
            orEventGroups: [
              {
                eventName: "newsletterSignup",
                operator: "equals",
                count: 1,
                properties: [
                  {
                    name: "formType",
                    operator: "equals",
                    value: "inline",
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
      name: "Downloaded Content",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 2000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "contentDownload",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "contentType",
                operator: "equals",
                value: "ebook",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-5-contact-form",
      name: "Submitted Contact Form",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 1000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "formSubmission",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "formType",
                operator: "equals",
                value: "contact",
                type: "string"
              },
              {
                name: "source",
                operator: "equals",
                value: "content",
                type: "string"
              }
            ]
          }
        ]
      }
    }
  ]
}; 