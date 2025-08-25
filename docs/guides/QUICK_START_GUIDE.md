# Quick Start Guide - Waymore Funnel Explorer

## 🚀 Get Up and Running in 5 Minutes

This guide will help you get the Waymore Funnel Explorer running on your local machine quickly and understand the current state of the application.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Git**

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd waymore-funnel-explorer-main

# Install dependencies
npm install
# or
bun install
```

### Step 2: Start Development Server

```bash
npm run dev
# or
bun dev
```

### Step 3: Open in Browser

Navigate to `http://localhost:5173` in your browser.

You should see the funnel list page with several example funnels already loaded.

## 🎯 Current Application State

### What You'll See

#### Default Funnels
The application comes with 7 pre-configured example funnels with realistic data:

1. **E-commerce Conversion Funnel** - Product discovery to purchase (7.56% conversion)
2. **SaaS Onboarding Funnel** - Landing page to subscription (3.13% conversion)
3. **Mobile App Engagement Funnel** - App store to monetization (2.35% conversion)
4. **Customer Support Funnel** - Support page to resolution (13.13% resolution)
5. **Content Marketing Funnel** - Content discovery to conversion (0.07% conversion)
6. **Product Purchase Dropoff Funnel** - Cart abandonment analysis
7. **B2B Lead Qualification Funnel** - Lead generation to qualification

#### Current Features Status

##### ✅ Fully Working
- **Funnel List** (`/funnels`) - View all funnels with performance metrics
- **Funnel Analysis** (`/funnels/:id/analysis`) - Interactive visualizations
- **Funnel Editor** (`/funnels/:id/edit`) - Step configuration and management
- **Mock Data System** - Realistic industry-standard conversion rates
- **Responsive Design** - Mobile-friendly interface

##### 🔄 Partially Working
- **Real-time Updates** - Currently using static calculations
- **Export Features** - Basic functionality, needs enhancement
- **Advanced Analytics** - Basic insights, could be enhanced

##### ❌ Not Implemented
- **Production API** - Currently using mock data only
- **User Authentication** - No user management
- **Real-time Data** - No live data integration

### Key Features to Explore

#### 1. Funnel List (`/funnels`)
- View all available funnels with realistic conversion rates
- See performance metrics and visitor counts
- Create new funnels or edit existing ones
- Delete funnels (with confirmation)

#### 2. Funnel Analysis (`/funnels/:id/analysis`)
- **Sankey Diagrams**: Interactive flow visualization
- **Step Flow Charts**: Step-by-step performance metrics
- **Drop-off Analysis**: Detailed conversion analysis
- **Performance Insights**: Business recommendations

#### 3. Funnel Editor (`/funnels/:id/edit`)
- **Step Management**: Add, remove, and reorder funnel steps
- **Condition Building**: Complex event-based conditions
- **Split Testing**: A/B testing configuration
- **AI Assistance**: AI-powered funnel generation

## 🔧 Development Workflow

### Current Development State

#### ✅ Ready for Development
- **Component Architecture**: Well-structured component hierarchy
- **Type Safety**: Comprehensive TypeScript types
- **State Management**: TanStack Query + React state
- **Styling**: Tailwind CSS + shadcn/ui components
- **Error Handling**: Comprehensive error boundaries

#### 🔄 Needs Attention
- **Testing**: Limited automated testing
- **Performance**: Bundle size optimization needed
- **API Integration**: Mock to real API transition

#### ❌ Missing
- **Production Deployment**: No production environment
- **Monitoring**: No application monitoring
- **CI/CD**: No automated deployment pipeline

### Making Changes

#### 1. Component Development
```typescript
// Edit components in src/components/
// Example: Add new visualization
const NewVisualization = ({ data }: { data: any }) => {
  return <div>New visualization component</div>;
};
```

#### 2. Service Layer
```typescript
// Edit services in src/services/
// Example: Add new API method
export const FunnelApi = {
  // ... existing methods
  newMethod: async (params: any) => {
    // Implementation
  }
};
```

#### 3. Type Definitions
```typescript
// Edit types in src/types/
// Example: Add new interface
interface NewFeature {
  id: string;
  name: string;
  // ... other properties
}
```

### Common Development Tasks

#### Add a New Funnel Step
```typescript
// In FunnelStepListEditor.tsx
const newStep: FunnelStep = {
  id: 'step-new',
  name: 'New Step',
  order: 3,
  isEnabled: true,
  isRequired: true,
  conditions: {
    orEventGroups: [{
      eventName: 'custom_event',
      operator: 'equals',
      count: 1
    }]
  }
};
```

#### Modify Visualization
```typescript
// In FunnelSankeyVisualization.tsx
// Update Sankey diagram configuration
const sankeyConfig = {
  nodeWidth: 20,
  nodePadding: 10,
  // ... other config
};
```

#### Add New API Endpoint
```typescript
// In src/services/api.ts
export const FunnelApi = {
  // ... existing methods
  
  newMethod: async (params: any) => {
    // Implementation
  }
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 5173
lsof -i :5173

# Use different port
npm run dev -- --port 3000
```

#### 2. TypeScript Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix type issues
npx tsc --noEmit --skipLibCheck
```

#### 3. Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Mock Data Issues
```bash
# Reset to default funnels
# Open browser console and run:
localStorage.removeItem('waymore_funnels');
location.reload();
```

#### 5. Performance Issues
```bash
# Check bundle size
npm run build
# Look for large dependencies in the build output

