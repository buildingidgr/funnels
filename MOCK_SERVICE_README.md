# Mock Funnel Calculation Service

This document describes the comprehensive mock calculation service that provides all the data needed for funnel visualizations in the frontend.

## Overview

The mock calculation service is designed to simulate a real API that processes funnel data and returns comprehensive results for all frontend visualizations. It includes:

- **Step-by-step metrics** (conversion rates, drop-off rates, visitor counts)
- **Split variation analysis** (A/B testing, multivariate testing)
- **Sankey visualization data** (nodes and links for flow diagrams)
- **Funnel insights** (overall performance, recommendations, business impact)
- **Comprehensive validation** (data integrity checks)

## Architecture

### Core Components

1. **MockFunnelCalculationService** (`src/services/mockFunnelCalculationService.ts`)
   - Main calculation engine
   - Singleton pattern for consistent state
   - Comprehensive data processing

2. **EnhancedFunnelApi** (`src/services/enhancedApi.ts`)
   - API wrapper for the calculation service
   - Backward compatibility with existing API
   - Structured data access methods

3. **Example Usage** (`src/services/exampleUsage.ts`)
   - Complete usage examples
   - Real-world integration patterns
   - Error handling demonstrations

## Data Flow

```
Frontend Request → EnhancedFunnelApi → MockFunnelCalculationService → Comprehensive Results
```

### Input Data Structure

The service expects a `Funnel` object with the following structure:

```typescript
interface Funnel {
  id: string;
  name: string;
  description: string;
  timeframe: { from: number; to: number };
  performedBy: string;
  steps: FunnelStep[];
}
```

**IMPORTANT**: The funnel data should contain **ONLY steps and conditions** - **NO visitor counts**. The service will automatically calculate all visitor counts and metrics based on realistic conversion rates.

### Output Data Structure

The service returns a comprehensive `FunnelCalculationResponse`:

```typescript
interface FunnelCalculationResponse {
  calculatedResults: Record<string, number>;        // Raw calculation values
  stepMetrics: StepMetrics[];                       // Step-by-step analysis
  splitVariationMetrics: SplitVariationMetrics[];   // A/B test results
  insights: FunnelInsights;                        // Business insights
  sankeyData: { nodes: Node[]; links: Link[] };    // Visualization data
  metadata: CalculationMetadata;                    // Calculation metadata
}
```

## Usage Examples

### Basic Calculation

```typescript
import { mockFunnelCalculationService } from './services/mockFunnelCalculationService';

// Create funnel with ONLY steps and conditions - NO visitor counts!
const myFunnelData = {
  id: 'my-funnel',
  name: 'My Funnel',
  steps: [
    {
      id: 'step-1',
      name: 'Landing Page',
      // NO visitorCount - service will calculate it!
      conditions: { /* your conditions */ }
    },
    {
      id: 'step-2', 
      name: 'Sign Up',
      // NO visitorCount - service will calculate it!
      conditions: { /* your conditions */ }
    }
  ]
};

const results = await mockFunnelCalculationService.calculateFunnel({
  funnel: myFunnelData,
  initialValue: 10000, // Starting point
  options: {
    includeSplitVariations: true,
    includeMetrics: true,
    includeInsights: true
  }
});

// Service automatically calculated all visitor counts and metrics!
console.log('Step 1 visitors:', results.stepMetrics[0].visitorCount);
console.log('Step 2 visitors:', results.stepMetrics[1].visitorCount);
```

### Using Enhanced API

```typescript
import { EnhancedFunnelApi } from './services/enhancedApi';

// Get comprehensive results
const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId, {
  initialValue: 15000,
  includeSplitVariations: true,
  includeMetrics: true,
  includeInsights: true
});

// Get specific metrics
const stepMetrics = await EnhancedFunnelApi.getStepMetrics(funnelId);
const insights = await EnhancedFunnelApi.getFunnelInsights(funnelId);
const sankeyData = await EnhancedFunnelApi.getSankeyData(funnelId);
```

### Real-world Integration

```typescript
import { exampleRealWorldUsage } from './services/exampleUsage';

const result = await exampleRealWorldUsage(funnelId);

if (result.success) {
  // Use the structured data for different visualizations
  const { sankey, stepFlow, dropOff, insights, splits } = result.data;
  
  // Render Sankey diagram
  renderSankeyDiagram(sankey);
  
  // Render step flow
  renderStepFlow(stepFlow);
  
  // Show drop-off analysis
  renderDropOffAnalysis(dropOff);
  
  // Display insights
  renderInsights(insights);
}
```

## Key Features

### 1. Realistic Calculation Logic

The service uses realistic conversion rates based on step types:

- **Page Views**: 95% conversion
- **Product Interactions**: 20% conversion
- **Add to Cart**: 10% conversion
- **Checkout Steps**: 60-80% conversion
- **Purchase**: 70% conversion

### 2. Split Variation Support

Handles A/B testing and multivariate testing scenarios:

```typescript
// Split variations are calculated proportionally
const splitProportion = variation.visitorCount / totalSplitVisitorCount;
const variationValue = Math.round(stepValue * splitProportion);
```

### 3. Comprehensive Insights

