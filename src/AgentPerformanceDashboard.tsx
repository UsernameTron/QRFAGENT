import React, { useState, useMemo } from 'react';
import { Upload, Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';

interface DataRow {
  [key: string]: any;
}

interface AgentData {
  name: string;
  totalInteractions: number;
  handledInteractions: number;
  abandonedWhileAssigned: number;
  avgHandleTime: number;
  totalHandleTime: number;
}

const AgentPerformanceDashboard = () => {
  const [data, setData] = useState<DataRow[] | null>(null);
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const result = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';']
      });
      
      // Filter out rows with missing critical data
      const cleanedData = result.data.filter((row: any) => 
        row.Queue && 
        row['Media Type']
      ) as DataRow[];
      
      setData(cleanedData);
      
      const uniqueAgents = new Set(cleanedData.map(row => row['Users - Interacted']).filter(a => a)).size;
      console.log(`Loaded ${cleanedData.length} interactions with ${uniqueAgents} unique agents`);
      
    } catch (err) {
      console.error('Error parsing uploaded file:', err);
      setError('Failed to process uploaded file: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate agent metrics from data
  const agentMetrics = useMemo(() => {
    if (!data) return null;

    // Filter data based on selections
    let filteredData = data;
    if (selectedQueue !== 'all') {
      filteredData = filteredData.filter(row => row.Queue === selectedQueue);
    }
    if (selectedMediaType !== 'all') {
      filteredData = filteredData.filter(row => row['Media Type'] === selectedMediaType);
    }

    // Calculate agent-level metrics
    const agentStats: { [key: string]: any } = {};
    
    filteredData.forEach((row: DataRow) => {
      const agent = row['Users - Interacted'];
      if (!agent || agent === '' || agent === 'null') return;
      
      if (!agentStats[agent]) {
        agentStats[agent] = {
          name: agent,
          totalInteractions: 0,
          handledInteractions: 0,
          abandonedWhileAssigned: 0,
          totalHandleTime: 0,
          handleTimes: []
        };
      }
      
      agentStats[agent].totalInteractions++;
      
      if (row.Abandoned === 'YES') {
        agentStats[agent].abandonedWhileAssigned++;
      } else {
        agentStats[agent].handledInteractions++;
        
        if (row['Total Handle'] && typeof row['Total Handle'] === 'number') {
          const handleTime = row['Total Handle'] > 10000 ? row['Total Handle'] / 1000 : row['Total Handle'];
          agentStats[agent].totalHandleTime += handleTime;
          agentStats[agent].handleTimes.push(handleTime);
        }
      }
    });

    // Calculate overall team average
    const allAgents = Object.values(agentStats);
    const agentsWithInteractions = allAgents.filter(a => a.handledInteractions > 0);
    const teamAvgHandleTime = agentsWithInteractions.length > 0
      ? agentsWithInteractions.reduce((sum, agent) =>
          sum + (agent.totalHandleTime / agent.handledInteractions), 0
        ) / agentsWithInteractions.length
      : 0;

    // Process agent metrics
    const agents = Object.values(agentStats).map(agent => {
      const avgHandleTime = agent.handledInteractions > 0 
        ? agent.totalHandleTime / agent.handledInteractions 
        : 0;
      
      // Ensure no NaN values
      const safeAvgHandleTime = isNaN(avgHandleTime) ? 0 : avgHandleTime;
      
      return {
        name: agent.name,
        totalInteractions: agent.totalInteractions,
        handledInteractions: agent.handledInteractions,
        abandonedWhileAssigned: agent.abandonedWhileAssigned,
        avgHandleTime: Math.round(safeAvgHandleTime),
        totalHandleTime: Math.round(agent.totalHandleTime || 0)
      };
    }).sort((a, b) => b.totalInteractions - a.totalInteractions);

    return { 
      agents, 
      teamAvgHandleTime: Math.round(teamAvgHandleTime),
      totalAgents: agents.length,
      avgInteractions: Math.round(agents.reduce((sum, a) => sum + a.totalInteractions, 0) / agents.length)
    };
  }, [data, selectedQueue, selectedMediaType]);

  // Get unique filter values
  const uniqueQueues = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(row => row.Queue).filter(q => q))].sort();
  }, [data]);

  const uniqueMediaTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(row => row['Media Type']).filter(m => m))].sort();
  }, [data]);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f1f5f9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    card: {
      background: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    button: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'transform 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    select: {
      background: 'rgba(30, 41, 59, 0.8)',
      color: '#f1f5f9',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      fontSize: '14px',
      cursor: 'pointer',
      outline: 'none'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '20px'
    },
    th: {
      textAlign: 'left' as const,
      padding: '12px',
      borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
      color: '#94a3b8',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
            QRF Agent Performance Dashboard
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Upload CSV data to analyze agent performance metrics
          </p>
        </div>

        {/* File Upload */}
        {!data && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '60px' }}>
            <Upload size={48} style={{ margin: '0 auto 20px', color: '#3b82f6' }} />
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Upload Performance Data</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
              Select a CSV file with agent interaction data
            </p>
            <label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isLoading}
              />
              <div style={styles.button}>
                {isLoading ? 'Processing...' : 'Choose File'}
              </div>
            </label>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{ ...styles.card, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Data Display */}
        {agentMetrics && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Queues ({uniqueQueues.length})</option>
                {uniqueQueues.map(queue => (
                  <option key={queue} value={queue}>{queue}</option>
                ))}
              </select>
              
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Media Types ({uniqueMediaTypes.length})</option>
                {uniqueMediaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <label style={{ marginLeft: 'auto' }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={isLoading}
                />
                <div style={{ ...styles.button, background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                  Upload New File
                </div>
              </label>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Users size={20} style={{ color: '#3b82f6' }} />
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>Total Agents</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{agentMetrics.totalAgents}</div>
              </div>

              <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Activity size={20} style={{ color: '#10b981' }} />
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>Avg Interactions</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{agentMetrics.avgInteractions}</div>
              </div>

              <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <CheckCircle size={20} style={{ color: '#f59e0b' }} />
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>Team Avg Handle Time</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '600' }}>{formatTime(agentMetrics.teamAvgHandleTime)}</div>
              </div>
            </div>

            {/* Agent Table */}
            <div style={{ ...styles.card, overflowX: 'auto' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
                Agent Performance Metrics
              </h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Agent Name</th>
                    <th style={styles.th}>Total Interactions</th>
                    <th style={styles.th}>Handled</th>
                    <th style={styles.th}>Abandoned</th>
                    <th style={styles.th}>Avg Handle Time</th>
                  </tr>
                </thead>
                <tbody>
                  {agentMetrics.agents.map((agent, idx) => (
                    <tr key={agent.name}>
                      <td style={styles.td}>{agent.name}</td>
                      <td style={styles.td}>{agent.totalInteractions}</td>
                      <td style={styles.td}>{agent.handledInteractions}</td>
                      <td style={styles.td}>{agent.abandonedWhileAssigned}</td>
                      <td style={styles.td}>{formatTime(agent.avgHandleTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentPerformanceDashboard;