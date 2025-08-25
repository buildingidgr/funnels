# API Integration Guide - Waymore Funnel Explorer

## Overview

This guide provides comprehensive instructions for integrating the Waymore Funnel Explorer with the external Waymore API. It covers the transition from the current mock API implementation to the production API, including authentication, error handling, and data transformation.

## Current State

### Mock API Implementation

The application currently uses a sophisticated mock API service that provides:

- **Realistic Data**: Industry-standard conversion rates and visitor counts
- **Comprehensive Calculations**: Full funnel analysis with metrics
- **Split Testing Support**: A/B testing calculations
- **Sankey Data Generation**: Visualization-ready data structures
- **Enhanced Analytics**: Step metrics, insights, and recommendations

**Key Files**:
- `src/services/api.ts` - Main API service interface
- `src/services/mockFunnelCalculationService.ts` - Mock calculation engine
- `src/services/enhancedApi.ts` - Enhanced API wrapper with comprehensive features

### Mock Service Features

```typescript
// Current mock service capabilities
const mockService = {
  // Funnel management
  listFunnels: () => Promise<FunnelSummary[]>,
  getFunnel: (id: string) => Promise<Funnel>,
  createFunnel: (funnel: Funnel) => Promise<Funnel>,
  updateFunnel: (id: string, funnel: Partial<Funnel>) => Promise<Funnel>,
  deleteFunnel: (id: string) => Promise<void>,
  
  // Funnel calculation
  calculateFunnel: (id: string) => Promise<FunnelResults>,
  
  // Enhanced features
  getStepMetrics: (id: string) => Promise<StepMetrics[]>,
  getFunnelInsights: (id: string) => Promise<FunnelInsights>,
  getSankeyData: (id: string) => Promise<SankeyData>,
  getSplitVariationMetrics: (id: string) => Promise<SplitVariationMetrics[]>,
  calculateFunnelComprehensive: (id: string, options?: any) => Promise<FunnelCalculationResponse>
};
```

## Enhanced API Features

### Current Enhanced API Implementation

The application includes an enhanced API service (`EnhancedFunnelApi`) that provides comprehensive funnel analysis capabilities:

#### Available Enhanced Methods

```typescript
// Comprehensive funnel calculation with all metrics
calculateFunnelComprehensive: async (
  funnelId: string, 
  options?: {
    timeframe?: { from: number; to: number };
    initialValue?: number;
    includeSplitVariations?: boolean;
    includeMetrics?: boolean;
    includeInsights?: boolean;
  }
): Promise<FunnelCalculationResponse>

// Step-by-step metrics
getStepMetrics: async (funnelId: string): Promise<StepMetrics[]>

// Split variation analysis
getSplitVariationMetrics: async (funnelId: string): Promise<SplitVariationMetrics[]>

// Funnel insights and recommendations
getFunnelInsights: async (funnelId: string): Promise<FunnelInsights>

// Sankey visualization data
getSankeyData: async (funnelId: string): Promise<SankeyData>
```

#### Enhanced Response Types

```typescript
interface FunnelCalculationResponse {
  calculatedResults: Record<string, number>;
  stepMetrics: StepMetrics[];
  splitVariationMetrics: SplitVariationMetrics[];
  insights: FunnelInsights;
  sankeyData: { nodes: Node[]; links: Link[] };
  metadata: CalculationMetadata;
}

interface StepMetrics {
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
}

interface FunnelInsights {
  overallConversionRate: number;
  totalDropOff: number;
  highestDropOffStep: StepMetrics;
  bestConvertingStep: StepMetrics;
  potentialRevenueLost?: number;
  improvementOpportunity: number;
  funnelType: 'ecommerce' | 'saas' | 'lead-gen' | 'mobile-app' | 'content' | 'support';
  recommendations: string[];
}
```

## External API Specification

### Required Endpoints

The application is designed to integrate with the **Waymore External API** with the following endpoints:

#### 1. Funnel Calculation
```
POST /funnels/{funnelId}/calculate
```

