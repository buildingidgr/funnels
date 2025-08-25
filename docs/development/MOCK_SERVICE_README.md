# Mock Funnel Calculation Service - Current Implementation

## Overview

This document describes the current implementation of the mock funnel calculation service in the Waymore Funnel Explorer application. The service provides comprehensive funnel analysis capabilities using realistic data and industry-standard conversion rates.

## Current Implementation Status

### ✅ Implemented Features
- **Comprehensive Calculation Engine**: Full funnel analysis with realistic conversion rates
- **Multiple Visualization Support**: Sankey, Step Flow, Drop-off Analysis, Insights
- **Split Testing Analysis**: A/B testing and multivariate testing support
- **Data Validation**: Comprehensive input validation and error handling
- **Performance Optimization**: Efficient calculation algorithms and caching
- **Industry-Specific Scenarios**: E-commerce, SaaS, Mobile App, Customer Support, Content Marketing

### 🔄 Partially Implemented
- **Real-time Updates**: Currently using static calculations
- **Advanced Analytics**: Basic insights, could be enhanced
- **Custom Algorithms**: Fixed conversion logic, not user-configurable

### ❌ Missing Features
- **Dynamic Conversion Rates**: User-defined conversion logic
- **Historical Data Analysis**: Time-series and trend analysis
- **Advanced Segmentation**: User behavior and demographic segmentation
- **Predictive Analytics**: Machine learning for performance predictions

## Architecture Overview

### Core Components

```
src/services/
├── mockFunnelCalculationService.ts    # Main calculation engine
├── enhancedApi.ts                     # Enhanced API wrapper
├── api.ts                            # Basic API service
└── exampleUsage.ts                   # Usage examples
```

### Data Flow

```
Frontend Request → EnhancedFunnelApi → MockFunnelCalculationService → Comprehensive Results
```

## Service Implementation

### Main Calculation Service

**Location**: `src/services/mockFunnelCalculationService.ts`

**Key Features**:
- Realistic conversion rate calculations
- Split variation analysis
- Sankey data generation
- Comprehensive insights
- Data validation

**Core Methods**:
```typescript
class MockFunnelCalculationService {
  // Main calculation method
  async calculateFunnel(request: FunnelCalculationRequest): Promise<FunnelCalculationResponse>
  
  // Data validation
  validateFunnelData(funnel: Funnel): ValidationResult
  
  // Individual metric calculations
  calculateStepMetrics(steps: FunnelStep[], initialValue: number): StepMetrics[]
  calculateSplitVariations(steps: FunnelStep[]): SplitVariationMetrics[]
  generateSankeyData(steps: FunnelStep[], results: Record<string, number>): SankeyData
  generateInsights(stepMetrics: StepMetrics[]): FunnelInsights
}
```

### Enhanced API Wrapper

**Location**: `src/services/enhancedApi.ts`

**Purpose**: Provides structured access to calculation results

**Key Methods**:
```typescript
export const EnhancedFunnelApi = {
  // Comprehensive calculation
  calculateFunnelComprehensive: async (funnelId: string, options?: CalculationOptions)
  
  // Individual metric access
  getStepMetrics: async (funnelId: string): Promise<StepMetrics[]>
  getSplitVariationMetrics: async (funnelId: string): Promise<SplitVariationMetrics[]>
  getFunnelInsights: async (funnelId: string): Promise<FunnelInsights>
  getSankeyData: async (funnelId: string): Promise<SankeyData>
}
```

## Data Structures

### Input Data

The service expects a `Funnel` object with steps and conditions:

```typescript
interface Funnel {
  id: string;
  name: string;
  description: string;
  timeframe: { from: number; to: number };
  performedBy: string;
  steps: FunnelStep[];
}

interface FunnelStep {
  id: string;
  name: string;
  order: number;
  isEnabled: boolean;
  isRequired: boolean;
  conditions: Conditions;
  splitVariations?: SplitVariation[];
}
```

