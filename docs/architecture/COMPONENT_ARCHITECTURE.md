# Component Architecture Guide - Waymore Funnel Explorer

## Overview

This document provides a detailed breakdown of the component architecture in the Waymore Funnel Explorer application, including component relationships, data flow, and design patterns.

## Current Architecture Status

### ✅ Implemented Features
- **Component Hierarchy**: Well-structured component tree with clear separation of concerns
- **Data Flow**: TanStack Query for server state, React state for local state
- **Visualization System**: Multiple visualization types (Sankey, Step Flow, Drop-off Analysis)
- **Form Management**: React Hook Form with Zod validation
- **Error Handling**: Error boundaries and comprehensive error handling
- **Performance Optimization**: Memoization, lazy loading, and optimization techniques

### 🔄 Partially Implemented
- **State Management**: Basic state management, could benefit from more centralized state
- **Caching Strategy**: Basic caching with TanStack Query
- **Component Composition**: Good composition patterns, could be enhanced

### ❌ Missing Features
- **Global State Management**: No centralized state management solution
- **Advanced Performance**: Virtual scrolling for large datasets
- **Component Testing**: Limited automated testing coverage
- **Advanced Accessibility**: Some accessibility features need enhancement

## Architecture Principles

### 1. **Component-First Design**
- Components are the primary building blocks
- Clear separation between presentational and container components
- Reusable component patterns

### 2. **Data Flow Patterns**
- Unidirectional data flow
- Props down, events up
- TanStack Query for server state management
- Local state for UI-specific data

### 3. **Performance Optimization**
- Memoization for expensive calculations
- Lazy loading for large components
- Efficient re-rendering strategies

### 4. **Accessibility First**
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatibility

## Component Hierarchy

```
App
├── QueryClientProvider
├── TooltipProvider
├── Toaster
├── Sonner
└── BrowserRouter
    └── Routes
        ├── FunnelsListPage
        ├── FunnelCreatePage
        ├── FunnelEditPage
        ├── FunnelAnalysisPage
        └── FunnelUsersPage
```

## Core Page Components

### 1. FunnelsListPage

**Location**: `src/pages/FunnelsListPage.tsx`

**Purpose**: Main dashboard showing all available funnels with performance metrics.

**Key Components**:
- `DashboardLayout` - Main layout wrapper
- `FunnelSummaryCard` - Individual funnel cards
- `MainNavigation` - Top navigation

**Data Flow**:
```typescript
// Data fetching
const { data: funnels, isLoading } = useQuery({
  queryKey: ['funnels'],
  queryFn: () => FunnelApi.listFunnels()
});

// Rendering
{funnels?.map(funnel => (
  <FunnelSummaryCard key={funnel.id} funnel={funnel} />
))}
```

### 2. FunnelEditPage

**Location**: `src/pages/FunnelEditPage.tsx`

**Purpose**: Comprehensive funnel editing interface with step management and configuration.

**Key Components**:
- `FunnelConfigEditor` - Main configuration panel
- `FunnelStepListEditor` - Step management
- `StepEditSidebar` - Step-specific editing
- `AIFunnelGenerator` - AI-assisted features

**Component Structure**:
```
FunnelEditPage
├── DashboardLayout
├── FunnelConfigEditor
│   ├── FunnelForm
│   └── AIFunnelGenerator
├── FunnelStepListEditor
│   ├── StepAccordionList
│   │   └── StepAccordionItem
│   └── SplitListSection
└── StepEditSidebar
    ├── StepConditionBuilder
    └── SlidingConfigPanel
```

### 3. FunnelAnalysisPage

**Location**: `src/pages/FunnelAnalysisPage.tsx`

**Purpose**: Advanced funnel analysis with multiple visualization types.

**Key Components**:
- `FunnelVisualizationTabs` - Tab navigation
- `UnifiedFunnelView` - Main visualization container
- `FunnelSankeyVisualization` - Sankey diagram
- `FunnelStepFlow` - Step flow chart
- `DropOffDetails` - Drop-off analysis

**Component Structure**:
```
FunnelAnalysisPage
├── DashboardLayout
├── FunnelVisualizationTabs
└── UnifiedFunnelView
    ├── FunnelSankeyVisualization
    ├── FunnelStepFlow
    ├── DropOffDetails
    └── FunnelOverview
```

## Funnel Management Components

### FunnelConfigEditor

**Location**: `src/components/funnel/FunnelConfigEditor.tsx`

**Purpose**: Main configuration interface for funnel properties.

**Features**:
- Basic funnel information (name, description)
- Timeframe configuration
- AI-assisted funnel generation
- Save/load functionality

