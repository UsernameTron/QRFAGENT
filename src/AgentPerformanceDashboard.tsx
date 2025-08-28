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

  // Google Material Design inspired dark theme colors
  const colors = {
    // Backgrounds - Rich dark with subtle gradients
    bg: '#0f0f0f',
    bgGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
    panel: '#1e1e1e',
    panel2: '#2d2d2d',
    panelHover: '#383838',
    
    // Text colors
    ink: '#ffffff',
    muted: '#9aa0a6',
    subtle: '#5f6368',
    
    // Google brand colors
    primary: '#4285f4',      // Google Blue
    primaryHover: '#3367d6',
    secondary: '#34a853',    // Google Green  
    secondaryHover: '#1e8e3e',
    accent: '#ea4335',       // Google Red
    accentHover: '#d73527',
    warning: '#fbbc05',      // Google Yellow
    warningHover: '#f9ab00',
    
    // Status colors
    success: '#34a853',
    error: '#ea4335',
    info: '#4285f4',
    
    // Performance tiers
    gold: '#ffd700',
    silver: '#c4c4c4',
    bronze: '#cd7f32',
    
    // UI elements
    borderColor: '#3c4043',
    dividerColor: '#5f6368',
    chipBg: '#2d2d2d',
    chipBorder: '#5f6368',
    chipText: '#e8eaed',
    
    // Interactive states
    hover: 'rgba(255,255,255,0.08)',
    active: 'rgba(255,255,255,0.12)',
    focus: 'rgba(66,133,244,0.3)',
    
    // Shadows
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
    shadowLarge: '0 2px 6px 2px rgba(0, 0, 0, 0.15), 0 8px 24px 4px rgba(0, 0, 0, 0.3)'
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
      default: return <BookOpen className="w-4 h-4" style={{ color: colors.accent }} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'gold': return colors.gold;
      case 'silver': return colors.silver;
      case 'bronze': return colors.bronze;
      default: return colors.accent;
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
      className="rounded-xl p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
      style={{ 
        background: colors.panel,
        border: `1px solid ${colors.borderColor}`,
        boxShadow: colors.shadow
      }}
    >
      {Icon && (
        <div className="absolute top-5 right-5 transition-all duration-300 group-hover:scale-110">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${colors.primary}20`,
              border: `1px solid ${colors.primary}40`
            }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
        </div>
      )}
      <div className="mb-3">
        <div 
          className="text-sm font-medium tracking-wide uppercase" 
          style={{ color: colors.muted }}
        >
          {title}
        </div>
      </div>
      <div 
        className="text-3xl font-bold mb-2 transition-colors duration-300" 
        style={{ color: colors.ink }}
      >
        {value}
      </div>
      {subtitle && (
        <div 
          className="text-sm leading-relaxed" 
          style={{ color: colors.subtle }}
        >
          {subtitle}
        </div>
      )}
      {formula && showFormulas && (
        <div 
          className="mt-3 text-xs p-3 rounded-lg transition-all duration-300" 
          style={{ 
            backgroundColor: `${colors.info}15`,
            color: colors.info,
            border: `1px solid ${colors.info}30`
          }}
        >
          <span className="font-mono">📐 {formula}</span>
        </div>
      )}
      {trend !== undefined && (
        <div 
          className="absolute bottom-5 right-5 p-1 rounded-full transition-all duration-300" 
          style={{ 
            backgroundColor: trend > 0 ? `${colors.success}20` : `${colors.error}20`,
            color: trend > 0 ? colors.success : colors.error
          }}
        >
          {trend > 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      )}
    </div>
  );

  interface ChipProps {
    children: React.ReactNode;
    color?: string;
  }

  const Chip = ({ children, color = colors.chipBg }: ChipProps) => (
    <span 
      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
      style={{ 
        backgroundColor: color,
        color: colors.chipText,
        border: `1px solid ${colors.borderColor}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
      }}
    >
      {children}
    </span>
  );

  const FormulasPanel = () => (
    <div 
      className="rounded-2xl p-6 mb-6"
      style={{ 
        background: `linear-gradient(180deg, ${colors.panel}, ${colors.panel2})`,
        border: `1px solid ${colors.borderColor}`,
        boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
      }}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.ink }}>
        <Calculator className="w-5 h-5" style={{ color: colors.accent }} />
        Agent Performance Calculation Formulas
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formulas).map(([key, formula]) => (
          <div 
            key={key}
            className="p-4 rounded-xl"
            style={{ 
              backgroundColor: `${colors.chipBg}60`,
              border: `1px solid ${colors.borderColor}`
            }}
          >
            <div className="font-semibold mb-1" style={{ color: colors.ink }}>
              {formula.name}
            </div>
            <div className="text-sm mb-2 font-mono" style={{ color: colors.accent }}>
              {formula.formula}
            </div>
            <div className="text-xs" style={{ color: colors.muted }}>
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
          background: `linear-gradient(135deg, ${colors.panel}, ${colors.panel2})`,
          border: `2px solid ${agent.performanceTier === 'gold' ? colors.gold : colors.borderColor}`,
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
              <div className="font-semibold flex items-center gap-2" style={{ color: colors.ink }}>
                {agent.name.length > 20 ? agent.name.substring(0, 20) + '...' : agent.name}
                {getTierIcon(agent.performanceTier)}
              </div>
              <div className="text-xs" style={{ color: colors.muted }}>
                {agent.daysWorked} days active • {agent.uniqueQueues} queues
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: colors.muted }}>Efficiency</div>
            <div className="text-xl font-bold" style={{ 
              color: agent.efficiencyScore >= 100 ? colors.success : colors.error 
            }}>
              {agent.efficiencyScore}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <div className="text-xs" style={{ color: colors.muted }}>Handled</div>
            <div className="font-semibold" style={{ color: colors.accent }}>
              {agent.handledInteractions}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: colors.muted }}>AHT</div>
            <div className="font-semibold" style={{ color: colors.secondary }}>
              {formatTime(agent.avgHandleTime)}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: colors.muted }}>Per Hour</div>
            <div className="font-semibold" style={{ color: colors.ink }}>
              {agent.interactionsPerHour}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
          <div className="flex gap-2">
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: `${colors.accent}20`,
                color: colors.accent
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
          background: colors.bgGradient,
          color: colors.ink,
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <div className="max-w-7xl mx-auto px-7 py-7">
          <header className="flex items-center gap-4 flex-wrap mb-6">
            <Chip>👥 Agent Performance Analysis</Chip>
            <h1 className="text-3xl font-bold m-0" style={{ color: colors.ink }}>
              Agent Performance Dashboard
            </h1>
          </header>
          
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: `${colors.error}20`, border: `2px solid ${colors.error}` }}>
              <AlertTriangle className="w-8 h-8" style={{ color: colors.error }} />
            </div>
            <h2 className="text-xl font-bold mb-4">Error Processing File</h2>
            <p className="text-lg mb-6" style={{ color: colors.muted }}>{error}</p>
            <button 
              onClick={() => {setError(null); setData(null);}}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{ 
                background: colors.accent,
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
        background: colors.bgGradient,
        color: colors.ink,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      <div className="max-w-7xl mx-auto px-7 py-7">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Chip>
              <span className="flex items-center gap-2">
                👥 <span className="font-semibold">Workforce Analytics</span>
              </span>
            </Chip>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Agent Performance Dashboard
          </h1>
          <p className="text-lg leading-relaxed mb-6" style={{ color: colors.muted }}>
            Comprehensive call center workforce analytics, performance tracking, and coaching insights
          </p>
          {data && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-md hover:shadow-lg"
                style={{ 
                  background: showFormulas ? colors.primary : colors.panel,
                  color: showFormulas ? 'white' : colors.ink,
                  border: `1px solid ${showFormulas ? colors.primary : colors.borderColor}`
                }}
              >
                <Calculator className="w-4 h-4" />
                {showFormulas ? 'Hide' : 'Show'} Formulas
              </button>
              <label className="cursor-pointer">
                <div 
                  className="px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  style={{ 
                    background: colors.primary,
                    color: 'white',
                    border: `1px solid ${colors.primaryHover}`
                  }}
                >
                  📁 Upload New File
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
        </header>

        {/* File Upload Interface */}
        {!data && !isLoading && (
          <div className="mb-8">
            <div 
              className="rounded-2xl p-20 text-center border-2 border-dashed transition-all duration-300 hover:border-opacity-80"
              style={{ 
                background: colors.panel,
                borderColor: colors.primary,
                boxShadow: colors.shadow
              }}
            >
              <div className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110" 
                   style={{ 
                     background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}10)`,
                     border: `2px solid ${colors.primary}40`
                   }}>
                <Users className="w-10 h-10" style={{ color: colors.primary }} />
              </div>
              
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.ink }}>
                Upload Agent Performance Data
              </h2>
              <p className="text-lg mb-8 max-w-md mx-auto leading-relaxed" style={{ color: colors.muted }}>
                Drag and drop your CSV file here, or click to select agent interaction data
              </p>
              
              <label className="inline-block cursor-pointer group">
                <div 
                  className="px-8 py-4 rounded-lg font-medium transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-lg group-hover:shadow-xl"
                  style={{ 
                    background: colors.primary,
                    color: 'white',
                    border: `1px solid ${colors.primaryHover}`
                  }}
                >
                  <span className="flex items-center gap-2">
                    📁 Choose CSV File
                  </span>
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
                backgroundColor: `${colors.chipBg}40`, 
                border: `1px solid ${colors.borderColor}` 
              }}>
                <h3 className="font-semibold mb-2" style={{ color: colors.ink }}>Expected Format:</h3>
                <p className="text-sm" style={{ color: colors.muted }}>
                  CSV file with columns: Queue, Media Type, Abandoned (YES/NO), Total Handle, Total Queue, Users - Interacted, Date, etc.
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-t-transparent mb-4" 
                 style={{ borderColor: colors.accent }}></div>
            <p className="text-lg font-medium" style={{ color: colors.ink }}>Processing your data...</p>
            <p className="text-sm mt-2" style={{ color: colors.muted }}>Analyzing agent performance metrics</p>
          </div>
        )}

        {agentMetrics && (
          <>
            {/* Show Formulas Panel when toggled */}
            {showFormulas && <FormulasPanel />}

            {/* Filters and Controls */}
            <div className="flex gap-4 mb-8 flex-wrap">
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="px-4 py-3 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-md focus:ring-2"
                style={{ 
                  background: colors.panel,
                  color: colors.ink,
                  border: `1px solid ${colors.borderColor}`,
                  boxShadow: colors.shadow
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
                className="px-4 py-3 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-md focus:ring-2"
                style={{ 
                  background: colors.panel,
                  color: colors.ink,
                  border: `1px solid ${colors.borderColor}`,
                  boxShadow: colors.shadow
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
                className="px-4 py-3 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-md focus:ring-2"
                style={{ 
                  background: colors.panel,
                  color: colors.ink,
                  border: `1px solid ${colors.borderColor}`,
                  boxShadow: colors.shadow
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
                className="px-4 py-3 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all duration-200 hover:shadow-md focus:ring-2"
                style={{ 
                  background: colors.panel,
                  color: colors.ink,
                  border: `1px solid ${colors.borderColor}`,
                  boxShadow: colors.shadow
                }}
              >
                <option value="interactions">Sort by Interactions</option>
                <option value="handleTime">Sort by Handle Time</option>
                <option value="efficiency">Sort by Efficiency</option>
              </select>
            </div>

            {/* Workforce Overview KPIs */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  background: `linear-gradient(180deg, ${colors.panel}, ${colors.panel2})`,
                  border: `1px solid ${colors.borderColor}`,
                  boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.ink }}>
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
                background: `linear-gradient(180deg, ${colors.panel}, ${colors.panel2})`,
                border: `1px solid ${colors.borderColor}`,
                boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
              }}
            >
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.ink }}>
                  <BarChart3 className="w-5 h-5" style={{ color: colors.accent }} />
                  Agent Performance Metrics
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  Comprehensive agent analytics for workforce optimization
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Agent
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Tier
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Handled
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        AHT
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Efficiency
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Per Hour
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Utilization
                        {showFormulas && <Info className="w-3 h-3 inline ml-1" />}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
                        Queues
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>
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
                          style={{ borderBottom: `1px solid ${colors.borderColor}` }}
                        >
                          <td className="px-6 py-4 font-medium text-sm" style={{ color: colors.ink }}>
                            {agent.name.length > 25 ? agent.name.substring(0, 25) + '...' : agent.name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getTierIcon(agent.performanceTier)}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: colors.ink }}>
                            {agent.totalInteractions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.success }}>
                            {agent.handledInteractions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ 
                            color: agent.avgHandleTime <= agentMetrics.teamAvgHandleTime ? colors.success : colors.error 
                          }}>
                            {formatTime(agent.avgHandleTime)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ 
                                backgroundColor: agent.efficiencyScore >= 100 ? `${colors.success}20` : `${colors.error}20`,
                                color: agent.efficiencyScore >= 100 ? colors.success : colors.error
                              }}
                            >
                              {agent.efficiencyScore}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.accent }}>
                            {agent.interactionsPerHour}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.secondary }}>
                            {agent.utilizationRate}%
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-medium" style={{ color: colors.ink }}>
                            {agent.uniqueQueues}
                          </td>
                          <td className="px-6 py-4 text-center text-sm" style={{ color: colors.muted }}>
                            {agent.daysWorked}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              
              {agentMetrics.agents.length > 20 && (
                <div className="px-6 py-3 text-center" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
                  <p className="text-sm" style={{ color: colors.muted }}>
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
                  background: `linear-gradient(180deg, ${colors.panel}, ${colors.panel2})`,
                  border: `1px solid ${colors.borderColor}`,
                  boxShadow: '0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.02)'
                }}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.ink }}>
                  <BookOpen className="w-5 h-5" style={{ color: colors.error }} />
                  Coaching Opportunities
                </h2>
                <p className="text-sm mb-4" style={{ color: colors.muted }}>
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
                          backgroundColor: `${colors.error}10`,
                          border: `1px solid ${colors.error}40`
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold" style={{ color: colors.ink }}>
                              {agent.name}
                            </div>
                            <div className="text-xs mt-1" style={{ color: colors.muted }}>
                              AHT: {formatTime(agent.avgHandleTime)} (Team avg: {formatTime(agentMetrics.teamAvgHandleTime)})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs" style={{ color: colors.muted }}>Needs Improvement</div>
                            <div className="text-lg font-bold" style={{ color: colors.error }}>
                              {agent.efficiencyScore}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs" style={{ color: colors.accent }}>
                          📊 Focus areas: Handle time reduction, process optimization
                        </div>
                      </div>
                    ))}
                </div>
                
                {agentMetrics.agents.filter(a => a.efficiencyScore < 85 && a.handledInteractions >= 10).length === 0 && (
                  <div className="text-center py-8" style={{ color: colors.success }}>
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