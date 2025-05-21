import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FunnelStepCondition } from "@/types/funnel";

interface StepConditionBuilderProps {
  conditions: FunnelStepCondition[] | Record<string, any>;
  onChange: (conditions: FunnelStepCondition[]) => void;
}

export function StepConditionBuilder({ conditions, onChange }: StepConditionBuilderProps) {
  // Convert object conditions to array format if needed
  const normalizeConditions = (conds: FunnelStepCondition[] | Record<string, any>): FunnelStepCondition[] => {
    if (Array.isArray(conds)) {
      return conds;
    }
    
    // If it's an object with a single condition (like {event: 'page_view'})
    if (typeof conds === 'object' && conds !== null) {
      const condition: FunnelStepCondition = {
        id: crypto.randomUUID(),
        type: 'event',
        event: conds.event || '',
        count: 1,
        countOperator: 'at least',
        timeWindow: { value: 7, unit: 'days' },
        properties: Object.entries(conds)
          .filter(([key]) => key !== 'event')
          .map(([property, value]) => ({
            property,
            operator: 'is',
            value: String(value)
          }))
      };
      return [condition];
    }
    
    return [];
  };

  const [conditionItems, setConditionItems] = useState<FunnelStepCondition[]>(normalizeConditions(conditions));

  React.useEffect(() => {
    setConditionItems(normalizeConditions(conditions));
  }, [conditions]);

  const updateConditions = (newItems: FunnelStepCondition[]) => {
    setConditionItems(newItems);
    onChange(newItems);
  };

  const addCondition = () => {
    const newCondition: FunnelStepCondition = {
      id: crypto.randomUUID(),
      type: 'event',
      event: '',
      count: 1,
      countOperator: 'at least',
      timeWindow: { value: 7, unit: 'days' },
      properties: [],
    };
    updateConditions([...conditionItems, newCondition]);
  };

  const removeCondition = (id?: string) => {
    updateConditions(conditionItems.filter(item => item.id !== id));
  };

  const updateConditionItem = (id: string, updated: Partial<FunnelStepCondition>) => {
    const newItems = conditionItems.map(item =>
      item.id === id ? { ...item, ...updated } : item
    );
    updateConditions(newItems);
  };

  // TODO: Render UI for each condition type, support AND/OR nesting, property filters, etc.
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Step Conditions</Label>
        <p className="text-sm text-muted-foreground mt-1">
          This segment contains all users that...
        </p>
      </div>

      <div className="bg-gray-50 rounded-md p-4 space-y-3">
        {conditionItems.map((item, index) => (
          <div key={item.id || index} className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Event name"
              value={item.event || ''}
              onChange={e => updateConditionItem(item.id!, { event: e.target.value })}
              style={{ minWidth: 120 }}
            />
            <select
              className="border rounded px-2 py-1 text-sm"
              value={item.countOperator || 'at least'}
              onChange={e => updateConditionItem(item.id!, { countOperator: e.target.value as any })}
            >
              <option value="at least">at least</option>
              <option value="exactly">exactly</option>
              <option value="at most">at most</option>
            </select>
            <input
              type="number"
              className="border rounded px-2 py-1 text-sm w-16"
              value={item.count || 1}
              min={1}
              onChange={e => updateConditionItem(item.id!, { count: Number(e.target.value) })}
            />
            <span className="text-sm">times</span>
            <span className="text-sm">within</span>
            <input
              type="number"
              className="border rounded px-2 py-1 text-sm w-16"
              value={item.timeWindow?.value || 7}
              min={1}
              onChange={e => updateConditionItem(item.id!, { timeWindow: { ...item.timeWindow, value: Number(e.target.value) } })}
            />
            <select
              className="border rounded px-2 py-1 text-sm"
              value={item.timeWindow?.unit || 'days'}
              onChange={e => updateConditionItem(item.id!, { timeWindow: { ...item.timeWindow, unit: e.target.value as any } })}
            >
              <option value="days">days</option>
              <option value="hours">hours</option>
              <option value="minutes">minutes</option>
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeCondition(item.id)}
              className="flex-shrink-0"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCondition}
          className="flex items-center text-xs mt-2"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add condition
        </Button>
      </div>
    </div>
  );
}