**Important**: Input funnels should contain **ONLY steps and conditions** - **NO visitor counts**. The service calculates all visitor counts automatically.

### Output Data

The service returns comprehensive results:

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

## Calculation Logic

### Conversion Rate Algorithm

The service uses industry-standard conversion rates:

```typescript
// Base conversion rates by step type
const CONVERSION_RATES = {
  'page_view': 0.95,           // 95% conversion
  'product_interaction': 0.20, // 20% conversion
  'add_to_cart': 0.10,         // 10% conversion
  'checkout_step': 0.75,       // 75% conversion
  'purchase': 0.70,            // 70% conversion
  'signup': 0.15,              // 15% conversion
  'onboarding': 0.80,          // 80% conversion
  'feature_usage': 0.70,       // 70% conversion
  'support_ticket': 0.30,      // 30% conversion
  'resolution': 0.90,          // 90% conversion
};

// Calculate step value based on previous step and conversion rate
const calculateStepValue = (previousValue: number, stepType: string): number => {
  const rate = CONVERSION_RATES[stepType] || 0.50;
  return Math.round(previousValue * rate);
};
```

### Split Variation Logic

Split variations are calculated proportionally:

```typescript
// Calculate split variation values
const calculateSplitVariations = (step: FunnelStep, stepValue: number): SplitVariationMetrics[] => {
  if (!step.splitVariations || step.splitVariations.length === 0) {
    return [];
  }
  
  const totalVariations = step.splitVariations.length;
  const baseProportion = 1 / totalVariations;
  
  return step.splitVariations.map((variation, index) => {
    const proportion = baseProportion * (0.8 + Math.random() * 0.4); // ±20% variation
    const variationValue = Math.round(stepValue * proportion);
    
    return {
      id: `${step.id}-variation-${index + 1}`,
      name: variation.name,
      visitorCount: variationValue,
      conversionRate: (variationValue / stepValue) * 100,
      dropOffRate: ((stepValue - variationValue) / stepValue) * 100,
      dropOffCount: stepValue - variationValue,
      parentStepId: step.id,
      proportionOfParent: proportion * 100
    };
  });
};
```

### Sankey Data Generation

Sankey visualization data is generated from step metrics:

```typescript
// Generate Sankey nodes and links
const generateSankeyData = (steps: FunnelStep[], results: Record<string, number>): SankeyData => {
  const nodes = [
    { id: 'start', name: 'Start', value: results.start || 10000 }
  ];
  
  const links = [];
  let previousNode = 'start';
  let previousValue = results.start || 10000;
  
  steps.forEach((step, index) => {
    const stepValue = results[step.id] || 0;
    const nodeId = `step-${step.id}`;
    
    // Add step node
    nodes.push({
      id: nodeId,
      name: step.name,
      value: stepValue,
      isOptional: !step.isRequired
    });
    
    // Add link from previous step
    links.push({
      source: previousNode,
      target: nodeId,
      value: stepValue
    });
    
    // Handle split variations
    if (step.splitVariations && step.splitVariations.length > 0) {
      step.splitVariations.forEach((variation, varIndex) => {
        const variationId = `${step.id}-variation-${varIndex + 1}`;
        const variationValue = results[variationId] || 0;
        
        nodes.push({
          id: variationId,
          name: variation.name,
          value: variationValue,
          isSplit: true,
          parentId: nodeId
        });
        
        links.push({
          source: nodeId,
          target: variationId,
          value: variationValue
        });
      });
    }
    
    previousNode = nodeId;
    previousValue = stepValue;
  });
  
  return { nodes, links };
};
```

## Usage Examples

### Basic Calculation

