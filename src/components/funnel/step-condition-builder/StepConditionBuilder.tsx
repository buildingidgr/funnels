import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Conditions, ConditionItem, EventProperty } from "@/types/funnel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { predefinedEvents, operators, eventProperties, propertyTypes } from "./data";
import { Input } from "@/components/ui/input";

interface StepConditionBuilderProps {
  conditions: Conditions;
  onChange: (conditions: Conditions) => void;
}

export function StepConditionBuilder({ conditions, onChange }: StepConditionBuilderProps) {
  const addCondition = (isAnd: boolean) => {
    const newCondition: ConditionItem = {
      eventName: "",
      operator: "equals",
      count: 1,
      properties: []
    };

    if (isAnd) {
      onChange({
        ...conditions,
        andAlsoEvents: [...(conditions.andAlsoEvents || []), newCondition]
      });
    } else {
      onChange({
        ...conditions,
        orEventGroups: [...conditions.orEventGroups, newCondition]
      });
    }
  };

  const removeCondition = (index: number, isAnd: boolean) => {
    if (isAnd) {
      const newAndEvents = [...(conditions.andAlsoEvents || [])];
      newAndEvents.splice(index, 1);
      onChange({
        ...conditions,
        andAlsoEvents: newAndEvents
      });
    } else {
      const newOrEvents = [...conditions.orEventGroups];
      newOrEvents.splice(index, 1);
      onChange({
        ...conditions,
        orEventGroups: newOrEvents
      });
    }
  };

  const updateCondition = (index: number, field: keyof ConditionItem, value: any, isAnd: boolean) => {
    if (isAnd) {
      const newAndEvents = [...(conditions.andAlsoEvents || [])];
      newAndEvents[index] = { ...newAndEvents[index], [field]: value };
      onChange({
        ...conditions,
        andAlsoEvents: newAndEvents
      });
    } else {
      const newOrEvents = [...conditions.orEventGroups];
      newOrEvents[index] = { ...newOrEvents[index], [field]: value };
      onChange({
        ...conditions,
        orEventGroups: newOrEvents
      });
    }
  };

  const addProperty = (conditionIndex: number, isAnd: boolean) => {
    const newProperty: EventProperty = {
      name: "",
      operator: "equals",
      value: "",
      type: "string"
    };

    if (isAnd) {
      const newAndEvents = [...(conditions.andAlsoEvents || [])];
      newAndEvents[conditionIndex] = {
        ...newAndEvents[conditionIndex],
        properties: [...(newAndEvents[conditionIndex].properties || []), newProperty]
      };
      onChange({
        ...conditions,
        andAlsoEvents: newAndEvents
      });
    } else {
      const newOrEvents = [...conditions.orEventGroups];
      newOrEvents[conditionIndex] = {
        ...newOrEvents[conditionIndex],
        properties: [...(newOrEvents[conditionIndex].properties || []), newProperty]
      };
      onChange({
        ...conditions,
        orEventGroups: newOrEvents
      });
    }
  };

  const removeProperty = (conditionIndex: number, propertyIndex: number, isAnd: boolean) => {
    if (isAnd) {
      const newAndEvents = [...(conditions.andAlsoEvents || [])];
      const properties = [...(newAndEvents[conditionIndex].properties || [])];
      properties.splice(propertyIndex, 1);
      newAndEvents[conditionIndex] = {
        ...newAndEvents[conditionIndex],
        properties
      };
      onChange({
        ...conditions,
        andAlsoEvents: newAndEvents
      });
    } else {
      const newOrEvents = [...conditions.orEventGroups];
      const properties = [...(newOrEvents[conditionIndex].properties || [])];
      properties.splice(propertyIndex, 1);
      newOrEvents[conditionIndex] = {
        ...newOrEvents[conditionIndex],
        properties
      };
      onChange({
        ...conditions,
        orEventGroups: newOrEvents
      });
    }
  };

  const updateProperty = (conditionIndex: number, propertyIndex: number, field: keyof EventProperty, value: any, isAnd: boolean) => {
    if (isAnd) {
      const newAndEvents = [...(conditions.andAlsoEvents || [])];
      const properties = [...(newAndEvents[conditionIndex].properties || [])];
      properties[propertyIndex] = { ...properties[propertyIndex], [field]: value };
      newAndEvents[conditionIndex] = {
        ...newAndEvents[conditionIndex],
        properties
      };
      onChange({
        ...conditions,
        andAlsoEvents: newAndEvents
      });
    } else {
      const newOrEvents = [...conditions.orEventGroups];
      const properties = [...(newOrEvents[conditionIndex].properties || [])];
      properties[propertyIndex] = { ...properties[propertyIndex], [field]: value };
      newOrEvents[conditionIndex] = {
        ...newOrEvents[conditionIndex],
        properties
      };
      onChange({
        ...conditions,
        orEventGroups: newOrEvents
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Step Conditions</Label>
        <p className="text-sm text-muted-foreground mt-1">
          This segment contains all users that...
        </p>
      </div>

      <div className="bg-gray-50 rounded-md p-4 space-y-3">
        {/* OR Group */}
        {conditions.orEventGroups.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">OR Group</div>
            {conditions.orEventGroups.map((condition, index) => (
              <div key={`or-${index}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={condition.eventName}
                    onValueChange={(value) => updateCondition(index, "eventName", value, false)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedEvents.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, "operator", value, false)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={condition.count}
                    onChange={(e) => updateCondition(index, "count", parseInt(e.target.value), false)}
                    className="w-[100px]"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index, false)}
                  >
                    Remove
                  </Button>
                </div>

                {/* Event Properties */}
                {condition.eventName && eventProperties[condition.eventName as keyof typeof eventProperties] && (
                  <div className="ml-4 space-y-2">
                    {condition.properties?.map((property, propIndex) => (
                      <div key={propIndex} className="flex items-center gap-2">
                        <Select
                          value={property.name}
                          onValueChange={(value) => updateProperty(index, propIndex, "name", value, false)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventProperties[condition.eventName as keyof typeof eventProperties].map((prop) => (
                              <SelectItem key={prop.name} value={prop.name}>
                                {prop.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={property.operator}
                          onValueChange={(value) => updateProperty(index, propIndex, "operator", value, false)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyTypes[property.type].map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type={property.type === "number" ? "number" : "text"}
                          value={property.value as string}
                          onChange={(e) => updateProperty(index, propIndex, "value", e.target.value, false)}
                          className="w-[150px]"
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProperty(index, propIndex, false)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addProperty(index, false)}
                    >
                      Add Property
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AND Group */}
        {conditions.andAlsoEvents?.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">AND Group</div>
            {conditions.andAlsoEvents.map((condition, index) => (
              <div key={`and-${index}`} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={condition.eventName}
                    onValueChange={(value) => updateCondition(index, "eventName", value, true)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedEvents.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(index, "operator", value, true)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    value={condition.count}
                    onChange={(e) => updateCondition(index, "count", parseInt(e.target.value), true)}
                    className="w-[100px]"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index, true)}
                  >
                    Remove
                  </Button>
                </div>

                {/* Event Properties */}
                {condition.eventName && eventProperties[condition.eventName as keyof typeof eventProperties] && (
                  <div className="ml-4 space-y-2">
                    {condition.properties?.map((property, propIndex) => (
                      <div key={propIndex} className="flex items-center gap-2">
                        <Select
                          value={property.name}
                          onValueChange={(value) => updateProperty(index, propIndex, "name", value, true)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventProperties[condition.eventName as keyof typeof eventProperties].map((prop) => (
                              <SelectItem key={prop.name} value={prop.name}>
                                {prop.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={property.operator}
                          onValueChange={(value) => updateProperty(index, propIndex, "operator", value, true)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyTypes[property.type].map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type={property.type === "number" ? "number" : "text"}
                          value={property.value as string}
                          onChange={(e) => updateProperty(index, propIndex, "value", e.target.value, true)}
                          className="w-[150px]"
                        />

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProperty(index, propIndex, true)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addProperty(index, true)}
                    >
                      Add Property
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value="or"
              onValueChange={(value) => addCondition(value === "and")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>Add Condition</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="or">Add OR Condition</SelectItem>
                <SelectItem value="and">Add AND Condition</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
