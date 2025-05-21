import { Funnel as FunnelType } from './types/funnel';
import { exampleFunnel } from './types/funnelExample';

// Use the imported Funnel type
type Funnel = FunnelType;

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