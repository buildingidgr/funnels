import { Funnel } from './funnel';

export const exampleFunnel6: Funnel = {
  id: 'customer-support-funnel-001',
  name: "Customer Support Resolution Funnel",
  description: "Tracks customer interactions from initial contact to issue resolution, including optional survey steps",
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
      id: "step-1-contact",
      name: "Initial Contact",
      displayColor: "#3B82F6",
      order: 1,
      visitorCount: 5000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "supportTicketCreated",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-2-optional-chat",
      name: "Live Chat (Optional)",
      displayColor: "#10B981",
      order: 2,
      visitorCount: 3000,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "liveChatStarted",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-3-resolution",
      name: "First Response",
      displayColor: "#F59E0B",
      order: 3,
      visitorCount: 4500,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "firstResponseSent",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-4-followup",
      name: "Issue Resolved",
      displayColor: "#EF4444",
      order: 4,
      visitorCount: 4000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "ticketResolved",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    },
    {
      id: "step-5-optional-survey",
      name: "Post-Support Survey (Optional)",
      displayColor: "#8B5CF6",
      order: 5,
      visitorCount: 2500,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "surveyCompleted",
            operator: "equals",
            count: 1,
            properties: []
          }
        ]
      }
    }
  ]
}; 