import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Lead, Account, Opportunity, Task, DashboardWidget, WidgetType } from '../types';
import { Card, Button, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  Zap,
  Activity,
  Settings2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w-stats', type: 'stats', title: 'Stats Overview', visible: true, order: 0 },
  { id: 'w-revenue', type: 'revenue', title: 'Revenue Forecast', visible: true, order: 1 },
  { id: 'w-activity', type: 'activity', title: 'Recent Activity', visible: true, order: 2 },
  { id: 'w-tasks', type: 'tasks', title: 'Upcoming Tasks', visible: true, order: 3 },
];

export default function DashboardView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubLeads = crmService.subscribeToLeads(setLeads);
    const unsubAccs = crmService.subscribeToAccounts(setAccounts);
    const unsubTasks = crmService.subscribeToTasks(setTasks);
    const unsubOpps = crmService.subscribeToOpportunities((data) => {
      setOpportunities(data);
    });
    const unsubPrefs = crmService.subscribeToUserPreferences((prefs) => {
      if (prefs?.dashboardWidgets) {
        setWidgets(prefs.dashboardWidgets.sort((a, b) => a.order - b.order));
      }
      setIsLoading(false);
    });

    return () => { 
      unsubLeads(); 
      unsubAccs(); 
      unsubOpps(); 
      unsubTasks();
      unsubPrefs();
    };
  }, []);

  const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0);
  const winRate = opportunities.length ? (opportunities.filter(o => o.stage === 'Closed Won').length / (opportunities.filter(o => ['Closed Won', 'Closed Lost'].includes(o.stage)).length || 1)) * 100 : 0;

  const chartData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 6000 },
    { name: 'Thu', value: 8000 },
    { name: 'Fri', value: 5000 },
    { name: 'Sat', value: 9000 },
    { name: 'Sun', value: 12000 },
  ];

  const handleToggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const handleMoveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === widgets.length - 1) return;

    const newWidgets = [...widgets];
    const item = newWidgets.splice(index, 1)[0];
    newWidgets.splice(direction === 'up' ? index - 1 : index + 1, 0, item);
    
    // Update order numbers
    const updated = newWidgets.map((w, i) => ({ ...w, order: i }));
    setWidgets(updated);
  };

  const handleSaveLayout = async () => {
    await crmService.updateUserPreferences(widgets);
    setIsCustomizing(false);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
            trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-xs font-extrabold text-brand-muted uppercase tracking-widest mb-2 px-1">{title}</h3>
      <p className="text-3xl font-black text-brand-secondary leading-none tracking-tighter">{value}</p>
    </Card>
  );

  const renderWidget = (widget: DashboardWidget) => {
    if (!widget.visible && !isCustomizing) return null;

    const widgetContent = (() => {
      switch (widget.type) {
        case 'stats':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Leads" 
                value={leads.length} 
                icon={Users} 
                trend={12} 
                color="bg-brand-primary/10 text-brand-primary" 
              />
              <StatCard 
                title="Active Accounts" 
                value={accounts.length} 
                icon={Briefcase} 
                trend={4} 
                color="bg-brand-muted/10 text-brand-muted" 
              />
              <StatCard 
                title="Pipeline value" 
                value={`$${(totalValue / 1000).toFixed(1)}k`} 
                icon={TrendingUp} 
                trend={25} 
                color="bg-[#e9f5db] text-[#4b5d3f]" 
              />
              <StatCard 
                title="Win Rate" 
                value={`${winRate.toFixed(0)}%`} 
                icon={Zap} 
                trend={-2} 
                color="bg-[#fefae0] text-[#7a6d2b]" 
              />
            </div>
          );
        case 'revenue':
          return (
            <Card className="p-8">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-lg font-black text-brand-secondary">Revenue Forecast</h3>
                  <p className="text-sm font-medium text-brand-muted">Projected income based on weighted pipeline stages.</p>
                </div>
                <Select options={[{value: '7d', label: 'Last 7 Days'}]} className="w-40" />
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6b705c" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6b705c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0e9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#a5a58d'}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#a5a58d'}} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: '1px solid #e9e9e0', boxShadow: '0 10px 30px rgba(107,112,92,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6b705c" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        case 'activity':
          return (
            <Card className="p-8 h-full">
              <h3 className="text-lg font-black text-brand-secondary mb-6 px-1">Recent Activity</h3>
              <div className="space-y-6">
                {leads.slice(0, 5).map((lead, i) => (
                  <div key={lead.id} className="flex gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                        <Activity size={18} />
                      </div>
                      {i < 4 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-brand-primary/10" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-secondary">New lead identified</p>
                      <p className="text-xs text-brand-muted">{lead.firstName} {lead.lastName} from {lead.company || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-400">No activity yet.</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-10">View All Updates</Button>
            </Card>
          );
        case 'tasks':
          return (
            <Card className="p-8 h-full">
              <h3 className="text-lg font-black text-brand-secondary mb-6 px-1">Upcoming Tasks</h3>
              <div className="space-y-4">
                {tasks.filter(t => t.status !== 'Completed').slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-light/30 border border-brand-accent/20 group hover:border-brand-primary/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-primary shadow-sm">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brand-secondary truncate">{task.subject}</p>
                      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest mt-0.5">
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                  </div>
                ))}
                {tasks.filter(t => t.status !== 'Completed').length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-400">All caught up!</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-10">View Task List</Button>
            </Card>
          );
        default:
          return null;
      }
    })();

    return (
      <motion.div 
        layout
        key={widget.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative transition-all duration-300",
          !widget.visible && "opacity-40 grayscale pointer-events-none scale-95"
        )}
      >
        {isCustomizing && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
            <button 
              onClick={() => handleToggleWidget(widget.id)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all",
                widget.visible ? "bg-brand-primary text-white" : "bg-white text-brand-muted"
              )}
            >
              {widget.visible ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleMoveWidget(widget.id, 'up')}
                className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-brand-muted hover:text-brand-primary transition-colors"
                disabled={widgets.indexOf(widget) === 0}
              >
                <MoveUp size={14} />
              </button>
              <button 
                onClick={() => handleMoveWidget(widget.id, 'down')}
                className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-brand-muted hover:text-brand-primary transition-colors"
                disabled={widgets.indexOf(widget) === widgets.length - 1}
              >
                <MoveDown size={14} />
              </button>
            </div>
          </div>
        )}
        {widgetContent}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">AshishInterbuild Intelligence</h1>
          <p className="text-brand-muted text-sm font-medium">Real-time performance metrics and sales intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          {isCustomizing ? (
            <>
              <Button variant="ghost" onClick={() => { setIsCustomizing(false); setWidgets(widgets); }}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveLayout} className="gap-2">
                <CheckCircle2 size={18} />
                Save Layout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsCustomizing(true)} className="gap-2">
                <Settings2 size={18} />
                Customize
              </Button>
              <Button variant="primary">Generate Forecast</Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {widgets.map(widget => (
          <div key={widget.id} className="w-full">
            {renderWidget(widget)}
          </div>
        ))}
      </div>
    </div>
  );
}