**Request Body**:
```typescript
interface FunnelCalculationRequest {
  timeframe?: { from: number; to: number };
  options?: {
    includeSplitVariations?: boolean; // default true
    includeMetrics?: boolean; // default true
    includeInsights?: boolean; // default true
  };
}
```

**Response**:
```typescript
interface FunnelCalculationResponse {
  calculatedResults: Record<string, number>;
  stepMetrics: StepMetrics[];
  splitVariationMetrics: SplitVariationMetrics[];
  insights: FunnelInsights;
  sankeyData: { nodes: Node[]; links: Link[] };
  metadata: CalculationMetadata;
}
```

#### 2. Events Catalog
```
GET /events
```

**Response**:
```typescript
interface EventsCatalogResponse {
  events: Array<{
    name: string;
    label: string;
    properties: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date';
      label: string;
    }>;
  }>;
}
```

### Missing API Endpoints

The following endpoints are currently handled by the mock service but need to be implemented for full external API integration:

#### 3. Funnel Management Endpoints
```
GET /funnels                    # List all funnels
GET /funnels/{id}              # Get funnel by ID
POST /funnels                  # Create new funnel
PUT /funnels/{id}              # Update funnel
DELETE /funnels/{id}           # Delete funnel
```

#### 4. Enhanced Analytics Endpoints
```
GET /funnels/{id}/metrics      # Get step metrics
GET /funnels/{id}/insights     # Get funnel insights
GET /funnels/{id}/sankey       # Get Sankey data
GET /funnels/{id}/variations   # Get split variation metrics
```

### Authentication

The API uses API key authentication:

```typescript
// Environment variable
VITE_API_KEY=your-production-api-key

// Request headers
const headers = {
  'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
  'Content-Type': 'application/json'
};
```

## Current Implementation Status

### ✅ Implemented Features
- **Mock API Service**: Fully functional with realistic data
- **Enhanced API Wrapper**: Comprehensive funnel analysis capabilities
- **Local Storage**: Persistent funnel data management
- **Error Handling**: Basic error handling and validation
- **Data Transformation**: Request/response transformation utilities

### 🔄 Partially Implemented
- **API Adapter Pattern**: Framework exists but needs production API integration
- **Caching Strategy**: Basic caching with TanStack Query
- **Retry Logic**: Basic retry mechanism

### ❌ Missing Features
- **Production API Integration**: No actual external API calls
- **Authentication**: No real API key validation
- **Advanced Error Handling**: Limited error categorization
- **Monitoring**: No API call monitoring or analytics
- **Rate Limiting**: No rate limiting implementation

## Integration Strategy

### Phase 1: API Service Migration

### Phase 1: API Service Migration

#### Step 1: Understand Current Mock Service

The current mock service provides these capabilities that need to be mapped to the external API:

**Current Mock Service Methods**:
```typescript
// Funnel Management
listFunnels(): Promise<FunnelSummary[]>
getFunnel(id: string): Promise<Funnel>
createFunnel(funnel: Omit<Funnel, 'id'>): Promise<Funnel>
updateFunnel(id: string, funnel: Partial<Funnel>): Promise<Funnel>
deleteFunnel(id: string): Promise<void>

// Funnel Calculation
calculateFunnel(id: string): Promise<FunnelResults>

// Enhanced Analytics
getStepMetrics(id: string): Promise<StepMetrics[]>
getFunnelInsights(id: string): Promise<FunnelInsights>
getSankeyData(id: string): Promise<SankeyData>
getSplitVariationMetrics(id: string): Promise<SplitVariationMetrics[]>
calculateFunnelComprehensive(id: string, options?: any): Promise<FunnelCalculationResponse>
```

**External API Mapping**:
- `listFunnels()` → `GET /funnels`
- `getFunnel(id)` → `GET /funnels/{id}`
- `createFunnel(funnel)` → `POST /funnels`
- `updateFunnel(id, funnel)` → `PUT /funnels/{id}`
- `deleteFunnel(id)` → `DELETE /funnels/{id}`
- `calculateFunnel(id)` → `POST /funnels/{id}/calculate`
- `getEventsCatalog()` → `GET /events`

