import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  Calendar,
  Users,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  current: number;
  week: number;
  month: number;
  trend: 'up' | 'down' | 'stable';
  department: string;
  shift: 'morning' | 'afternoon' | 'night';
  callsHandled: number;
  avgHandleTime: number;
  customerSatisfaction: number;
  firstCallResolution: number;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ComponentType<any>;
  className?: string;
  percentage?: boolean;
}

interface PerformanceBarProps {
  value: number;
  showLabel?: boolean;
  height?: string;
  animated?: boolean;
}

const AgentPerformanceMetrics: React.FC = () => {
  // Enhanced sample agent performance data with more metrics
  const [agents, setAgents] = useState<Agent[]>([
    { id: '001', name: 'Sarah Chen', current: 96.2, week: 94.8, month: 93.5, trend: 'up', department: 'Sales', shift: 'morning', callsHandled: 127, avgHandleTime: 4.2, customerSatisfaction: 4.8, firstCallResolution: 89.5 },
    { id: '002', name: 'Michael Rodriguez', current: 94.5, week: 93.2, month: 92.1, trend: 'up', department: 'Technical Support', shift: 'afternoon', callsHandled: 98, avgHandleTime: 7.1, customerSatisfaction: 4.6, firstCallResolution: 82.1 },
    { id: '003', name: 'Emma Watson', current: 92.8, week: 91.5, month: 90.8, trend: 'up', department: 'Customer Service', shift: 'morning', callsHandled: 143, avgHandleTime: 3.8, customerSatisfaction: 4.7, firstCallResolution: 87.3 },
    { id: '004', name: 'James Wilson', current: 91.3, week: 92.0, month: 91.5, trend: 'down', department: 'Sales', shift: 'afternoon', callsHandled: 89, avgHandleTime: 5.2, customerSatisfaction: 4.4, firstCallResolution: 78.9 },
    { id: '005', name: 'Lisa Anderson', current: 90.7, week: 89.8, month: 88.9, trend: 'up', department: 'Technical Support', shift: 'night', callsHandled: 76, avgHandleTime: 8.3, customerSatisfaction: 4.3, firstCallResolution: 84.2 },
    { id: '006', name: 'David Kim', current: 89.2, week: 88.5, month: 87.8, trend: 'up', department: 'Customer Service', shift: 'morning', callsHandled: 156, avgHandleTime: 3.2, customerSatisfaction: 4.5, firstCallResolution: 91.7 },
    { id: '007', name: 'Jennifer Brown', current: 88.9, week: 88.9, month: 89.1, trend: 'stable', department: 'Sales', shift: 'afternoon', callsHandled: 102, avgHandleTime: 4.8, customerSatisfaction: 4.2, firstCallResolution: 76.4 },
    { id: '008', name: 'Robert Taylor', current: 87.5, week: 86.8, month: 85.9, trend: 'up', department: 'Customer Service', shift: 'night', callsHandled: 134, avgHandleTime: 4.1, customerSatisfaction: 4.4, firstCallResolution: 83.8 },
    { id: '009', name: 'Maria Garcia', current: 86.8, week: 87.2, month: 87.5, trend: 'down', department: 'Technical Support', shift: 'morning', callsHandled: 87, avgHandleTime: 6.9, customerSatisfaction: 4.1, firstCallResolution: 79.3 },
    { id: '010', name: 'John Smith', current: 86.2, week: 85.5, month: 84.8, trend: 'up', department: 'Sales', shift: 'afternoon', callsHandled: 94, avgHandleTime: 5.5, customerSatisfaction: 4.0, firstCallResolution: 74.2 }
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Agent>('current');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Enhanced performance metrics calculations
  const metrics = useMemo(() => {
    const filteredAgents = agents.filter(agent => {
      const matchesDepartment = departmentFilter === 'all' || agent.department === departmentFilter;
      const matchesShift = shiftFilter === 'all' || agent.shift === shiftFilter;
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesShift && matchesSearch;
    });

    const avgPerformance = filteredAgents.reduce((acc, agent) => acc + agent.current, 0) / filteredAgents.length;
    const topPerformer = filteredAgents.reduce((top, agent) => agent.current > top.current ? agent : top, filteredAgents[0]);
    const aboveTarget = filteredAgents.filter(agent => agent.current >= 85).length;
    const performanceTrend = filteredAgents.reduce((acc, agent) => {
      const diff = agent.current - agent.week;
      return acc + diff;
    }, 0) / filteredAgents.length;

    const avgSatisfaction = filteredAgents.reduce((acc, agent) => acc + agent.customerSatisfaction, 0) / filteredAgents.length;
    const avgHandleTime = filteredAgents.reduce((acc, agent) => acc + agent.avgHandleTime, 0) / filteredAgents.length;
    const avgFCR = filteredAgents.reduce((acc, agent) => acc + agent.firstCallResolution, 0) / filteredAgents.length;
    const totalCalls = filteredAgents.reduce((acc, agent) => acc + agent.callsHandled, 0);

    const distribution = {
      excellent: filteredAgents.filter(a => a.current >= 90).length,
      good: filteredAgents.filter(a => a.current >= 80 && a.current < 90).length,
      average: filteredAgents.filter(a => a.current >= 70 && a.current < 80).length,
      poor: filteredAgents.filter(a => a.current < 70).length
    };

    const departmentStats = agents.reduce((acc, agent) => {
      if (!acc[agent.department]) {
        acc[agent.department] = { count: 0, avgPerformance: 0, totalPerformance: 0 };
      }
      acc[agent.department].count++;
      acc[agent.department].totalPerformance += agent.current;
      acc[agent.department].avgPerformance = acc[agent.department].totalPerformance / acc[agent.department].count;
      return acc;
    }, {} as Record<string, { count: number; avgPerformance: number; totalPerformance: number }>);

    return {
      avgPerformance: Number(avgPerformance.toFixed(1)),
      topPerformer: topPerformer || { name: 'N/A', current: 0 },
      aboveTarget,
      totalAgents: filteredAgents.length,
      performanceTrend: Number(performanceTrend.toFixed(1)),
      distribution,
      avgSatisfaction: Number(avgSatisfaction.toFixed(1)),
      avgHandleTime: Number(avgHandleTime.toFixed(1)),
      avgFCR: Number(avgFCR.toFixed(1)),
      totalCalls,
      departmentStats,
      filteredAgents
    };
  }, [agents, departmentFilter, shiftFilter, searchTerm]);

  // Performance classification with enhanced categories
  const getPerformanceClass = useCallback((value: number) => {
    if (value >= 95) return { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Outstanding', bgGlow: 'shadow-emerald-500/20' };
    if (value >= 90) return { color: 'text-green-400', bg: 'bg-green-500', label: 'Excellent', bgGlow: 'shadow-green-500/20' };
    if (value >= 85) return { color: 'text-cyan-400', bg: 'bg-cyan-500', label: 'Good', bgGlow: 'shadow-cyan-500/20' };
    if (value >= 75) return { color: 'text-yellow-400', bg: 'bg-yellow-500', label: 'Average', bgGlow: 'shadow-yellow-500/20' };
    if (value >= 65) return { color: 'text-orange-400', bg: 'bg-orange-500', label: 'Below Average', bgGlow: 'shadow-orange-500/20' };
    return { color: 'text-red-400', bg: 'bg-red-500', label: 'Poor', bgGlow: 'shadow-red-500/20' };
  }, []);

  // Sorting functionality
  const sortedAgents = useMemo(() => {
    return [...metrics.filteredAgents].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [metrics.filteredAgents, sortBy, sortOrder]);

  // Handle sorting
  const handleSort = (column: keyof Agent) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // Refresh data simulation with realistic fluctuations
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        current: Math.min(100, Math.max(60, agent.current + (Math.random() - 0.5) * 3)),
        callsHandled: Math.max(50, agent.callsHandled + Math.floor((Math.random() - 0.5) * 20)),
        avgHandleTime: Math.max(2, agent.avgHandleTime + (Math.random() - 0.5) * 1),
        customerSatisfaction: Math.min(5, Math.max(3, agent.customerSatisfaction + (Math.random() - 0.5) * 0.3)),
        firstCallResolution: Math.min(100, Math.max(60, agent.firstCallResolution + (Math.random() - 0.5) * 5))
      })));
      setRefreshing(false);
    }, 1500);
  }, []);

  // Export to CSV with enhanced data
  const handleExport = useCallback(() => {
    const csv = [
      ['Rank', 'Agent ID', 'Agent Name', 'Department', 'Shift', 'Current Performance', '7-Day Average', '30-Day Average', 'Trend', 'Calls Handled', 'Avg Handle Time', 'Customer Satisfaction', 'First Call Resolution'],
      ...sortedAgents.map((agent, index) => [
        index + 1,
        agent.id,
        agent.name,
        agent.department,
        agent.shift,
        `${agent.current.toFixed(1)}%`,
        `${agent.week.toFixed(1)}%`,
        `${agent.month.toFixed(1)}%`,
        agent.trend,
        agent.callsHandled,
        `${agent.avgHandleTime.toFixed(1)}s`,
        agent.customerSatisfaction.toFixed(1),
        `${agent.firstCallResolution.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sortedAgents]);

  // Enhanced Metric Card Component
  const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    subtitle,
    trend,
    icon: Icon,
    className = '',
    percentage = false
  }) => (
    <div className={`bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</div>
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
      </div>
      <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
        {typeof value === 'number' ? value.toFixed(1) : value}{percentage && '%'}
      </div>
      {subtitle && <div className="text-slate-400 text-sm mb-2">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`text-sm flex items-center gap-1 ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
          {trend > 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : trend < 0 ? (
            <ArrowDownRight className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
          {Math.abs(trend).toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );

  // Enhanced Performance Bar Component
  const PerformanceBar: React.FC<PerformanceBarProps> = ({
    value,
    showLabel = true,
    height = 'h-3',
    animated = true
  }) => {
    const { color, bg, bgGlow } = getPerformanceClass(value);
    return (
      <div className="flex items-center gap-3">
        <div className={`flex-1 ${height} bg-slate-900 rounded-full overflow-hidden shadow-inner`}>
          <div
            className={`h-full ${bg} transition-all duration-1000 ease-out relative overflow-hidden ${bgGlow}`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          >
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>
        {showLabel && (
          <span className={`text-sm font-semibold min-w-[55px] text-right ${color}`}>
            {value.toFixed(1)}%
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
                  Agent Performance Metrics
                </h1>
                <p className="text-slate-400 mt-2 text-lg">Real-time performance monitoring and comprehensive analytics</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-indigo-600 hover:to-purple-600 border border-slate-600 rounded-xl text-white transition-all duration-300 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={handleExport}
                className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-emerald-600 hover:to-teal-600 border border-slate-600 rounded-xl text-white transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Customer Service">Customer Service</option>
            </select>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </select>
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Showing {metrics.totalAgents} agents</span>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Average Performance"
            value={metrics.avgPerformance}
            percentage={true}
            trend={metrics.performanceTrend}
            icon={TrendingUp}
            className={getPerformanceClass(metrics.avgPerformance).color}
          />
          <MetricCard
            label="Top Performer"
            value={`${metrics.topPerformer.current?.toFixed(1)}%`}
            subtitle={metrics.topPerformer.name}
            icon={Award}
            className="text-emerald-400"
          />
          <MetricCard
            label="Above Target (85%)"
            value={`${metrics.aboveTarget}/${metrics.totalAgents}`}
            subtitle={`${((metrics.aboveTarget / metrics.totalAgents) * 100).toFixed(1)}% of team`}
            icon={Target}
            className="text-cyan-400"
          />
          <MetricCard
            label="Total Calls Handled"
            value={metrics.totalCalls.toLocaleString()}
            subtitle="This period"
            icon={Activity}
            className="text-indigo-400"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            label="Avg Customer Satisfaction"
            value={metrics.avgSatisfaction}
            subtitle="Out of 5.0"
            icon={Star}
            className="text-yellow-400"
          />
          <MetricCard
            label="Avg Handle Time"
            value={`${metrics.avgHandleTime}s`}
            subtitle="Per call"
            icon={Activity}
            className="text-purple-400"
          />
          <MetricCard
            label="First Call Resolution"
            value={metrics.avgFCR}
            percentage={true}
            subtitle="Average across team"
            icon={CheckCircle}
            className="text-green-400"
          />
        </div>

        {/* Performance Distribution and Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Performance Distribution
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Outstanding (95%+)', count: sortedAgents.filter(a => a.current >= 95).length, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: 'Excellent (90-94%)', count: sortedAgents.filter(a => a.current >= 90 && a.current < 95).length, color: 'bg-green-500', textColor: 'text-green-400' },
                { label: 'Good (85-89%)', count: sortedAgents.filter(a => a.current >= 85 && a.current < 90).length, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
                { label: 'Average (75-84%)', count: sortedAgents.filter(a => a.current >= 75 && a.current < 85).length, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                { label: 'Below Average (65-74%)', count: sortedAgents.filter(a => a.current >= 65 && a.current < 75).length, color: 'bg-orange-500', textColor: 'text-orange-400' },
                { label: 'Needs Improvement (<65%)', count: sortedAgents.filter(a => a.current < 65).length, color: 'bg-red-500', textColor: 'text-red-400' }
              ].map((category) => (
                <div key={category.label} className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm w-44">{category.label}</span>
                  <div className="flex-1 h-10 bg-slate-900 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${category.color} flex items-center px-4 text-white text-sm font-semibold transition-all duration-700 shadow-lg`}
                      style={{ width: `${metrics.totalAgents > 0 ? (category.count / metrics.totalAgents) * 100 : 0}%` }}
                    >
                      {category.count} agent{category.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${category.textColor}`}>
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top 5 Performers
            </h2>
            <div className="space-y-4">
              {sortedAgents.slice(0, 5).map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-xl hover:bg-slate-900/70 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm mb-1">{agent.name}</div>
                    <div className="text-xs text-slate-400 mb-2">{agent.department} • {agent.shift}</div>
                    <PerformanceBar value={agent.current} height="h-2" />
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getPerformanceClass(agent.current).color}`}>
                      {agent.current.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400">
                      {agent.callsHandled} calls
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Agent Performance Table */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Individual Agent Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Rank</th>
                  <th
                    className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold cursor-pointer hover:text-slate-300 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Agent Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Department</th>
                  <th
                    className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold cursor-pointer hover:text-slate-300 transition-colors"
                    onClick={() => handleSort('current')}
                  >
                    Performance {sortBy === 'current' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">7-Day Avg</th>
                  <th className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">30-Day Avg</th>
                  <th
                    className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold cursor-pointer hover:text-slate-300 transition-colors"
                    onClick={() => handleSort('callsHandled')}
                  >
                    Calls {sortBy === 'callsHandled' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold cursor-pointer hover:text-slate-300 transition-colors"
                    onClick={() => handleSort('customerSatisfaction')}
                  >
                    CSAT {sortBy === 'customerSatisfaction' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-4 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sortedAgents.map((agent, index) => {
                  const perfClass = getPerformanceClass(agent.current);
                  return (
                    <tr key={agent.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-all duration-200">
                      <td className="py-4 px-4 text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-white font-medium">{agent.name}</div>
                          <div className="text-xs text-slate-400">{agent.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-slate-300 text-sm">{agent.department}</div>
                          <div className="text-xs text-slate-400 capitalize">{agent.shift} shift</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <PerformanceBar value={agent.current} />
                      </td>
                      <td className={`py-4 px-4 font-medium ${getPerformanceClass(agent.week).color}`}>
                        {agent.week.toFixed(1)}%
                      </td>
                      <td className={`py-4 px-4 font-medium ${getPerformanceClass(agent.month).color}`}>
                        {agent.month.toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-medium">
                        {agent.callsHandled}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-slate-300 font-medium">{agent.customerSatisfaction.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {agent.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                          {agent.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                          {agent.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
                          <span className={`text-xs font-medium ${
                            agent.trend === 'up' ? 'text-green-400' :
                            agent.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                          }`}>
                            {agent.trend}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Performance Overview */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Department Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(metrics.departmentStats).map(([dept, stats]) => (
              <div key={dept} className="bg-slate-900/50 rounded-xl p-4">
                <h3 className="text-white font-medium mb-2">{dept}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Agents:</span>
                    <span className="text-white">{stats.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Avg Performance:</span>
                    <span className={`font-medium ${getPerformanceClass(stats.avgPerformance).color}`}>
                      {stats.avgPerformance.toFixed(1)}%
                    </span>
                  </div>
                  <PerformanceBar value={stats.avgPerformance} showLabel={false} height="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPerformanceMetrics;