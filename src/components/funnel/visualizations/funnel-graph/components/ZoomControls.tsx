import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  isPannedOrZoomed: boolean;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, minZoom, maxZoom, onZoomIn, onZoomOut, onReset, isPannedOrZoomed }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 10,
      background: 'rgba(255,255,255,0.95)',
      padding: '8px 12px',
      borderRadius: '8px',
      border: isPannedOrZoomed ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.2s ease'
    }}>
      <span style={{ minWidth: 40, textAlign: 'right', fontWeight: 600, color: isPannedOrZoomed ? '#3b82f6' : '#64748b' }}>{Math.round(zoom * 100)}%</span>
      {isPannedOrZoomed && (
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', animation: 'pulse 2s infinite' }} />
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onZoomIn} disabled={zoom >= maxZoom} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
                background: zoom >= maxZoom ? '#f1f5f9' : '#ffffff', color: zoom >= maxZoom ? '#94a3b8' : '#64748b',
                cursor: zoom >= maxZoom ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <ZoomIn size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onZoomOut} disabled={zoom <= minZoom} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
                background: zoom <= minZoom ? '#f1f5f9' : '#ffffff', color: zoom <= minZoom ? '#94a3b8' : '#64748b',
                cursor: zoom <= minZoom ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <ZoomOut size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onReset} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#ffffff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <RotateCcw size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ZoomControls;


