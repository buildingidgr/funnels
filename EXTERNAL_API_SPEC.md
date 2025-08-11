# Waymore Funnel External API Specification

This document defines the external API required by the Waymore Funnel Explorer.

Authentication is handled by a separate internal service and is out of scope for this document.

## Overview

The frontend needs two capabilities:

1. Calculate funnel results based on a funnel definition and timeframe
2. Fetch the catalog of available events used to configure funnel steps (including their properties and types)

All timestamps are epoch milliseconds unless stated otherwise.

---

## 1) Calculate Funnel Results

### Endpoints

- Option A (server resolves funnel by ID)
  - Method: `POST`
  - Path: `/funnels/{funnelId}/calculate`

- Option B (client sends full funnel object)
  - Method: `POST`
  - Path: `/funnel-calculation`

Both variants accept the same calculation options and return the same response shape.

### Request Body (Option A)

```json
{
  "timeframe": { "from": 1719878400000, "to": 1722470400000 },
  "options": {
    "includeSplitVariations": true,
    "includeMetrics": true,
    "includeInsights": true
  }
}
```

### Request Body (Option B)

```json
{
  "funnel": {
    "id": "abc-123",
    "name": "E-commerce Conversion Funnel",
    "description": "Tracks users from discovery to purchase",
    "timeframe": { "from": 1719878400000, "to": 1722470400000 },
    "performedBy": "all_contacts",
    "steps": [
      {
        "id": "step-1-product-visit",
        "name": "Product Page Visit",
        "order": 1,
        "isEnabled": true,
        "isRequired": true,
        "conditions": {
          "orEventGroups": [
            {
              "eventName": "page_view",
              "operator": "equals",
              "count": 1,
              "properties": [
                { "name": "page_type", "operator": "equals", "value": "product", "type": "string" },
                { "name": "session_duration", "operator": "greaterThanNumeric", "value": 10, "type": "number" }
              ]
            }
          ]
        }
      }
    ]
  },
  "timeframe": { "from": 1719878400000, "to": 1722470400000 },
  "options": {
    "includeSplitVariations": true,
    "includeMetrics": true,
    "includeInsights": true
  }
}
```

### Response 200 (FunnelCalculationResponse)

```json
{
  "calculatedResults": {
    "start": 10000,
    "step-1-product-visit": 8900,
    "end": 8900,
    "step-2-variation-1": 5400
  },
  "stepMetrics": [
    {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "visitorCount": 8900,
      "conversionRate": 89.0,
      "dropOffRate": 11.0,
      "dropOffCount": 1100,
      "previousStepValue": 10000,
      "isOptional": false,
      "isSplit": false
    }
  ],
  "splitVariationMetrics": [
    {
      "id": "step-2-variation-1",
      "name": "Variation A",
      "visitorCount": 5400,
      "conversionRate": 60.7,
      "dropOffRate": 39.3,
      "dropOffCount": 3500,
      "parentStepId": "step-2",
      "proportionOfParent": 60.0
    }
  ],
  "insights": {
    "overallConversionRate": 89.0,
    "totalDropOff": 1100,
    "highestDropOffStep": {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "visitorCount": 8900,
      "conversionRate": 89.0,
      "dropOffRate": 11.0,
      "dropOffCount": 1100,
      "previousStepValue": 10000,
      "isOptional": false
    },
    "bestConvertingStep": {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "visitorCount": 8900,
      "conversionRate": 89.0,
      "dropOffRate": 11.0,
      "dropOffCount": 1100,
      "previousStepValue": 10000,
      "isOptional": false
    },
    "potentialRevenueLost": 82500,
    "improvementOpportunity": 11.0,
    "funnelType": "ecommerce",
    "recommendations": [
      "Focus on improving Product Page Visit - currently has 11.0% drop-off",
      "Use Product Page Visit as a model - it has the best conversion rate at 89.0%",
      "Optimize cart abandonment recovery and checkout flow"
    ]
  },
  "sankeyData": {
    "nodes": [
      { "id": "start", "name": "Start", "value": 10000 },
      { "id": "step-step-1-product-visit", "name": "Product Page Visit", "value": 8900, "isOptional": false }
    ],
    "links": [
      { "source": "start", "target": "step-step-1-product-visit", "value": 8900 }
    ]
  },
  "metadata": {
    "calculatedAt": "2024-08-01T12:34:56.000Z",
    "timeframe": { "from": 1719878400000, "to": 1722470400000 },
    "totalSteps": 1,
    "enabledSteps": 1,
    "initialValue": 10000
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "INVALID_FUNNEL_DATA",
    "message": "At least one step must be enabled",
    "details": ["Step IDs must be unique"]
  }
}
```