**Props Interface**:
```typescript
interface FunnelConfigEditorProps {
  funnel: Funnel;
  onSave: (funnel: Funnel) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### FunnelStepListEditor

**Location**: `src/components/funnel/FunnelStepListEditor.tsx`

**Purpose**: Step management with drag-and-drop reordering.

**Features**:
- Add/remove funnel steps
- Drag-and-drop reordering
- Step enable/disable
- Split variation management

**Component Structure**:
```
FunnelStepListEditor
├── StepAccordionList
│   └── StepAccordionItem[]
│       ├── StepHeader
│       ├── StepContent
│       └── SplitVariations
└── AddStepButton
```

### StepEditSidebar

**Location**: `src/components/funnel/step-edit-sidebar/StepEditSidebar.tsx`

**Purpose**: Detailed step editing with condition building.

**Features**:
- Step properties editing
- Condition building interface
- Split variation configuration
- Real-time validation

**Component Structure**:
```
StepEditSidebar
├── StepHeader
├── StepProperties
├── StepConditionBuilder
└── SplitVariations
```

## Visualization Components

### FunnelSankeyVisualization

**Location**: `src/components/funnel/visualizations/funnel-graph/FunnelSankeyVisualization.tsx`

**Purpose**: Interactive Sankey diagram for funnel flow visualization.

**Features**:
- Interactive nodes and links
- Zoom and pan controls
- Hover tooltips
- Responsive design

**Component Structure**:
```
FunnelSankeyVisualization
├── SankeyDiagram
│   ├── EnhancedNode[]
│   ├── EnhancedLink[]
│   └── CustomTooltip
├── InteractiveControls
│   ├── ZoomControls
│   └── TagsToolbar
└── SankeyLegend
```

**Custom Hooks**:
- `useSankeyData` - Data processing
- `useZoomPan` - Interaction handling
- `useNodeSelection` - Selection state
- `useSankeyTooltip` - Tooltip management

### FunnelStepFlow

**Location**: `src/components/funnel/visualizations/funnel-step-flow/FunnelStepFlow.tsx`

**Purpose**: Step-by-step flow visualization with metrics.

**Features**:
- Step cards with metrics
- Connection lines
- Split variation display
- Performance indicators

**Component Structure**:
```
FunnelStepFlow
├── FunnelStep[]
│   ├── StepHeader
│   ├── StepMetrics
│   └── SplitVariations
└── StepConnector[]
```

### DropOffDetails

**Location**: `src/components/funnel/visualizations/DropOffDetails.tsx`

**Purpose**: Detailed drop-off analysis and insights.

**Features**:
- Drop-off rate calculations
- Performance insights
- Recommendations
- Export capabilities

## Condition Building Components

### StepConditionBuilder

**Location**: `src/components/funnel/step-condition-builder/StepConditionBuilder.tsx`

**Purpose**: Complex condition building interface for funnel steps.

**Features**:
- Event group management
- Property filtering
- Time window configuration
- Occurrence rules

**Component Structure**:
```
StepConditionBuilder
├── ConditionItem[]
│   ├── EventSelector
│   ├── OperatorSelector
│   ├── PropertyFilters
│   └── OccurrenceDetails
├── AddConditionButton
└── AIConditionGenerator
```

### AIConditionGenerator

**Location**: `src/components/funnel/step-condition-builder/AIConditionGenerator.tsx`

**Purpose**: AI-assisted condition generation.

**Features**:
- Smart condition suggestions
- Industry-specific templates
- Natural language input
- Auto-completion

## UI Component Library

### shadcn/ui Components

The application uses shadcn/ui components for consistent design:

**Core Components**:
- `Button` - Action buttons
- `Card` - Content containers
- `Dialog` - Modal dialogs
- `Form` - Form handling
- `Input` - Text inputs
- `Select` - Dropdown selects
- `Tabs` - Tab navigation
- `Toast` - Notifications

**Usage Pattern**:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

// Component usage
<Card>
  <CardHeader>
    <h3>Funnel Configuration</h3>
  </CardHeader>
  <CardContent>
    <Button onClick={handleSave}>Save Funnel</Button>
  </CardContent>
</Card>
```

### Custom UI Components

**LoadingState**
- **Location**: `src/components/ui/LoadingState.tsx`
- **Purpose**: Consistent loading indicators
- **Features**: Skeleton loading, spinner states

**Sonner**
- **Location**: `src/components/ui/sonner.tsx`
- **Purpose**: Toast notifications
- **Features**: Success, error, warning notifications

## Layout Components

### DashboardLayout

**Location**: `src/components/layout/DashboardLayout.tsx`

**Purpose**: Main application layout with navigation and content area.

**Features**:
- Responsive sidebar navigation
- Header with user controls
- Content area with padding
- Mobile-friendly design

**Component Structure**:
```
DashboardLayout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── Sidebar
│   └── MainNavigation
└── MainContent
    └── {children}
```

