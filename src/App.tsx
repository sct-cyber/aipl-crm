// Replace everything in App.tsx with this to fix imports and logo
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Users, Briefcase, BarChart3, MessageSquare, LayoutDashboard, 
  LogOut, Menu, Plus, Search, Settings, TrendingUp, Contact as ContactIcon, CheckSquare 
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import Dashboard from './views/DashboardView';
import Leads from './views/LeadsView';
import Accounts from './views/AccountsView';
import Contacts from './views/ContactsView';
import Tasks from './views/TasksView';
import Opportunities from './views/OpportunitiesView';
import Timeline from './views/TimelineView';
import Integrations from './views/IntegrationsView';
import KPIs from './views/KPIsView';
import { TaskNotificationProvider } from './components/TaskNotificationProvider';

const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link to={to} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group", active ? "bg-[#CC0000] text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-[#CC0000]")}>
    <Icon size={20} />
    <span className="font-bold text-sm">{label}</span>
  </Link>
);

const AppLayout = ({ children, user }: { children: React.ReactNode, user: FirebaseUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex min-h-screen bg-white w-full overflow-x-hidden">
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform lg:translate-x-0", !isSidebarOpen && "-translate-x-full")}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
              <img src="/AI Logo_13Feb23.jpg" alt="AIPL" className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=AIPL&background=CC0000&color=fff'; }} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">AIPL <span className="text-[#CC0000]">CRM</span></span>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/leads" icon={Users} label="Leads" active={location.pathname.startsWith('/leads')} />
            <NavItem to="/contacts" icon={ContactIcon} label="Contacts" active={location.pathname.startsWith('/contacts')} />
            <NavItem to="/accounts" icon={Briefcase} label="Accounts" active={location.pathname.startsWith('/accounts')} />
            <NavItem to="/tasks" icon={CheckSquare} label="Tasks" active={location.pathname.startsWith('/tasks')} />
            <NavItem to="/opportunities" icon={BarChart3} label="Pipeline" active={location.pathname.startsWith('/opportunities')} />
            <NavItem to="/kpis" icon={TrendingUp} label="KPIs" active={location.pathname.startsWith('/kpis')} />
          </nav>
          <div className="pt-6 border-t border-slate-100">
            <button onClick={() => auth.signOut()} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs"><LogOut size={18} /><span>Sign Out</span></button>
          </div>
        </div>
      </aside>
      <main className={cn("flex-1 flex flex-col min-w-0 transition-all duration-300", isSidebarOpen ? "lg:ml-72" : "ml-0")}>
        <header className="h-20 border-b border-slate-100 bg-white sticky top-0 z-30 px-6 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg"><Menu size={20} /></button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white rounded-lg text-sm font-bold"><Plus size={18} /><span>Quick Add</span></button>
        </header>
        <div className="flex-1 w-full">{children}</div>
      </main>
    </div>
  );
};

// ... Rest of the file (Login component and App export) stays the same
export default function App() { /* Copy paste your existing App function here */ }
