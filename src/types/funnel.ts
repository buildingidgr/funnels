export interface Timeframe {
  from: number;
  to: number;
}

export interface EventProperty {
  name: string;
  operator: 'equals' | 'contains' | 'regex' | 'startsWith' | 'endsWith' | 'isSet' | 'isNotSet' | 'isTrue' | 'isFalse' | 'greaterThan' | 'lessThan' | 'equalsNumeric' | 'notEqualsNumeric' | 'greaterThanNumeric' | 'lessThanNumeric';
  value: string | number | readonly string[];
  type: 'string' | 'number' | 'boolean' | 'date';
  logicalLink?: 'AND' | 'OR';
}

export interface TimeWindow {
  type: 'anytime' | 'relative';
  value?: number;
  unit?: 'days' | 'hours' | 'minutes' | 'weeks' | 'months';
}

export interface OccurrenceDetails {
  operator: 'atLeast' | 'atMost' | 'exactly' | 'between';
  count: number;
  count2?: number;
  timeWindow?: TimeWindow;
}

export interface PrimaryEventDetails {
  type: string;
  properties?: EventProperty[];
  occurrence?: OccurrenceDetails;
}

export interface FilterClause {
  logicalLink?: 'AND' | 'OR';
  sourceType: 'userAttribute' | 'eventProperty' | 'utmParameter';
  propertyName: string;
  operator: string;
  value: string | number | boolean | readonly string[];
}

export interface EventConditionDefinition {
  primaryEvent: PrimaryEventDetails;
  filters?: FilterClause[];
}

export interface ConditionItem {
  eventName: string;
  operator: 'equals' | 'contains' | 'regex' | 'startsWith' | 'endsWith' | 'isSet' | 'isNotSet' | 'isTrue' | 'isFalse' | 'greaterThan' | 'lessThan' | 'equalsNumeric' | 'notEqualsNumeric' | 'greaterThanNumeric' | 'lessThanNumeric';
  count: number;
  properties?: EventProperty[];
  occurrence?: OccurrenceDetails;
}

export interface Conditions {
  orEventGroups: ConditionItem[];
  andAlsoEvents?: ConditionItem[];
}

export interface SplitVariation {
  id: string;
  name: string;
  visitorCount?: number;
  conditions: Conditions;
}

export interface FunnelStep {
  id: string;
  name: string;
  description?: string;
  displayColor?: string;
  order: number;
  visitorCount?: number;
  /**
   * Direct numerical value used by some visualisation hooks. In most cases this mirrors
   * `visitorCount` but the visualisation code expects a `value` property, so we're
   * exposing it here to avoid TypeScript errors.
   */
  value?: number;
  /**
   * Lightweight representation for split sub-steps (A/B variations, etc.) that the
   * Sankey graph renders individually. This is separate from `splitVariations` which
   * already contains richer information but is not always present.
   */
  split?: { name: string; value?: number }[];
  isEnabled: boolean;
  isRequired: boolean;
  isVisible?: boolean;
  isOptional?: boolean;
  aiEnabled?: boolean;
  conditions: Conditions;
  splitVariations?: SplitVariation[];
}

export interface Funnel {
  id?: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  lastCalculatedAt?: string;
  lastUpdated?: number;
  timeframe: Timeframe;
  performedBy: string;
  steps: FunnelStep[];
}

export interface FunnelSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lastCalculatedAt: string | null;
  performance?: {
    totalVisitors: number;
    conversionRate: number;
    steps: {
      id: string;
      name: string;
      visitorCount: number;
      conversionRate: number;
    }[];
  };
}

export type FunnelResults = Record<string, number> & { calculated: number };
