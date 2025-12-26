import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, trend }) => {
  return (
    <div className="bg-surface/50 backdrop-blur-md border border-slate-700/50 p-5 rounded-xl shadow-xl hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {value}
          </div>
          {subValue && (
            <p className={`text-xs mt-2 font-medium ${
              trend === 'up' ? 'text-emerald-400' : 
              trend === 'down' ? 'text-rose-400' : 'text-slate-500'
            }`}>
              {subValue}
            </p>
          )}
        </div>
        {icon && <div className="text-slate-500 bg-slate-800/50 p-2 rounded-lg">{icon}</div>}
      </div>
    </div>
  );
};