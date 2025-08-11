import { Card } from '@/components/ui/card';
import React from 'react';

type Mode = 'classic' | 'semantic' | 'monochrome';

export const SankeyLegend: React.FC<{ linkRenderMode?: Mode }> = ({ linkRenderMode = 'classic' }) => {
  const isSemantic = linkRenderMode === 'semantic';
  const isMonochrome = linkRenderMode === 'monochrome';

  return (
    <div className="mb-4">
      <Card className="p-4 bg-white/80 backdrop-blur-sm border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Conversion scale */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-emerald-500 rounded"></div>
              <span className="text-sm font-medium text-gray-700">High (≥75%)</span>
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

          {/* Flow types reflect current render mode */}
          <div className="flex items-center gap-6">
            {/* Main path */}
            <div className="flex items-center gap-2">
              <svg width="64" height="14" viewBox="0 0 64 14">
                {isMonochrome ? (
                  <>
                    <path d="M2 7 L62 7" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
                  </>
                ) : isSemantic ? (
                  <>
                    {/* halo */}
                    <path d="M2 7 L62 7" stroke="#60a5fa" strokeWidth="12" strokeOpacity="0.12" strokeLinecap="round" />
                    {/* base */}
                    <path d="M2 7 L62 7" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                    {/* inner highlight */}
                    <path d="M2 7 L62 7" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
                  </>
                ) : (
                  <path d="M2 7 L62 7" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                )}
              </svg>
              <span className="text-sm text-gray-700">Main path</span>
            </div>

            {/* Split path */}
            <div className="flex items-center gap-2">
              <svg width="64" height="18" viewBox="0 0 64 18">
                {isMonochrome ? (
                  <>
                    <path d="M2 9 L62 9" stroke="#111827" strokeWidth="5" strokeLinecap="round" strokeDasharray="4 3" />
                  </>
                ) : isSemantic ? (
                  <>
                    {/* dotted outline */}
                    <path d="M2 9 L62 9" stroke="#60a5fa" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.5" strokeDasharray="4 3" />
                    {/* solid inner */}
                    <path d="M2 9 L62 9" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                    {/* bead */}
                    <circle cx="24" cy="9" r="2.2" fill="#ffffff" />
                  </>
                ) : (
                  <path d="M2 9 L62 9" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" strokeDasharray="4 2" />
                )}
              </svg>
              <span className="text-sm text-gray-700">Split path</span>
            </div>

            {/* Optional path */}
            <div className="flex items-center gap-2">
              <svg width="64" height="14" viewBox="0 0 64 14">
                {isMonochrome ? (
                  <path d="M2 7 L62 7" stroke="#111827" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 6" />
                ) : (
                  <path d="M2 7 L62 7" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.45" strokeDasharray="10 6" />
                )}
              </svg>
              <span className="text-sm text-gray-700">Optional path</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};