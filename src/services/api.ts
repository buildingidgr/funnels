import { Funnel, FunnelResults, FunnelSummary } from "@/types/funnel";
import { exampleFunnel } from "@/types/funnelExample";
import { exampleFunnel4 } from "@/types/funnelExample4";
import { exampleFunnel5 } from "@/types/funnelExample5";
import { exampleFunnel6 } from "@/types/funnelExample6";
import { exampleFunnel7 } from "@/types/funnelExample7";
import { exampleFunnel8 } from "@/types/funnelExample8";
import { toast } from "sonner";

// Mock API service (would be replaced with actual API calls)
const API_BASE_URL = "https://connect.waymore.io/api/v1";

// Get API key from environment variables with fallback for development
const API_KEY = import.meta.env.VITE_API_KEY || 'development-key';

// Helper to format API errors
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred while communicating with the API');
}

// Helper to format dates (for display)
export const formatDate = (timestamp: string | number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

// Generate a UUID (for mocking purposes only)
export const generateId = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Define storage keys
const STORAGE_KEYS = {
  FUNNELS: 'waymore_funnels',
  ID_COUNTER: 'waymore_funnel_id_counter'
};

// Counter for generating incremental IDs
let funnelIdCounter = parseInt(localStorage.getItem(STORAGE_KEYS.ID_COUNTER) || '1', 10);

// Generate incremental IDs for new funnels
export const generateIncrementalId = (): string => {
  const paddedCounter = funnelIdCounter.toString().padStart(8, '0');
  funnelIdCounter++;
  localStorage.setItem(STORAGE_KEYS.ID_COUNTER, funnelIdCounter.toString());
  return `funnel-${paddedCounter}`;
};

// Default funnel examples
const defaultFunnels: Funnel[] = [
  {
    ...exampleFunnel,
    id: 'ecommerce-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  },
  {
    ...exampleFunnel4,
    id: 'saas-onboarding-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  },
  {
    ...exampleFunnel5,
    id: 'mobile-app-engagement-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  },
  {
    ...exampleFunnel6,
    id: 'customer-support-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  },
  {
    ...exampleFunnel7,
    id: 'content-marketing-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  },
  {
    ...exampleFunnel8,
    id: 'product-purchase-dropoff-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  }
];

// Initialize mock funnels from localStorage or use default
let mockFunnels: Funnel[] = [];

// Function to reset funnels to default
export const resetFunnels = (): void => {
  console.log('Resetting funnels to default...');
  try {
    localStorage.removeItem(STORAGE_KEYS.FUNNELS);
    mockFunnels = [...defaultFunnels];
    localStorage.setItem(STORAGE_KEYS.FUNNELS, JSON.stringify(mockFunnels));
    
    // Force page reload to see changes
    window.location.reload();
  } catch (error) {
    console.error('Error resetting funnels:', error);
  }
};

// Function to load funnels from localStorage
const loadFunnelsFromStorage = (): void => {
  try {
    const storedFunnels = localStorage.getItem(STORAGE_KEYS.FUNNELS);
    if (storedFunnels) {
      const parsedFunnels = JSON.parse(storedFunnels);
      if (Array.isArray(parsedFunnels)) {
        // Check if the funnels are using the old data structure
        const hasOldStructure = parsedFunnels.some(funnel => 
          funnel.steps?.some(step => 
            step.conditions?.orEventGroups?.some(group => 
              group.primaryEvent
            )
          )
        );
        
        if (hasOldStructure) {
          console.log('Found funnels with old data structure, resetting...');
          resetFunnels();
          return;
        }
        
        mockFunnels = parsedFunnels;
        console.log('Loaded funnels from localStorage:', mockFunnels);
        return;
      }
    }
    // If no valid funnels found, reset to default
    resetFunnels();
  } catch (error) {
    console.error('Error loading funnels from localStorage:', error);
    resetFunnels();
  }
};

// Initialize on module load
loadFunnelsFromStorage();

// Save funnels to localStorage
const saveFunnels = (): void => {
  console.log('Saving funnels...');
  try {
    console.log('Saving funnels:', mockFunnels);
    localStorage.setItem(STORAGE_KEYS.FUNNELS, JSON.stringify(mockFunnels));
    console.log('Successfully saved funnels to localStorage');
  } catch (error) {
    console.error('Error saving funnels to localStorage:', error);
  }
};

export const FunnelApi = {
  // List funnels
  listFunnels: async (params?: { 
    limit?: number; 
    offset?: number; 
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastCalculatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<FunnelSummary[]> => {
    try {
      // Return mock data instead of making API call
      return mockFunnels.map(funnel => {
        // Calculate performance metrics from step data
        const enabledSteps = funnel.steps.filter(step => step.isEnabled);
        const totalVisitors = enabledSteps[0]?.visitorCount || 0;
        const finalStep = enabledSteps[enabledSteps.length - 1];
        const finalVisitors = finalStep?.visitorCount || 0;
        const conversionRate = totalVisitors > 0 ? (finalVisitors / totalVisitors) * 100 : 0;

        const performanceSteps = enabledSteps.map((step, index) => {
          const previousStep = index > 0 ? enabledSteps[index - 1] : null;
          const previousVisitors = previousStep?.visitorCount || totalVisitors;
          const stepConversionRate = previousVisitors > 0 ? (step.visitorCount / previousVisitors) * 100 : 0;

          return {
            id: step.id,
            name: step.name,
            visitorCount: step.visitorCount || 0,
            conversionRate: stepConversionRate
          };
        });

        return {
          id: funnel.id!,
          name: funnel.name,
          description: funnel.description,
          createdAt: funnel.createdAt!,
          updatedAt: funnel.updatedAt!,
          lastCalculatedAt: funnel.lastCalculatedAt!,
          performance: {
            totalVisitors,
            conversionRate,
            steps: performanceSteps
          }
        };
      });
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Get funnel by ID
  getFunnel: async (id: string): Promise<Funnel> => {
    try {
      // Return mock data instead of making API call
      const funnel = mockFunnels.find(f => f.id === id);
      if (!funnel) {
        throw new Error(`Funnel with ID ${id} not found`);
      }
      return funnel;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Create funnel
  createFunnel: async (funnel: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt' | 'lastCalculatedAt'>): Promise<Funnel> => {
    try {
      // Create mock funnel
      const newFunnel: Funnel = {
        ...funnel,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastCalculatedAt: null
      };
      
      mockFunnels.push(newFunnel);
      saveFunnels();
      
      return newFunnel;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Update funnel
  updateFunnel: async (id: string, funnel: Partial<Funnel>): Promise<Funnel> => {
    try {
      // Update mock funnel
      const index = mockFunnels.findIndex(f => f.id === id);
      if (index === -1) {
        throw new Error(`Funnel with ID ${id} not found`);
      }
      
      const updatedFunnel = {
        ...mockFunnels[index],
        ...funnel,
        updatedAt: new Date().toISOString()
      };
      
      mockFunnels[index] = updatedFunnel;
      saveFunnels();
      
      return updatedFunnel;
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Delete funnel
  deleteFunnel: async (id: string): Promise<void> => {
    try {
      // Delete mock funnel
      const index = mockFunnels.findIndex(f => f.id === id);
      if (index === -1) {
        throw new Error(`Funnel with ID ${id} not found`);
      }
      
      mockFunnels.splice(index, 1);
      saveFunnels();
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  // Calculate funnel results
  calculateFunnel: async (id: string): Promise<FunnelResults> => {
    try {
      const funnel = mockFunnels.find(f => f.id === id);
      if (!funnel) {
        throw new Error(`Funnel with ID ${id} not found`);
      }
      
      console.log('Calculating funnel:', funnel.name);
      
      const results: FunnelResults = {
        calculated: Date.now()
      };
      
      let previousValue = funnel.steps[0].visitorCount || 10000; // Default initial value if not set
      console.log('Initial value:', previousValue);
      results[funnel.steps[0].id] = previousValue; // Set initial step value
      console.log(`Step ${funnel.steps[0].name}:`, {
        value: previousValue,
        rate: '100%'
      });

      // Calculate realistic conversion rates based on funnel data structure
      funnel.steps.slice(1).forEach((step, index) => {
        // Use the visitor count from funnel data as the target value
        const targetValue = step.visitorCount || 0;
        const conversionRate = previousValue > 0 ? targetValue / previousValue : 0;
        
        // The API calculates the same value as specified in the funnel data
        results[step.id] = targetValue;
        
        console.log(`Step ${step.name}:`, {
          previousValue,
          calculatedValue: targetValue,
          rate: `${(conversionRate * 100).toFixed(1)}%`,
          isRequired: step.isRequired,
          visitorCount: targetValue
        });
        
        previousValue = targetValue;
        
        if (step.splitVariations && step.splitVariations.length > 0) {
          const stepValue = results[step.id];
          const numVariations = step.splitVariations.length;
          
          console.log(`Processing splits for ${step.name}:`, {
            totalValue: stepValue,
            variations: numVariations
          });

          // Calculate total visitor count from split variations to get proportions
          const totalSplitVisitorCount = step.splitVariations.reduce((total, variation) => {
            return total + (variation.visitorCount || 0);
          }, 0);

          step.splitVariations.forEach((variation, varIndex) => {
            const variationId = `${step.id}-variation-${varIndex + 1}`;
            
            // Calculate proportion based on the actual visitor counts in the funnel data
            const splitProportion = totalSplitVisitorCount > 0 ? (variation.visitorCount || 0) / totalSplitVisitorCount : 0;
            const variationValue = Math.round(stepValue * splitProportion);

            results[variationId] = variationValue;
            console.log(`Split ${variation.name}:`, {
              visitorCount: variation.visitorCount,
              calculatedValue: variationValue,
              proportion: totalSplitVisitorCount > 0 ? `${((variation.visitorCount || 0) / totalSplitVisitorCount * 100).toFixed(1)}%` : '0.0%',
              rate: stepValue > 0 ? `${((variationValue / stepValue) * 100).toFixed(1)}%` : '0.0%'
            });
          });
        }
      });
      
      // Post-calculation validation: Ensure each step has fewer users than the previous (except optional steps)
      funnel.steps.forEach((step, index) => {
        if (index === 0) return;
        
        const prevStep = funnel.steps[index - 1];
        const currentValue = results[step.id];
        const prevValue = results[prevStep.id];

        // CRITICAL: Each step must have fewer users than the previous (except optional steps)
        if (currentValue > prevValue && prevValue !== 0) {
            console.warn(`VIOLATION: ${step.name} has ${currentValue} users but previous step ${prevStep.name} has ${prevValue} users. Capping at previous step value.`);
            results[step.id] = prevValue; // Cap at previous step's value
        }

        // Log the validation result
        console.log(`Validation: ${step.name}: ${currentValue} users (${prevValue > 0 ? ((currentValue / prevValue) * 100).toFixed(1) : 0}% of previous) - ${currentValue <= prevValue ? '✅ VALID' : '❌ INVALID'}`);

        // Ensure split variations sum up correctly to the parent step value
        if (step.splitVariations && step.splitVariations.length > 0) {
          let calculatedSplitTotal = 0;
          step.splitVariations.forEach((_, varIndex) => {
            const variationId = `${step.id}-variation-${varIndex + 1}`;
            calculatedSplitTotal += results[variationId] || 0;
          });

          if (calculatedSplitTotal !== results[step.id] && results[step.id] !== undefined) {
            //This can happen due to rounding. Redistribute last split to match.
            if (calculatedSplitTotal > results[step.id]) {
                 console.warn(`Split total for ${step.name} (${calculatedSplitTotal}) exceeds step value (${results[step.id]}). Adjusting last split.`);
                 const lastVariationId = `${step.id}-variation-${step.splitVariations.length}`;
                 const diff = calculatedSplitTotal - results[step.id];
                 results[lastVariationId] = Math.max(0, (results[lastVariationId] || 0) - diff);

            } else if (calculatedSplitTotal < results[step.id]) {
                 console.warn(`Split total for ${step.name} (${calculatedSplitTotal}) is less than step value (${results[step.id]}). Adjusting last split.`);
                 const lastVariationId = `${step.id}-variation-${step.splitVariations.length}`;
                 const diff = results[step.id] - calculatedSplitTotal;
                 results[lastVariationId] = (results[lastVariationId] || 0) + diff;
            }
             // Re-log final split values after adjustment
            let recheckSplitTotal = 0;
            step.splitVariations.forEach((variation, varIndex) => {
                const variationId = `${step.id}-variation-${varIndex + 1}`;
                recheckSplitTotal += results[variationId] || 0;
                 console.log(`Split ${variation.name} (adjusted check):`, {
                    value: results[variationId],
                    rate: results[step.id] > 0 ? `${((results[variationId] / results[step.id]) * 100).toFixed(1)}%` : '0.0%'
                });
            });
             console.log(`Final split total for ${step.name} after adjustment: ${recheckSplitTotal} (Step value: ${results[step.id]})`);
          }
        }
      });
      
      console.log('Final results:', results);
      
      // Update the funnel data with the calculated results as the single source of truth
      const funnelIndex = mockFunnels.findIndex(f => f.id === id);
      if (funnelIndex !== -1) {
        mockFunnels[funnelIndex].lastCalculatedAt = new Date().toISOString();
        
        // Update each step with the calculated values
        mockFunnels[funnelIndex].steps.forEach(step => {
          if (results[step.id] !== undefined) {
            step.value = results[step.id]; // Set the calculated value
            step.visitorCount = results[step.id]; // Also update visitorCount for consistency
          }
          
          // Update split variations with calculated values
          if (step.splitVariations && step.splitVariations.length > 0) {
            step.splitVariations.forEach((variation, varIndex) => {
              const variationId = `${step.id}-variation-${varIndex + 1}`;
              if (results[variationId] !== undefined) {
                variation.visitorCount = results[variationId];
              }
            });
          }
        });
        
        saveFunnels();
      }
      
      return results;
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};
