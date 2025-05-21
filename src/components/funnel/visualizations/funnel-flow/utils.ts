
/**
 * Calculate conversion rate between current and previous values
 */
export const calculateConversion = (current: number | undefined, previous: number): number => {
  if (!current || previous <= 0) return 0;
  return (current / previous) * 100;
};

/**
 * Calculate dropoff between previous and current values
 */
export const calculateDropoff = (current: number | undefined, previous: number): number => {
  if (!current) return previous;
  return Math.max(0, previous - current);
};

/**
 * Get color class based on conversion rate
 */
export const getConversionColor = (conversionRate: number): string => {
  if (conversionRate >= 80) return "bg-green-500";
  if (conversionRate >= 60) return "bg-green-400";
  if (conversionRate >= 40) return "bg-yellow-500";
  if (conversionRate >= 20) return "bg-orange-500";
  return "bg-red-500";
};