```typescript
import { mockFunnelCalculationService } from '@/services/mockFunnelCalculationService';

// Create funnel with steps and conditions
const funnel = {
  id: 'my-funnel',
  name: 'My Funnel',
  steps: [
    {
      id: 'step-1',
      name: 'Landing Page',
      order: 1,
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
    }
  ]
};

// Calculate results
const results = await mockFunnelCalculationService.calculateFunnel({
  funnel,
  initialValue: 10000,
  options: {
    includeSplitVariations: true,
    includeMetrics: true,
    includeInsights: true
  }
});

console.log('Step metrics:', results.stepMetrics);
console.log('Insights:', results.insights);
console.log('Sankey data:', results.sankeyData);
```

### Using Enhanced API

```typescript
import { EnhancedFunnelApi } from '@/services/enhancedApi';

// Get comprehensive results
const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(
  'funnel-id',
  {
    initialValue: 15000,
    includeSplitVariations: true,
    includeMetrics: true,
    includeInsights: true
  }
);

// Access specific metrics
const stepMetrics = await EnhancedFunnelApi.getStepMetrics('funnel-id');
const insights = await EnhancedFunnelApi.getFunnelInsights('funnel-id');
const sankeyData = await EnhancedFunnelApi.getSankeyData('funnel-id');
```

### Integration with Components

```typescript
// In FunnelSankeyVisualization component
const FunnelSankeyVisualization = ({ funnelId }: { funnelId: string }) => {
  const { data: sankeyData, isLoading } = useQuery({
    queryKey: ['sankey-data', funnelId],
    queryFn: () => EnhancedFunnelApi.getSankeyData(funnelId)
  });
  
  if (isLoading) return <LoadingState />;
  
  return <SankeyDiagram nodes={sankeyData.nodes} links={sankeyData.links} />;
};

// In DropOffDetails component
const DropOffDetails = ({ funnelId }: { funnelId: string }) => {
  const { data: stepMetrics } = useQuery({
    queryKey: ['step-metrics', funnelId],
    queryFn: () => EnhancedFunnelApi.getStepMetrics(funnelId)
  });
  
  return <DropOffAnalysis metrics={stepMetrics} />;
};
```

## Data Validation

### Validation Rules

The service includes comprehensive validation:

```typescript
const validation = mockFunnelCalculationService.validateFunnelData(funnel);

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
  // Handle validation errors
}
```

**Validation Checks**:
- Funnel name is required and non-empty
- At least one step is required
- At least one step must be enabled
- Step IDs must be unique
- Step order must be sequential
- Split variations must have valid conditions
- Event properties must have valid types and operators

### Error Handling

```typescript
try {
  const results = await mockFunnelCalculationService.calculateFunnel(request);
  // Process results
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    // Handle validation errors
  } else if (error instanceof CalculationError) {
    console.error('Calculation error:', error.message);
    // Handle calculation errors
  } else {
    console.error('Unexpected error:', error);
    // Handle unexpected errors
  }
}
```

## Performance Optimization

### Caching Strategy

The service implements intelligent caching:

```typescript
// Cache calculation results
const cacheKey = `funnel-${funnelId}-${JSON.stringify(options)}`;
const cachedResult = calculationCache.get(cacheKey);

if (cachedResult && !isStale(cachedResult)) {
  return cachedResult;
}

const result = await calculateFunnel(request);
calculationCache.set(cacheKey, result, { ttl: 5 * 60 * 1000 }); // 5 minutes
return result;
```

### Memory Management

- **Efficient data structures**: Optimized for calculation performance
- **Garbage collection**: Clean up unused calculation data
- **Memory limits**: Prevent memory leaks with large datasets
- **Batch processing**: Handle multiple funnels efficiently

## Testing

### Unit Tests