Provides business-focused insights:

- Overall conversion rate
- Highest drop-off step identification
- Best performing step analysis
- Potential revenue lost calculations
- Actionable recommendations

### 4. Sankey Visualization Data

Generates structured data for Sankey diagrams:

```typescript
{
  nodes: [
    { id: 'start', name: 'Start', value: 10000 },
    { id: 'step-1', name: 'Product Visit', value: 9500 },
    { id: 'split-1', name: 'Quick Add', value: 1200, isSplit: true }
  ],
  links: [
    { source: 'start', target: 'step-1', value: 9500 },
    { source: 'step-1', target: 'split-1', value: 1200 }
  ]
}
```

## Data Validation

The service includes comprehensive validation:

```typescript
const validation = mockFunnelCalculationService.validateFunnelData(funnel);

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
  // Handle validation errors
}
```

### Validation Rules

- Funnel name is required
- At least one step is required
- At least one step must be enabled
- Step IDs must be unique
- Split variations must have valid proportions

## Integration with Frontend Components

### Sankey Visualization

```typescript
// In FunnelSankeyVisualization.tsx
const sankeyData = await EnhancedFunnelApi.getSankeyData(funnelId);
// Use sankeyData.nodes and sankeyData.links for rendering
```

### Drop-off Analysis

```typescript
// In DropOffDetails.tsx
const stepMetrics = await EnhancedFunnelApi.getStepMetrics(funnelId);
// Use stepMetrics for drop-off calculations
```

### Step Flow Visualization

```typescript
// In FunnelStepFlow.tsx
const stepMetrics = await EnhancedFunnelApi.getStepMetrics(funnelId);
// Use stepMetrics for step-by-step rendering
```

### Insights and Recommendations

```typescript
// In any insights component
const insights = await EnhancedFunnelApi.getFunnelInsights(funnelId);
// Use insights for recommendations and business metrics
```

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const results = await mockFunnelCalculationService.calculateFunnel(request);
  // Process results
} catch (error) {
  console.error('Calculation error:', error.message);
  // Handle error appropriately
}
```

### Common Error Scenarios

- **Invalid funnel data**: Validation errors
- **No enabled steps**: Calculation cannot proceed
- **Missing required fields**: Data integrity issues
- **Calculation failures**: Mathematical errors

## Performance Considerations

### Caching Strategy

The service can be extended with caching:

```typescript
// Example caching implementation
const cacheKey = `funnel-${funnelId}-${JSON.stringify(options)}`;
const cachedResult = cache.get(cacheKey);

if (cachedResult) {
  return cachedResult;
}

const result = await calculateFunnel(request);
cache.set(cacheKey, result);
return result;
```

### Batch Processing

For multiple funnels:

```typescript
const batchResults = await Promise.all(
  funnelIds.map(id => EnhancedFunnelApi.calculateFunnelComprehensive(id))
);
```

## Testing

### Unit Tests

```typescript
// Test basic calculation
const testFunnel = createTestFunnel();
const results = await mockFunnelCalculationService.calculateFunnel({
  funnel: testFunnel,
  initialValue: 1000
});

expect(results.stepMetrics).toHaveLength(3);
expect(results.insights.overallConversionRate).toBeGreaterThan(0);
```

### Integration Tests

```typescript
// Test with real funnel data
const results = await exampleWithExistingFunnel();
expect(results.insights.funnelType).toBe('ecommerce');
expect(results.sankeyData.nodes.length).toBeGreaterThan(0);
```

## Migration from Existing API

### Backward Compatibility

The enhanced API maintains backward compatibility:

```typescript
// Old way (still works)
const basicResults = await FunnelApi.calculateFunnel(funnelId);

// New way (enhanced)
const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
```

### Gradual Migration

1. **Phase 1**: Use enhanced API alongside existing API
2. **Phase 2**: Update components to use comprehensive results
3. **Phase 3**: Remove old API calls

## Future Enhancements

### Planned Features

1. **Real-time calculations**: WebSocket support for live updates
2. **Advanced analytics**: Cohort analysis, trend detection
3. **Custom algorithms**: User-defined calculation logic
4. **Performance optimization**: Lazy loading, virtual scrolling
5. **Export capabilities**: PDF reports, CSV data export

### Extensibility

The service is designed for easy extension:

```typescript
// Custom calculation algorithm
class CustomCalculationService extends MockFunnelCalculationService {
  protected calculateRealisticStepValue(previousValue: number, step: FunnelStep, stepIndex: number): number {
    // Custom calculation logic
    return customCalculation(previousValue, step, stepIndex);
  }
}
```

## Conclusion

The mock funnel calculation service provides a comprehensive foundation for funnel analysis and visualization. It includes all the data structures and calculation logic needed to support the existing frontend components while providing a clear path for future enhancements.

The service is designed to be:
- **Comprehensive**: Covers all visualization needs
- **Realistic**: Uses industry-standard conversion rates
- **Extensible**: Easy to modify and extend
- **Well-tested**: Includes validation and error handling
- **Production-ready**: Can be easily replaced with real API calls

For implementation questions or feature requests, refer to the example usage files and integration patterns provided in the codebase.
