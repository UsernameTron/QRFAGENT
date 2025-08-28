import React, { useState, useMemo } from 'react';
import { Award, AlertTriangle, Activity, Users, Zap, BarChart3, Star, Shield, BookOpen, ChevronUp, ChevronDown, Calculator, Info, CheckCircle, LucideIcon } from 'lucide-react';
import Papa from 'papaparse';

interface DataRow {
  [key: string]: any;
}

const AgentPerformanceDashboard = () => {
  const [data, setData] = useState<DataRow[] | null>(null);
  const [selectedQueue, setSelectedQueue] = useState('all');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormulas, setShowFormulas] = useState(false);
  const [sortBy, setSortBy] = useState('interactions'); // interactions, handleTime, efficiency

  // Ultra-clean, sleek design system
  const colors = {
    // Backgrounds - Clean and minimal
    bg: '#000000',
    bgPattern: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
    card: 'rgba(255, 255, 255, 0.03)',
    cardHover: 'rgba(255, 255, 255, 0.06)',
    
    // Text - High contrast for readability
    primary: '#ffffff',
    secondary: '#a3a3a3',
    tertiary: '#6b7280',
    
    // Accent colors - Refined palette
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    
    // UI elements - Subtle and refined
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(255, 255, 255, 0.16)',
    
    // Interactive states
    hover: 'rgba(255, 255, 255, 0.04)',
    active: 'rgba(255, 255, 255, 0.08)',
    
    // Performance tiers
    gold: '#fbbf24',
    silver: '#d1d5db',
    bronze: '#d97706'
  };

  // Formulas documentation for agent metrics
  const formulas = {
    avgHandleTime: {
      name: "Agent Avg Handle Time",
      formula: "Sum(Handle Time for Agent's Handled Calls) ÷ Count(Agent's Handled Calls)",
      description: "Average time agent spends on handled interactions"
    },
    efficiencyScore: {
      name: "Efficiency Score",
      formula: "100 - ((Agent AHT - Team Avg AHT) ÷ Team Avg AHT × 100)",
      description: "How agent's handle time compares to team average (higher is better)"
    },
    productivityRate: {
      name: "Productivity Rate",
      formula: "(Handled Interactions ÷ Total Assigned Interactions) × 100",
      description: "Percentage of assigned interactions successfully handled"
    },
    versatilityScore: {
      name: "Versatility Score",
      formula: "Unique Queues Handled ÷ Total Available Queues × 100",
      description: "Percentage of queues agent is trained to handle"
    },
    utilizationRate: {
      name: "Utilization Rate",
      formula: "(Total Handle Time ÷ Available Work Time) × 100",
      description: "Percentage of time spent actively handling interactions"
    },
    interactionsPerHour: {
      name: "Interactions Per Hour",
      formula: "Total Handled Interactions ÷ (Total Handle Time in Seconds ÷ 3600)",
      description: "Average number of interactions handled per hour"
    }
  };

  // Load CSV data from file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
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
      
      // Log agent statistics
      const uniqueAgents = new Set(cleanedData.map(row => row['Users - Interacted']).filter(a => a)).size;
      console.log(`Loaded ${cleanedData.length} interactions with ${uniqueAgents} unique agents`);
      
    } catch (err) {
      console.error('Error parsing uploaded file:', err);
      setError('Failed to process uploaded file: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine performance tier
  const calculatePerformanceTier = (efficiency: number, productivity: number, interactions: number) => {
    if (interactions < 10) return 'new'; // Not enough data
    
    const score = (efficiency * 0.4) + (productivity * 0.4) + (Math.min(interactions / 100, 1) * 20);
    
    if (score >= 85) return 'gold';
    if (score >= 70) return 'silver';
    return 'bronze';
  };

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
    if (selectedAgent !== 'all') {
      filteredData = filteredData.filter(row => row['Users - Interacted'] === selectedAgent);
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
          totalQueueTime: 0,
          queues: new Set(),
          mediaTypes: new Set(),
          handleTimes: [],
          dates: new Set()
        };
      }
      
      agentStats[agent].totalInteractions++;
      
      // Track handled vs abandoned
      if (row.Abandoned === 'YES') {
        agentStats[agent].abandonedWhileAssigned++;
      } else {
        agentStats[agent].handledInteractions++;
        
        // Track handle time for handled calls
        if (row['Total Handle'] && typeof row['Total Handle'] === 'number') {
          const handleTime = row['Total Handle'] > 10000 ? row['Total Handle'] / 1000 : row['Total Handle'];
          agentStats[agent].totalHandleTime += handleTime;
          agentStats[agent].handleTimes.push(handleTime);
        }
      }
      
      // Track queue time
      if (row['Total Queue'] && typeof row['Total Queue'] === 'number') {
        const queueTime = row['Total Queue'] > 10000 ? row['Total Queue'] / 1000 : row['Total Queue'];
        agentStats[agent].totalQueueTime += queueTime;
      }
      
      // Track queues and media types
      if (row.Queue) agentStats[agent].queues.add(row.Queue);
      if (row['Media Type']) agentStats[agent].mediaTypes.add(row['Media Type']);
      if (row.Date) agentStats[agent].dates.add(row.Date.split(' ')[0]); // Get date part only
    });

    // Calculate overall team averages for comparison
    const allAgents = Object.values(agentStats);
    const teamAvgHandleTime = allAgents.reduce((sum, agent) => 
      sum + (agent.handledInteractions > 0 ? agent.totalHandleTime / agent.handledInteractions : 0), 0
    ) / allAgents.filter(a => a.handledInteractions > 0).length;

    const totalQueues = new Set(data.map(row => row.Queue).filter(q => q)).size;

    // Process agent metrics with calculated scores
    const agents = Object.values(agentStats).map(agent => {
      const avgHandleTime = agent.handledInteractions > 0 
        ? agent.totalHandleTime / agent.handledInteractions 
        : 0;
      
      // Calculate efficiency score (100 = team average, >100 = better than average)
      const efficiencyScore = teamAvgHandleTime > 0 && avgHandleTime > 0
        ? Math.round(100 - ((avgHandleTime - teamAvgHandleTime) / teamAvgHandleTime * 100))
        : 100;
      
      // Calculate productivity rate
      const productivityRate = agent.totalInteractions > 0
        ? (agent.handledInteractions / agent.totalInteractions * 100)
        : 0;
      
      // Calculate versatility score
      const versatilityScore = totalQueues > 0
        ? (agent.queues.size / totalQueues * 100)
        : 0;
      
      // Calculate interactions per hour
      const hoursWorked = agent.totalHandleTime / 3600;
      const interactionsPerHour = hoursWorked > 0
        ? agent.handledInteractions / hoursWorked
        : 0;
      
      // Calculate utilization (assuming 8 hour work day * number of unique dates)
      const availableSeconds = agent.dates.size * 8 * 3600;
      const utilizationRate = availableSeconds > 0
        ? (agent.totalHandleTime / availableSeconds * 100)
        : 0;

      return {
        name: agent.name,
        totalInteractions: agent.totalInteractions,
        handledInteractions: agent.handledInteractions,
        abandonedWhileAssigned: agent.abandonedWhileAssigned,
        avgHandleTime: Math.round(avgHandleTime),
        totalHandleTime: Math.round(agent.totalHandleTime),
        productivityRate: productivityRate.toFixed(1),
        efficiencyScore,
        versatilityScore: versatilityScore.toFixed(1),
        interactionsPerHour: interactionsPerHour.toFixed(1),
        utilizationRate: Math.min(100, utilizationRate).toFixed(1), // Cap at 100%
        uniqueQueues: agent.queues.size,
        uniqueMediaTypes: agent.mediaTypes.size,
        daysWorked: agent.dates.size,
        queues: Array.from(agent.queues),
        mediaTypes: Array.from(agent.mediaTypes),
        // Performance tier based on multiple factors
        performanceTier: calculatePerformanceTier(efficiencyScore, productivityRate, agent.handledInteractions)
      };
    });

    // Sort agents based on selected criteria
    agents.sort((a, b) => {
      switch(sortBy) {
        case 'handleTime':
          return a.avgHandleTime - b.avgHandleTime;
        case 'efficiency':
          return b.efficiencyScore - a.efficiencyScore;
        default: // interactions
          return b.totalInteractions - a.totalInteractions;
      }
    });

    // Calculate overall workforce stats
    const workforceStats = {
      totalAgents: agents.length,
      avgInteractionsPerAgent: Math.round(agents.reduce((sum, a) => sum + a.totalInteractions, 0) / agents.length),
      avgHandleTimeOverall: Math.round(teamAvgHandleTime),
      topPerformers: agents.filter(a => a.performanceTier === 'gold').length,
      needsCoaching: agents.filter(a => a.performanceTier === 'bronze').length,
      avgEfficiency: Math.round(agents.reduce((sum, a) => sum + a.efficiencyScore, 0) / agents.length),
      avgUtilization: (agents.reduce((sum, a) => sum + parseFloat(a.utilizationRate), 0) / agents.length).toFixed(1)
    };

    return { agents, workforceStats, teamAvgHandleTime };
  }, [data, selectedQueue, selectedMediaType, selectedAgent, sortBy]);

  const uniqueQueues = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(row => row.Queue).filter(q => q))].sort();
  }, [data]);

  const uniqueMediaTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(row => row['Media Type']).filter(m => m))].sort();
  }, [data]);

  const uniqueAgents = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map(row => row['Users - Interacted']).filter(a => a && a !== '' && a !== 'null'))].sort();
  }, [data]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getTierIcon = (tier: string) => {
    switch(tier) {
      case 'gold': return <Star className="w-4 h-4" style={{ color: colors.gold }} />;
      case 'silver': return <Shield className="w-4 h-4" style={{ color: colors.silver }} />;
      case 'bronze': return <AlertTriangle className="w-4 h-4" style={{ color: colors.bronze }} />;
      default: return <BookOpen className="w-4 h-4" style={{ color: colors.red }} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'gold': return colors.gold;
      case 'silver': return colors.silver;
      case 'bronze': return colors.bronze;
      default: return colors.red;
    }
  };

  interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: number;
    formula?: string | null;
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, formula }: MetricCardProps) => (
    <div 
      className="group relative"
    >
      <div
        className="h-full p-6 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 border"
        style={{ 
          background: colors.card,
          borderColor: colors.border
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = colors.cardHover;
          e.currentTarget.style.borderColor = colors.borderActive;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = colors.card;
          e.currentTarget.style.borderColor = colors.border;
        }}
      >
        {Icon && (
          <div className="mb-6 inline-flex">
            <Icon 
              className="w-6 h-6 transition-all duration-300 group-hover:scale-110" 
              style={{ color: colors.blue }} 
            />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 
            className="text-sm font-medium tracking-tight" 
            style={{ color: colors.secondary }}
          >
            {title}
          </h3>
          
          <div 
            className="text-2xl font-semibold tracking-tight" 
            style={{ color: colors.primary }}
          >
            {value}
          </div>
          
          {subtitle && (
            <p 
              className="text-sm leading-relaxed" 
              style={{ color: colors.tertiary }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {trend !== undefined && (
          <div className="absolute top-6 right-6">
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: trend > 0 ? `${colors.green}20` : `${colors.red}20`
              }}
            >
              {trend > 0 ? 
                <ChevronUp className="w-4 h-4" style={{ color: colors.green }} /> : 
                <ChevronDown className="w-4 h-4" style={{ color: colors.red }} />
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );

  interface ChipProps {
    children: React.ReactNode;
    color?: string;
  }

  const Chip = ({ children, color }: ChipProps) => (
    <span 
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm transition-all duration-200"
      style={{ 
        background: color || colors.card,
        color: colors.secondary,
        border: `1px solid ${colors.border}`
      }}
    >
      {children}
    </span>
  );

  const FormulasPanel = () => (
    <div 
      className="rounded-2xl p-6 mb-6"
      style={{ 
        background: `linear-gradient(180deg, ${colors.card}, ${colors.cardHover})`,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
      }}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
        <Calculator className="w-5 h-5" style={{ color: colors.red }} />
        Agent Performance Calculation Formulas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formulas).map(([key, formula]) => (
          <div 
            key={key}
            className="p-4 rounded-xl"
            style={{ 
              backgroundColor: `${colors.card}60`,
              border: `1px solid ${colors.border}`
            }}
          >
            <div className="font-semibold mb-1" style={{ color: colors.primary }}>
              {formula.name}
            </div>
            <div className="text-sm mb-2 font-mono" style={{ color: colors.red }}>
              {formula.formula}
            </div>
            <div className="text-xs" style={{ color: colors.secondary }}>
              {formula.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Agent Performance Card Component
  const AgentCard = ({ agent, rank }: any) => {
    const tierColor = getTierColor(agent.performanceTier);
    
    return (
      <div 
        className="rounded-xl p-4 relative"
        style={{ 
          background: `linear-gradient(135deg, ${colors.card}, ${colors.cardHover})`,
          border: `2px solid ${agent.performanceTier === 'gold' ? colors.gold : colors.border}`,
          boxShadow: agent.performanceTier === 'gold' ? `0 0 20px ${colors.gold}40` : '0 5px 15px rgba(0,0,0,.3)'
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center"
              style={{ 
                backgroundColor: `${tierColor}20`,
                color: tierColor,
                border: `1px solid ${tierColor}`
              }}
            >
              {rank}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2" style={{ color: colors.primary }}>
                {agent.name.length > 20 ? agent.name.substring(0, 20) + '...' : agent.name}
                {getTierIcon(agent.performanceTier)}
              </div>
              <div className="text-xs" style={{ color: colors.secondary }}>
                {agent.daysWorked} days active • {agent.uniqueQueues} queues
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: colors.secondary }}>Efficiency</div>
            <div className="text-xl font-bold" style={{ 
              color: agent.efficiencyScore >= 100 ? colors.green : colors.red 
            }}>
              {agent.efficiencyScore}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="text-xs" style={{ color: colors.secondary }}>Handled</div>
            <div className="font-semibold" style={{ color: colors.red }}>
              {agent.handledInteractions}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: colors.secondary }}>AHT</div>
            <div className="font-semibold" style={{ color: colors.secondary }}>
              {formatTime(agent.avgHandleTime)}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: colors.secondary }}>Per Hour</div>
            <div className="font-semibold" style={{ color: colors.primary }}>
              {agent.interactionsPerHour}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${colors.border}` }}>
          <div className="flex gap-2">
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: `${colors.red}20`,
                color: colors.red
              }}
            >
              {agent.productivityRate}% Productive
            </span>
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: `${colors.secondary}20`,
                color: colors.secondary
              }}
            >
              {agent.utilizationRate}% Utilized
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (error && !data) {
    return (
      <div 
        className="min-h-screen"
        style={{ 
          background: `${colors.bg}, ${colors.bgPattern}`,
          color: colors.primary,
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <div className="max-w-7xl mx-auto px-7 py-7">
          <header className="flex items-center gap-4 flex-wrap mb-6">
            <Chip>👥 Agent Performance Analysis</Chip>
            <h1 className="text-3xl font-bold m-0" style={{ color: colors.primary }}>
              Agent Performance Dashboard
            </h1>
          </header>
          
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: `${colors.red}20`, border: `2px solid ${colors.red}` }}>
              <AlertTriangle className="w-8 h-8" style={{ color: colors.red }} />
            </div>
            <h2 className="text-xl font-bold mb-4">Error Processing File</h2>
            <p className="text-lg mb-6" style={{ color: colors.secondary }}>{error}</p>
            <button 
              onClick={() => {setError(null); setData(null);}}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ 
                background: colors.red,
                color: 'white'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        background: `${colors.bg}, ${colors.bgPattern}`,
        color: colors.primary,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-medium tracking-tight mb-2" style={{ color: colors.primary }}>
                Agent Performance
              </h1>
              <p className="text-base" style={{ color: colors.secondary }}>
                Workforce analytics and insights
              </p>
            </div>
            {data && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFormulas(!showFormulas)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                  style={{ 
                    background: showFormulas ? colors.blue : colors.card,
                    color: showFormulas ? 'white' : colors.secondary,
                    border: `1px solid ${showFormulas ? colors.blue : colors.border}`
                  }}
                >
                  <Calculator className="w-4 h-4" />
                  Formulas
                </button>
                <label className="cursor-pointer">
                  <div 
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                    style={{ 
                      background: colors.blue,
                      color: 'white',
                      border: `1px solid ${colors.blue}`
                    }}
                  >
                    Upload CSV
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
            )}
          </div>
        </header>

        {/* File Upload Interface */}
        {!data && !isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div 
                className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-110" 
                style={{ 
                  background: colors.card,
                  border: `1px solid ${colors.border}`
                }}
              >
                <Users className="w-8 h-8" style={{ color: colors.blue }} />
              </div>
              
              <h2 className="text-2xl font-medium tracking-tight mb-3" style={{ color: colors.primary }}>
                Upload Performance Data
              </h2>
              <p className="text-base mb-8 leading-relaxed" style={{ color: colors.secondary }}>
                Select a CSV file containing agent interaction data to begin analysis
              </p>
              
              <label className="group cursor-pointer inline-block">
                <div 
                  className="px-6 py-3 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border group-hover:-translate-y-0.5"
                  style={{ 
                    background: colors.blue,
                    color: 'white',
                    borderColor: colors.blue
                  }}
                >
                  Choose File
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
              
              <div className="mt-8 p-4 rounded-xl" style={{ 
                backgroundColor: `${colors.card}40`, 
                border: `1px solid ${colors.border}` 
              }}>
                <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>Expected Format:</h3>
                <p className="text-sm" style={{ color: colors.secondary }}>
                  CSV file with columns: Queue, Media Type, Abandoned (YES/NO), Total Handle, Total Queue, Users - Interacted, Date, etc.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-t-transparent mb-4" 
                 style={{ borderColor: colors.red }}></div>
            <p className="text-lg font-medium" style={{ color: colors.primary }}>Processing your data...</p>
            <p className="text-sm mt-2" style={{ color: colors.secondary }}>Analyzing agent performance metrics</p>
          </div>
        )}

        {agentMetrics && (
          <>
            {/* Show Formulas Panel when toggled */}
            {showFormulas && <FormulasPanel />}

            {/* Filters and Controls */}
            <div className="flex gap-3 mb-12 flex-wrap">
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
                style={{ 
                  background: colors.card,
                  color: colors.secondary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Queues ({uniqueQueues.length})</option>
                {uniqueQueues.map(queue => (
                  <option key={queue} value={queue}>{queue}</option>
                ))}
              </select>
              
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
                style={{ 
                  background: colors.card,
                  color: colors.secondary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Media Types ({uniqueMediaTypes.length})</option>
                {uniqueMediaTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
                style={{ 
                  background: colors.card,
                  color: colors.secondary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="all">All Agents ({uniqueAgents.length})</option>
                {uniqueAgents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 backdrop-blur-sm"
                style={{ 
                  background: colors.card,
                  color: colors.secondary,
                  border: `1px solid ${colors.border}`
                }}
              >
                <option value="interactions">Sort by Interactions</option>
                <option value="handleTime">Sort by Handle Time</option>
                <option value="efficiency">Sort by Efficiency</option>
              </select>
            </div>

            {/* Workforce Overview KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <MetricCard
                title="Active Agents"
                value={agentMetrics.workforceStats.totalAgents}
                subtitle={`Handling interactions`}
                icon={Users}
              />
              <MetricCard
                title="Top Performers"
                value={agentMetrics.workforceStats.topPerformers}
                subtitle={`${((agentMetrics.workforceStats.topPerformers / agentMetrics.workforceStats.totalAgents) * 100).toFixed(0)}% of workforce`}
                icon={Award}
                trend={agentMetrics.workforceStats.topPerformers > 0 ? 1 : -1}
              />
              <MetricCard
                title="Avg Efficiency"
                value={`${agentMetrics.workforceStats.avgEfficiency}%`}
                subtitle="Team efficiency score"
                icon={Zap}
                formula={showFormulas ? "Avg of all agent efficiency scores" : null}
              />
              <MetricCard
                title="Avg Utilization"
                value={`${agentMetrics.workforceStats.avgUtilization}%`}
                subtitle="Time spent on calls"
                icon={Activity}
                formula={showFormulas ? "(Total Handle Time ÷ Available Time) × 100" : null}
              />
            </section>

            {/* Top Performers Section */}
            <div className="mb-6">
              <div 
                className="rounded-2xl p-6"
                style={{ 
                  background: `linear-gradient(180deg, ${colors.card}, ${colors.cardHover})`,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                  <Award className="w-5 h-5" style={{ color: colors.gold }} />
                  Top Performing Agents
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentMetrics.agents
                    .filter(agent => agent.handledInteractions >= 10) // Minimum threshold
                    .slice(0, 6)
                    .map((agent, idx) => (
                      <AgentCard key={agent.name} agent={agent} rank={idx + 1} />
                    ))}
                </div>
              </div>
            </div>

            {/* Detailed Agent Performance Table */}
            <div 
              className="rounded-2xl overflow-hidden"
              style={{ 
                background: `linear-gradient(180deg, ${colors.card}, ${colors.cardHover})`,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
              }}
            >
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.primary }}>
                  <BarChart3 className="w-5 h-5" style={{ color: colors.red }} />
                  Agent Performance Metrics
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.secondary }}>
                  Comprehensive agent analytics for workforce optimization
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Agent
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Tier
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Handled
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        AHT
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Efficiency
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Per Hour
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Utilization
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Queues
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.secondary }}>
                        Days
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentMetrics.agents
                      .slice(0, 20)
                      .map((agent, idx) => (
                        <tr 
                          key={idx} 
                          className="transition-colors hover:bg-black hover:bg-opacity-10"
                          style={{ borderBottom: `1px solid ${colors.border}` }}
                        >
                          <td className="px-6 py-4 font-medium text-sm" style={{ color: colors.primary }}>
                            {agent.name.length > 25 ? agent.name.substring(0, 25) + '...' : agent.name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getTierIcon(agent.performanceTier)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: colors.primary }}>
                            {agent.totalInteractions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.green }}>
                            {agent.handledInteractions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ 
                            color: agent.avgHandleTime <= agentMetrics.teamAvgHandleTime ? colors.green : colors.red 
                          }}>
                            {formatTime(agent.avgHandleTime)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ 
                                backgroundColor: agent.efficiencyScore >= 100 ? `${colors.green}20` : `${colors.red}20`,
                                color: agent.efficiencyScore >= 100 ? colors.green : colors.red
                              }}
                            >
                              {agent.efficiencyScore}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.red }}>
                            {agent.interactionsPerHour}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.secondary }}>
                            {agent.utilizationRate}%
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.primary }}>
                            {agent.uniqueQueues}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.secondary }}>
                            {agent.daysWorked}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {agentMetrics.agents.length > 20 && (
                <div className="px-6 py-3 text-center" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <p className="text-sm" style={{ color: colors.secondary }}>
                    Showing top 20 agents of {agentMetrics.agents.length} total agents
                  </p>
                </div>
              )}
            </div>

            {/* Coaching Opportunities Section */}
            <div className="mt-6">
              <div 
                className="rounded-2xl p-6"
                style={{ 
                  background: `linear-gradient(180deg, ${colors.card}, ${colors.cardHover})`,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
                  <BookOpen className="w-5 h-5" style={{ color: colors.red }} />
                  Coaching Opportunities
                </h2>
                <p className="text-sm mb-4" style={{ color: colors.secondary }}>
                  Agents with efficiency below 85% or high handle times may benefit from additional training
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agentMetrics.agents
                    .filter(agent => agent.efficiencyScore < 85 && agent.handledInteractions >= 10)
                    .slice(0, 4)
                    .map((agent) => (
                      <div 
                        key={agent.name}
                        className="p-4 rounded-xl"
                        style={{ 
                          backgroundColor: `${colors.red}10`,
                          border: `1px solid ${colors.red}40`
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold" style={{ color: colors.primary }}>
                              {agent.name}
                            </div>
                            <div className="text-xs mt-1" style={{ color: colors.secondary }}>
                              AHT: {formatTime(agent.avgHandleTime)} (Team avg: {formatTime(agentMetrics.teamAvgHandleTime)})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs" style={{ color: colors.secondary }}>Needs Improvement</div>
                            <div className="text-lg font-bold" style={{ color: colors.red }}>
                              {agent.efficiencyScore}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs" style={{ color: colors.red }}>
                          📊 Focus areas: Handle time reduction, process optimization
                        </div>
                      </div>
                    ))}
                </div>
                
                {agentMetrics.agents.filter(a => a.efficiencyScore < 85 && a.handledInteractions >= 10).length === 0 && (
                  <div className="text-center py-8" style={{ color: colors.green }}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>All agents are performing above coaching threshold!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-6 flex gap-3 flex-wrap">
              <Chip>👥 {agentMetrics.workforceStats.totalAgents} agents analyzed</Chip>
              <Chip>⭐ {agentMetrics.workforceStats.topPerformers} top performers</Chip>
              <Chip>📈 {agentMetrics.workforceStats.avgInteractionsPerAgent} avg interactions/agent</Chip>
              <Chip>⏱️ {formatTime(agentMetrics.workforceStats.avgHandleTimeOverall)} team avg AHT</Chip>
              <Chip>🎯 {agentMetrics.workforceStats.needsCoaching} need coaching</Chip>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentPerformanceDashboard;