import { Funnel, FunnelResults } from './types/funnel';
import { exampleFunnel } from './types/funnelExample';

// Store funnels in memory
let funnels: Funnel[] = [exampleFunnel];

// Use the imported Funnel type
type FunnelType = Funnel;

const DEFAULT_FUNNEL: Funnel = {
  ...exampleFunnel,
  id: 'ecommerce-funnel-001',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastCalculatedAt: null
};

// Helper function to safely parse dates
function safeParseDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    
    // If the date is in the future, return current date
    if (date > new Date()) {
      return new Date().toISOString();
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

// Helper function to validate and fix funnel dates
function validateFunnelDates(funnel: any): Funnel {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  
  // Ensure all dates are valid and not in the future
  const createdAt = safeParseDate(funnel.createdAt) || new Date().toISOString();
  const updatedAt = safeParseDate(funnel.updatedAt) || new Date().toISOString();
  const lastCalculatedAt = safeParseDate(funnel.lastCalculatedAt);
  
  // Ensure timeframe is valid
  const timeframe = {
    from: typeof funnel.timeframe?.from === 'number' 
      ? Math.max(Math.min(funnel.timeframe.from, now), thirtyDaysAgo)
      : thirtyDaysAgo,
    to: typeof funnel.timeframe?.to === 'number' 
      ? Math.min(funnel.timeframe.to, now)
      : now
  };

  return {
    ...funnel,
    createdAt,
    updatedAt,
    lastCalculatedAt,
    timeframe
  };
}

// Function to clear localStorage
export function clearFunnelsFromStorage(): void {
  try {
    localStorage.removeItem('funnels');
    console.log('Cleared funnels from localStorage');
  } catch (error) {
    console.error('Error clearing funnels from localStorage:', error);
  }
}

// Function to load funnels from localStorage
export function loadFunnelsFromStorage(): Funnel[] | null {
  try {
    const storedFunnels = localStorage.getItem('funnels');
    if (!storedFunnels) {
      console.log('No funnels found in localStorage');
      return null;
    }
    
    const parsedFunnels = JSON.parse(storedFunnels);
    if (!Array.isArray(parsedFunnels) || parsedFunnels.length === 0) {
      console.log('Invalid funnel data in localStorage');
      return null;
    }

    // If we find the old travel agency funnel, clear it
    if (parsedFunnels.some(funnel => funnel.id === 'travel-agency-funnel-001')) {
      console.log('Found old travel agency funnel, clearing localStorage');
      clearFunnelsFromStorage();
      return null;
    }

    console.log('Validating funnel dates...');
    const validatedFunnels = parsedFunnels.map(validateFunnelDates);
    console.log('Funnel dates validated successfully');
    
    return validatedFunnels;
  } catch (error) {
    console.error('Error loading funnels from localStorage:', error);
    clearFunnelsFromStorage(); // Clear on error
    return null;
  }
}

// Function to save funnels to localStorage
export function saveFunnelsToStorage(funnels: Funnel[]): void {
  try {
    // Validate dates before saving
    const validatedFunnels = funnels.map(validateFunnelDates);
    localStorage.setItem('funnels', JSON.stringify(validatedFunnels));
    console.log('Funnels saved to localStorage successfully');
  } catch (error) {
    console.error('Error saving funnels to localStorage:', error);
  }
}

// Initialize with default funnel if none exists
export function initializeFunnels(): Funnel[] {
  // Always clear localStorage first
  clearFunnelsFromStorage();
  
  // Then initialize with our new default funnel
  console.log('Initializing with new default funnel:', DEFAULT_FUNNEL);
  saveFunnelsToStorage([DEFAULT_FUNNEL]);
  return [DEFAULT_FUNNEL];
}

export const FunnelApi = {
  calculateFunnel: async (funnelId: string): Promise<FunnelResults> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const funnel = funnels.find(f => f.id === funnelId);
    if (!funnel) {
      throw new Error('Funnel not found');
    }

    const results: FunnelResults = {
      calculated: Date.now()
    };
    let currentValue = 1000; // Default initial value

    // Helper function to generate a random conversion rate with more variation
    const generateConversionRate = (isRequired: boolean, isSplitStep: boolean = false) => {
      // Base rate is higher for required steps
      const baseRate = isRequired ? 0.4 : 0.3;
      // Add more randomization
      const randomFactor = Math.random() * 0.4; // 0 to 0.4
      // For split steps, ensure lower conversion rates
      const splitAdjustment = isSplitStep ? -0.2 : 0;
      // Cap at 0.8 (80%)
      return Math.min(0.8, Math.max(0.1, baseRate + randomFactor + splitAdjustment));
    };

    // Helper function to generate a random split percentage
    const generateSplitPercentage = (remainingVariations: number) => {
      if (remainingVariations === 1) {
        // Last variation gets remaining value, but with some loss
        return 0.8 + Math.random() * 0.2; // 80-100% of remaining
      }
      // More randomization for splits
      const basePercentage = 0.3 + Math.random() * 0.3; // 30-60%
      return Math.min(0.8, basePercentage); // Cap at 80%
    };

    // Process each step
    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const hasSplits = step.splitVariations && step.splitVariations.length > 0;
      
      // Calculate conversion rate for this step
      const conversionRate = generateConversionRate(step.isRequired, hasSplits);
      const stepValue = Math.floor(currentValue * conversionRate);
      results[step.id] = stepValue;

      // Handle split variations if they exist
      if (hasSplits) {
        let remainingValue = stepValue;
        let remainingVariations = step.splitVariations.length;

        step.splitVariations.forEach((variation, index) => {
          const splitPercentage = generateSplitPercentage(remainingVariations);
          const variationValue = index === step.splitVariations.length - 1
            ? Math.floor(remainingValue * splitPercentage) // Last variation gets remaining value with some loss
            : Math.floor(remainingValue * splitPercentage);

          results[`${step.id}-variation-${index + 1}`] = variationValue;
          remainingValue -= variationValue;
          remainingVariations--;
        });

        // If there's a next step, apply additional conversion rate for split paths
        if (i < funnel.steps.length - 1) {
          const nextStep = funnel.steps[i + 1];
          const splitConversionRate = generateConversionRate(nextStep.isRequired, true);
          currentValue = Math.floor(stepValue * splitConversionRate);
        } else {
          currentValue = stepValue;
        }
      } else {
        currentValue = stepValue;
      }
    }

    return results;
  },
}; 