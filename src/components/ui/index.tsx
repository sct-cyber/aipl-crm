import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white border border-brand-accent/50 rounded-3xl shadow-xl shadow-brand-primary/5 overflow-hidden", className)}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  isLoading,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg',
  isLoading?: boolean
}) => {
  const variants = {
    primary: 'bg-brand-primary text-white hover:opacity-90 shadow-xl shadow-brand-primary/10',
    secondary: 'bg-brand-accent text-brand-primary hover:bg-brand-muted/20',
    outline: 'bg-transparent border-2 border-brand-accent text-brand-muted hover:border-brand-primary hover:text-brand-primary',
    ghost: 'bg-transparent text-gray-500 hover:bg-gray-100',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-bold',
    md: 'px-6 py-3 text-sm font-bold',
    lg: 'px-8 py-4 text-base font-bold'
  };

  return (
    <button 
      disabled={props.disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
      {children}
    </button>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: { 
  isOpen: boolean, 
  onClose: () => void, 
  title: string, 
  children: React.ReactNode 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-3xl w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
            <svg className="lucide lucide-x" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Input = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) => (
  <div className="space-y-1.5 flex-1">
    {label && <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">{label}</label>}
    <input 
      className={cn(
        "w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none font-medium",
        error && "border-red-200 ring-4 ring-red-500/5 focus:ring-red-500/10"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 px-1">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: { value: string, label: string }[], error?: string }) => (
  <div className="space-y-1.5 flex-1">
    {label && <label className="text-xs font-bold uppercase tracking-widest text-gray-400 px-1">{label}</label>}
    <select 
      className={cn(
        "w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-brand-primary/20 focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none appearance-none font-medium text-gray-900",
        error && "border-red-200 ring-4 ring-red-500/5 focus:ring-red-500/10"
      )}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
