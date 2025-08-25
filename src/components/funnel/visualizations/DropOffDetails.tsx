import React, { useMemo, useState } from "react";
import { FunnelStep } from "@/types/funnel";
import {
  AlertCircle,
  TrendingUp,
  Info,
  List as ListIcon,
  BarChart2,
  Filter,
  Sparkles,
  Zap,
  TrendingUp as TrendingUpIcon,
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
  id: string;
  name: string;
  displayName: string;
  value: number;
  dropOff: string;
  dropOffRaw: number;
  dropOffValue: number;
  previousStep: string;
  previousDisplayName: string;
  previousValue: number;
  fill: string;
  conversionRate: string;
}

export const DropOffDetails: React.FC<DropOffDetailsProps> = ({ steps, initialValue, revenuePerConversion, funnelType = 'ecommerce' }) => {
  // Filter out disabled steps using the correct property name
  const enabledSteps = steps.filter(step => step.isEnabled);
  
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
    const previous = enabledSteps[index];
    const previousValue = previous.visitorCount || 1; // Use the previous step's visitor count
    const currentValue = step.visitorCount || 0;
    const dropOffPercentage = calculateDropOff(currentValue, previousValue);
    const dropOffValue = previousValue - currentValue;
    const conversionRate = calculateConversion(currentValue, previousValue);

    const displayName = (step.name && step.name.trim().length > 0) ? step.name : 'Unnamed Step';
    const previousDisplayName = (previous.name && previous.name.trim().length > 0) ? previous.name : 'Previous Step';
    
    return {
      id: step.id,
      name: step.name,
      displayName,
      value: currentValue,
      dropOff: dropOffPercentage.toFixed(1),
      dropOffRaw: dropOffPercentage,
      dropOffValue,
      previousStep: previous.name,
      previousDisplayName,
      previousValue,
      fill: getStepColor(dropOffPercentage),
      conversionRate: conversionRate.toFixed(1),
    };
  });

  // Local UI state - moved to top before conditional returns
  const [viewMode, setViewMode] = useState<'list' | 'bars'>('list');
  const [sortBy, setSortBy] = useState<'dropoffPercent' | 'dropoffValue' | 'conversionRate' | 'name'>('dropoffPercent');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [threshold, setThreshold] = useState<number>(25);
  const [whatIfPercent, setWhatIfPercent] = useState<number>(20);
  const [selectedStepId, setSelectedStepId] = useState<string>(chartData[0]?.id || '');

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
          av = a.displayName.toLowerCase();
          bv = b.displayName.toLowerCase();
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

  // Early return after all hooks
  if (enabledSteps.length <= 1) {
    return (
      <div className="flex items-center justify-center p-4 text-sm border rounded-md bg-gray-50 text-gray-500 gap-2">
        <AlertCircle size={16} />
        <span>At least two steps are needed to show drop-off details.</span>
      </div>
    );
  }

  // Find the highest drop-off step
  const highestDropOff = chartData.reduce((highest, current) => {
    return Number(current.dropOff) > Number(highest.dropOff) ? current : highest;
  }, chartData[0] || { 
    id: 'none',
    dropOff: "0", 
    previousStep: "Initial", 
    previousDisplayName: "Initial",
    name: "Step", 
    displayName: "Step",
    value: 0,
    dropOffRaw: 0,
    dropOffValue: 0,
    previousValue: 0,
    fill: '#ccc',
    conversionRate: "0"
  } as ChartData);
  
  // Find the most successful step (with lowest drop-off)
  const lowestDropOff = chartData.reduce((lowest, current) => {
    return Number(current.dropOff) < Number(lowest.dropOff) ? current : lowest;
  }, chartData[0] || { 
    id: 'none',
    dropOff: "100", 
    previousStep: "Initial", 
    previousDisplayName: "Initial",
    name: "Step", 
    displayName: "Step",
    value: 0,
    dropOffRaw: 100,
    dropOffValue: 0,
    previousValue: 0,
    fill: '#ccc',
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
  const selectedStep = chartData.find(s => s.id === selectedStepId) || highestRevenueImpact;
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
      <div className="space-y-6">

        {/* 1. OVERVIEW SECTION */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUpIcon className="h-5 w-5 text-blue-600" />
            <h4 className="text-base font-semibold text-blue-900">Overview</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tooltip>
              <TooltipTrigger>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{overallConversionRate}%</div>
                  <div className="text-xs text-blue-600">Overall Conversion</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Current conversion rate from start to finish</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{totalDropOff.toLocaleString()}</div>
                  <div className="text-xs text-red-600">Total Users Lost</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Total users who dropped off throughout the funnel</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {funnelInsights.unit}{funnelInsights.unit ? potentialRevenue.toLocaleString() : totalDropOff.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">{funnelInsights.metric}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{funnelInsights.description}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">+{improvementOpportunity}%</div>
                  <div className="text-xs text-purple-600">Improvement Potential</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Potential conversion improvement if all drop-offs are fixed</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 2. THRESHOLD CONTROLS - Clearly labeled for friction hotspots */}
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-amber-600" />
            <h4 className="text-base font-semibold text-amber-900">Friction Hotspot Detection</h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-xs">Adjust the threshold to identify high-risk steps that need immediate attention.</p>
                <p className="text-xs mt-1">Steps with drop-off rates above this threshold are shown in the "Friction Hotspots" section below.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Filter className="h-4 w-4" />
              <span>Drop-off threshold:</span>
            </div>
            <div className="flex-1 max-w-xs">
              <Slider
                value={[threshold]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => setThreshold(v[0] ?? 0)}
              />
            </div>
            <Badge className="px-3 py-1 bg-amber-100 text-amber-800 border-amber-300">
              {threshold}%+
            </Badge>
            <div className="text-sm text-amber-600">
              {highRiskSteps.length} hotspot{highRiskSteps.length !== 1 ? 's' : ''} detected
            </div>
          </div>
        </div>

        {/* 3. FRICTION HOTSPOTS - Steps above threshold */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h4 className="text-base font-semibold text-red-900">
              Friction Hotspots ({highRiskSteps.length})
            </h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Steps with drop-off rates above {threshold}% that need immediate attention</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {highRiskSteps.length > 0 ? (
            <div className="space-y-3">
              {highRiskSteps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-700">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{step.displayName}</div>
                      <div className="text-sm text-gray-500">from {step.previousDisplayName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${step.dropOffRaw >= 50 ? 'text-red-600' : 'text-amber-600'}`}>
                      {step.dropOff}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {step.dropOffValue.toLocaleString()} users lost
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No steps above {threshold}% drop-off threshold</p>
              <p className="text-xs">Great job! Your funnel is performing well.</p>
            </div>
          )}
        </div>

        {/* 4. WHAT-IF SIMULATOR */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h4 className="text-base font-semibold text-emerald-900">What-if Improvement Simulator</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Select Step</label>
              <Select value={selectedStepId} onValueChange={v => setSelectedStepId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a step to improve" />
                </SelectTrigger>
                <SelectContent>
                  {chartData.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reduce drop-off by: {whatIfPercent}%
              </label>
              <Slider 
                value={[whatIfPercent]} 
                min={0} 
                max={50} 
                step={5} 
                onValueChange={v => setWhatIfPercent(v[0] ?? 0)} 
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-700">{whatIfRegainedUsers.toLocaleString()}</div>
                <div className="text-sm text-emerald-600">Users Regained</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">
                  {funnelInsights.unit}{funnelInsights.unit ? whatIfRegainedRevenue.toLocaleString() : whatIfRegainedUsers.toLocaleString()}
                </div>
                <div className="text-sm text-emerald-600">{funnelInsights.metric} Regained</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. COMPLETE ANALYSIS - All steps with detailed breakdown */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-gray-600" />
              <h4 className="text-base font-semibold text-gray-900">Complete Step-by-Step Analysis</h4>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">View:</span>
                <div className="flex items-center gap-1">
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
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'dropoffPercent' | 'dropoffValue' | 'conversionRate' | 'name')}>
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
                <button
                  className="text-xs px-2 py-1 rounded border border-gray-300 bg-white"
                  onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
                >
                  {sortDir === 'desc' ? 'Desc' : 'Asc'}
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="divide-y border rounded bg-white">
              {sortedData.map((step, index) => (
                <Tooltip key={step.name}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                          {index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityClasses(step.dropOffRaw)} font-medium`}>
                          {getSeverity(step.dropOffRaw)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{step.displayName}</div>
                          <div className="text-xs text-gray-500">from {step.previousDisplayName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-bold ${Number(step.dropOff) < 20 ? "text-emerald-600" : Number(step.dropOff) < 50 ? "text-amber-600" : "text-red-600"}`}>
                            {step.dropOff}%
                          </div>
                          <div className="text-xs text-gray-500">drop-off</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{step.value.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">users</div>
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="text-xs">
                      <p className="font-medium mb-1">{step.displayName}</p>
                      <p className="mb-2">From {step.previousDisplayName} ({step.previousValue.toLocaleString()} users)</p>
                      <p className="mb-1"><strong>{step.dropOff}%</strong> dropped off ({step.dropOffValue.toLocaleString()} users)</p>
                      <p><strong>{step.value.toLocaleString()} users</strong> continued to this step</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="space-y-3 border rounded bg-white p-4">
              {sortedData.map((s, i) => (
                <div key={s.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{s.displayName}</div>
                        <div className="text-xs text-gray-500">from {s.previousDisplayName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityClasses(s.dropOffRaw)} font-medium`}>
                        {getSeverity(s.dropOffRaw)}
                      </span>
                      <span className="text-gray-700 font-medium">{s.dropOff}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
                    <div
                      className="h-3 rounded"
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
