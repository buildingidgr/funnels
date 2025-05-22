import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FunnelVisualizationTabs from '../../components/funnel/visualizations/FunnelVisualizationTabs';
import { FunnelApi } from '../../services/api';
import { Funnel } from '@/types/funnel';

const FunnelAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFunnel = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await FunnelApi.getFunnel(id);
        setFunnel(data);
        setError(null);
      } catch (err) {
        console.error('Error loading funnel:', err);
        setError(err instanceof Error ? err.message : 'Failed to load funnel data');
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'red'
      }}>
        {error}
      </div>
    );
  }

  if (!funnel) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'red'
      }}>
        Funnel not found
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ 
        marginBottom: '24px',
        fontSize: '24px',
        fontWeight: 600,
        color: '#1e293b'
      }}>
        Funnel Analysis: {funnel.name}
      </h1>
      
      <FunnelVisualizationTabs 
        steps={funnel.steps} 
        initialValue={funnel.steps[0]?.visitorCount || 0} 
        funnelId={id} 
      />
    </div>
  );
};

export default FunnelAnalysisPage; 