### Field Definitions

- FunnelCalculationRequest
  - `timeframe`: `{ from: number; to: number }` (epoch ms). Optional; server may default to `funnel.timeframe`.
  - `options`:
    - `includeSplitVariations`: `boolean` (default `true`)
    - `includeMetrics`: `boolean` (default `true`)
    - `includeInsights`: `boolean` (default `true`)

- FunnelCalculationResponse
  - `calculatedResults`: key-value map of counts per `step.id`; includes keys `start` and `end`. For split variations, keys must be `${step.id}-variation-${index+1}`.
  - `stepMetrics`: per-step analytics with counts and rates.
  - `splitVariationMetrics`: per-variation analytics.
  - `insights`: overall insights and recommendations.
  - `sankeyData`: nodes and links for visualization.
  - `metadata`: calculation metadata including timeframe and `initialValue`.

### Notes

- Requests must not include `visitorCount` values; the service calculates them.
- Requests must not include `initialValue`; the service has no dependency on client-provided counts and will compute the baseline cohort (`metadata.initialValue`) and all step values based on its own logic/data sources.
- Split variation result keys must follow `${step.id}-variation-${index+1}`.
- Sankey node IDs should be: `start`, `end`, `step-${step.id}`, and `split-${step.id}-${varIndex}` for split nodes.

---

## 2) Fetch Events Catalog (for Step Configuration)

### Endpoint

- Method: `GET`
- Path: `/events`
- Description: Returns the catalog of selectable events and their properties.

### Response 200

```json
{
  "events": [
    {
      "name": "pageViewed",
      "label": "Page Viewed",
      "properties": [
        { "name": "urlPath", "type": "string", "label": "URL Path" },
        { "name": "referrer", "type": "string", "label": "Referrer" },
        { "name": "timestamp", "type": "date", "label": "Timestamp" }
      ]
    },
    {
      "name": "addToCart",
      "label": "Add to Cart",
      "properties": [
        { "name": "productId", "type": "string", "label": "Product ID" },
        { "name": "productSku", "type": "string", "label": "Product SKU" },
        { "name": "quantity", "type": "number", "label": "Quantity" },
        { "name": "price", "type": "number", "label": "Price" },
        { "name": "currency", "type": "string", "label": "Currency" },
        { "name": "timestamp", "type": "date", "label": "Timestamp" }
      ]
    }
  ]
}
```

### Error Response

```json
{
  "error": {
    "code": "EVENTS_UNAVAILABLE",
    "message": "Events catalogue could not be loaded"
  }
}
```

### Operator Expectations by Property Type

If you choose to return supported operators per property, use the values below. Otherwise, the frontend can infer operators from `type`.

- `string`: `equals`, `contains`, `startsWith`, `endsWith`, `regex`, `isSet`, `isNotSet`
- `number`: `equalsNumeric`, `notEqualsNumeric`, `greaterThanNumeric`, `lessThanNumeric`
- `boolean`: `isTrue`, `isFalse`
- `date`: `equals`, `greaterThan`, `lessThan`

---

## Types Reference (Shape Requirements)

TypeScript-like interfaces to clarify required shapes. These are descriptive; actual API is JSON.