**Enhanced Analytics Mapping**:
- `getStepMetrics(id)` → `GET /funnels/{id}/metrics` (or part of calculate response)
- `getFunnelInsights(id)` → `GET /funnels/{id}/insights` (or part of calculate response)
- `getSankeyData(id)` → `GET /funnels/{id}/sankey` (or part of calculate response)
- `getSplitVariationMetrics(id)` → `GET /funnels/{id}/variations` (or part of calculate response)

#### Step 2: Create Production API Service

Create a new production API service that implements the same interface as the mock service:

```typescript
// src/services/productionApi.ts
import { Funnel, FunnelResults, FunnelSummary } from "@/types/funnel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://connect.waymore.io/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY;

class ProductionApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Implement all required methods
  async listFunnels(): Promise<FunnelSummary[]> {
    return this.makeRequest<FunnelSummary[]>('/funnels');
  }

  async getFunnel(id: string): Promise<Funnel> {
    return this.makeRequest<Funnel>(`/funnels/${id}`);
  }

  async createFunnel(funnel: Omit<Funnel, 'id'>): Promise<Funnel> {
    return this.makeRequest<Funnel>('/funnels', {
      method: 'POST',
      body: JSON.stringify(funnel),
    });
  }

  async updateFunnel(id: string, funnel: Partial<Funnel>): Promise<Funnel> {
    return this.makeRequest<Funnel>(`/funnels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(funnel),
    });
  }

  async deleteFunnel(id: string): Promise<void> {
    await this.makeRequest(`/funnels/${id}`, {
      method: 'DELETE',
    });
  }

  async calculateFunnel(
    id: string, 
    options?: FunnelCalculationRequest
  ): Promise<FunnelCalculationResponse> {
    return this.makeRequest<FunnelCalculationResponse>(
      `/funnels/${id}/calculate`,
      {
        method: 'POST',
        body: JSON.stringify(options || {}),
      }
    );
  }

  async getEventsCatalog(): Promise<EventsCatalogResponse> {
    return this.makeRequest<EventsCatalogResponse>('/events');
  }
}

export const productionApiService = new ProductionApiService();
```

#### Step 2: Create API Adapter

Create an adapter that provides backward compatibility:

```typescript
// src/services/apiAdapter.ts
import { productionApiService } from './productionApi';
import { mockFunnelCalculationService } from './mockFunnelCalculationService';

class ApiAdapter {
  private useMockApi: boolean;

  constructor() {
    // Use mock API in development, production API in production
    this.useMockApi = import.meta.env.DEV && !import.meta.env.VITE_USE_PRODUCTION_API;
  }

  async listFunnels() {
    if (this.useMockApi) {
      return mockFunnelCalculationService.listFunnels();
    }
    return productionApiService.listFunnels();
  }

  async getFunnel(id: string) {
    if (this.useMockApi) {
      return mockFunnelCalculationService.getFunnel(id);
    }
    return productionApiService.getFunnel(id);
  }

  async createFunnel(funnel: Omit<Funnel, 'id'>) {
    if (this.useMockApi) {
      return mockFunnelCalculationService.createFunnel(funnel);
    }
    return productionApiService.createFunnel(funnel);
  }

  async updateFunnel(id: string, funnel: Partial<Funnel>) {
    if (this.useMockApi) {
      return mockFunnelCalculationService.updateFunnel(id, funnel);
    }
    return productionApiService.updateFunnel(id, funnel);
  }

  async deleteFunnel(id: string) {
    if (this.useMockApi) {
      return mockFunnelCalculationService.deleteFunnel(id);
    }
    return productionApiService.deleteFunnel(id);
  }

  async calculateFunnel(id: string, options?: any) {
    if (this.useMockApi) {
      return mockFunnelCalculationService.calculateFunnel({ funnel: { id }, ...options });
    }
    return productionApiService.calculateFunnel(id, options);
  }

  async getEventsCatalog() {
    if (this.useMockApi) {
      // Return mock events catalog
      return {
        events: [
          {
            name: 'page_view',
            label: 'Page Viewed',
            properties: [
              { name: 'page_type', type: 'string', label: 'Page Type' },
              { name: 'session_duration', type: 'number', label: 'Session Duration' }
            ]
          },
          // ... more events
        ]
      };
    }
    return productionApiService.getEventsCatalog();
  }
}