### MainNavigation

**Location**: `src/components/navigation/MainNavigation.tsx`

**Purpose**: Primary navigation menu.

**Features**:
- Route-based navigation
- Active state highlighting
- Icon support
- Collapsible design

## Data Flow Architecture

### Current Data Flow Patterns

The application uses a hybrid approach to data management:

#### 1. Server State Management (TanStack Query)

```typescript
// Query for funnel data
const { data: funnel, isLoading, error } = useQuery({
  queryKey: ['funnel', funnelId],
  queryFn: () => FunnelApi.getFunnel(funnelId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Mutation for saving funnel
const saveMutation = useMutation({
  mutationFn: (funnel: Funnel) => FunnelApi.updateFunnel(funnel.id!, funnel),
  onSuccess: () => {
    queryClient.invalidateQueries(['funnel', funnelId]);
    toast.success('Funnel saved successfully');
  },
  onError: (error) => {
    toast.error('Failed to save funnel');
    console.error('Save error:', error);
  }
});
```

#### 2. Local State Management

```typescript
// Component-specific state
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState(initialData);

// Form state with React Hook Form
const form = useForm<FunnelFormData>({
  resolver: zodResolver(funnelSchema),
  defaultValues: initialData
});
```

#### 3. Custom Hooks for Business Logic

```typescript
// Custom hook for funnel calculation
const { calculatedSteps, isLoading, calculateFunnel } = useFunnelCalculation({
  steps: funnel.steps,
  initialValue: 10000,
  funnelId: funnel.id,
  autoCalculate: true
});
```

### Data Flow Patterns

#### 1. Props Drilling Pattern

For simple component hierarchies:
```typescript
// Parent component
const ParentComponent = () => {
  const [data, setData] = useState();
  
  return (
    <ChildComponent 
      data={data} 
      onDataChange={setData} 
    />
  );
};
```

### 2. Context Pattern

For deeply nested components:
```typescript
// Context definition
const FunnelContext = createContext<FunnelContextType>();

// Provider component
const FunnelProvider = ({ children }) => {
  const [funnel, setFunnel] = useState();
  
  return (
    <FunnelContext.Provider value={{ funnel, setFunnel }}>
      {children}
    </FunnelContext.Provider>
  );
};

// Consumer component
const useFunnel = () => useContext(FunnelContext);
```

### 3. Custom Hooks Pattern

For reusable logic:

```typescript
// Custom hook for funnel calculation
const useFunnelCalculation = (funnelId: string) => {
  const [results, setResults] = useState();
  const [isLoading, setIsLoading] = useState(false);
  
  const calculate = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await FunnelApi.calculateFunnel(funnelId);
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  }, [funnelId]);
  
  return { results, isLoading, calculate };
};

// Component usage
const Component = ({ funnelId }) => {
  const { results, isLoading, calculate } = useFunnelCalculation(funnelId);
  
  return (
    <div>
      {isLoading ? <LoadingState /> : <Results data={results} />}
    </div>
  );
};
```

#### 4. Compound Component Pattern

For complex component interactions:

```typescript
// Compound component for funnel steps
const FunnelStepEditor = ({ children, ...props }) => {
  const [selectedStep, setSelectedStep] = useState(null);
  
  return (
    <FunnelStepContext.Provider value={{ selectedStep, setSelectedStep }}>
      <div className="funnel-step-editor" {...props}>
        {children}
      </div>
    </FunnelStepContext.Provider>
  );
};

FunnelStepEditor.List = StepList;
FunnelStepEditor.Details = StepDetails;
FunnelStepEditor.Conditions = StepConditions;

// Usage
<FunnelStepEditor>
  <FunnelStepEditor.List />
  <FunnelStepEditor.Details />
  <FunnelStepEditor.Conditions />
</FunnelStepEditor>
```

#### 5. Render Props Pattern

For flexible component composition:

```typescript
const FunnelDataProvider = ({ children, funnelId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['funnel', funnelId],
    queryFn: () => FunnelApi.getFunnel(funnelId)
  });
  
  return children({ data, isLoading, error });
};

// Usage
<FunnelDataProvider funnelId={id}>
  {({ data, isLoading, error }) => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    return <FunnelDisplay funnel={data} />;
  }}
</FunnelDataProvider>
```
```typescript
// Custom hook
const useFunnelCalculation = (funnelId: string) => {
  const [results, setResults] = useState();
  const [isLoading, setIsLoading] = useState(false);
  
  const calculate = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await FunnelApi.calculateFunnel(funnelId);
      setResults(data);
    } finally {
      setIsLoading(false);
    }
  }, [funnelId]);
  
  return { results, isLoading, calculate };
};

// Component usage
const Component = ({ funnelId }) => {
  const { results, isLoading, calculate } = useFunnelCalculation(funnelId);
  
  return (
    <div>
      {isLoading ? <LoadingState /> : <Results data={results} />}
    </div>
  );
};
```

