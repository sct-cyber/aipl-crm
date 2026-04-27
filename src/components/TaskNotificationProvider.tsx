import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Task } from '../types';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  taskId: string;
  subject: string;
  type: 'reminder' | 'overdue';
}

export function TaskNotificationProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsub = crmService.subscribeToTasks((allTasks) => {
      setTasks(allTasks);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(async (task) => {
        if (task.status === 'Completed') return;

        // Check for upcoming reminders
        if (task.reminderAt && !task.reminderSent) {
          const reminderTime = new Date(task.reminderAt);
          if (now >= reminderTime) {
            // Trigger reminder
            triggerNotification(task, 'reminder');
            await crmService.updateTask(task.id, { reminderSent: true });
          }
        }

        // Check for overdue tasks (if not already reminded or as a secondary check)
        if (task.dueDate) {
          const dueTime = new Date(task.dueDate);
          if (now > dueTime && !task.reminderSent) {
            // Trigger overdue if we haven't sent a reminder yet
            triggerNotification(task, 'overdue');
            await crmService.updateTask(task.id, { reminderSent: true });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [tasks]);

  const triggerNotification = (task: Task, type: 'reminder' | 'overdue') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, {
      id,
      taskId: task.id,
      subject: task.subject,
      type
    }]);

    // Auto remove after 10 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="w-80 bg-white rounded-2xl shadow-2xl border border-brand-accent/50 p-4 pointer-events-auto flex gap-4"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'overdue' ? "bg-red-100 text-red-600" : "bg-brand-primary/10 text-brand-primary"
              )}>
                <Bell size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-1">
                  {n.type === 'overdue' ? 'Overdue Task' : 'Task Reminder'}
                </p>
                <p className="text-sm font-black text-brand-secondary truncate">{n.subject}</p>
              </div>
              <button 
                onClick={() => removeNotification(n.id)}
                className="text-gray-300 hover:text-black transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
