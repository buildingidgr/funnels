import { Funnel, FunnelResults, FunnelSummary } from "@/types/funnel";
import { exampleFunnel } from "@/types/funnelExample";
import { exampleFunnel4 } from "@/types/funnelExample4";
import { exampleFunnel5 } from "@/types/funnelExample5";
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
  }
];

// Initialize mock funnels from localStorage or use default
let mockFunnels: Funnel[] = [];

// Function to reset funnels to default
export const resetFunnels = (): void => {
  console.log('Resetting funnels to default...');
  try {
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.FUNNELS);
    console.log('Successfully cleared localStorage');
    
    // Initialize with default funnels
    mockFunnels = [...defaultFunnels];
    console.log('Initialized with default funnels:', mockFunnels);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.FUNNELS, JSON.stringify(mockFunnels));
    console.log('Successfully saved default funnels to localStorage');
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
      return mockFunnels.map(funnel => ({
        id: funnel.id!,
        name: funnel.name,
        description: funnel.description,
        createdAt: funnel.createdAt!,
        updatedAt: funnel.updatedAt!,
        lastCalculatedAt: funnel.lastCalculatedAt!
      }));
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

      // Base conversion rate ranges
      const baseRequiredConvRate = { min: 0.30, max: 0.70 }; // e.g., 30-70%
      const baseOptionalConvRate = { min: 0.10, max: 0.40 }; // e.g., 10-40%
      const conversionDecayFactor = 0.05; // Reduce max conversion rate by 5% for each subsequent step

      funnel.steps.slice(1).forEach((step, index) => {
        const effectiveIndex = index + 1; // True index in the funnel steps array
        let minConv, maxConv;

        if (!step.isRequired) {
          minConv = baseOptionalConvRate.min;
          maxConv = Math.max(baseOptionalConvRate.min, baseOptionalConvRate.max - (effectiveIndex * conversionDecayFactor));
        } else {
          minConv = baseRequiredConvRate.min;
          maxConv = Math.max(baseRequiredConvRate.min, baseRequiredConvRate.max - (effectiveIndex * conversionDecayFactor));
        }
        
        const conversionRate = minConv + Math.random() * (maxConv - minConv);
        const newValue = Math.round(previousValue * conversionRate);
        results[step.id] = newValue;
        
        console.log(`Step ${step.name}:`, {
          previousValue,
          newValue,
          rate: `${(conversionRate * 100).toFixed(1)}%`,
          isRequired: step.isRequired,
          minConv: (minConv*100).toFixed(1),
          maxConv: (maxConv*100).toFixed(1)
        });
        
        previousValue = newValue;
        
        if (step.splitVariations && step.splitVariations.length > 0) {
          const stepValue = results[step.id];
          let remainingValueForSplits = stepValue;
          const numVariations = step.splitVariations.length;
          
          console.log(`Processing splits for ${step.name}:`, {
            totalValue: stepValue,
            variations: numVariations
          });

          // Generate random proportions for splits
          let proportions = Array.from({ length: numVariations }, () => Math.random());
          const sumProportions = proportions.reduce((a, b) => a + b, 0);
          proportions = proportions.map(p => p / sumProportions); // Normalize

          step.splitVariations.forEach((variation, varIndex) => {
            const variationId = `${step.id}-variation-${varIndex + 1}`;
            let variationValue;

            if (varIndex === numVariations - 1) {
              variationValue = remainingValueForSplits; // Assign remaining to the last split
            } else {
              variationValue = Math.round(stepValue * proportions[varIndex]);
              remainingValueForSplits -= variationValue;
            }
            // Ensure non-negative if previous rounding led to issues
            variationValue = Math.max(0, variationValue);
            if(remainingValueForSplits < 0 && varIndex < numVariations -1) remainingValueForSplits = 0;


            results[variationId] = variationValue;
            console.log(`Split ${variation.name}${varIndex === numVariations -1 ? ' (last)' : ''}:`, {
              value: variationValue,
              rate: stepValue > 0 ? `${((variationValue / stepValue) * 100).toFixed(1)}%` : '0.0%',
              proportion: (proportions[varIndex]*100).toFixed(1)
            });
          });
        }
      });
      
      // Post-calculation adjustments (e.g., capping rates if necessary)
      // This part is simplified as the new logic should inherently produce more realistic rates.
      // However, we can add a final check to ensure values are consistent.
      funnel.steps.forEach((step, index) => {
        if (index === 0) return;
        
        const prevStep = funnel.steps[index - 1];
        const currentValue = results[step.id];
        const prevValue = results[prevStep.id];

        // Optional: Add a cap if a step somehow ended up with more than its predecessor (should not happen with current logic)
        if (currentValue > prevValue && prevValue !== 0) {
            console.warn(`Adjusting ${step.name} value as it exceeded previous step:`, {
                from: currentValue,
                to: prevValue,
            });
            results[step.id] = prevValue; // Cap at previous step's value
        }

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
      // Update lastCalculatedAt timestamp for the funnel
      const funnelIndex = mockFunnels.findIndex(f => f.id === id);
      if (funnelIndex !== -1) {
        mockFunnels[funnelIndex].lastCalculatedAt = new Date().toISOString();
        saveFunnels();
      }
      
      return results;
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};