## State Management Architecture

### Current State Management Strategy

The application uses a layered approach to state management:

#### 1. Server State (TanStack Query)

**Purpose**: API data, caching, and synchronization

```typescript
// Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false; // Don't retry client errors
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

// Query patterns
const useFunnelData = (funnelId: string) => {
  return useQuery({
    queryKey: ['funnel', funnelId],
    queryFn: () => FunnelApi.getFunnel(funnelId),
    enabled: !!funnelId,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation patterns
const useUpdateFunnel = () => {
  return useMutation({
    mutationFn: (funnel: Funnel) => FunnelApi.updateFunnel(funnel.id!, funnel),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['funnel', variables.id], data);
      queryClient.invalidateQueries(['funnels']);
      toast.success('Funnel updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update funnel');
      console.error('Update error:', error);
    }
  });
};
```

#### 2. Local State (React useState/useReducer)

**Purpose**: UI state, form data, component-specific state

```typescript
// Simple local state
const [isEditing, setIsEditing] = useState(false);
const [selectedStep, setSelectedStep] = useState<string | null>(null);

// Complex local state with useReducer
interface FunnelEditorState {
  isEditing: boolean;
  selectedStep: string | null;
  unsavedChanges: boolean;
  validationErrors: Record<string, string>;
}

type FunnelEditorAction = 
  | { type: 'START_EDITING' }
  | { type: 'STOP_EDITING' }
  | { type: 'SELECT_STEP'; stepId: string }
  | { type: 'SET_UNSAVED_CHANGES'; hasChanges: boolean }
  | { type: 'SET_VALIDATION_ERRORS'; errors: Record<string, string> };

const funnelEditorReducer = (state: FunnelEditorState, action: FunnelEditorAction): FunnelEditorState => {
  switch (action.type) {
    case 'START_EDITING':
      return { ...state, isEditing: true };
    case 'STOP_EDITING':
      return { ...state, isEditing: false, unsavedChanges: false };
    case 'SELECT_STEP':
      return { ...state, selectedStep: action.stepId };
    case 'SET_UNSAVED_CHANGES':
      return { ...state, unsavedChanges: action.hasChanges };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.errors };
    default:
      return state;
  }
};
```

#### 3. Form State (React Hook Form)

**Purpose**: Form data, validation, and submission

```typescript
// Form with validation
const funnelForm = useForm<FunnelFormData>({
  resolver: zodResolver(funnelSchema),
  defaultValues: {
    name: '',
    description: '',
    timeframe: {
      from: Date.now() - 30 * 24 * 60 * 60 * 1000,
      to: Date.now()
    },
    performedBy: 'all_contacts',
    steps: []
  },
  mode: 'onChange'
});

// Form submission
const onSubmit = async (data: FunnelFormData) => {
  try {
    const result = await saveMutation.mutateAsync(data);
    funnelForm.reset(result);
    toast.success('Funnel saved successfully');
  } catch (error) {
    toast.error('Failed to save funnel');
  }
};
```

#### 4. Context State (React Context)

**Purpose**: Global UI state, theme, user preferences

```typescript
// Theme context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### State Management Best Practices

#### 1. **Choose the Right State Location**

```typescript
// Server state - use TanStack Query
const { data: funnel } = useQuery(['funnel', id], () => FunnelApi.getFunnel(id));

// UI state - use local state
const [isExpanded, setIsExpanded] = useState(false);

// Form state - use React Hook Form
const form = useForm({ resolver: zodResolver(schema) });

// Global UI state - use Context
const { theme } = useTheme();
```

#### 2. **Optimize Re-renders**

```typescript
// Memoize expensive components
const ExpensiveChart = React.memo(({ data }: { data: ChartData }) => {
  return <Chart data={data} />;
});

// Memoize callbacks
const handleStepClick = useCallback((stepId: string) => {
  setSelectedStep(stepId);
}, []);

// Memoize derived state
const filteredSteps = useMemo(() => {
  return steps.filter(step => step.isEnabled);
}, [steps]);
```

#### 3. **Handle Loading and Error States**

```typescript
const FunnelComponent = ({ funnelId }: { funnelId: string }) => {
  const { data: funnel, isLoading, error } = useFunnelData(funnelId);
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!funnel) return <EmptyState />;
  
  return <FunnelDisplay funnel={funnel} />;
};
```

## Performance Optimization

### 1. Memoization

**React.memo for Components**:
```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});
```

**useMemo for Calculations**:
```typescript
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

