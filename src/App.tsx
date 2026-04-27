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
        ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/10" 
        : "text-brand-muted hover:bg-white/50 hover:text-brand-primary"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-brand-muted group-hover:text-brand-primary")} />
    <span className="font-semibold">{label}</span>
  </Link>
);

// --- Layout Component ---
const AppLayout = ({ children, user }: { children: React.ReactNode, user: FirebaseUser }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-brand-light">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-brand-accent border-r border-transparent transition-transform duration-300 transform lg:translate-x-0 overflow-y-auto",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col min-h-full p-8">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-14 h-14 flex items-center justify-center">
              <img 
                src="https://storage.googleapis.com/test-bucket-ai-studio-build/input_file_1.png" 
                alt="AshishInterbuild Logo" 
                className="w-full h-full object-contain scale-150" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-brand-primary leading-tight">
              Ashish<br/><span className="text-brand-secondary">Interbuild</span>
            </span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
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

          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.displayName || 'CRM User'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium border border-transparent hover:border-red-100"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300",
        isSidebarOpen ? "lg:ml-72" : ""
      )}>
        {/* Header */}
        <header className="h-20 border-b border-brand-accent bg-transparent sticky top-0 z-30 px-10 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/50 rounded-lg lg:hidden">
            <Menu size={20} className="text-brand-primary" />
          </button>
          
          <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-xl text-sm focus:ring-4 focus:ring-brand-primary/5 transition-all text-brand-secondary placeholder:text-brand-muted/50"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-xl shadow-brand-primary/10 active:scale-95">
              <Plus size={18} />
              <span className="hidden sm:inline">New Lead</span>
            </button>
          </div>
        </header>

        {children}
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
    <div className="min-h-screen flex items-center justify-center bg-brand-light p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] p-12 shadow-2xl shadow-brand-secondary/5 border border-gray-100"
      >
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <img 
            src="https://storage.googleapis.com/test-bucket-ai-studio-build/input_file_0.png" 
            alt="AIPL Logo" 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2 text-brand-secondary">AIPL CRM</h1>
        <p className="text-gray-500 mb-10 leading-relaxed font-medium">Business intelligence and management suite for Ashish Interbuild.</p>
        
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-brand-secondary text-white py-4.5 px-6 rounded-2xl font-bold hover:bg-brand-primary transition-all duration-300 shadow-xl shadow-brand-secondary/10 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
              <span>Login with Google</span>
            </>
          )}
        </button>
        
        <p className="mt-8 text-xs text-gray-400 font-medium">
          Authorized personnel only. By signing in, you agree to AIPL corporate policies.
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
        // Sync user to DB
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Default User',
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL,
            role: 'user', // Default role
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
          <div className="w-12 h-12 border-4 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-brand-secondary tracking-tight">Initializing AIPL CRM...</p>
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
