import React from "react";
import { FunnelStep as FunnelStepType, ConditionItem } from "@/types/funnel";
import SplitVariations from "./SplitVariations";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  CheckCircle,
  SkipForward
} from "lucide-react";
import { motion } from "framer-motion";
import { calculatePercentage, calculateTotalPercentage, getColorClass, getTextColorClass } from "./utils";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface FunnelStepProps {
  step: FunnelStepType;
  previousValue: number;
  isFirst?: boolean;
  editable?: boolean;
  onUpdateStep?: (stepId: string, changes: Partial<FunnelStepType>) => void;
  onRemoveStep?: (stepId: string) => void;
  onMoveStepUp?: (stepId: string) => void;
  onMoveStepDown?: (stepId: string) => void;
}

const FunnelStep: React.FC<FunnelStepProps> = ({ 
  step, 
  previousValue, 
  isFirst,
  editable = false,
  onUpdateStep,
  onRemoveStep,
  onMoveStepUp,
  onMoveStepDown
}) => {
  const currentValue = step.value || step.visitorCount || 0;
  const percentage = calculatePercentage(currentValue, previousValue);
  const totalPercentage = calculateTotalPercentage(currentValue, previousValue);
  const colorClass = getColorClass(percentage);
  const textColorClass = getTextColorClass(percentage);
  const isImprovement = percentage > 100;
  const isOptional = !step.isRequired;
  const bypassedUsers = previousValue - currentValue;
  const bypassPercentage = previousValue > 0 ? (bypassedUsers / previousValue) * 100 : 0;
  
  const renderCondition = (condition: ConditionItem, i: number) => {
    return (
      <div key={condition.eventName || i} className="mb-2 p-2 bg-gray-50 rounded border border-gray-100">
        <div className="font-medium text-gray-700 flex items-center gap-2">
          <span>Event:</span>
          <span className="text-blue-700">{condition.eventName}</span>
          <span className="text-gray-500">{condition.operator} {condition.count} times</span>
        </div>
        {condition.properties && condition.properties.length > 0 && (
          <div className="ml-4 mt-1">
            <div className="text-xs text-gray-500">Properties:</div>
            <ul className="list-disc ml-4">
              {condition.properties.map((prop, idx) => (
                <li key={idx} className="text-xs text-gray-700">
                  {prop.name} {prop.operator} {String(prop.value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const operatorOptions: ConditionItem["operator"][] = [
    'equals','contains','regex','startsWith','endsWith','isSet','isNotSet','isTrue','isFalse','greaterThan','lessThan','equalsNumeric','notEqualsNumeric','greaterThanNumeric','lessThanNumeric'
  ];

  // Mock event catalog for selection (inline list instead of dropdown)
  const mockEvents: string[] = [
    'Page Viewed',
    'Signup Started',
    'Signup Completed',
    'Email Verified',
    'Login',
    'Plan Selected',
    'Payment Initiated',
    'Payment Succeeded',
    'Onboarding Step Completed',
    'Invite Sent',
    'Invite Accepted'
  ];

  const handleConditionChange = (index: number, changes: Partial<ConditionItem>) => {
    const current = step.conditions?.orEventGroups ?? [];
    const updated = current.map((c, i) => i === index ? { ...c, ...changes } : c);
    const newConditions = { ...(step.conditions || { orEventGroups: [] }), orEventGroups: updated };
    onUpdateStep?.(step.id, { conditions: newConditions });
  };

  const addCondition = () => {
    const current = step.conditions?.orEventGroups ?? [];
    const newItem: ConditionItem = { eventName: '', operator: 'equals', count: 1, properties: [] };
    const newConditions = { ...(step.conditions || { orEventGroups: [] }), orEventGroups: [...current, newItem] };
    onUpdateStep?.(step.id, { conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const current = step.conditions?.orEventGroups ?? [];
    const updated = current.filter((_, i) => i !== index);
    const newConditions = { ...(step.conditions || { orEventGroups: [] }), orEventGroups: updated };
    onUpdateStep?.(step.id, { conditions: newConditions });
  };

  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="p-5">
        {/* Step Header - compact */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[360px]" title={step.name}>{step.name}</h3>
                {isOptional && (
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-300">Optional</Badge>
                )}
                {(step.conditions?.orEventGroups?.length || 0) > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-300">Conditions</Badge>
                )}
                {(step.splitVariations?.length || 0) > 0 && (
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-300">Splits</Badge>
                )}
              </div>
              {step.description && (
                <p className="text-sm text-gray-500 truncate max-w-[420px]" title={step.description}>{step.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="w-4 h-4" />
              <span className="text-xl font-bold">{currentValue.toLocaleString()}</span>
            </div>
            <div className="w-44 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full h-2 mt-1">
              <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{isOptional ? 'Completion Rate' : 'Conversion Rate'}</span>
              {isImprovement ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-800">{percentage.toFixed(1)}%</span>
              {!isFirst && (
                <span className="ml-2 text-sm text-gray-500">from {previousValue.toLocaleString()} users</span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{isOptional ? 'Bypass Rate' : 'Total Conversion'}</span>
              {isOptional ? (
                <SkipForward className="w-4 h-4 text-blue-500" />
              ) : (
                <span className={`text-sm ${textColorClass}`}>{totalPercentage.toFixed(1)}%</span>
              )}
            </div>
            {isOptional ? (
              <div className="flex items-baseline">
                <span className="text-2xl font-semibold text-blue-600">{bypassPercentage.toFixed(1)}%</span>
                <span className="ml-2 text-sm text-gray-500">bypassed ({bypassedUsers.toLocaleString()} users)</span>
              </div>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${Math.min(totalPercentage, 100)}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Optional Step Flow Summary */}
        {isOptional && bypassedUsers > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Completed Path</span>
                <span className="text-sm font-semibold text-green-600">{currentValue.toLocaleString()} users</span>
              </div>
              <div className="flex items-center gap-3">
                <SkipForward className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Bypassed Path</span>
                <span className="text-sm font-semibold text-blue-600">{bypassedUsers.toLocaleString()} users</span>
              </div>
            </div>
          </div>
        )}

        {/* Conditions (read-only summary collapsed by default) */}
        <div className="mt-4">
          <details className="group">
            <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-700">
              <ChevronRight className="w-4 h-4 mr-2 group-open:rotate-90 transition-transform" />
              Conditions
            </summary>
            <div className="mt-3 pl-6 grid grid-cols-1 gap-3">
              {step.conditions.orEventGroups.length === 0 ? (
                <div className="text-sm text-gray-500">No conditions.</div>
              ) : (
                <>
                  {step.conditions.orEventGroups.map(renderCondition)}
                  {step.conditions.andAlsoEvents?.map(renderCondition)}
                </>
              )}
            </div>
          </details>
        </div>

        {/* Split Variations */}
        {step.splitVariations && step.splitVariations.length > 0 && (
          <div className="mt-6">
            <SplitVariations split={step.splitVariations} parentValue={currentValue} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FunnelStep;