```ts
// Core funnel shape
interface Funnel {
  id?: string;
  name: string;
  description: string;
  timeframe: { from: number; to: number };
  performedBy: string;
  steps: FunnelStep[];
}

interface FunnelStep {
  id: string;
  name: string;
  description?: string;
  displayColor?: string;
  order: number;
  isEnabled: boolean;
  isRequired: boolean;
  isVisible?: boolean;
  isOptional?: boolean;
  aiEnabled?: boolean;
  conditions: Conditions;
  splitVariations?: SplitVariation[];
}

interface Conditions {
  orEventGroups: ConditionItem[];
  andAlsoEvents?: ConditionItem[];
}

interface ConditionItem {
  eventName: string;
  operator: 'equals' | 'contains' | 'regex' | 'startsWith' | 'endsWith' | 'isSet' | 'isNotSet' | 'isTrue' | 'isFalse' | 'greaterThan' | 'lessThan' | 'equalsNumeric' | 'notEqualsNumeric' | 'greaterThanNumeric' | 'lessThanNumeric';
  count: number;
  properties?: EventProperty[];
  occurrence?: OccurrenceDetails;
}

interface EventProperty {
  name: string;
  operator: 'equals' | 'contains' | 'regex' | 'startsWith' | 'endsWith' | 'isSet' | 'isNotSet' | 'isTrue' | 'isFalse' | 'greaterThan' | 'lessThan' | 'equalsNumeric' | 'notEqualsNumeric' | 'greaterThanNumeric' | 'lessThanNumeric';
  value: string | number | readonly string[];
  type: 'string' | 'number' | 'boolean' | 'date';
  logicalLink?: 'AND' | 'OR';
}

interface OccurrenceDetails {
  operator: 'atLeast' | 'atMost' | 'exactly' | 'between';
  count: number;
  count2?: number;
  timeWindow?: {
    type: 'anytime' | 'relative';
    value?: number;
    unit?: 'days' | 'hours' | 'minutes' | 'weeks' | 'months';
  };
}

interface SplitVariation {
  id: string;
  name: string;
  conditions: Conditions;
}

// Request/response
interface FunnelCalculationRequest {
  funnel?: Funnel; // required for /funnel-calculation
  timeframe?: { from: number; to: number };
  options?: {
    includeSplitVariations?: boolean; // default true
    includeMetrics?: boolean; // default true
    includeInsights?: boolean; // default true
  };
}

interface FunnelCalculationResponse {
  calculatedResults: Record<string, number>; // includes 'start' and 'end'; split keys: `${step.id}-variation-${index+1}`
  stepMetrics: Array<{
    id: string;
    name: string;
    visitorCount: number;
    conversionRate: number;
    dropOffRate: number;
    dropOffCount: number;
    previousStepValue: number;
    isOptional: boolean;
    isSplit?: boolean;
    parentStepId?: string;
  }>;
  splitVariationMetrics: Array<{
    id: string;
    name: string;
    visitorCount: number;
    conversionRate: number;
    dropOffRate: number;
    dropOffCount: number;
    parentStepId: string;
    proportionOfParent: number;
  }>;
  insights: {
    overallConversionRate: number;
    totalDropOff: number;
    highestDropOffStep: any; // same shape as a stepMetrics item
    bestConvertingStep: any; // same shape as a stepMetrics item
    potentialRevenueLost?: number;
    improvementOpportunity: number;
    funnelType: 'ecommerce' | 'saas' | 'lead-gen' | 'mobile-app' | 'content' | 'support';
    recommendations: string[];
  };
  sankeyData: {
    nodes: Array<{ id: string; name: string; value: number; isOptional?: boolean; isSplit?: boolean; parentId?: string }>;
    links: Array<{ source: string; target: string; value: number }>;
  };
  metadata: {
    calculatedAt: string; // ISO
    timeframe: { from: number; to: number };
    totalSteps: number;
    enabledSteps: number;
    initialValue: number; // computed by the service
  };
}
```

---

## Versioning

- Initial version: 1.0.0
- Breaking changes will increment the major version and be documented here.

## Contact

