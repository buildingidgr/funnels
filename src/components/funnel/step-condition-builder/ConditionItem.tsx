
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash, Tag } from "lucide-react";
import { ConditionItemType } from "./types";
import { ConditionOperator } from "./ConditionOperator";
import { properties } from "./data";

interface ConditionItemProps {
  condition: ConditionItemType;
  index: number;
  onUpdate: (field: 'property' | 'operator' | 'value', value: string) => void;
  onRemove: () => void;
}

export function ConditionItem({ condition, index, onUpdate, onRemove }: ConditionItemProps) {
  return (
    <div className="space-y-2">
      {index > 0 && (
        <div className="flex items-center">
          <Select value="and" onValueChange={() => {}}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="and">and/or</SelectItem>
              <SelectItem value="or">or</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-shrink-0">
          <span className="text-sm text-gray-500">where</span>
        </div>
        
        <div className="flex-grow min-w-[180px]">
          <Select
            value={condition.property}
            onValueChange={(value) => onUpdate('property', value)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select property" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {properties.map((prop) => (
                <SelectItem key={prop.value} value={prop.value}>
                  {prop.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <ConditionOperator
          value={condition.operator}
          onChange={(value) => onUpdate('operator', value)}
        />
        
        <div className="flex-grow">
          <Input
            placeholder="Enter a value"
            value={condition.value}
            onChange={(e) => onUpdate('value', e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="flex-shrink-0"
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Remove condition</span>
        </Button>
      </div>
    </div>
  );
}
