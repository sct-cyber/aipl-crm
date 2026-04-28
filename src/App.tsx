import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Contact as ContactIcon,
  CheckSquare
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

// --- Sidebar Item ---
const NavItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-[#CC0000] text-white shadow-lg shadow-red-900/20" 
        : "text-slate-500 hover:bg-slate-50 hover:text-[#CC0000]"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-[#CC0000]")} />
    <span className="font-bold text-sm">{label}</span>
  </Link>
);

// --- Layout Component ---
const AppLayout = ({ children, user }: { children: React.ReactNode, user: FirebaseUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-white w-full overflow-x-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-transform duration-300 transform lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
              <img 
                src="/logo.jpg" 
                alt="AIPL" 
                className="w-full h-full object-contain mix-blend-multiply"
                onError={(e) => {
                  e.currentTarget.src = 'https://ui-avatars.com/api/?name=AIPL&background=CC0000&color=fff';
                }}
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">
              AIPL <span className="text-[#CC0000]">CRM</span>
            </span>
          </div>

          <nav className="flex-1 space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/leads" icon={Users} label="Leads" active={location.pathname.startsWith('/leads')} />
            <NavItem to="/contacts" icon={ContactIcon} label="Contacts" active={location.pathname.startsWith('/contacts')} />
            <NavItem to="/accounts" icon={Briefcase} label="Accounts" active={location.pathname.startsWith('/accounts')} />
            <NavItem to="/tasks" icon={CheckSquare} label="Tasks" active={location.pathname.startsWith('/tasks')} />
            <NavItem to="/opportunities" icon={BarChart3} label="Pipeline" active={location.pathname.startsWith('/opportunities')} />
            <NavItem to="/kpis" icon={TrendingUp} label="KPIs" active={location.pathname.startsWith('/kpis')} />
            <NavItem to="/timeline" icon={MessageSquare} label="Communication" active={location.pathname.startsWith('/timeline')} />
            <NavItem to="/integrations" icon={Settings} label="Integrations" active={location.pathname.startsWith('/integrations')} />
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'CRM User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs border border-transparent"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isSidebarOpen ? "lg:ml-72" : "ml-0"
      )}>
        <header className="h-20 border-b border-slate-100 bg-white sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg">
              <Menu size={20} className="text-slate-600" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-red-500/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-sm">
              <Plus size={18} />
              <span className="hidden sm:inline">Quick Add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Login View ---
const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      const { googleProvider } = await import('./lib/firebase');
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-slate-50 rounded-2xl p-4">
          <img 
            src="/logo.jpg" 
            alt="AIPL" 
            className="w-full h-full object-contain mix-blend-multiply" 
            onError={(e) => {
              e.currentTarget.src = 'https://ui-avatars.com/api/?name=AIPL&background=CC0000&color=fff';
            }}
          />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">AIPL <span className="text-[#CC0000]">CRM</span></h1>
        <p className="text-slate-400 mb-8 text-sm font-medium">Internal Intelligence & Sales Suite.</p>
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold hover:bg-[#CC0000] transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              <span>Continue with Google</span>
            </>
          )}
        </button>
        
        <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
          Secure Access Only<br/>Authorized Personnel
        </p>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
            role: 'user',
            createdAt: new Date().toISOString()
          });
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-50 border-t-[#CC0000] rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest">AIPL CRM Loading</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <AppLayout user={user}>
          <TaskNotificationProvider>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/kpis" element={<KPIs />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TaskNotificationProvider>
        </AppLayout>
      )}
    </BrowserRouter>
  );
}