export const apiAdapter = new ApiAdapter();
```

#### Step 3: Update Existing API Service

Update the existing API service to use the adapter:

```typescript
// src/services/api.ts
import { apiAdapter } from './apiAdapter';

export const FunnelApi = {
  listFunnels: apiAdapter.listFunnels.bind(apiAdapter),
  getFunnel: apiAdapter.getFunnel.bind(apiAdapter),
  createFunnel: apiAdapter.createFunnel.bind(apiAdapter),
  updateFunnel: apiAdapter.updateFunnel.bind(apiAdapter),
  deleteFunnel: apiAdapter.deleteFunnel.bind(apiAdapter),
  calculateFunnel: apiAdapter.calculateFunnel.bind(apiAdapter),
  getEventsCatalog: apiAdapter.getEventsCatalog.bind(apiAdapter),
};
```

### Phase 2: Data Persistence Strategy

#### Current Local Storage Implementation

The application currently uses localStorage for data persistence:

```typescript
// Current storage keys
const STORAGE_KEYS = {
  FUNNELS: 'waymore_funnels',
  ID_COUNTER: 'waymore_funnel_id_counter'
};

// Current persistence methods
const saveFunnels = (): void => {
  localStorage.setItem(STORAGE_KEYS.FUNNELS, JSON.stringify(mockFunnels));
};

const loadFunnelsFromStorage = (): void => {
  const storedFunnels = localStorage.getItem(STORAGE_KEYS.FUNNELS);
  if (storedFunnels) {
    mockFunnels = JSON.parse(storedFunnels);
  }
};
```

#### Migration to External API

When integrating with the external API, the persistence strategy should change:

```typescript
// New persistence strategy with external API
class FunnelPersistenceService {
  // Cache management
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  // Save funnel to external API
  async saveFunnel(funnel: Funnel): Promise<Funnel> {
    if (funnel.id) {
      return await productionApiService.updateFunnel(funnel.id, funnel);
    } else {
      return await productionApiService.createFunnel(funnel);
    }
  }
  
