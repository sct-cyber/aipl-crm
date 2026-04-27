import React, { useEffect, useState } from 'react';
import { crmService } from '../services/crmService';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Card, Button, Modal, Input, Select } from '../components/ui';
import { cn } from '../lib/utils';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Calendar,
  MoreVertical,
  ChevronRight,
  Bell,
  BellOff
} from 'lucide-react';

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  Low: 'text-brand-muted bg-brand-accent border-brand-accent',
  Normal: 'text-[#7a6d2b] bg-[#fefae0] border-[#f9f3cf]',
  High: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20'
};

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderOption, setReminderOption] = useState<'none' | 'at-time' | '15m' | '1h' | 'custom'>('none');

  useEffect(() => {
    const unsub = crmService.subscribeToTasks((data) => {
      setTasks(data);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let reminderAt = undefined;
    const reminderType = formData.get('reminderType') as string;
    const dueDateStr = formData.get('dueDate') as string;
    
    if (dueDateStr) {
      const dueDate = new Date(dueDateStr);
      if (reminderType === 'at-time') {
        reminderAt = dueDate.toISOString();
      } else if (reminderType === '15m') {
        reminderAt = new Date(dueDate.getTime() - 15 * 60000).toISOString();
      } else if (reminderType === '1h') {
        reminderAt = new Date(dueDate.getTime() - 60 * 60000).toISOString();
      } else if (reminderType === 'custom') {
        reminderAt = formData.get('reminderAt') as string;
      }
    }

    const taskData = {
      subject: formData.get('subject') as string,
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as TaskStatus,
      priority: formData.get('priority') as TaskPriority,
      reminderAt,
      reminderSent: false,
    };

    await crmService.addTask(taskData);
    setIsModalOpen(false);
    setReminderOption('none');
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    await crmService.updateTask(task.id, { status: newStatus });
  };

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-secondary mb-1">Tasks</h1>
          <p className="text-brand-muted text-sm font-medium">Organize your workflow and follow-ups.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>New Task</span>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-1">Upcoming Tasks</h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading tasks...</div>
            ) : pendingTasks.length === 0 ? (
              <div className="py-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-xs">
                All caught up! No pending tasks.
              </div>
            ) : (
              pendingTasks.map((task) => (
                <Card key={task.id} className="p-5 hover:border-brand-primary/20 transition-all group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleTask(task); }}
                      className="text-gray-300 hover:text-brand-primary transition-colors transform active:scale-90"
                    >
                      <Circle size={24} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-brand-secondary truncate tracking-tight">{task.subject}</p>
                        {task.reminderAt && (
                          <div className={cn(
                            "flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                            task.reminderSent ? "bg-gray-100 text-gray-400" : "bg-brand-primary/10 text-brand-primary"
                          )} title={task.reminderAt ? `Reminder set for ${new Date(task.reminderAt).toLocaleString()}` : ''}>
                            <Bell size={10} />
                            <span>Remind</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={cn(
                          "px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border rounded-lg",
                          PRIORITY_COLORS[task.priority]
                        )}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                            <Calendar size={12} className="text-gray-300" />
                            {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-gray-100">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-1">Completed</h3>
            <div className="space-y-3 opacity-60">
              {completedTasks.map((task) => (
                <Card key={task.id} className="p-5 border-gray-100 bg-gray-50/50 rounded-3xl">
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className="text-brand-primary"
                    >
                      <CheckCircle2 size={24} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-500 line-through truncate tracking-tight">{task.subject}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Follow-up Task"
      >
        <form onSubmit={handleAddTask} className="p-8 space-y-6">
          <Input label="Subject" name="subject" required placeholder="Follow up on pricing proposal" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" name="dueDate" type="datetime-local" required />
            <Select 
              label="Priority" 
              name="priority" 
              options={[
                { value: 'Normal', label: 'Normal' },
                { value: 'Low', label: 'Low' },
                { value: 'High', label: 'High' },
              ]} 
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-brand-muted uppercase tracking-widest">Reminder</label>
            <div className="grid grid-cols-5 gap-2">
              <button 
                type="button"
                onClick={() => setReminderOption('none')}
                className={cn(
                  "py-2 px-1 text-[9px] font-bold rounded-xl border transition-all",
                  reminderOption === 'none' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-500 border-gray-100 hover:border-brand-primary/30"
                )}
              >
                None
              </button>
              <button 
                type="button"
                onClick={() => setReminderOption('15m')}
                className={cn(
                  "py-2 px-1 text-[9px] font-bold rounded-xl border transition-all",
                  reminderOption === '15m' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-500 border-gray-100 hover:border-brand-primary/30"
                )}
              >
                15m Pre
              </button>
              <button 
                type="button"
                onClick={() => setReminderOption('1h')}
                className={cn(
                  "py-2 px-1 text-[9px] font-bold rounded-xl border transition-all",
                  reminderOption === '1h' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-500 border-gray-100 hover:border-brand-primary/30"
                )}
              >
                1h Pre
              </button>
              <button 
                type="button"
                onClick={() => setReminderOption('at-time')}
                className={cn(
                  "py-2 px-1 text-[9px] font-bold rounded-xl border transition-all",
                  reminderOption === 'at-time' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-500 border-gray-100 hover:border-brand-primary/30"
                )}
              >
                At Due
              </button>
              <button 
                type="button"
                onClick={() => setReminderOption('custom')}
                className={cn(
                  "py-2 px-1 text-[9px] font-bold rounded-xl border transition-all",
                  reminderOption === 'custom' ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-500 border-gray-100 hover:border-brand-primary/30"
                )}
              >
                Custom
              </button>
            </div>
            <input type="hidden" name="reminderType" value={reminderOption} />
            {reminderOption === 'custom' && (
              <div className="animate-in slide-in-from-top-1 duration-200">
                <Input label="Reminder Time" name="reminderAt" type="datetime-local" required />
              </div>
            )}
          </div>

          <Select 
            label="Initial Status" 
            name="status" 
            options={[
              { value: 'Not Started', label: 'Not Started' },
              { value: 'In Progress', label: 'In Progress' },
            ]} 
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-accent/30">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
