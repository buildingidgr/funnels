import React from 'react';
import styles from '../FunnelGraph.module.css';

interface SankeyLegendProps {
  className?: string;
}

export const SankeyLegend: React.FC<SankeyLegendProps> = ({ className }) => {
  return (
    <div className={`${styles.sankeyLegend} ${className || ''}`}>
      <div className={styles.legendItem}>
        <div 
          className={styles.legendColor} 
          style={{ background: '#3b82f6' }} 
        />
        <span className={styles.legendLabel}>Main Steps</span>
      </div>
      <div className={styles.legendItem}>
        <div 
          className={styles.legendColor} 
          style={{ 
            background: '#34d399',
            border: '2px dashed #10b981'
          }} 
        />
        <span className={styles.legendLabel}>Split Paths</span>
      </div>
      <div className={styles.legendItem}>
        <div 
          className={styles.legendColor} 
          style={{ 
            background: '#f59e0b',
            border: '2px dashed #f59e0b'
          }} 
        />
        <span className={styles.legendLabel}>Optional Steps</span>
      </div>
      <div className={styles.legendItem}>
        <div 
          className={styles.legendColor} 
          style={{ 
            background: 'linear-gradient(90deg, #93c5fd, #6ee7b7)',
            height: '4px'
          }} 
        />
        <span className={styles.legendLabel}>User Flow</span>
      </div>
    </div>
  );
}; 