  // Load funnel from external API with caching
  async loadFunnel(id: string): Promise<Funnel> {
    const cacheKey = `funnel-${id}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    
    const funnel = await productionApiService.getFunnel(id);
    this.cache.set(cacheKey, {
      data: funnel,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 minutes
    });
    
    return funnel;
  }
  
  // List funnels with pagination and filtering
  async listFunnels(options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<FunnelSummary[]> {
    return await productionApiService.listFunnels(options);
  }
}
```

### Phase 3: Data Transformation

#### Step 1: Response Transformation

Create transformers to handle differences between mock and production API responses:

```typescript
// src/services/transformers.ts
import { FunnelCalculationResponse, StepMetrics, FunnelInsights } from '@/types/funnel';

export class ResponseTransformer {
  static transformCalculationResponse(
    response: any, 
    funnel: Funnel
  ): FunnelCalculationResponse {
    // Transform production API response to match expected format
    return {
      calculatedResults: response.calculatedResults,
      stepMetrics: this.transformStepMetrics(response.stepMetrics, funnel),
      splitVariationMetrics: response.splitVariationMetrics || [],
      insights: this.transformInsights(response.insights),
      sankeyData: this.transformSankeyData(response.sankeyData),
      metadata: response.metadata
    };
  }

  static transformStepMetrics(
    metrics: any[], 
    funnel: Funnel
  ): StepMetrics[] {
    return metrics.map(metric => ({
      id: metric.id,
      name: metric.name,
      visitorCount: metric.visitorCount,
      conversionRate: metric.conversionRate,
      dropOffRate: metric.dropOffRate || 0,
      dropOffCount: metric.dropOffCount || 0,
      previousStepValue: metric.previousStepValue || 0,
      isOptional: metric.isOptional || false,
      isSplit: metric.isSplit || false
    }));
  }

  static transformInsights(insights: any): FunnelInsights {
    return {
      overallConversionRate: insights.overallConversionRate,
      totalDropOff: insights.totalDropOff,
      highestDropOffStep: insights.highestDropOffStep,
      bestConvertingStep: insights.bestConvertingStep,
      potentialRevenueLost: insights.potentialRevenueLost,
      improvementOpportunity: insights.improvementOpportunity,
      funnelType: insights.funnelType,
      recommendations: insights.recommendations || []
    };
  }

  static transformSankeyData(data: any) {
    return {
      nodes: data.nodes.map((node: any) => ({
        id: node.id,
        name: node.name,
        value: node.value,
        isOptional: node.isOptional,
        isSplit: node.isSplit,
        parentId: node.parentId
      })),
      links: data.links.map((link: any) => ({
        source: link.source,
        target: link.target,
        value: link.value
      }))
    };
  }
}
```

#### Step 2: Request Transformation

Create request transformers for outgoing data:

```typescript
// src/services/requestTransformers.ts
import { Funnel, FunnelCalculationRequest } from '@/types/funnel';

export class RequestTransformer {
  static transformFunnelForApi(funnel: Funnel): any {
    // Remove client-side only properties
    const { id, createdAt, updatedAt, lastCalculatedAt, ...apiFunnel } = funnel;
    
    return {
      ...apiFunnel,
      // Transform any client-specific data to API format
      steps: funnel.steps.map(step => {
        const { visitorCount, value, ...apiStep } = step;
        return apiStep;
      })
    };
  }

  static transformCalculationRequest(
    request: FunnelCalculationRequest
  ): any {
    return {
      timeframe: request.timeframe,
      options: {
        includeSplitVariations: request.options?.includeSplitVariations ?? true,
        includeMetrics: request.options?.includeMetrics ?? true,
        includeInsights: request.options?.includeInsights ?? true
      }
    };
  }
}
```

### Phase 3: Error Handling

#### Step 1: API Error Handling

Create comprehensive error handling for the production API:

```typescript
// src/services/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiErrorHandler {
  static handleError(error: any): never {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error: Unable to connect to the server',
        0,
        'NETWORK_ERROR'
      );
    }

    if (error.status) {
      switch (error.status) {
        case 401:
          throw new ApiError(
            'Authentication failed. Please check your API key.',
            401,
            'UNAUTHORIZED'
          );
        case 403:
          throw new ApiError(
            'Access denied. You do not have permission to perform this action.',
            403,
            'FORBIDDEN'
          );
        case 404:
          throw new ApiError(
            'Resource not found.',
            404,
            'NOT_FOUND'
          );
        case 429:
          throw new ApiError(
            'Rate limit exceeded. Please try again later.',
            429,
            'RATE_LIMITED'
          );
        case 500:
          throw new ApiError(
            'Server error. Please try again later.',
            500,
            'SERVER_ERROR'
          );
        default:
          throw new ApiError(
            error.message || 'An unexpected error occurred',
            error.status,
            'UNKNOWN_ERROR'
          );
      }
    }

    throw new ApiError(
      error.message || 'An unexpected error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
}
```

#### Step 2: Retry Logic

Implement retry logic for transient failures:

```typescript
// src/services/retryHandler.ts
export class RetryHandler {
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError!;
  }
}
```

### Phase 4: Caching Strategy

#### Step 1: Implement Caching

Create a caching layer for API responses:

```typescript
// src/services/cache.ts
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();
```

#### Step 2: Integrate with TanStack Query

Update TanStack Query configuration to use caching:

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { apiCache } from '@/services/cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
    },
  },
});
```

## Current Enhanced API Usage Patterns

### Using the Enhanced API Service

The application provides an enhanced API service that offers comprehensive funnel analysis:

```typescript
import { EnhancedFunnelApi } from '@/services/enhancedApi';

// Comprehensive funnel calculation
const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(
  funnelId,
  {
    timeframe: { from: Date.now() - 30 * 24 * 60 * 60 * 1000, to: Date.now() },
    initialValue: 15000,
    includeSplitVariations: true,
    includeMetrics: true,
    includeInsights: true
  }
);

