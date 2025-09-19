import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Download, Eye, Edit2, MessageCircle, Users, TrendingUp, CheckCircle, Zap } from 'lucide-react';

const AgentDashboard = () => {
  const [agents, setAgents] = useState([
    { id: 'AGT001', name: 'Alex Johnson', status: 'online', performance: 92, tasks: 45, responseTime: 1.8, successRate: 96 },
    { id: 'AGT002', name: 'Sarah Williams', status: 'online', performance: 88, tasks: 52, responseTime: 2.1, successRate: 94 },
    { id: 'AGT003', name: 'Mike Chen', status: 'busy', performance: 75, tasks: 38, responseTime: 3.2, successRate: 89 },
    { id: 'AGT004', name: 'Emma Davis', status: 'online', performance: 95, tasks: 61, responseTime: 1.5, successRate: 98 },
    { id: 'AGT005', name: 'James Wilson', status: 'offline', performance: 0, tasks: 0, responseTime: 0, successRate: 0 },
    { id: 'AGT006', name: 'Lisa Anderson', status: 'online', performance: 83, tasks: 47, responseTime: 2.4, successRate: 91 },
    { id: 'AGT007', name: 'David Brown', status: 'busy', performance: 79, tasks: 33, responseTime: 2.8, successRate: 87 },
    { id: 'AGT008', name: 'Amy Taylor', status: 'online', performance: 91, tasks: 56, responseTime: 1.9, successRate: 95 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter agents based on search term
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agents, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeAgents = agents.filter(a => a.status !== 'offline');
    const avgPerformance = activeAgents.reduce((acc, a) => acc + a.performance, 0) / activeAgents.length || 0;
    const totalTasks = agents.reduce((acc, a) => acc + a.tasks, 0);
    const avgResponseTime = activeAgents.reduce((acc, a) => acc + a.responseTime, 0) / activeAgents.length || 0;
    
    return {
      activeCount: activeAgents.length,
      avgPerformance: avgPerformance.toFixed(1),
      totalTasks,
      avgResponseTime: avgResponseTime.toFixed(1)
    };
  }, [agents]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Simulate data refresh with random updates
      setAgents(prev => prev.map(agent => ({
        ...agent,
        tasks: agent.status !== 'offline' ? agent.tasks + Math.floor(Math.random() * 5) : 0,
        performance: agent.status !== 'offline' ? Math.min(100, agent.performance + Math.floor(Math.random() * 5 - 2)) : 0
      })));
      setRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Status', 'Performance', 'Tasks', 'Response Time', 'Success Rate'],
      ...agents.map(a => [a.id, a.name, a.status, a.performance, a.tasks, a.responseTime, a.successRate])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agent-performance.csv';
    link.click();
  };

  const StatCard = ({ title, value, change, changeType, icon: Icon, iconColor }) => (
    <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:transform hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {value}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wider mt-1">
            {title}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change && (
        <span className={`text-xs px-2 py-1 rounded ${changeType === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </span>
      )}
    </div>
  );

  const AgentRow = ({ agent }) => {
    const getStatusColor = (status) => {
      switch(status) {
        case 'online': return 'bg-green-500/20 text-green-400';
        case 'busy': return 'bg-yellow-500/20 text-yellow-400';
        case 'offline': return 'bg-red-500/20 text-red-400';
        default: return '';
      }
    };

    const getPerfColor = (performance) => {
      if (performance >= 85) return 'bg-gradient-to-r from-green-500 to-cyan-400';
      if (performance >= 70) return 'bg-gradient-to-r from-yellow-500 to-yellow-300';
      return 'bg-gradient-to-r from-red-500 to-red-300';
    };

    return (
      <tr className="hover:bg-indigo-500/5 transition-colors">
        <td className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {agent.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-white font-medium">{agent.name}</div>
              <div className="text-gray-400 text-xs">{agent.id}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 border-b border-gray-700">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(agent.status)}`}>
            {agent.status}
          </span>
        </td>
        <td className="px-4 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${getPerfColor(agent.performance)} transition-all duration-500`}
                style={{ width: `${agent.performance}%` }}
              />
            </div>
            <span className="text-gray-400 text-sm">{agent.performance}%</span>
          </div>
        </td>
        <td className="px-4 py-4 border-b border-gray-700 text-gray-300">{agent.tasks}</td>
        <td className="px-4 py-4 border-b border-gray-700 text-gray-300">{agent.responseTime}s</td>
        <td className="px-4 py-4 border-b border-gray-700 text-gray-300">{agent.successRate}%</td>
        <td className="px-4 py-4 border-b border-gray-700">
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-400 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all">
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-400 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all">
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-400 flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
                QRF
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Agent Performance Dashboard
              </h1>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Agents"
            value={stats.activeCount}
            change="12% from last week"
            changeType="positive"
            icon={Users}
            iconColor="bg-green-500/20 text-green-400"
          />
          <StatCard
            title="Avg Performance"
            value={`${stats.avgPerformance}%`}
            change="3.2% improvement"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-indigo-500/20 text-indigo-400"
          />
          <StatCard
            title="Tasks Completed"
            value={stats.totalTasks}
            change="234 today"
            changeType="positive"
            icon={CheckCircle}
            iconColor="bg-yellow-500/20 text-yellow-400"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.avgResponseTime}s`}
            change="0.3s slower"
            changeType="negative"
            icon={Zap}
            iconColor="bg-red-500/20 text-red-400"
          />
        </div>

        {/* Agent Table */}
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Agent Performance Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Agent</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Status</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Performance</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Tasks</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Response Time</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Success Rate</th>
                  <th className="px-4 py-3 text-gray-400 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map(agent => (
                  <AgentRow key={agent.id} agent={agent} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;