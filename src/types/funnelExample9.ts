import { Funnel } from './funnel';

export const exampleFunnel9: Funnel = {
  id: 'b2b-lead-qualification-funnel-001',
  name: 'B2B Lead Qualification Funnel',
  description: 'Tracks prospects from first visit through lead capture, qualification, demo, trial, and closed-won',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastCalculatedAt: null,
  timeframe: {
    from: Date.now() - 30 * 24 * 60 * 60 * 1000,
    to: Date.now()
  },
  performedBy: 'all_contacts',
  steps: [
    {
      id: 'step-1-landing',
      name: 'Landing Page Visit',
      displayColor: '#4A90E2',
      order: 1,
      visitorCount: 18000,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'page_view',
            operator: 'equals',
            count: 1,
            properties: [
              { name: 'page_type', operator: 'equals', value: 'landing', type: 'string' }
            ]
          }
        ]
      }
    },
    {
      id: 'step-2-lead-magnet',
      name: 'Lead Magnet Download',
      displayColor: '#7ED321',
      order: 2,
      visitorCount: 1200,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'download',
            operator: 'equals',
            count: 1,
            properties: [
              { name: 'content_type', operator: 'contains', value: ['whitepaper', 'ebook', 'report'], type: 'string' }
            ]
          }
        ]
      },
      splitVariations: [
        {
          id: 'variation-1-whitepaper',
          name: 'Whitepaper',
          visitorCount: 700,
          conditions: {
            orEventGroups: [
              { eventName: 'download', operator: 'equals', count: 1, properties: [ { name: 'content_type', operator: 'equals', value: 'whitepaper', type: 'string' } ] }
            ]
          }
        },
        {
          id: 'variation-2-ebook',
          name: 'Ebook',
          visitorCount: 500,
          conditions: {
            orEventGroups: [
              { eventName: 'download', operator: 'equals', count: 1, properties: [ { name: 'content_type', operator: 'equals', value: 'ebook', type: 'string' } ] }
            ]
          }
        }
      ]
    },
    {
      id: 'step-3-lead-captured',
      name: 'Lead Capture (Form Submitted)',
      displayColor: '#F5A623',
      order: 3,
      visitorCount: 420,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'contact',
            operator: 'equals',
            count: 1,
            properties: [
              { name: 'form_type', operator: 'contains', value: ['lead', 'contact'], type: 'string' },
              { name: 'email_valid', operator: 'isTrue', value: true, type: 'boolean' }
            ]
          }
        ]
      }
    },
    {
      id: 'step-4-qualified',
      name: 'MQL/SQL Qualified',
      displayColor: '#D0021B',
      order: 4,
      visitorCount: 180,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'contact',
            operator: 'equals',
            count: 1,
            properties: [
              { name: 'lead_score', operator: 'greaterThanNumeric', value: 60, type: 'number' },
              { name: 'company_size', operator: 'isSet', value: '', type: 'string' }
            ]
          }
        ]
      }
    },
    {
      id: 'step-5-demo-request',
      name: 'Demo Requested',
      displayColor: '#9013FE',
      order: 5,
      visitorCount: 95,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'contact',
            operator: 'equals',
            count: 1,
            properties: [ { name: 'request_type', operator: 'equals', value: 'demo', type: 'string' } ]
          }
        ]
      }
    },
    {
      id: 'step-6-demo-completed',
      name: 'Demo Completed',
      displayColor: '#50E3C2',
      order: 6,
      visitorCount: 60,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'signup',
            operator: 'equals',
            count: 1,
            properties: [ { name: 'demo_attendance', operator: 'isTrue', value: true, type: 'boolean' } ]
          }
        ]
      }
    },
    {
      id: 'step-7-trial-started',
      name: 'Free Trial Started',
      displayColor: '#FF6B6B',
      order: 7,
      visitorCount: 35,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'signup',
            operator: 'equals',
            count: 1,
            properties: [ { name: 'trial_type', operator: 'contains', value: ['free', 'limited'], type: 'string' } ]
          }
        ]
      }
    },
    {
      id: 'step-8-closed-won',
      name: 'Closed Won',
      displayColor: '#27AE60',
      order: 8,
      visitorCount: 10,
      isEnabled: true,
      isRequired: true,
      conditions: {
        orEventGroups: [
          {
            eventName: 'purchase',
            operator: 'equals',
            count: 1,
            properties: [
              { name: 'contract_signed', operator: 'isTrue', value: true, type: 'boolean' },
              { name: 'plan_type', operator: 'contains', value: ['pro', 'enterprise'], type: 'string' }
            ]
          }
        ]
      }
    }
  ]
};


