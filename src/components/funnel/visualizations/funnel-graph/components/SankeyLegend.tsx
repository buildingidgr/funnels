import { Card } from '@/components/ui/card';

export const SankeyLegend: React.FC = () => {
  return (
    <div className="mb-4">
      <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Connection conversion rate */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-emerald-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">High conversion (≥75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Moderate (40–74%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gray-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">Low (&lt;40%)</span>
            </div>
          </div>

          {/* Flow Types */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Main path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded" style={{ strokeDasharray: '4,2' }}></div>
              <span className="text-sm text-gray-600">A/B split path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-purple-600 rounded" style={{ strokeDasharray: '6,3' }}></div>
              <span className="text-sm text-gray-600">Optional path</span>
            </div>
          </div>


        </div>


      </Card>
    </div>
      );
  }; 