import React, { useState, useMemo } from 'react';
import { Award, AlertTriangle, Activity, Users, Zap, BarChart3, Star, Shield, BookOpen, ChevronUp, ChevronDown, Calculator, Info, CheckCircle, Target, LucideIcon } from 'lucide-react';
import Papa from 'papaparse';

interface DataRow {
  [key: string]: any;
}

interface AgentData {
  name: any;
  totalInteractions: any;
  handledInteractions: any;
  abandonedWhileAssigned: any;
  avgHandleTime: number;
  totalHandleTime: number;
  productivityRate: string;
  efficiencyScore: number;
  versatilityScore: string;
  interactionsPerHour: string;
  utilizationRate: string;
  uniqueQueues: number;
  uniqueMediaTypes: number;
  daysWorked: number;
  queues: any[];
  mediaTypes: any[];
  performanceTier: string;
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

  // Advanced organic design system with dynamic backgrounds
  const colors = {
    // Backgrounds - Dynamic and organic
    bg: '#000000',
    bgPattern: `
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
      radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
      linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%)
    `,
    card: 'rgba(255, 255, 255, 0.04)',
    cardHover: 'rgba(255, 255, 255, 0.08)',
    
    // Text - High contrast with subtle gradients
    primary: '#ffffff',
    secondary: '#a3a3a3',
    tertiary: '#6b7280',
    
    // Refined accent palette with organic variations
    blue: '#3b82f6',
    blueGlow: 'rgba(59, 130, 246, 0.2)',
    green: '#10b981',
    greenGlow: 'rgba(16, 185, 129, 0.2)',
    red: '#ef4444',
    redGlow: 'rgba(239, 68, 68, 0.2)',
    yellow: '#f59e0b',
    orange: '#f97316',
    purple: '#8b5cf6',
    purpleGlow: 'rgba(139, 92, 246, 0.2)',
    
    // UI elements with organic feel
    border: 'rgba(255, 255, 255, 0.1)',
    borderActive: 'rgba(255, 255, 255, 0.2)',
    
    // Interactive states
    hover: 'rgba(255, 255, 255, 0.06)',
    active: 'rgba(255, 255, 255, 0.12)',
    
    // Performance tiers with glow effects
    gold: '#fbbf24',
    goldGlow: 'rgba(251, 191, 36, 0.3)',
    silver: '#d1d5db',
    silverGlow: 'rgba(209, 213, 219, 0.2)',
    bronze: '#d97706',
    bronzeGlow: 'rgba(217, 119, 6, 0.2)'
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

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: MetricCardProps) => {
    // Generate organic variations for each card
    const cardVariations = [
      { rotation: '1deg', borderRadius: '24px 12px 18px 20px', animationDelay: '0s' },
      { rotation: '-0.5deg', borderRadius: '16px 28px 14px 24px', animationDelay: '0.1s' },
      { rotation: '1.2deg', borderRadius: '20px 16px 26px 18px', animationDelay: '0.2s' },
      { rotation: '-0.8deg', borderRadius: '22px 20px 16px 28px', animationDelay: '0.3s' }
    ];
    
    const randomVariation = cardVariations[Math.floor(Math.random() * cardVariations.length)];
    
    return (
      <div 
        className="group relative organic-card"
        style={{
          transform: `rotate(${randomVariation.rotation})`,
          animationDelay: randomVariation.animationDelay
        }}
      >
        <div
          className="h-full p-6 backdrop-blur-sm transition-all duration-700 hover:-translate-y-2 hover:rotate-0 border relative overflow-hidden"
          style={{ 
            background: colors.card,
            borderColor: colors.border,
            borderRadius: randomVariation.borderRadius,
            willChange: 'transform, background-color'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.cardHover;
            e.currentTarget.style.borderColor = colors.borderActive;
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02) rotate(0deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.card;
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.transform = 'translateY(0px) scale(1) rotate(0deg)';
          }}
        >
          {/* Organic background shape */}
          <div 
            className="absolute inset-0 opacity-10 transition-all duration-700 group-hover:opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 70%, ${colors.blue}40, transparent 50%)`,
              clipPath: 'ellipse(60% 40% at 20% 80%)'
            }}
          />
          
