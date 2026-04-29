import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import LoginPage from './views/LoginPage';
import DashboardView from './views/DashboardView';
import LeadsView from './views/LeadsView';
import ContactsView from './views/ContactsView';
import AccountsView from './views/AccountsView';
import DealsView from './views/DealsView';
import TasksView from './views/TasksView';
import Layout from './components/Layout';
import type { User } from 'firebase/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/leads" element={<LeadsView />} />
          <Route path="/contacts" element={<ContactsView />} />
          <Route path="/accounts" element={<AccountsView />} />
          <Route path="/deals" element={<DealsView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
