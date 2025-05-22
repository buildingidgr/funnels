import { Funnel, FunnelResults, FunnelSummary } from "@/types/funnel";
import { exampleFunnel } from "@/types/funnelExample";
import { exampleFunnel2 } from "@/types/funnelExample2";
import { exampleFunnel3 } from "@/types/funnelExample3";
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
    ...exampleFunnel2,
    id: 'content-engagement-funnel-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastCalculatedAt: null
  },
  {
    ...exampleFunnel3,
    id: 'travel-booking-funnel-001',
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
      // Return mock calculation results
      const funnel = mockFunnels.find(f => f.id === id);
      if (!funnel) {
        throw new Error(`Funnel with ID ${id} not found`);
      }
      
      const results: FunnelResults = {
        calculated: Date.now()
      };
      
      // Generate realistic conversion rates
      let previousValue = funnel.steps[0].visitorCount || 10000;
      
      // Add step results with realistic conversion rates
      funnel.steps.forEach((step, index) => {
        if (index === 0) {
          // First step keeps its original value
          results[step.id] = previousValue;
        } else {
          // Calculate conversion rate based on step type
          let conversionRate;
          if (!step.isRequired) {
            // Optional steps have lower conversion rates (30-50%)
            conversionRate = 0.3 + Math.random() * 0.2;
          } else {
            // Required steps have higher conversion rates (40-70%)
            conversionRate = 0.4 + Math.random() * 0.3;
          }
          
          // Apply conversion rate to get new value
          const newValue = Math.round(previousValue * conversionRate);
          results[step.id] = newValue;
          previousValue = newValue;
        }
        
        // Handle split variations if they exist
        if (step.splitVariations) {
          const totalVariations = step.splitVariations.length;
          let remainingValue = results[step.id];
          
          step.splitVariations.forEach((variation, varIndex) => {
            const variationId = `${step.id}-variation-${varIndex + 1}`;
            
            // For the last variation, use remaining value
            if (varIndex === totalVariations - 1) {
              results[variationId] = remainingValue;
            } else {
              // For other variations, use 40-60% of remaining value
              const splitRate = 0.4 + Math.random() * 0.2;
              const variationValue = Math.round(remainingValue * splitRate);
              results[variationId] = variationValue;
              remainingValue -= variationValue;
            }
          });
        }
      });
      
      return results;
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};