          {Icon && (
            <div className="mb-6 inline-flex relative z-10">
              <Icon 
                className="w-6 h-6 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12" 
                style={{ color: colors.blue }} 
              />
            </div>
          )}
          
          <div className="space-y-2 relative z-10">
            <h3 
              className="text-sm font-medium tracking-tight transition-all duration-300 group-hover:text-opacity-90" 
              style={{ color: colors.secondary }}
            >
              {title}
            </h3>
            
            <div 
              className="text-2xl font-semibold tracking-tight transition-all duration-300 group-hover:scale-105" 
              style={{ color: colors.primary }}
            >
              {value}
            </div>
            
            {subtitle && (
              <p 
                className="text-sm leading-relaxed transition-all duration-300" 
                style={{ color: colors.tertiary }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {trend !== undefined && (
            <div className="absolute top-6 right-6 z-10">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                style={{ 
                  background: `linear-gradient(135deg, ${trend > 0 ? colors.green : colors.red}20, ${trend > 0 ? colors.green : colors.red}10)`
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
  };

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

  const FlowingDivider = () => (
    <div className="w-full h-24 my-16 relative overflow-hidden">
      <svg 
        className="w-full h-full"
        viewBox="0 0 1200 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: colors.blue, stopOpacity: 0.1 }} />
            <stop offset="50%" style={{ stopColor: colors.purple, stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: colors.green, stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        <path 
          d="M0,50 Q300,10 600,50 T1200,50 L1200,100 L0,100 Z"
          fill="url(#flowGradient)"
          className="animate-pulse"
        />
        <path 
          d="M0,60 Q400,20 800,60 T1200,60"
          stroke={colors.border}
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </div>
  );

  interface CoachingFocusCardProps {
    agent: AgentData;
    rank: number;
  }

  const CoachingFocusCard = ({ agent, rank }: CoachingFocusCardProps) => {
    const improvementAreas = [];
    if (agent.efficiencyScore < 85) improvementAreas.push('Handle Time');
    if (parseFloat(agent.productivityRate) < 75) improvementAreas.push('Productivity');
    if (parseFloat(agent.utilizationRate) < 70) improvementAreas.push('Utilization');
    
    const gapFromTarget = 100 - agent.efficiencyScore;
    
    return (
      <div 
        className="organic-card organic-agent-card group cursor-pointer transition-all duration-300 hover:scale-105"
        style={{
          transform: `rotate(${(rank % 2 === 0 ? 1 : -1) * (0.5 + rank * 0.3)}deg)`
        } as React.CSSProperties}
      >
        <div 
          className="p-6 h-full glass-morphism relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              ${colors.red}15 0%, 
              ${colors.orange}10 50%,
              ${colors.red}08 100%
            )`,
            borderRadius: '24px 16px 28px 20px',
            border: `2px solid ${colors.red}30`,
            boxShadow: `
              0 8px 24px rgba(239, 68, 68, 0.15),
              0 4px 12px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `
          }}
        >
          <div className="absolute top-4 right-4 opacity-30">
            <BookOpen className="w-8 h-8" style={{ color: colors.red }} />
          </div>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.red}40, ${colors.orange}30)`,
                  color: colors.red,
                  border: `1px solid ${colors.red}50`
                }}
              >
                {rank}
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: colors.primary }}>
                  {agent.name}
                </h3>
                <p className="text-xs" style={{ color: colors.red }}>
                  Coaching Priority
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs" style={{ color: colors.secondary }}>Efficiency Gap</span>
              <span className="font-bold text-lg" style={{ color: colors.red }}>
                -{gapFromTarget}%
              </span>
            </div>
            
            <div className="w-full bg-black bg-opacity-30 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${agent.efficiencyScore}%`,
                  background: `linear-gradient(90deg, ${colors.red}, ${colors.orange})`
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center">
                <div className="text-xs" style={{ color: colors.secondary }}>AHT</div>
                <div className="font-semibold text-sm" style={{ color: colors.red }}>
                  {formatTime(agent.avgHandleTime)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: colors.secondary }}>Target</div>
                <div className="font-semibold text-sm" style={{ color: colors.orange }}>
                  {formatTime(agentMetrics.teamAvgHandleTime)}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${colors.red}15` }}>
              <div className="text-xs font-medium mb-2" style={{ color: colors.red }}>
                Focus Areas
              </div>
              <div className="flex flex-wrap gap-1">
                {improvementAreas.map(area => (
                  <span 
                    key={area}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      background: `${colors.red}20`,
                      color: colors.red,
                      border: `1px solid ${colors.red}30`
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: colors.orange }}>
              <Target className="w-3 h-3" />
              <span>Development Plan Available</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  // Enhanced organic agent card with mini visualizations
  const AgentCard = ({ agent, rank }: any) => {
    const tierColor = getTierColor(agent.performanceTier);
    const cardRotations = ['-1.5deg', '0.8deg', '-0.3deg', '1.2deg', '-0.7deg'];
    const cardRotation = cardRotations[rank % cardRotations.length];
    
    return (
      <div 
        className="group organic-agent-card relative"
        style={{
          transform: `rotate(${cardRotation})`,
          transformOrigin: 'center center'
        }}
      >
        <div
          className="p-6 relative backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:rotate-0 border overflow-hidden"
          style={{ 
            background: colors.card,
            border: `1px solid ${agent.performanceTier === 'gold' ? colors.gold : colors.border}`,
            borderRadius: '28px 16px 24px 20px',
            boxShadow: agent.performanceTier === 'gold' ? 
              `0 8px 32px ${colors.gold}30, 0 0 0 1px ${colors.gold}20` : 
              `0 4px 20px rgba(0,0,0,.2)`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02) rotate(0deg)';
            e.currentTarget.style.borderColor = agent.performanceTier === 'gold' ? colors.gold : colors.borderActive;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px) scale(1) rotate(0deg)';
            e.currentTarget.style.borderColor = agent.performanceTier === 'gold' ? colors.gold : colors.border;
          }}
        >
          {/* Organic background pattern */}
          <div 
            className="absolute inset-0 opacity-5 transition-all duration-500 group-hover:opacity-10"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${tierColor}, transparent 60%)`,
              clipPath: 'ellipse(70% 50% at 30% 80%)'
            }}
          />

          {/* Header with rank and tier */}
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3">
              {/* Organic rank badge */}
              <div 
                className="text-sm font-bold flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                style={{ 
                  width: '32px',
                  height: '32px',
                  background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}10)`,
                  color: tierColor,
                  border: `1px solid ${tierColor}40`,
                  borderRadius: '12px 6px 10px 8px'
                }}
              >
                #{rank}
              </div>
              
              {/* Agent name and info */}
              <div>
                <div className="font-semibold flex items-center gap-2 text-base" style={{ color: colors.primary }}>
                  {agent.name.length > 18 ? agent.name.substring(0, 18) + '...' : agent.name}
                  {getTierIcon(agent.performanceTier)}
                </div>
                <div className="text-xs mt-1" style={{ color: colors.tertiary }}>
                  {agent.daysWorked} days • {agent.uniqueQueues} queues
                </div>
              </div>
            </div>

            {/* Circular progress for efficiency */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={colors.border}
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke={agent.efficiencyScore >= 100 ? colors.green : colors.red}
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${Math.min(agent.efficiencyScore, 100) * 1.25} 125`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: colors.primary }}>
                  {agent.efficiencyScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Performance metrics in organic layout */}
          <div className="space-y-4 mb-6 relative z-10">
            {/* Handled interactions with mini bar */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: colors.secondary }}>
                Interactions
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000 group-hover:scale-105"
                  style={{ 
                    width: '60px',
                    background: `linear-gradient(90deg, ${colors.blue}40, ${colors.blue})`,
                    transform: `scaleX(${Math.min(agent.handledInteractions / 100, 1)})`
                  }}
                />
                <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {agent.handledInteractions}
                </span>
              </div>
            </div>

            {/* Average handle time */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: colors.secondary }}>
                Avg Handle Time
              </span>
              <span className="text-sm font-semibold" style={{ color: colors.tertiary }}>
                {formatTime(agent.avgHandleTime)}
              </span>
            </div>

            {/* Interactions per hour */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: colors.secondary }}>
                Per Hour
              </span>
              <span className="text-sm font-semibold" style={{ color: colors.green }}>
                {agent.interactionsPerHour}
              </span>
            </div>
          </div>

          {/* Bottom metrics */}
          <div className="pt-4 relative z-10" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${colors.blue}15`,
                    color: colors.blue,
                    border: `1px solid ${colors.blue}30`
                  }}
                >
                  {agent.productivityRate}% Productive
                </span>
              </div>
              <span 
                className="text-xs font-medium"
                style={{ color: colors.tertiary }}
              >
                {agent.utilizationRate}% Utilized
              </span>
            </div>
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
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        background: `${colors.bg}, ${colors.bgPattern}`,
        color: colors.primary,
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}
    >
      {/* Organic background shapes with particle system */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating particles */}
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        
        {/* Dynamic organic shapes */}
        <div 
          className="absolute"
          style={{
            top: '10%',
            left: '5%',
            width: '400px',
            height: '300px',
            background: `radial-gradient(ellipse, ${colors.blueGlow}, transparent 70%)`,
            clipPath: 'ellipse(60% 40% at 30% 70%)',
            transform: 'rotate(-15deg)',
            animation: 'organicPulse 8s ease-in-out infinite, backgroundShift 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute"
          style={{
            top: '60%',
            right: '10%',
            width: '300px',
            height: '400px',
            background: `radial-gradient(ellipse, ${colors.purpleGlow}, transparent 60%)`,
            clipPath: 'ellipse(50% 60% at 70% 30%)',
            transform: 'rotate(25deg)',
            animation: 'organicPulse 12s ease-in-out infinite, backgroundShift 30s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute"
          style={{
            bottom: '20%',
            left: '20%',
            width: '250px',
            height: '350px',
            background: `radial-gradient(ellipse, ${colors.greenGlow}, transparent 50%)`,
            clipPath: 'ellipse(70% 30% at 40% 60%)',
            transform: 'rotate(-8deg)',
            animation: 'organicPulse 10s ease-in-out infinite, backgroundShift 25s ease-in-out infinite',
            animationDelay: '4s'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header with fluid typography */}
        <header className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 
                className="fluid-text-3xl font-medium tracking-tight mb-3 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
                style={{ 
                  backgroundSize: '200% 200%',
                  animation: 'backgroundShift 6s ease-in-out infinite'
                }}
              >
                Agent Performance
              </h1>
              <p className="fluid-text-xl" style={{ color: colors.secondary }}>
                Organic workforce analytics and insights
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
            <section className="flex flex-wrap justify-center gap-8 mb-20" style={{ perspective: '1000px' }}>
              <MetricCard
                title="Total Agents"
                value={agentMetrics.workforceStats.totalAgents}
                subtitle={`In workforce`}
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

            {/* Flowing divider */}
            <FlowingDivider />

            {/* Top Performers Section - Organic Layout */}
            <div className="mb-16">
              <div className="mb-12 text-center">
                <h2 className="text-2xl font-medium tracking-tight mb-3 flex items-center justify-center gap-3" style={{ color: colors.primary }}>
                  <Award className="w-6 h-6" style={{ color: colors.gold }} />
                  Top Performing Agents
                </h2>
                <p className="text-base" style={{ color: colors.secondary }}>
                  Outstanding performers driving excellence across the team
                </p>
              </div>
              
              {/* Organic masonry-style layout */}
              <div className="organic-grid" style={{ columnCount: 'auto', columnWidth: '320px', columnGap: '2rem' }}>
                {agentMetrics.agents
                  .filter(agent => agent.handledInteractions >= 10)
                  .slice(0, 8)
                  .map((agent, idx) => (
                    <div key={agent.name} style={{ breakInside: 'avoid', marginBottom: '2rem' }}>
                      <AgentCard agent={agent} rank={idx + 1} />
                    </div>
                  ))}
              </div>
            </div>

            {/* Flowing divider */}
            <FlowingDivider />

            {/* Bottom Performing Agents - Coaching Focus */}
            <div className="mb-16">
              <div className="mb-12 text-center">
                <h2 className="text-2xl font-medium tracking-tight mb-3 flex items-center justify-center gap-3" style={{ color: colors.primary }}>
                  <BookOpen className="w-6 h-6" style={{ color: colors.yellow }} />
                  Development Opportunities
                </h2>
                <p className="text-base" style={{ color: colors.secondary }}>
                  Agents with growth potential who would benefit from targeted coaching
                </p>
              </div>
              
              {/* Bottom performers with coaching focus */}
              <div className="organic-grid" style={{ columnCount: 'auto', columnWidth: '320px', columnGap: '2rem' }}>
                {agentMetrics.agents
                  .filter(agent => agent.handledInteractions >= 10 && (agent.efficiencyScore < 85 || parseFloat(agent.productivityRate) < 75))
                  .sort((a, b) => a.efficiencyScore - b.efficiencyScore) // Sort worst to best for development focus
                  .slice(0, 6)
                  .map((agent, idx) => (
                    <div key={agent.name} style={{ breakInside: 'avoid', marginBottom: '2rem' }}>
                      <CoachingFocusCard agent={agent} rank={idx + 1} />
                    </div>
                  ))}
              </div>
              
              {agentMetrics.agents.filter(a => a.handledInteractions >= 10 && (a.efficiencyScore < 85 || parseFloat(a.productivityRate) < 75)).length === 0 && (
                <div className="text-center py-16">
                  <div 
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-110" 
                    style={{ 
                      background: colors.card,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <CheckCircle className="w-10 h-10" style={{ color: colors.green }} />
                  </div>
                  <h3 className="text-xl font-medium mb-2" style={{ color: colors.primary }}>
                    Excellent Team Performance! 
                  </h3>
                  <p className="text-base" style={{ color: colors.secondary }}>
                    All agents are meeting performance standards
                  </p>
                </div>
              )}
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
              
            </div>

            {/* Bottom Performing Agents - Coaching Focus */}
            <div className="mt-16">
              <div className="mb-8">
                <FlowingDivider />
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.red }}>
                  Development Opportunities
                </h2>
                <p style={{ color: colors.secondary }}>
                  Agents who could benefit from targeted coaching and skill development
                </p>
              </div>
              
              <div className="organic-grid">
                {agentMetrics.agents
                  .filter(agent => (agent.efficiencyScore < 85 || parseFloat(agent.productivityRate) < 75) && agent.handledInteractions >= 10)
                  .slice(0, 6)
                  .map((agent, idx) => (
                    <CoachingFocusCard key={agent.name} agent={agent} rank={idx + 1} />
                  ))}
              </div>
              
              {agentMetrics.agents.filter(a => (a.efficiencyScore < 85 || parseFloat(a.productivityRate) < 75) && a.handledInteractions >= 10).length === 0 && (
                <div className="text-center py-16">
                  <div 
                    className="inline-block p-8 rounded-full mb-4"
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.green}20, ${colors.primary}20)`,
                      border: `2px solid ${colors.green}40`
                    }}
                  >
                    <CheckCircle className="w-12 h-12" style={{ color: colors.green }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.green }}>
                    Exceptional Team Performance!
                  </h3>
                  <p style={{ color: colors.secondary }}>
                    All agents are exceeding performance thresholds
                  </p>
                </div>
              )}
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