// Access specific metrics
const stepMetrics = comprehensiveResults.stepMetrics;
const insights = comprehensiveResults.insights;
const sankeyData = comprehensiveResults.sankeyData;
```

### Best Practices for API Usage

#### 1. Use TanStack Query for Caching

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Query for funnel data
const { data: funnel, isLoading } = useQuery({
  queryKey: ['funnel', id],
  queryFn: () => FunnelApi.getFunnel(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation for saving funnel
const saveMutation = useMutation({
  mutationFn: (funnel: Funnel) => FunnelApi.updateFunnel(funnel.id!, funnel),
  onSuccess: () => {
    queryClient.invalidateQueries(['funnel', id]);
    toast.success('Funnel saved successfully');
  },
  onError: (error) => {
    toast.error('Failed to save funnel');
    console.error('Save error:', error);
  }
});
```

#### 2. Handle Loading and Error States

```typescript
const FunnelAnalysisComponent = ({ funnelId }: { funnelId: string }) => {
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['funnel-analysis', funnelId],
    queryFn: () => EnhancedFunnelApi.calculateFunnelComprehensive(funnelId),
    enabled: !!funnelId
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!results) return <EmptyState />;

  return (
    <div>
      <FunnelSankeyVisualization data={results.sankeyData} />
      <StepMetricsDisplay metrics={results.stepMetrics} />
      <FunnelInsights insights={results.insights} />
    </div>
  );
};
```

#### 3. Optimize for Performance

```typescript
// Use React.memo for expensive components
const FunnelSankeyVisualization = React.memo(({ data }: { data: SankeyData }) => {
  // Expensive rendering logic
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return processSankeyData(rawData);
}, [rawData]);

// Use useCallback for event handlers
const handleStepClick = useCallback((stepId: string) => {
  // Handle step click
}, []);
```

## Environment Configuration

### Development Environment

```env
# .env.development
VITE_API_BASE_URL=https://staging-api.waymore.io/api/v1
VITE_API_KEY=staging-api-key
VITE_USE_PRODUCTION_API=false
VITE_API_DELAY_SAVE_MIN_MS=600
VITE_API_DELAY_SAVE_MAX_MS=1500
```

### Production Environment

```env
# .env.production
VITE_API_BASE_URL=https://connect.waymore.io/api/v1
VITE_API_KEY=production-api-key
VITE_USE_PRODUCTION_API=true
```

### Staging Environment

```env
# .env.staging
VITE_API_BASE_URL=https://staging-api.waymore.io/api/v1
VITE_API_KEY=staging-api-key
VITE_USE_PRODUCTION_API=true
```

## Testing the Integration

### Step 1: Unit Tests

Create tests for the API integration:

```typescript
// src/services/__tests__/productionApi.test.ts
import { productionApiService } from '../productionApi';
import { ApiError } from '../errorHandler';

describe('ProductionApiService', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  it('should make authenticated requests', async () => {
    const mockResponse = { id: '1', name: 'Test Funnel' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await productionApiService.getFunnel('1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/funnels/1'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer'),
        }),
      })
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(productionApiService.getFunnel('1')).rejects.toThrow(ApiError);
  });
});
```

### Step 2: Integration Tests

Test the complete integration:

```typescript
// src/services/__tests__/apiAdapter.test.ts
import { apiAdapter } from '../apiAdapter';

describe('ApiAdapter', () => {
  it('should use mock API in development', async () => {
    const originalEnv = import.meta.env.DEV;
    import.meta.env.DEV = true;
    import.meta.env.VITE_USE_PRODUCTION_API = 'false';

    const result = await apiAdapter.listFunnels();
    expect(result).toBeDefined();

    import.meta.env.DEV = originalEnv;
  });

  it('should use production API when configured', async () => {
    const originalEnv = import.meta.env.VITE_USE_PRODUCTION_API;
    import.meta.env.VITE_USE_PRODUCTION_API = 'true';

    // Mock production API
    jest.spyOn(productionApiService, 'listFunnels').mockResolvedValue([]);

    await apiAdapter.listFunnels();
    expect(productionApiService.listFunnels).toHaveBeenCalled();

    import.meta.env.VITE_USE_PRODUCTION_API = originalEnv;
  });
});
```

### Step 3: Manual Testing

Create a testing checklist:

