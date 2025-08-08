import React, { useMemo, useState } from "react";
import { FunnelStep } from "@/types/funnel";
import {
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Users,
  Info,
  List as ListIcon,
  BarChart2,
  Filter,
  Target,
  Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface DropOffDetailsProps {
  steps: FunnelStep[];
  initialValue: number;
  revenuePerConversion?: number; // Optional: revenue per successful conversion
  funnelType?: 'ecommerce' | 'saas' | 'lead-gen' | 'mobile-app' | 'content' | 'support'; // Funnel type for better insights
}

interface ChartData {
  name: string;
  value: number;
  dropOff: string;
  dropOffRaw: number;
  dropOffValue: number;
  previousStep: string;
  previousValue: number;
  fill: string;
  conversionRate: string;
}

export const DropOffDetails: React.FC<DropOffDetailsProps> = ({ steps, initialValue, revenuePerConversion, funnelType = 'ecommerce' }) => {
  // Filter out disabled steps using the correct property name
  const enabledSteps = steps.filter(step => step.isEnabled);
  
  if (enabledSteps.length <= 1) {
    return (
      <div className="flex items-center justify-center p-4 text-sm border rounded-md bg-gray-50 text-gray-500 gap-2">
        <AlertCircle size={16} />
        <span>At least two steps are needed to show drop-off details.</span>
      </div>
    );
  }

  // Function to calculate drop-off percentage between steps
  const calculateDropOff = (currentValue: number | undefined, previousValue: number): number => {
    if (!currentValue) return 100;
    return 100 - (currentValue / previousValue * 100);
  };
  
  // Function to calculate conversion rate between steps
  const calculateConversion = (currentValue: number | undefined, previousValue: number): number => {
    if (!currentValue || previousValue <= 0) return 0;
    return (currentValue / previousValue) * 100;
  };

  // Get color based on drop-off rate
  const getStepColor = (dropOffPercentage: number): string => {
    if (dropOffPercentage < 20) return "#22c55e"; // Green for low drop-off
    if (dropOffPercentage < 50) return "#f59e0b"; // Yellow/amber for medium drop-off
    return "#ef4444"; // Red for high drop-off
  };

  // Prepare chart data - exclude the first step from drop-off analysis since it's the starting point
  const chartData: ChartData[] = enabledSteps.slice(1).map((step, index) => {
    const previousValue = enabledSteps[index].visitorCount || 1; // Use the previous step's visitor count
    const currentValue = step.visitorCount || 0;
    const dropOffPercentage = calculateDropOff(currentValue, previousValue);
    const dropOffValue = previousValue - currentValue;
    const conversionRate = calculateConversion(currentValue, previousValue);
    
    return {
      name: step.name,
      value: currentValue,
      dropOff: dropOffPercentage.toFixed(1),
      dropOffRaw: dropOffPercentage,
      dropOffValue,
      previousStep: enabledSteps[index].name,
      previousValue,
      fill: getStepColor(dropOffPercentage),
      conversionRate: conversionRate.toFixed(1),
    };
  });

  // Local UI state
  const [viewMode, setViewMode] = useState<'list' | 'bars'>('list');
  const [sortBy, setSortBy] = useState<'dropoffPercent' | 'dropoffValue' | 'conversionRate' | 'name'>('dropoffPercent');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [threshold, setThreshold] = useState<number>(25);
  const [whatIfPercent, setWhatIfPercent] = useState<number>(20);
  const [selectedStepName, setSelectedStepName] = useState<string>(chartData[0]?.name || '');

  const sortedData = useMemo(() => {
    const data = [...chartData];
    data.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortBy) {
        case 'dropoffPercent':
          av = a.dropOffRaw;
          bv = b.dropOffRaw;
          break;
        case 'dropoffValue':
          av = a.dropOffValue;
          bv = b.dropOffValue;
          break;
        case 'conversionRate':
          av = parseFloat(a.conversionRate);
          bv = parseFloat(b.conversionRate);
          break;
        case 'name':
          av = a.name.toLowerCase();
          bv = b.name.toLowerCase();
          break;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      }
      const an = Number(av);
      const bn = Number(bv);
      return sortDir === 'asc' ? an - bn : bn - an;
    });
    return data;
  }, [chartData, sortBy, sortDir]);

  const highRiskSteps = useMemo(() => chartData.filter(s => s.dropOffRaw >= threshold), [chartData, threshold]);

  // Find the highest drop-off step
  const highestDropOff = chartData.reduce((highest, current) => {
    return Number(current.dropOff) > Number(highest.dropOff) ? current : highest;
  }, chartData[0] || { 
    dropOff: "0", 
    previousStep: "Initial", 
    name: "Step", 
    dropOffValue: 0,
    conversionRate: "0"
  } as ChartData);
  
  // Find the most successful step (with lowest drop-off)
  const lowestDropOff = chartData.reduce((lowest, current) => {
    return Number(current.dropOff) < Number(lowest.dropOff) ? current : lowest;
  }, chartData[0] || { 
    dropOff: "100", 
    previousStep: "Initial", 
    name: "Step", 
    dropOffValue: 0,
    conversionRate: "0"
  } as ChartData);

  // Calculate overall funnel metrics
  const totalDropOff = chartData.reduce((sum, step) => sum + step.dropOffValue, 0);
  const overallConversionRate = ((enabledSteps[enabledSteps.length - 1].visitorCount / initialValue) * 100).toFixed(1);
  
  // Calculate business-focused insights based on funnel type
  const getRevenuePerConversion = () => {
    if (revenuePerConversion) return revenuePerConversion;
    
    // Default values based on funnel type
    const defaults = {
      'ecommerce': 75,
      'saas': 500,
      'lead-gen': 200,
      'mobile-app': 25,
      'content': 150,
      'support': 100
    };
    return defaults[funnelType] || 50;
  };

  const revenuePerConversionValue = getRevenuePerConversion();
  const potentialRevenue = totalDropOff * revenuePerConversionValue;
  const improvementOpportunity = ((totalDropOff / initialValue) * 100).toFixed(1);
  
  // Find the step with highest revenue impact
  const highestRevenueImpact = chartData.reduce((highest, current) => {
    return current.dropOffValue > highest.dropOffValue ? current : highest;
  }, chartData[0] || { dropOffValue: 0, name: "No data" } as ChartData);
  
  // Calculate potential improvement if we fix the biggest drop-off
  const potentialImprovement = ((highestRevenueImpact.dropOffValue / initialValue) * 100).toFixed(1);

  // What-if simulator
  const selectedStep = chartData.find(s => s.name === selectedStepName) || highestRevenueImpact;
  const whatIfRegainedUsers = Math.round((selectedStep?.dropOffValue || 0) * (whatIfPercent / 100));
  const whatIfRegainedRevenue = whatIfRegainedUsers * revenuePerConversionValue;

  const getSeverity = (p: number) => (p >= 50 ? 'High' : p >= 20 ? 'Medium' : 'Low');
  const getSeverityClasses = (p: number) => (
    p >= 50
      ? 'bg-red-50 text-red-700'
      : p >= 20
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700'
  );

  // Get funnel-specific insights
  const getFunnelInsights = () => {
    const insights = {
      'ecommerce': {
        metric: 'Revenue Lost',
        description: 'Potential revenue lost from cart abandonment',
        unit: '$',
        action: 'Focus on reducing cart abandonment'
      },
      'saas': {
        metric: 'MRR Lost',
        description: 'Potential Monthly Recurring Revenue lost',
        unit: '$',
        action: 'Improve signup and onboarding flow'
      },
      'lead-gen': {
        metric: 'Leads Lost',
        description: 'Potential qualified leads lost',
        unit: '',
        action: 'Optimize lead capture forms'
      },
      'mobile-app': {
        metric: 'Users Lost',
        description: 'Potential active users lost',
        unit: '',
        action: 'Improve app onboarding experience'
      },
      'content': {
        metric: 'Engagement Lost',
        description: 'Potential content engagement lost',
        unit: '',
        action: 'Optimize content discovery and consumption'
      },
      'support': {
        metric: 'Cases Lost',
        description: 'Potential support cases not resolved',
        unit: '',
        action: 'Improve support ticket resolution'
      }
    };
    return insights[funnelType] || insights['ecommerce'];
  };

  const funnelInsights = getFunnelInsights();

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Section Header with Explanation */}
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Drop-off Analysis</h3>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs mb-2">This analysis shows how many users leave at each step of your funnel.</p>
              <p className="text-xs">• <strong>Drop-off %</strong>: Percentage of users who left between steps</p>
              <p className="text-xs">• <strong>Users</strong>: Actual number of users who reached each step</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>Threshold</span>
            </div>
            <div className="flex-1 min-w-[160px]">
              <Slider
                value={[threshold]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => setThreshold(v[0] ?? 0)}
              />
            </div>
            <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700">{threshold}%+</Badge>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>View</span>
              <div className="flex items-center gap-2">
                <button
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${viewMode === 'list' ? 'bg-white border-gray-300' : 'border-transparent text-gray-500'}`}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="h-3.5 w-3.5" /> List
                </button>
                <button
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${viewMode === 'bars' ? 'bg-white border-gray-300' : 'border-transparent text-gray-500'}`}
                  onClick={() => setViewMode('bars')}
                >
                  <BarChart2 className="h-3.5 w-3.5" /> Bars
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Target className="h-4 w-4 text-gray-400" />
              <span>Sort by</span>
            </div>
            <div className="min-w-[160px]">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dropoffPercent">Drop-off %</SelectItem>
                  <SelectItem value="dropoffValue">Dropped users</SelectItem>
                  <SelectItem value="conversionRate">Conversion %</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button
              className="text-xs px-2 py-1 rounded border border-gray-300 bg-white"
              onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
            >
              {sortDir === 'desc' ? 'Desc' : 'Asc'}
            </button>
          </div>
        </div>

        {/* Business-Focused Insights */}
        <div className="flex flex-wrap gap-3 items-center mb-2">
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{funnelInsights.metric}:</span>
                <span className="font-semibold text-green-700">
                  {funnelInsights.unit}{funnelInsights.unit ? potentialRevenue.toLocaleString() : totalDropOff.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{funnelInsights.description}</p>
              {revenuePerConversion && (
                <p className="text-xs mt-1">Based on ${revenuePerConversion}/conversion</p>
              )}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-red-50 px-2 py-1 rounded">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>Priority Fix:</span>
                <span className="font-semibold text-red-700">{highestRevenueImpact.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Fix this step to recover {potentialImprovement}% of lost users</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
                <TrendingDown className="h-3 w-3 text-blue-500" />
                <span>Improvement:</span>
                <span className="font-semibold text-blue-700">+{improvementOpportunity}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Potential conversion improvement if all drop-offs are fixed</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 text-xs bg-emerald-50 px-2 py-1 rounded">
                <Users className="h-3 w-3 text-emerald-500" />
                <span>Current Rate:</span>
                <span className="font-semibold text-emerald-700">{overallConversionRate}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Current overall conversion rate from start to finish</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* What-if Simulator + Actionable Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* What-if Simulator */}
          <div className="rounded-lg p-3 border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-emerald-800">What-if improvement</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="text-xs text-gray-600">Step</div>
              <Select value={selectedStepName} onValueChange={v => setSelectedStepName(v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  {chartData.map(s => (
                    <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-600 mt-2">Reduce drop-off by</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Slider value={[whatIfPercent]} min={0} max={50} step={5} onValueChange={v => setWhatIfPercent(v[0] ?? 0)} />
                </div>
                <Badge className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700">{whatIfPercent}%</Badge>
              </div>
              <div className="mt-2 text-xs text-gray-700">
                <div className="flex justify-between"><span>Regained users</span><span className="font-semibold text-gray-900">{whatIfRegainedUsers.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Regained {funnelInsights.metric.toLowerCase()}</span><span className="font-semibold text-gray-900">{funnelInsights.unit}{funnelInsights.unit ? whatIfRegainedRevenue.toLocaleString() : whatIfRegainedUsers.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Action Plan */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800">Action Plan</h4>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>1. Immediate Priority:</strong> Focus on {highestRevenueImpact.name} - fixing this step could recover {highestRevenueImpact.dropOffValue.toLocaleString()} users</p>
            <p><strong>2. {funnelInsights.metric}:</strong> You're losing {funnelInsights.unit}{funnelInsights.unit ? potentialRevenue.toLocaleString() : totalDropOff.toLocaleString()} in potential {funnelInsights.metric.toLowerCase()}</p>
            <p><strong>3. Quick Wins:</strong> Improving {lowestDropOff.name} (currently {lowestDropOff.dropOff}% drop-off) could serve as a model for other steps</p>
            <p><strong>4. Action:</strong> {funnelInsights.action}</p>
          </div>
        </div>

          {/* Hotspots */}
          <div className="rounded-lg p-3 border border-rose-200 bg-rose-50/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <h4 className="text-sm font-semibold text-rose-800">Friction hotspots ({highRiskSteps.length})</h4>
            </div>
            <div className="space-y-1">
              {highRiskSteps.slice(0, 3).map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded ${getSeverityClasses(s.dropOffRaw)} font-medium`}>{getSeverity(s.dropOffRaw)}</span>
                    <span className="truncate text-gray-800 font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{s.dropOff}%</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{s.dropOffValue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {highRiskSteps.length === 0 && (
                <div className="text-xs text-gray-600">No steps over {threshold}% drop-off</div>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-step Details / Bars */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600 mb-2">
            <p>{viewMode === 'list' ? 'Each row shows how many users left between steps:' : 'Bar length shows drop-off percentage; darker means higher risk.'}</p>
          </div>

          {viewMode === 'list' ? (
            <div className="divide-y border rounded bg-white">
              {sortedData.map((step, index) => (
                <Tooltip key={step.name}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between px-3 py-2 text-xs hover:bg-gray-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">{index + 1}</span>
                        <span className={`px-1.5 py-0.5 rounded ${getSeverityClasses(step.dropOffRaw)} font-medium`}>{getSeverity(step.dropOffRaw)}</span>
                        <span className="truncate font-medium text-gray-800">{step.name}</span>
                        <span className="text-gray-400">from</span>
                        <span className="truncate text-gray-500">{step.previousStep}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${Number(step.dropOff) < 20 ? "text-emerald-600" : Number(step.dropOff) < 50 ? "text-amber-600" : "text-red-600"}`}>{step.dropOff}%</span>
                        <span className="text-gray-400">/</span>
                        <span className="font-medium text-gray-500">{step.value.toLocaleString()} users</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="text-xs">
                      <p className="font-medium mb-1">{step.name}</p>
                      <p className="mb-2">From {step.previousStep} ({step.previousValue.toLocaleString()} users)</p>
                      <p className="mb-1"><strong>{step.dropOff}%</strong> dropped off ({step.dropOffValue.toLocaleString()} users)</p>
                      <p><strong>{step.value.toLocaleString()} users</strong> continued to this step</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="space-y-2 border rounded bg-white p-3">
              {sortedData.map((s, i) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">{i + 1}</span>
                      <span className="truncate font-medium text-gray-800">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded ${getSeverityClasses(s.dropOffRaw)} font-medium`}>{getSeverity(s.dropOffRaw)}</span>
                      <span className="text-gray-500">{s.dropOff}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${Math.max(0, Math.min(100, s.dropOffRaw))}%`,
                        background: s.dropOffRaw >= 50 ? '#ef4444' : s.dropOffRaw >= 20 ? '#f59e0b' : '#22c55e',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
    </TooltipProvider>
  );
};

export default DropOffDetails;
