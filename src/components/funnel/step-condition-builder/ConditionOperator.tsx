
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { operators } from "./data";

interface ConditionOperatorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ConditionOperator({ value, onChange }: ConditionOperatorProps) {
  return (
    <div className="w-32">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
