import React from 'react';

const NavigationHint: React.FC<{ visible: boolean }> = ({ visible }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      zIndex: 10,
      background: 'rgba(255,255,255,0.9)',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '11px',
      color: '#64748b',
      maxWidth: '240px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none'
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Navigation</div>
      <div>• Hold Ctrl (or ⌘) + scroll to zoom</div>
      <div>• Drag to pan</div>
      <div>• Use controls to reset</div>
    </div>
  );
};

export default NavigationHint;


