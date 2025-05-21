import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get readable operator text
export function getReadableOperator(operator: string): string {
  switch (operator) {
    case "equals": return "=";
    case "contains": return "contains";
    case "startsWith": return "starts with";
    case "endsWith": return "ends with";
    case "greaterThan": return ">";
    case "lessThan": return "<";
    default: return operator;
  }
}
