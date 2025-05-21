
/**
 * Calculate percentage from previous step
 */
export const calculatePercentage = (value: number | undefined, previousValue: number): number => {
  if (!value || previousValue === 0) return 0;
  return (value / previousValue) * 100;
};

/**
 * Calculate percentage from initial value
 */
export const calculateTotalPercentage = (value: number | undefined, initialValue: number): number => {
  if (!value || initialValue === 0) return 0;
  return (value / initialValue) * 100;
};

/**
 * Determine color class based on percentage
 */
export const getColorClass = (percentage: number): string => {
  if (percentage >= 70) return "bg-green-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * Determine text color class based on percentage
 */
export const getTextColorClass = (percentage: number): string => {
  if (percentage >= 70) return "text-green-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
};
