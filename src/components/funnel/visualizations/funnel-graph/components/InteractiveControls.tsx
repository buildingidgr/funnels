import React from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Eye, Settings, Palette, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InteractiveControlsProps {
  showTooltips: boolean;
  setShowTooltips: (show: boolean) => void;
  interactiveTooltips: boolean;
  setInteractiveTooltips: (interactive: boolean) => void;
  showPerformanceIndicators: boolean;
  setShowPerformanceIndicators: (show: boolean) => void;
  showConversionLabels: boolean;
  setShowConversionLabels: (show: boolean) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
}

export const InteractiveControls: React.FC<InteractiveControlsProps> = ({
  showTooltips,
  setShowTooltips,
  interactiveTooltips,
  setInteractiveTooltips,
  showPerformanceIndicators,
  setShowPerformanceIndicators,
  showConversionLabels,
  setShowConversionLabels,
  animationSpeed,
  setAnimationSpeed,
  colorScheme,
  setColorScheme
}) => {
  return (
    <Card className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Visualization Controls</h3>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-gray-500 cursor-help">
                Customize your view
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust these settings to customize your funnel visualization experience</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tooltip Controls */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tooltips</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-tooltips" className="text-sm">Show Tooltips</Label>
              <Switch
                id="show-tooltips"
                checked={showTooltips}
                onCheckedChange={setShowTooltips}
              />
            </div>
            {showTooltips && (
              <div className="flex items-center justify-between">
                <Label htmlFor="interactive-tooltips" className="text-sm">Interactive Mode</Label>
                <Switch
                  id="interactive-tooltips"
                  checked={interactiveTooltips}
                  onCheckedChange={setInteractiveTooltips}
                />
              </div>
            )}
          </div>
        </div>

        {/* Visual Indicators */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Visual Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="performance-indicators" className="text-sm">Performance Borders</Label>
              <Switch
                id="performance-indicators"
                checked={showPerformanceIndicators}
                onCheckedChange={setShowPerformanceIndicators}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="conversion-labels" className="text-sm">Conversion Labels</Label>
              <Switch
                id="conversion-labels"
                checked={showConversionLabels}
                onCheckedChange={setShowConversionLabels}
              />
            </div>
          </div>
        </div>

        {/* Animation & Color */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Animation & Style</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Animation Speed</Label>
              <Slider
                value={[animationSpeed]}
                onValueChange={(value) => setAnimationSpeed(value[0])}
                max={3}
                min={0.5}
                step={0.1}
                className="mt-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                {animationSpeed === 0.5 ? 'Slow' : animationSpeed === 1 ? 'Normal' : animationSpeed === 2 ? 'Fast' : 'Very Fast'}
              </div>
            </div>
            
            <div>
              <Label className="text-sm">Color Scheme</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="accessible">High Contrast</SelectItem>
                  <SelectItem value="colorblind">Colorblind Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>Hover to explore</span>
            </div>
            <div className="flex items-center gap-1">
              <Palette className="h-3 w-3" />
              <span>Colors indicate performance</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>Data-driven insights</span>
          </div>
        </div>
      </div>
    </Card>
  );
}; 