**useCallback for Functions**:
```typescript
const handleClick = useCallback(() => {
  // Handle click logic
}, [dependencies]);
```

### 2. Lazy Loading

**Component Lazy Loading**:
```typescript
const LazyComponent = lazy(() => import('./LazyComponent'));

// Usage with Suspense
<Suspense fallback={<LoadingState />}>
  <LazyComponent />
</Suspense>
```

### 3. Virtual Scrolling

For large lists:

```typescript
// Example with react-window
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </List>
);
```

### 4. Code Splitting

```typescript
// Lazy load components
const FunnelSankeyVisualization = lazy(() => import('./FunnelSankeyVisualization'));
const FunnelStepFlow = lazy(() => import('./FunnelStepFlow'));
const DropOffDetails = lazy(() => import('./DropOffDetails'));

// Usage with Suspense
const FunnelAnalysisPage = () => {
  const [activeTab, setActiveTab] = useState('sankey');
  
  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Suspense fallback={<LoadingState />}>
        {activeTab === 'sankey' && <FunnelSankeyVisualization />}
        {activeTab === 'flow' && <FunnelStepFlow />}
        {activeTab === 'dropoff' && <DropOffDetails />}
      </Suspense>
    </div>
  );
};
```

### 5. Bundle Optimization

```typescript
// Dynamic imports for heavy libraries
const loadD3 = async () => {
  const d3 = await import('d3');
  return d3;
};

// Usage in component
const SankeyChart = () => {
  const [d3, setD3] = useState(null);
  
  useEffect(() => {
    loadD3().then(setD3);
  }, []);
  
  if (!d3) return <LoadingState />;
  
  return <Chart d3={d3} />;
};
```

## Component Composition Patterns

### 1. Container/Presentational Pattern

```typescript
// Container component (logic)
const FunnelListContainer = () => {
  const { data: funnels, isLoading, error } = useQuery({
    queryKey: ['funnels'],
    queryFn: () => FunnelApi.listFunnels()
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => FunnelApi.deleteFunnel(id),
    onSuccess: () => queryClient.invalidateQueries(['funnels'])
  });
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <FunnelList 
      funnels={funnels} 
      onDelete={deleteMutation.mutate}
      isLoading={deleteMutation.isLoading}
    />
  );
};

// Presentational component (UI)
interface FunnelListProps {
  funnels: FunnelSummary[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const FunnelList = ({ funnels, onDelete, isLoading }: FunnelListProps) => {
  return (
    <div className="funnel-list">
      {funnels.map(funnel => (
        <FunnelCard 
          key={funnel.id} 
          funnel={funnel}
          onDelete={() => onDelete(funnel.id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
```

### 2. Higher-Order Component Pattern

```typescript
// HOC for error handling
const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// HOC for loading states
const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  LoadingComponent: React.ComponentType = LoadingState
) => {
  return ({ isLoading, ...props }: P & { isLoading: boolean }) => {
    if (isLoading) return <LoadingComponent />;
    return <Component {...(props as P)} />;
  };
};

// Usage
const FunnelListWithErrorHandling = withErrorBoundary(FunnelList);
const FunnelListWithLoading = withLoading(FunnelList);
```

### 3. Render Props Pattern

```typescript
// Data provider component
interface DataProviderProps<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  children: (data: { data: T; isLoading: boolean; error: Error | null }) => React.ReactNode;
}

const DataProvider = <T,>({ queryKey, queryFn, children }: DataProviderProps<T>) => {
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn
  });
  
  return <>{children({ data, isLoading, error })}</>;
};

// Usage
<DataProvider 
  queryKey={['funnels']} 
  queryFn={() => FunnelApi.listFunnels()}
>
  {({ data, isLoading, error }) => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    return <FunnelList funnels={data} />;
  }}
</DataProvider>
```

### 4. Compound Component Pattern

```typescript
// Compound component for funnel steps
interface FunnelStepEditorContextType {
  selectedStep: string | null;
  setSelectedStep: (stepId: string | null) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

const FunnelStepEditorContext = createContext<FunnelStepEditorContextType | undefined>(undefined);

const FunnelStepEditor = ({ children, ...props }: { children: React.ReactNode }) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <FunnelStepEditorContext.Provider 
      value={{ selectedStep, setSelectedStep, isEditing, setIsEditing }}
    >
      <div className="funnel-step-editor" {...props}>
        {children}
      </div>
    </FunnelStepEditorContext.Provider>
  );
};

// Sub-components
FunnelStepEditor.List = () => {
  const { selectedStep, setSelectedStep } = useContext(FunnelStepEditorContext)!;
  return <StepList selectedStep={selectedStep} onSelectStep={setSelectedStep} />;
};

FunnelStepEditor.Details = () => {
  const { selectedStep, isEditing, setIsEditing } = useContext(FunnelStepEditorContext)!;
  return <StepDetails stepId={selectedStep} isEditing={isEditing} onEdit={setIsEditing} />;
};

FunnelStepEditor.Conditions = () => {
  const { selectedStep } = useContext(FunnelStepEditorContext)!;
  return <StepConditions stepId={selectedStep} />;
};

// Usage
<FunnelStepEditor>
  <FunnelStepEditor.List />
  <FunnelStepEditor.Details />
  <FunnelStepEditor.Conditions />
</FunnelStepEditor>
```
```typescript
// Example with react-window
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index]}
      </div>
    )}
  </List>
);
```

