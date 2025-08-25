import { Button } from "@/components/ui/button";
import { Plus, X, Info, Trash2 } from "lucide-react";
import { Conditions, ConditionItem, EventProperty } from "@/types/funnel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { predefinedEvents, eventProperties, propertyTypes } from "./data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AIConditionGenerator } from "./AIConditionGenerator";

interface StepConditionBuilderProps {
  conditions: Conditions;
  onChange: (conditions: Conditions) => void;
  stepName?: string;
}

export function StepConditionBuilder({ conditions, onChange, stepName }: StepConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: ConditionItem = {
      eventName: "",
      operator: "equals",
      count: 1,
      properties: []
    };

    onChange({
      ...conditions,
      orEventGroups: [...conditions.orEventGroups, newCondition]
    });
  };

  const removeCondition = (index: number) => {
    const newOrEvents = [...conditions.orEventGroups];
    newOrEvents.splice(index, 1);
    onChange({
      ...conditions,
      orEventGroups: newOrEvents
    });
  };

  const updateCondition = (index: number, field: keyof ConditionItem, value: string | number) => {
    const newOrEvents = [...conditions.orEventGroups];
    newOrEvents[index] = { ...newOrEvents[index], [field]: value };
    onChange({
      ...conditions,
      orEventGroups: newOrEvents
    });
  };

  const addProperty = (conditionIndex: number) => {
    const condition = conditions.orEventGroups[conditionIndex];
    const newProperty: EventProperty = {
      name: "",
      operator: "equals",
      value: "",
      type: "string",
      logicalLink: (condition?.properties?.length ?? 0) > 0 ? "AND" : undefined,
    };

    const newOrEvents = [...conditions.orEventGroups];
    newOrEvents[conditionIndex] = {
      ...newOrEvents[conditionIndex],
      properties: [...(newOrEvents[conditionIndex].properties || []), newProperty]
    };
    onChange({
      ...conditions,
      orEventGroups: newOrEvents
    });
  };

  const removeProperty = (conditionIndex: number, propertyIndex: number) => {
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
  };

  const updateProperty = (conditionIndex: number, propertyIndex: number, field: keyof EventProperty, value: string | number | boolean | readonly string[]) => {
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
  };

  const getConditionDescription = (condition: ConditionItem) => {
    if (!condition.eventName) return "Select an event";
    
    const event = predefinedEvents.find(e => e.value === condition.eventName);
    const eventName = event?.label || condition.eventName;
    
    let description = eventName;
    
    if (condition.count > 1) {
      description += ` (${condition.count}+ times)`;
    }
    
    if (condition.properties?.length) {
      description += ` + ${condition.properties.length} properties`;
    }
    
    return description;
  };

  const getOperatorsForProperty = (eventName: string, propertyName: string) => {
    const eventProps = eventProperties[eventName as keyof typeof eventProperties];
    if (!eventProps) return propertyTypes.string;
    
    const property = eventProps.find(prop => prop.name === propertyName);
    if (!property) return propertyTypes.string;
    
    return propertyTypes[property.type as keyof typeof propertyTypes] || propertyTypes.string;
  };

  return (
    <div className="space-y-3">
      {/* Compact Help Text */}
      <div className="text-sm text-gray-600 flex items-center gap-2">
        <Info className="h-3 w-3" />
        <span>Users see this step if they meet ANY condition (OR). Within a condition, properties are combined with AND/OR.</span>
      </div>

      {/* Conditions */}
      {conditions.orEventGroups.length === 0 ? (
        <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-md">
          <p className="text-sm mb-3">No conditions set</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={addCondition} size="sm" variant="outline" className="px-3">
              <Plus className="h-4 w-4 mr-1" />
              Add Condition
            </Button>
            <AIConditionGenerator 
              onGenerate={onChange} 
              stepName={stepName}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {conditions.orEventGroups.map((condition, index) => (
            <div key={index} className="space-y-3 border rounded-md p-3 bg-white">
              {/* Condition Header */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs h-5 px-2">OR {index + 1}</Badge>
                <span className="text-sm font-medium text-gray-800">
                  {getConditionDescription(condition)}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeCondition(index)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Event and Count - Inline */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-500 w-14">Event:</span>
                <Select
                  value={condition.eventName}
                  onValueChange={(value) => updateCondition(index, "eventName", value)}
                >
                  <SelectTrigger className="h-8 text-sm w-56">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedEvents.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-gray-500">Count:</span>
                <Input
                  type="number"
                  value={condition.count}
                  onChange={e => updateCondition(index, "count", parseInt(e.target.value) || 1)}
                  min="1"
                  placeholder="1"
                  className="h-8 text-sm w-24"
                />
              </div>

              {/* Properties */}
              {condition.eventName && eventProperties[condition.eventName as keyof typeof eventProperties] && (
                <div className="ml-1 md:ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Properties</span>
                    <Button
                      onClick={() => addProperty(index)}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-sm px-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {condition.properties?.map((property, propIndex) => {
                    const availableOperators = getOperatorsForProperty(condition.eventName, property.name);
                    return (
                      <div key={propIndex} className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto,1fr,auto] items-center gap-2 text-sm">
                        {propIndex > 0 && (
                          <Select
                            value={property.logicalLink || "AND"}
                            onValueChange={value => updateProperty(index, propIndex, "logicalLink", value)}
                          >
                            <SelectTrigger className="h-8 text-sm w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AND">AND</SelectItem>
                              <SelectItem value="OR">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        <Select
                          value={property.name}
                          onValueChange={(value) => updateProperty(index, propIndex, "name", value)}
                        >
                          <SelectTrigger className="h-8 text-sm w-48">
                            <SelectValue placeholder="Property" />
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
                          onValueChange={(value) => updateProperty(index, propIndex, "operator", value)}
                        >
                          <SelectTrigger className="h-8 text-sm w-28">
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableOperators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          value={property.value as string}
                          onChange={e => updateProperty(index, propIndex, "value", e.target.value)}
                          placeholder="Value"
                          className="h-8 text-sm w-48"
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeProperty(index, propIndex)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {index < conditions.orEventGroups.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Condition Button */}
      {conditions.orEventGroups.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={addCondition} variant="outline" size="sm" className="flex-1 h-8 text-sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Another Condition
          </Button>
          <AIConditionGenerator 
            onGenerate={onChange} 
            stepName={stepName}
          />
        </div>
      )}
    </div>
  );
}
