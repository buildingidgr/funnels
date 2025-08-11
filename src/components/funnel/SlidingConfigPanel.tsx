import React, { useEffect, useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunnelConfigEditor } from './FunnelConfigEditor';
import { Funnel } from '@/types/funnel';

interface SlidingConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  funnel: Funnel | null;
  onSave: (updatedFunnel: Funnel) => Promise<void>;
}

export function SlidingConfigPanel({ isOpen, onClose, funnel, onSave }: SlidingConfigPanelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!funnel) return null;

  return (
    <>
      {/* Backdrop overlay for mobile when not fullscreen */}
      {isOpen && !isFullscreen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div
        className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: isFullscreen ? '100vw' : 'min(900px, 96vw)',
          ['--panel-width' as any]: isFullscreen ? '100vw' : 'min(900px, 96vw)'
        } as React.CSSProperties}
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Funnel Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure your funnel steps, conditions, and split variations. Changes are saved automatically.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(v => !v)}
            className="h-8 w-8 mr-1"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <FunnelConfigEditor 
            funnel={funnel} 
            onSave={onSave}
          />
        </div>
      </div>
      </div>
    </>
  );
}