## Error Handling

### 1. Error Boundaries

**Component Error Boundary**:
```typescript
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### 2. API Error Handling

**Service Layer Error Handling**:
```typescript
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred');
};

// Usage in API calls
try {
  const data = await apiCall();
  return data;
} catch (error) {
  return handleApiError(error);
}
```

### 3. Form Validation

**React Hook Form with Zod**:
```typescript
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

const form = useForm({
  resolver: zodResolver(schema),
});

// Error display
{form.formState.errors.name && (
  <span className="text-red-500">
    {form.formState.errors.name.message}
  </span>
)}
```

## Accessibility

### 1. ARIA Labels

**Component Accessibility**:
```typescript
<button
  aria-label="Add new funnel step"
  aria-describedby="step-description"
  onClick={handleAddStep}
>
  <PlusIcon />
</button>
```

### 2. Keyboard Navigation

**Focus Management**:
```typescript
const focusableElements = useRef<HTMLElement[]>([]);

useEffect(() => {
  // Trap focus in modal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Focus management logic
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 3. Screen Reader Support

**Semantic HTML**:
```typescript
<main role="main" aria-label="Funnel Analysis">
  <section aria-labelledby="funnel-title">
    <h2 id="funnel-title">Funnel Performance</h2>
    {/* Content */}
  </section>
</main>
```

## Testing Strategy

### Testing Architecture

The application follows a comprehensive testing strategy with multiple layers:

#### 1. Unit Testing (Components)

**React Testing Library with Jest**:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test setup
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

// Component test
describe('FunnelList', () => {
  it('should render funnel list with data', async () => {
    const mockFunnels = [
      { id: '1', name: 'Test Funnel', description: 'Test Description' }
    ];
    
    // Mock API call
    jest.spyOn(FunnelApi, 'listFunnels').mockResolvedValue(mockFunnels);
    
    renderWithProviders(<FunnelList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Funnel')).toBeInTheDocument();
    });
  });
  
  it('should handle funnel deletion', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.spyOn(FunnelApi, 'deleteFunnel').mockResolvedValue();
    
    renderWithProviders(<FunnelList />);
    
    await user.click(screen.getByLabelText('Delete funnel'));
    await user.click(screen.getByText('Confirm'));
    
    expect(mockDelete).toHaveBeenCalledWith('funnel-id');
  });
});
```

#### 2. Hook Testing

**Custom Hook Testing**:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useFunnelCalculation', () => {
  it('should calculate funnel results', async () => {
    const mockResults = { calculatedResults: { 'step-1': 1000 } };
    jest.spyOn(mockFunnelCalculationService, 'calculateFunnel')
      .mockResolvedValue(mockResults);
    
    const { result } = renderHook(
      () => useFunnelCalculation({
        steps: [{ id: 'step-1', name: 'Step 1', isEnabled: true }],
        initialValue: 1000
      }),
      { wrapper: createWrapper() }
    );
    
    await act(async () => {
      await result.current.calculateFunnel();
    });
    
    expect(result.current.calculatedSteps[0].value).toBe(1000);
  });
});
```

#### 3. Integration Testing

**Component Integration**:

```typescript
describe('FunnelEditPage Integration', () => {
  it('should save funnel changes', async () => {
    const user = userEvent.setup();
    const mockSave = jest.spyOn(FunnelApi, 'updateFunnel').mockResolvedValue({});
    
    renderWithProviders(<FunnelEditPage />);
    
    // Fill form
    await user.type(screen.getByLabelText('Funnel Name'), 'Updated Funnel');
    await user.type(screen.getByLabelText('Description'), 'Updated description');
    
    // Save
    await user.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Funnel',
          description: 'Updated description'
        })
      );
    });
  });
  
  it('should handle validation errors', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<FunnelEditPage />);
    
    // Try to save without required fields
    await user.click(screen.getByText('Save Changes'));
    
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });
});
```

#### 4. API Testing

**Service Layer Testing**:

