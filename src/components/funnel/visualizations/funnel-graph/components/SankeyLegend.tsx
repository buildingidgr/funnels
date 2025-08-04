import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info, Target, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const SankeyLegend: React.FC = () => {
  return (
    <div className="mb-4">
      <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Performance Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
              <span className="text-sm font-medium text-gray-700">High Conversion (≥75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-600"></div>
              <span className="text-sm font-medium text-gray-700">Medium (40-74%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
              <span className="text-sm font-medium text-gray-700">Low (&lt;40%)</span>
            </div>
          </div>

          {/* Connection Types */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">Main Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-400 rounded border-dashed border-2" style={{ borderDasharray: '6,3' }}></div>
              <span className="text-sm text-gray-600">Bypass Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-400 rounded border-dashed border-2" style={{ borderDasharray: '3,2' }}></div>
              <span className="text-sm text-gray-600">Optional Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-400 rounded border-dashed border-2" style={{ borderDasharray: '4,2' }}></div>
              <span className="text-sm text-gray-600">Split Flow</span>
            </div>
          </div>

          {/* Interactive Features */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-blue-600 cursor-help">
                  <Info className="h-4 w-4" />
                  <span className="text-sm font-medium">Interactive Features</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">How to use this visualization:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Hover over nodes to see detailed metrics</li>
                    <li>• Hover over connections to see conversion rates</li>
                    <li>• Green borders indicate high-performing steps</li>
                    <li>• Red borders indicate steps needing attention</li>
                    <li>• Connection thickness shows user volume</li>
                    <li>• Animated flow lines show user movement</li>
                    <li>• Use zoom controls to explore details</li>
                    <li>• Drag to pan around the visualization</li>
                    <li>• Scroll wheel to zoom in/out</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Node size = User count</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>Connection width = Conversion volume</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Best performing steps highlighted</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 