```typescript
describe('MockFunnelCalculationService', () => {
  it('should calculate funnel with realistic conversion rates', async () => {
    const testFunnel = createTestFunnel();
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: testFunnel,
      initialValue: 1000
    });
    
    expect(results.stepMetrics).toHaveLength(testFunnel.steps.length);
    expect(results.insights.overallConversionRate).toBeGreaterThan(0);
    expect(results.sankeyData.nodes.length).toBeGreaterThan(0);
  });
  
  it('should handle split variations correctly', async () => {
    const funnelWithSplits = createFunnelWithSplits();
    const results = await mockFunnelCalculationService.calculateFunnel({
      funnel: funnelWithSplits,
      initialValue: 1000
    });
    
    expect(results.splitVariationMetrics.length).toBeGreaterThan(0);
    expect(results.sankeyData.nodes.some(n => n.isSplit)).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('EnhancedFunnelApi Integration', () => {
  it('should provide comprehensive funnel analysis', async () => {
    const results = await EnhancedFunnelApi.calculateFunnelComprehensive('test-funnel');
    
    expect(results.stepMetrics).toBeDefined();
    expect(results.insights).toBeDefined();
    expect(results.sankeyData).toBeDefined();
    expect(results.metadata).toBeDefined();
  });
});
```

## Migration to Production API

### Backward Compatibility

The enhanced API maintains backward compatibility:

```typescript
// Old way (still works)
const basicResults = await FunnelApi.calculateFunnel(funnelId);

// New way (enhanced)
const comprehensiveResults = await EnhancedFunnelApi.calculateFunnelComprehensive(funnelId);
```

### Gradual Migration Strategy

1. **Phase 1**: Use enhanced API alongside existing API
2. **Phase 2**: Update components to use comprehensive results
3. **Phase 3**: Replace mock service with production API calls
4. **Phase 4**: Remove mock service dependencies

### Production API Integration

When ready to integrate with production API:

```typescript
// Replace mock service with production API
class ProductionFunnelCalculationService {
  async calculateFunnel(request: FunnelCalculationRequest): Promise<FunnelCalculationResponse> {
    const response = await fetch('/api/funnels/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
}
```

## Maintenance and Updates

### Regular Maintenance

- **Conversion rate updates**: Based on industry changes and user feedback
- **Performance optimization**: Regular performance audits and improvements
- **Bug fixes**: Address calculation errors and edge cases
- **Feature enhancements**: Add new calculation capabilities

### Quality Assurance

- **Data validation**: Automated validation checks
- **Performance testing**: Regular performance audits
- **Accuracy verification**: Compare with real-world data
- **User feedback**: Incorporate user suggestions and requirements

## Future Enhancements

### Planned Features

1. **Dynamic Conversion Rates**: User-configurable conversion logic
2. **Historical Data Analysis**: Time-series and trend analysis
3. **Advanced Segmentation**: User behavior and demographic segmentation
4. **Predictive Analytics**: Machine learning for performance predictions
5. **Real-time Updates**: Live data integration and updates
6. **Custom Algorithms**: User-defined calculation methods

### Extensibility

The service is designed for easy extension:

```typescript
// Custom calculation service
class CustomCalculationService extends MockFunnelCalculationService {
  protected calculateStepConversion(step: FunnelStep, previousValue: number): number {
    // Custom conversion logic
    return customConversionRate(step, previousValue);
  }
  
  protected generateCustomInsights(stepMetrics: StepMetrics[]): FunnelInsights {
    // Custom insights generation
    return customInsights(stepMetrics);
  }
}
```

## Conclusion

The mock funnel calculation service provides a comprehensive foundation for funnel analysis and visualization. It includes all the data structures and calculation logic needed to support the existing frontend components while providing a clear path for future enhancements and production API integration.

### Key Strengths

1. **Comprehensive**: Covers all visualization and analysis needs
2. **Realistic**: Uses industry-standard conversion rates and data
3. **Extensible**: Easy to modify and extend for new requirements
4. **Well-tested**: Includes validation and comprehensive error handling
5. **Production-ready**: Can be easily replaced with real API calls

### Success Metrics

- **Calculation Accuracy**: Results match expected conversion rates
- **Performance**: Fast calculation and response times
- **Reliability**: Consistent results and error handling
- **Maintainability**: Easy to update and extend

---

*This document should be updated as the service evolves and new features are added. Regular reviews ensure the documentation remains current and accurate.*