```typescript
describe('FunnelApi', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  
  it('should fetch funnels successfully', async () => {
    const mockFunnels = [{ id: '1', name: 'Test Funnel' }];
    fetch.mockResponseOnce(JSON.stringify(mockFunnels));
    
    const result = await FunnelApi.listFunnels();
    
    expect(result).toEqual(mockFunnels);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/funnels'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
  });
  
  it('should handle API errors', async () => {
    fetch.mockRejectOnce(new Error('Network error'));
    
    await expect(FunnelApi.listFunnels()).rejects.toThrow('Network error');
  });
});
```

#### 5. Visual Regression Testing

**Storybook with Chromatic**:

```typescript
// Storybook story
export default {
  title: 'Components/FunnelList',
  component: FunnelList,
  parameters: {
    chromatic: { viewports: [320, 768, 1024] }
  }
};

export const Default = {
  args: {
    funnels: [
      { id: '1', name: 'E-commerce Funnel', description: 'Test description' }
    ]
  }
};

export const Empty = {
  args: {
    funnels: []
  }
};

export const Loading = {
  args: {
    funnels: [],
    isLoading: true
  }
};
```

#### 6. E2E Testing

**Playwright**:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Funnel Management', () => {
  test('should create and edit a funnel', async ({ page }) => {
    await page.goto('/funnels');
    
    // Create new funnel
    await page.click('[data-testid="create-funnel"]');
    await page.fill('[data-testid="funnel-name"]', 'Test Funnel');
    await page.fill('[data-testid="funnel-description"]', 'Test Description');
    await page.click('[data-testid="save-funnel"]');
    
    // Verify funnel was created
    await expect(page.locator('text=Test Funnel')).toBeVisible();
    
    // Edit funnel
    await page.click('[data-testid="edit-funnel"]');
    await page.fill('[data-testid="funnel-name"]', 'Updated Funnel');
    await page.click('[data-testid="save-funnel"]');
    
    // Verify changes were saved
    await expect(page.locator('text=Updated Funnel')).toBeVisible();
  });
  
  test('should delete a funnel', async ({ page }) => {
    await page.goto('/funnels');
    
    // Delete funnel
    await page.click('[data-testid="delete-funnel"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify funnel was deleted
    await expect(page.locator('text=Test Funnel')).not.toBeVisible();
  });
});
```

### Testing Best Practices

#### 1. **Test Data Management**

```typescript
// Test data factories
const createMockFunnel = (overrides = {}): Funnel => ({
  id: 'test-funnel-1',
  name: 'Test Funnel',
  description: 'Test Description',
  timeframe: { from: Date.now() - 86400000, to: Date.now() },
  performedBy: 'all_contacts',
  steps: [],
  ...overrides
});

const createMockStep = (overrides = {}): FunnelStep => ({
  id: 'step-1',
  name: 'Test Step',
  order: 1,
  isEnabled: true,
  isRequired: true,
  conditions: { orEventGroups: [] },
  ...overrides
});
```

#### 2. **Mock Management**

```typescript
// Centralized mocks
jest.mock('@/services/api', () => ({
  FunnelApi: {
    listFunnels: jest.fn(),
    getFunnel: jest.fn(),
    createFunnel: jest.fn(),
    updateFunnel: jest.fn(),
    deleteFunnel: jest.fn(),
    calculateFunnel: jest.fn(),
  }
}));

// Mock cleanup
afterEach(() => {
  jest.clearAllMocks();
});
```

#### 3. **Accessibility Testing**

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<FunnelList />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### 4. **Performance Testing**

```typescript
import { render } from '@testing-library/react';

test('should render within performance budget', () => {
  const startTime = performance.now();
  
  render(<FunnelList />);
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  expect(renderTime).toBeLessThan(100); // 100ms budget
});
```
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FunnelList', () => {
  it('should render funnel list', () => {
    render(<FunnelList />);
    expect(screen.getByText('Funnels')).toBeInTheDocument();
  });
  
  it('should handle funnel creation', async () => {
    const user = userEvent.setup();
    render(<FunnelList />);
    
    await user.click(screen.getByText('Create Funnel'));
    expect(screen.getByText('New Funnel')).toBeInTheDocument();
  });
});
```

### 2. Hook Testing

**Custom Hook Testing**:
```typescript
import { renderHook, act } from '@testing-library/react';

describe('useFunnelCalculation', () => {
  it('should calculate funnel results', async () => {
    const { result } = renderHook(() => useFunnelCalculation('funnel-1'));
    
    await act(async () => {
      await result.current.calculate();
    });
    
    expect(result.current.results).toBeDefined();
  });
});
```

### 3. Integration Testing

**Component Integration**:
```typescript
describe('FunnelEditPage Integration', () => {
  it('should save funnel changes', async () => {
    render(<FunnelEditPage />);
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Name'), 'Test Funnel');
    
    // Save
    await userEvent.click(screen.getByText('Save'));
    
    // Verify save was called
    expect(mockSaveFunction).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Funnel' })
    );
  });
});
```

