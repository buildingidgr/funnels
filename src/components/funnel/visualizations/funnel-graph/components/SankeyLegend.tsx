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
          {/* Step Column Colors */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
              <span className="text-sm font-medium text-gray-700">Step Columns: High Conversion (≥75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-yellow-600"></div>
              <span className="text-sm font-medium text-gray-700">Step Columns: Medium (40-74%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"></div>
              <span className="text-sm font-medium text-gray-700">Step Columns: Low (&lt;40%)</span>
            </div>
          </div>

          {/* Flow Types */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Standard Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-purple-500 rounded" style={{ strokeDasharray: '4,2' }}></div>
              <span className="text-sm text-gray-600">Split Variations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-orange-500 rounded" style={{ strokeDasharray: '3,2' }}></div>
              <span className="text-sm text-gray-600">Optional Steps</span>
            </div>
          </div>


        </div>


      </Card>
    </div>
      );
  }; 