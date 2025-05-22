export interface Timeframe {
  from: number;
  to: number;
}

export interface EventProperty {
  name: string;
  operator: 'equals' | 'contains' | 'regex' | 'startsWith' | 'endsWith' | 'isSet' | 'isNotSet' | 'isTrue' | 'isFalse' | 'greaterThan' | 'lessThan' | 'equalsNumeric' | 'notEqualsNumeric' | 'greaterThanNumeric' | 'lessThanNumeric';
  value: string | number | readonly string[];
  type: 'string' | 'number' | 'boolean' | 'date';
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
  value: any;
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
  displayColor?: string;
  order: number;
  visitorCount?: number;
  isEnabled: boolean;
  isRequired: boolean;
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
}

export type FunnelResults = Record<string, number> & { calculated: number };
