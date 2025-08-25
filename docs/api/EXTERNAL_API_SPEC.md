# Waymore Funnel External API Specification

This document defines the external API required by the Waymore Funnel Explorer.

Authentication is handled by a separate internal service and is out of scope for this document.

## Overview

The frontend needs the following capabilities:

1. **Funnel Management**: CRUD operations for funnel definitions
2. **Funnel Calculation**: Calculate funnel results based on a funnel definition and timeframe
3. **Events Catalog**: Fetch the catalog of available events used to configure funnel steps
4. **Enhanced Analytics**: Access to step metrics, insights, and visualization data

All timestamps are epoch milliseconds unless stated otherwise.

## API Base URL

```
Production: https://connect.waymore.io/api/v1
Staging: https://staging-api.waymore.io/api/v1
```

## Authentication

All API requests require authentication using an API key:

```
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

---

## 1) Funnel Management

### List Funnels
- Method: `GET`
- Path: `/funnels`
- Description: Returns a list of all funnels with summary information

**Query Parameters**:
- `limit` (optional): Number of funnels to return (default: 50, max: 100)
- `offset` (optional): Number of funnels to skip (default: 0)
- `sortBy` (optional): Field to sort by (`name`, `createdAt`, `updatedAt`, `lastCalculatedAt`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

**Response 200**:
```json
{
  "funnels": [
    {
      "id": "ecommerce-funnel-001",
      "name": "E-commerce Conversion Funnel",
      "description": "Tracks users from discovery to purchase",
      "createdAt": "2024-07-01T00:00:00.000Z",
      "updatedAt": "2024-08-01T00:00:00.000Z",
      "lastCalculatedAt": "2024-08-01T12:34:56.000Z",
      "performance": {
        "totalVisitors": 25000,
        "conversionRate": 7.56,
        "steps": [
          {
            "id": "step-1-product-visit",
            "name": "Product Page Visit",
            "visitorCount": 25000,
            "conversionRate": 100.0
          }
        ]
      }
    }
  ],
  "pagination": {
    "total": 7,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### Get Funnel by ID
- Method: `GET`
- Path: `/funnels/{funnelId}`
- Description: Returns the complete funnel definition

**Response 200**:
```json
{
  "id": "ecommerce-funnel-001",
  "name": "E-commerce Conversion Funnel",
  "description": "Tracks users from discovery to purchase",
  "createdAt": "2024-07-01T00:00:00.000Z",
  "updatedAt": "2024-08-01T00:00:00.000Z",
  "lastCalculatedAt": "2024-08-01T12:34:56.000Z",
  "timeframe": { "from": 1719878400000, "to": 1722470400000 },
  "performedBy": "all_contacts",
  "steps": [
    {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "description": "Users who visit product pages",
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
              { "name": "page_type", "operator": "equals", "value": "product", "type": "string" }
            ]
          }
        ]
      }
    }
  ]
}
```

### Create Funnel
- Method: `POST`
- Path: `/funnels`
- Description: Creates a new funnel

**Request Body**:
```json
{
  "name": "New E-commerce Funnel",
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
              { "name": "page_type", "operator": "equals", "value": "product", "type": "string" }
            ]
          }
        ]
      }
    }
  ]
}
```

**Response 201**:
```json
{
  "id": "new-funnel-123",
  "name": "New E-commerce Funnel",
  "description": "Tracks users from discovery to purchase",
  "createdAt": "2024-08-01T12:34:56.000Z",
  "updatedAt": "2024-08-01T12:34:56.000Z",
  "lastCalculatedAt": null,
  "timeframe": { "from": 1719878400000, "to": 1722470400000 },
  "performedBy": "all_contacts",
  "steps": [...]
}
```

### Update Funnel
- Method: `PUT`
- Path: `/funnels/{funnelId}`
- Description: Updates an existing funnel

**Request Body**: Same as Create Funnel (all fields required)

**Response 200**: Same as Get Funnel by ID

### Delete Funnel
- Method: `DELETE`
- Path: `/funnels/{funnelId}`
- Description: Deletes a funnel

**Response 204**: No content

---

## 2) Calculate Funnel Results

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

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Funnel not found |
| `INVALID_FUNNEL_DATA` | 400 | Invalid funnel configuration |
| `CALCULATION_FAILED` | 500 | Funnel calculation failed |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Rate Limiting

- **Standard Plan**: 100 requests per minute
- **Professional Plan**: 1000 requests per minute
- **Enterprise Plan**: 10000 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Pagination and Filtering

All list endpoints support pagination and filtering:

**Pagination Parameters**:
- `limit`: Number of items per page (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

**Sorting Parameters**:
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction (`asc` or `desc`)

**Filtering Parameters**:
- `search`: Search in name and description
- `createdAfter`: Filter by creation date
- `createdBefore`: Filter by creation date
- `lastCalculatedAfter`: Filter by last calculation date
- `lastCalculatedBefore`: Filter by last calculation date

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true,
    "totalPages": 3,
    "currentPage": 1
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

## 3) Enhanced Analytics

### Get Step Metrics
- Method: `GET`
- Path: `/funnels/{funnelId}/metrics`
- Description: Returns step-by-step metrics for a funnel

**Query Parameters**:
- `timeframe` (optional): Override funnel timeframe
- `includeSplitVariations` (optional): Include split variation metrics (default: true)

**Response 200**:
```json
{
  "stepMetrics": [
    {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "visitorCount": 25000,
      "conversionRate": 100.0,
      "dropOffRate": 0.0,
      "dropOffCount": 0,
      "previousStepValue": 25000,
      "isOptional": false,
      "isSplit": false
    },
    {
      "id": "step-2-product-interaction",
      "name": "Product Interaction",
      "visitorCount": 18750,
      "conversionRate": 75.0,
      "dropOffRate": 25.0,
      "dropOffCount": 6250,
      "previousStepValue": 25000,
      "isOptional": false,
      "isSplit": false
    }
  ]
}
```

### Get Funnel Insights
- Method: `GET`
- Path: `/funnels/{funnelId}/insights`
- Description: Returns business insights and recommendations

**Query Parameters**:
- `timeframe` (optional): Override funnel timeframe

**Response 200**:
```json
{
  "insights": {
    "overallConversionRate": 7.56,
    "totalDropOff": 23110,
    "highestDropOffStep": {
      "id": "step-3-add-to-cart",
      "name": "Add to Cart",
      "visitorCount": 5625,
      "conversionRate": 30.0,
      "dropOffRate": 70.0,
      "dropOffCount": 13125,
      "previousStepValue": 18750,
      "isOptional": false
    },
    "bestConvertingStep": {
      "id": "step-1-product-visit",
      "name": "Product Page Visit",
      "visitorCount": 25000,
      "conversionRate": 100.0,
      "dropOffRate": 0.0,
      "dropOffCount": 0,
      "previousStepValue": 25000,
      "isOptional": false
    },
    "potentialRevenueLost": 82500,
    "improvementOpportunity": 70.0,
    "funnelType": "ecommerce",
    "recommendations": [
      "Focus on improving Add to Cart - currently has 70.0% drop-off",
      "Optimize product interaction to increase engagement",
      "Consider A/B testing different add-to-cart button placements"
    ]
  }
}
```

### Get Sankey Data
- Method: `GET`
- Path: `/funnels/{funnelId}/sankey`
- Description: Returns Sankey diagram data for visualization

**Query Parameters**:
- `timeframe` (optional): Override funnel timeframe
- `includeSplitVariations` (optional): Include split variations (default: true)

**Response 200**:
```json
{
  "sankeyData": {
    "nodes": [
      { "id": "start", "name": "Start", "value": 25000 },
      { "id": "step-step-1-product-visit", "name": "Product Page Visit", "value": 25000, "isOptional": false },
      { "id": "step-step-2-product-interaction", "name": "Product Interaction", "value": 18750, "isOptional": false },
      { "id": "step-step-3-add-to-cart", "name": "Add to Cart", "value": 5625, "isOptional": false }
    ],
    "links": [
      { "source": "start", "target": "step-step-1-product-visit", "value": 25000 },
      { "source": "step-step-1-product-visit", "target": "step-step-2-product-interaction", "value": 18750 },
      { "source": "step-step-2-product-interaction", "target": "step-step-3-add-to-cart", "value": 5625 }
    ]
  }
}
```

### Get Split Variation Metrics
- Method: `GET`
- Path: `/funnels/{funnelId}/variations`
- Description: Returns split variation metrics for A/B testing

**Query Parameters**:
- `timeframe` (optional): Override funnel timeframe

**Response 200**:
```json
{
  "splitVariationMetrics": [
    {
      "id": "step-3-variation-1",
      "name": "Quick Add (Mobile)",
      "visitorCount": 3375,
      "conversionRate": 30.0,
      "dropOffRate": 70.0,
      "dropOffCount": 7875,
      "parentStepId": "step-3-add-to-cart",
      "proportionOfParent": 60.0
    },
    {
      "id": "step-3-variation-2",
      "name": "Standard Add (Desktop)",
      "visitorCount": 2250,
      "conversionRate": 30.0,
      "dropOffRate": 70.0,
      "dropOffCount": 5250,
      "parentStepId": "step-3-add-to-cart",
      "proportionOfParent": 40.0
    }
  ]
}
```

---

## 4) Fetch Events Catalog (for Step Configuration)

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

## API Versioning

### Version Header
All API requests should include the API version header:
```
Accept: application/vnd.waymore.v1+json
```

### Versioning Strategy
- **Major Version**: Breaking changes (e.g., v1 → v2)
- **Minor Version**: New features, backward compatible
- **Patch Version**: Bug fixes, backward compatible

### Current Version
- **API Version**: v1.0.0
- **Status**: Stable
- **Deprecation Policy**: 12 months notice for breaking changes

### Deprecation Timeline
- **v1.0.0**: Current stable version
- **v1.1.0**: Planned features (Q2 2024)
- **v2.0.0**: Breaking changes (Q4 2024, with 12 months notice)

### Migration Guide
When new versions are released, migration guides will be provided with:
- Detailed change logs
- Code examples for migration
- Backward compatibility information
- Testing strategies

## Contact

Please coordinate with the internal team for authentication and environment/base URL details. This spec focuses only on request/response contracts.

### Support
- **Technical Support**: api-support@waymore.io
- **Documentation**: https://docs.waymore.io/api
- **Status Page**: https://status.waymore.io
- **Developer Community**: https://community.waymore.io

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