```markdown
## API Integration Testing Checklist

### Authentication
- [ ] API key is properly configured
- [ ] Authorization headers are sent with requests
- [ ] 401 errors are handled gracefully

### Funnel Management
- [ ] List funnels endpoint works
- [ ] Get funnel by ID works
- [ ] Create funnel works
- [ ] Update funnel works
- [ ] Delete funnel works

### Funnel Calculation
- [ ] Calculate funnel endpoint works
- [ ] Response format matches expected structure
- [ ] Error handling works for invalid funnels
- [ ] Timeout handling works for long calculations

### Events Catalog
- [ ] Get events catalog works
- [ ] Event properties are properly formatted
- [ ] Event types are correctly mapped

### Error Handling
- [ ] Network errors are handled
- [ ] 4xx errors are handled
- [ ] 5xx errors are handled
- [ ] Rate limiting is handled

### Performance
- [ ] Response times are acceptable
- [ ] Caching works correctly
- [ ] Retry logic works for transient failures
```

## Monitoring and Debugging

### Step 1: API Monitoring

Add monitoring for API calls:

```typescript
// src/services/monitoring.ts
export class ApiMonitoring {
  static logApiCall(endpoint: string, method: string, duration: number, success: boolean) {
    console.log(`[API] ${method} ${endpoint} - ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
    
    // Send to monitoring service
    if (import.meta.env.PROD) {
      // Send to analytics/monitoring service
      this.sendToMonitoring({
        endpoint,
        method,
        duration,
        success,
        timestamp: Date.now()
      });
    }
  }

  private static sendToMonitoring(data: any) {
    // Implementation for monitoring service
  }
}
```

### Step 2: Debug Tools

Add debug utilities:

```typescript
// src/services/debug.ts
export class ApiDebug {
  static enableDebugMode() {
    if (import.meta.env.DEV) {
      // Enable detailed logging
      this.logApiRequests();
      this.logApiResponses();
      this.logApiErrors();
    }
  }

  private static logApiRequests() {
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      const [url, options] = args;
      console.log(`[API Request] ${options?.method || 'GET'} ${url}`, options);
      
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        console.log(`[API Response] ${response.status} - ${duration}ms`);
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[API Error] ${duration}ms`, error);
        throw error;
      }
    };
  }

  private static logApiResponses() {
    // Implementation for response logging
  }

  private static logApiErrors() {
    // Implementation for error logging
  }
}
```

## Migration Checklist

### Pre-Migration

- [ ] Review external API specification
- [ ] Set up staging environment
- [ ] Configure API keys and endpoints
- [ ] Create test data in staging
- [ ] Set up monitoring and logging

### Migration Steps

- [ ] Implement production API service
- [ ] Create API adapter for backward compatibility
- [ ] Implement data transformers
- [ ] Add comprehensive error handling
- [ ] Implement caching strategy
- [ ] Add retry logic
- [ ] Update environment configuration

### Post-Migration

- [ ] Test all functionality with production API
- [ ] Monitor performance and error rates
- [ ] Validate data accuracy
- [ ] Update documentation
- [ ] Train team on new API integration

### Rollback Plan

- [ ] Keep mock API implementation
- [ ] Use feature flags to switch between APIs
- [ ] Monitor for issues after migration
- [ ] Have rollback procedure ready

## Conclusion

This API integration guide provides a comprehensive approach to transitioning from the mock API to the production Waymore API. The phased approach ensures a smooth migration with minimal disruption to the development team.

### Key Benefits

1. **Backward Compatibility**: Existing code continues to work during migration
2. **Comprehensive Error Handling**: Robust error handling for production use
3. **Performance Optimization**: Caching and retry logic for better performance
4. **Monitoring**: Built-in monitoring and debugging capabilities
5. **Testing**: Comprehensive testing strategy for validation

### Next Steps

1. **Review the external API specification** in `EXTERNAL_API_SPEC.md`
2. **Set up staging environment** with test API keys
3. **Implement the production API service** following this guide
4. **Test thoroughly** before production deployment
5. **Monitor performance** after migration

---

*This guide should be updated as the external API evolves and new requirements are added.*
