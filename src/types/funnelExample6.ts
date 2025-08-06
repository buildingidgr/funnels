import { Funnel } from './funnel';

export const exampleFunnel6: Funnel = {
  id: 'customer-support-funnel-001',
  name: "Customer Support Resolution Funnel",
  description: "Tracks customer interactions from initial contact to issue resolution with realistic support metrics and detailed tracking",
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
      id: "step-1-support-search",
      name: "Support Page Visit",
      displayColor: "#3B82F6",
      order: 1,
      visitorCount: 8000,
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
                operator: "contains",
                value: ["help", "support", "contact"],
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
      id: "step-2-ticket-created",
      name: "Support Ticket Created",
      displayColor: "#10B981",
      order: 2,
      visitorCount: 2400,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "support_ticket_created",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "ticket_priority",
                operator: "contains",
                value: ["low", "medium", "high", "urgent"],
                type: "string"
              },
              {
                name: "ticket_category",
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
      id: "step-3-live-chat",
      name: "Live Chat Initiated (Optional)",
      displayColor: "#F59E0B",
      order: 3,
      visitorCount: 1200,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "live_chat_started",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "chat_type",
                operator: "contains",
                value: ["general", "technical", "billing"],
                type: "string"
              },
              {
                name: "wait_time",
                operator: "lessThanNumeric",
                value: 300,
                type: "number"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-4-agent-assigned",
      name: "Agent Assigned",
      displayColor: "#EF4444",
      order: 4,
      visitorCount: 1080,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "agent_assigned",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "assignment_time",
                operator: "lessThanNumeric",
                value: 3600,
                type: "number"
              },
              {
                name: "agent_expertise",
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
      id: "step-5-first-response",
      name: "First Response Sent",
      displayColor: "#8B5CF6",
      order: 5,
      visitorCount: 972,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "first_response_sent",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "response_time",
                operator: "lessThanNumeric",
                value: 7200,
                type: "number"
              },
              {
                name: "response_quality",
                operator: "contains",
                value: ["helpful", "resolved", "escalated"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-6-customer-reply",
      name: "Customer Reply",
      displayColor: "#06B6D4",
      order: 6,
      visitorCount: 583,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "customer_reply",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "reply_time",
                operator: "lessThanNumeric",
                value: 86400,
                type: "number"
              },
              {
                name: "reply_sentiment",
                operator: "contains",
                value: ["positive", "neutral", "negative"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-7-resolution",
      name: "Issue Resolved",
      displayColor: "#10B981",
      order: 7,
      visitorCount: 525,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: "ticket_resolved",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "resolution_time",
                operator: "lessThanNumeric",
                value: 604800,
                type: "number"
              },
              {
                name: "resolution_type",
                operator: "contains",
                value: ["solved", "closed", "escalated"],
                type: "string"
              }
            ]
          }
        ]
      }
    },
    {
      id: "step-8-satisfaction-survey",
      name: "Satisfaction Survey Completed (Optional)",
      displayColor: "#F59E0B",
      order: 8,
      visitorCount: 263,
      isEnabled: true,
      isRequired: false,
      conditions: {
        orEventGroups: [
          {
            eventName: "satisfaction_survey_completed",
            operator: "equals",
            count: 1,
            properties: [
              {
                name: "survey_score",
                operator: "greaterThanNumeric",
                value: 0,
                type: "number"
              },
              {
                name: "survey_completion_time",
                operator: "lessThanNumeric",
                value: 604800,
                type: "number"
              }
            ]
          }
        ]
      }
    }
  ]
}; 