Please coordinate with the internal team for authentication and environment/base URL details. This spec focuses only on request/response contracts.

---

## Full example funnel (complete details)

A complete example of an existing funnel used in the app (values adapted to static JSON):

```json
{
  "id": "ecommerce-funnel-001",
  "name": "E-commerce Conversion Funnel",
  "description": "Tracks users from product discovery to purchase completion with realistic conversion rates and detailed event tracking",
  "createdAt": "2024-07-01T00:00:00.000Z",
  "updatedAt": "2024-08-01T00:00:00.000Z",
  "lastCalculatedAt": null,
  "timeframe": { "from": 1719878400000, "to": 1722470400000 },
  "performedBy": "all_contacts",
  "steps": [
    {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "displayColor": "#4A90E2",
      "order": 1,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "page_view",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "page_type", "operator": "equals", "value": "product", "type": "string" },
              { "name": "session_duration", "operator": "greaterThanNumeric", "value": 10, "type": "number" }
            ]
          }
        ]
      }
    },
    {
      "id": "step-2-product-interaction",
      "name": "Product Interaction",
      "displayColor": "#7ED321",
      "order": 2,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "product_interaction",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "interaction_type", "operator": "contains", "value": ["image_zoom", "size_selector", "color_selector", "reviews_view"], "type": "string" }
            ]
          }
        ]
      }
    },
    {
      "id": "step-3-add-to-cart",
      "name": "Add to Cart",
      "displayColor": "#F5A623",
      "order": 3,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "add_to_cart",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "product_available", "operator": "isTrue", "value": "true", "type": "boolean" }
            ]
          }
        ]
      },
      "splitVariations": [
        {
          "id": "variation-1-quick-add",
          "name": "Quick Add (Mobile)",
          "conditions": {
            "orEventGroups": [
              {
                "eventName": "add_to_cart",
                "operator": "equals",
                "count": 1,
                "properties": [
                  { "name": "device_type", "operator": "equals", "value": "mobile", "type": "string" },
                  { "name": "add_method", "operator": "equals", "value": "quick_add", "type": "string" }
                ]
              }
            ]
          }
        },
        {
          "id": "variation-2-standard-add",
          "name": "Standard Add (Desktop)",
          "conditions": {
            "orEventGroups": [
              {
                "eventName": "add_to_cart",
                "operator": "equals",
                "count": 1,
                "properties": [
                  { "name": "device_type", "operator": "equals", "value": "desktop", "type": "string" },
                  { "name": "add_method", "operator": "equals", "value": "standard", "type": "string" }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "id": "step-4-cart-review",
      "name": "Cart Review",
      "displayColor": "#D0021B",
      "order": 4,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "cart_view",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "cart_value", "operator": "greaterThanNumeric", "value": 0, "type": "number" }
            ]
          }
        ]
      }
    },
    {
      "id": "step-5-checkout-start",
      "name": "Checkout Started",
      "displayColor": "#9013FE",
      "order": 5,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "checkout_started",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "checkout_method", "operator": "contains", "value": ["guest", "account"], "type": "string" }
            ]
          }
        ]
      }
    },
    {
      "id": "step-6-payment-info",
      "name": "Payment Information Entered",
      "displayColor": "#50E3C2",
      "order": 6,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "payment_info_entered",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "payment_method", "operator": "contains", "value": ["credit_card", "paypal", "apple_pay", "google_pay"], "type": "string" }
            ]
          }
        ]
      }
    },
    {
      "id": "step-7-purchase-complete",
      "name": "Purchase Completed",
      "displayColor": "#FF6B6B",
      "order": 7,
      "isEnabled": true,
      "isRequired": true,
      "conditions": {
        "orEventGroups": [
          {
            "eventName": "purchase",
            "operator": "equals",
            "count": 1,
            "properties": [
              { "name": "transaction_status", "operator": "equals", "value": "success", "type": "string" },
              { "name": "order_value", "operator": "greaterThanNumeric", "value": 0, "type": "number" }
            ]
          }
        ]
      }
    }
  ]
}
```
