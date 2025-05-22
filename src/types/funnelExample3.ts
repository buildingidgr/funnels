import { Funnel } from './funnel';

export const exampleFunnel3: Funnel = {
  id: 'travel-booking-funnel-001',
  name: "Travel Agency Booking Funnel",
  description: "Tracks users from Facebook ad landing to booking completion, with destination-based split paths and optional engagement steps",
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
      id: "step-1-landing",
      name: "Facebook Ad Landing",
      displayColor: "#4A90E2",
      order: 1,
      visitorCount: 5000,
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
                name: "source",
                operator: "equals",
                value: "facebook",
                type: "string"
              },
              {
                name: "campaign",
                operator: "contains",
                value: "summer-vacation",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-2-destination",
      name: "Destination Selection",
      displayColor: "#7ED321",
      order: 2,
      visitorCount: 4000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "destinationSelected",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      },
      splitVariations: [
        {
          id: "variation-1-domestic",
          name: "Domestic Destination",
          visitorCount: 2500,
          conditions: {
            orEventGroups: [
              {
                eventName: "domesticDestinationSelected",
                operator: "equals",
                count: 1,
                properties: []
              }
            ]
          }
        },
        {
          id: "variation-2-international",
          name: "International Destination",
          visitorCount: 1500,
          conditions: {
            orEventGroups: [
              {
                eventName: "internationalDestinationSelected",
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
      id: "step-3-accommodation",
      name: "Accommodation Options",
      displayColor: "#F5A623",
      order: 3,
      visitorCount: 3500,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "accommodationViewed",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-4-travel-details",
      name: "Travel Details Entry",
      displayColor: "#D0021B",
      order: 4,
      visitorCount: 3000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "travelDetailsSubmitted",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "hasDates",
                operator: "equals",
                value: "true",
                type: "string"
              },
              {
                name: "hasGroupSize",
                operator: "equals",
                value: "true",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-5-optional-gallery",
      name: "Photo Gallery & Reviews (Optional)",
      displayColor: "#9013FE",
      order: 5,
      visitorCount: 2000,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "galleryViewed",
            operator: "equals",
            count: 1,
            properties: []
          },
          {
            eventName: "reviewsRead",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-6-email-capture",
      name: "Email for Quote",
      displayColor: "#50E3C2",
      order: 6,
      visitorCount: 2500,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "emailSubmitted",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "emailValid",
                operator: "equals",
                value: "true",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-7-package-comparison",
      name: "Package Comparison",
      displayColor: "#4A90E2",
      order: 7,
      visitorCount: 2000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "packageComparisonViewed",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-8-deposit",
      name: "Deposit Payment",
      displayColor: "#7ED321",
      order: 8,
      visitorCount: 1500,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "depositPaid",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "paymentStatus",
                operator: "equals",
                value: "completed",
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-9-optional-transfer",
      name: "Airport Transfer (Optional)",
      displayColor: "#F5A623",
      order: 9,
      visitorCount: 800,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "transferServiceAdded",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-10-booking-complete",
      name: "Booking Complete",
      displayColor: "#D0021B",
      order: 10,
      visitorCount: 1000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "bookingCompleted",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "bookingStatus",
                operator: "equals",
                value: "confirmed",
                type: "string"
              }
            ]
          }
        ]
      }
    }
  ]
}; 