## Architecture Recommendations

### Immediate Improvements

#### 1. **Global State Management**
Consider implementing a global state management solution for complex state:

```typescript
// Zustand for global state
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  user: User | null;
  notifications: Notification[];
  setTheme: (theme: 'light' | 'dark') => void;
  setUser: (user: User | null) => void;
  addNotification: (notification: Notification) => void;
}

const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  user: null,
  notifications: [],
  setTheme: (theme) => set({ theme }),
  setUser: (user) => set({ user }),
  addNotification: (notification) => 
    set((state) => ({ 
      notifications: [...state.notifications, notification] 
    })),
}));
```

#### 2. **Component Library Enhancement**
Create a comprehensive component library:

```typescript
// Component library structure
src/
  components/
    ui/                    # Base UI components
    funnel/               # Funnel-specific components
    visualization/        # Visualization components
    forms/               # Form components
    layout/              # Layout components
    feedback/            # Feedback components (toast, alerts)
```

#### 3. **Performance Monitoring**
Implement performance monitoring:

```typescript
// Performance monitoring hook
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Send to analytics
      analytics.track('component_render_time', {
        component: componentName,
        renderTime,
        timestamp: Date.now()
      });
    };
  });
};
```

### Long-term Architecture Goals

#### 1. **Micro-Frontend Architecture**
Consider splitting the application into micro-frontends:

```
waymore-funnel-explorer/
├── shell/                 # Main application shell
├── funnel-editor/         # Funnel editing module
├── funnel-analytics/      # Analytics and visualization module
├── funnel-management/     # Funnel list and management module
└── shared/               # Shared components and utilities
```

#### 2. **Advanced Caching Strategy**
Implement advanced caching with service workers:

```typescript
// Service worker for offline support
const CACHE_NAME = 'waymore-funnel-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
      ]);
    })
  );
});
```

#### 3. **Real-time Updates**
Implement real-time updates with WebSockets:

```typescript
// Real-time funnel updates
const useFunnelRealtime = (funnelId: string) => {
  const [updates, setUpdates] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(`ws://api.waymore.io/funnels/${funnelId}/updates`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setUpdates(prev => [...prev, update]);
    };
    
    return () => ws.close();
  }, [funnelId]);
  
  return updates;
};
```

### Scalability Considerations

#### 1. **Component Lazy Loading**
Implement comprehensive lazy loading:

```typescript
// Route-based code splitting
const FunnelAnalysisPage = lazy(() => import('./pages/FunnelAnalysisPage'));
const FunnelEditPage = lazy(() => import('./pages/FunnelEditPage'));

// Component-based code splitting
const FunnelSankeyVisualization = lazy(() => 
  import('./components/visualizations/FunnelSankeyVisualization')
);
```

#### 2. **Data Virtualization**
For large datasets:

```typescript
// Virtual scrolling for large funnel lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedFunnelList = ({ funnels }) => (
  <List
    height={600}
    itemCount={funnels.length}
    itemSize={80}
    itemData={funnels}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <FunnelCard funnel={data[index]} />
      </div>
    )}
  </List>
);
```

#### 3. **Advanced Error Handling**
Implement comprehensive error handling:

```typescript
// Error boundary with recovery
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Send to error reporting service
    errorReporting.captureException(error, {
      extra: errorInfo,
      tags: { component: this.props.componentName }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

## Conclusion

This component architecture provides a solid foundation for the Waymore Funnel Explorer application. The modular design allows for easy maintenance, testing, and future enhancements while maintaining good performance and accessibility standards.

### Key Principles

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components are designed to be reusable
3. **Performance**: Optimized rendering and data flow
4. **Accessibility**: Built with accessibility in mind
5. **Testability**: Components are easily testable
6. **Maintainability**: Clear structure and documentation
7. **Scalability**: Designed for future growth and complexity

### Best Practices

1. **Use TypeScript**: Strict typing for all components
2. **Follow Naming Conventions**: Consistent file and component naming
3. **Implement Error Boundaries**: Proper error handling
4. **Optimize Performance**: Use memoization and lazy loading
5. **Write Tests**: Comprehensive testing coverage
6. **Document Components**: Clear documentation and examples
7. **Monitor Performance**: Track and optimize performance metrics
8. **Plan for Scale**: Design with future growth in mind

### Success Metrics

- **Performance**: < 100ms initial render time
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Test Coverage**: > 80% code coverage
- **Bundle Size**: < 500KB initial bundle
- **Error Rate**: < 0.1% runtime errors

---

*This architecture guide should be updated as the application evolves and new components are added. Regular reviews and updates ensure the architecture remains current and effective.*