# Profile performance
# Use React DevTools Profiler
# Use browser Performance tab
```

### Debug Tools

#### Browser Developer Tools
- **React DevTools**: Install React Developer Tools extension
- **Network Tab**: Monitor API calls and responses (currently mock data)
- **Console**: View logs and errors
- **Performance Tab**: Profile application performance

#### Debug Logging
```typescript
// Add debug logging
const debug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Usage
debug('Funnel data loaded', funnelData);
```

## 📁 Key Files to Know

### Core Application Files
- `src/App.tsx` - Main application component and routing
- `src/main.tsx` - Application entry point
- `src/index.css` - Global styles

### Page Components
- `src/pages/FunnelsListPage.tsx` - Funnel listing page
- `src/pages/FunnelAnalysisPage.tsx` - Analysis page with visualizations
- `src/pages/FunnelEditPage.tsx` - Editor page for funnel configuration
- `src/pages/FunnelCreatePage.tsx` - Funnel creation page

### Services
- `src/services/api.ts` - Main API service (mock implementation)
- `src/services/mockFunnelCalculationService.ts` - Mock calculation engine
- `src/services/enhancedApi.ts` - Enhanced API wrapper

### Types
- `src/types/funnel.ts` - Core funnel type definitions
- `src/types/funnelExample*.ts` - Example funnel data files

### Visualizations
- `src/components/funnel/visualizations/funnel-graph/` - Sankey diagrams
- `src/components/funnel/visualizations/funnel-step-flow/` - Step flow charts
- `src/components/funnel/visualizations/DropOffDetails.tsx` - Drop-off analysis

### UI Components
- `src/components/ui/` - shadcn/ui components
- `src/components/layout/DashboardLayout.tsx` - Main layout component
- `src/components/navigation/MainNavigation.tsx` - Navigation component

## 🎨 UI Components

### shadcn/ui Components
The project uses shadcn/ui components. Key components:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
```

### Custom Components
- `src/components/ui/LoadingState.tsx` - Loading indicators
- `src/components/ui/Sonner.tsx` - Toast notifications
- `src/components/loading/FunnelAnalysisLoading.tsx` - Analysis loading state

## 🔄 State Management

### TanStack Query (Server State)
```typescript
// Fetch funnel data
const { data: funnel, isLoading, error } = useQuery({
  queryKey: ['funnel', id],
  queryFn: () => FunnelApi.getFunnel(id),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutate funnel data
const mutation = useMutation({
  mutationFn: (data) => FunnelApi.updateFunnel(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['funnel', id]);
    toast.success('Funnel updated successfully');
  },
  onError: (error) => {
    toast.error('Failed to update funnel');
  }
});
```

### React State (Local State)
```typescript
// Component-specific state
const [isEditing, setIsEditing] = useState(false);
const [selectedStep, setSelectedStep] = useState<string | null>(null);

// Form state with React Hook Form
const form = useForm<FunnelFormData>({
  resolver: zodResolver(funnelSchema),
  defaultValues: initialData
});
```

### Local Storage (Persistent Data)
```typescript
// Save funnel data
localStorage.setItem('waymore_funnels', JSON.stringify(funnels));

// Load funnel data
const funnels = JSON.parse(localStorage.getItem('waymore_funnels') || '[]');
```

## 🧪 Testing

### Current Testing Status

#### ✅ Available
- **Manual Testing**: Comprehensive manual testing procedures
- **Error Handling**: Comprehensive error boundaries and validation
- **Type Checking**: TypeScript compilation and type checking

#### 🔄 Partially Available
- **Unit Testing**: Basic test setup, limited coverage
- **Component Testing**: Basic component testing framework

#### ❌ Missing
- **Automated Testing**: Comprehensive test suite
- **E2E Testing**: No automated end-to-end testing
- **Performance Testing**: No automated performance testing

### Manual Testing Checklist
- [ ] Create a new funnel
- [ ] Add/remove funnel steps
- [ ] Configure step conditions
- [ ] View funnel analysis
- [ ] Test different visualizations
- [ ] Verify responsive design
- [ ] Check accessibility
- [ ] Test error scenarios
- [ ] Verify data persistence
- [ ] Test performance with large datasets

### Future Testing Implementation
```bash
# When testing is implemented
npm test          # Run unit tests
npm run test:e2e  # Run E2E tests
npm run test:coverage  # Run tests with coverage
```

## 📚 Next Steps

### Immediate Actions (Week 1)
1. **Explore the Application**: Test all features and understand the current state
2. **Review Documentation**: Read the full `DEVELOPMENT_HANDOVER.md`
3. **Set Up Environment**: Ensure development environment is working
4. **Team Onboarding**: Review codebase with the team

### Short-term Goals (Month 1)
1. **API Integration**: Plan and implement production API integration
2. **Testing Setup**: Implement automated testing framework
3. **Performance Optimization**: Optimize bundle size and performance
4. **Deployment Setup**: Set up production deployment pipeline

### Medium-term Goals (Month 2-3)
1. **Feature Enhancement**: Add advanced analytics and export features
2. **User Experience**: Improve accessibility and user feedback
3. **Monitoring**: Implement application monitoring and analytics
4. **Documentation**: Keep documentation updated and comprehensive

## 🆘 Need Help?

### Documentation
- **Full Documentation**: `docs/guides/DEVELOPMENT_HANDOVER.md`
- **API Specification**: `docs/api/EXTERNAL_API_SPEC.md`
- **Mock Service**: `docs/development/MOCK_SERVICE_README.md`
- **Component Architecture**: `docs/architecture/COMPONENT_ARCHITECTURE.md`

### Development Resources
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **TanStack Query**: https://tanstack.com/query/latest

### Support
- **Issues**: Create GitHub issues for bugs or feature requests
- **Code Reviews**: Use pull requests for all changes
- **Team Communication**: Regular team meetings and knowledge sharing

---

**Ready to start developing! 🚀**

The application is in a solid state with a well-structured codebase, comprehensive documentation, and clear roadmap for future development. The foundation is strong and ready for your team to build upon.
