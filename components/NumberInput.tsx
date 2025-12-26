import React from 'react';
import { ChevronUp, ChevronDown, Minus, Plus } from 'lucide-react';

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: 'large' | 'compact' | 'table';
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10000,
  step = 1,
  variant = 'large',
  className = ''
}) => {
  const handleIncrement = () => {
    if (value + step <= max) onChange(value + step);
  };

  const handleDecrement = () => {
    if (value - step >= min) onChange(value - step);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    if (!isNaN(newVal) && newVal >= min && newVal <= max) {
      onChange(newVal);
    }
  };

  if (variant === 'table') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <button 
          onClick={handleDecrement}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
        >
          <ChevronDown size={14} />
        </button>
        <span className="font-mono text-sm w-8 text-center">{value}</span>
        <button 
          onClick={handleIncrement}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>}
      <div className="flex items-center bg-surface border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all shadow-lg">
        <button
          onClick={handleDecrement}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors border-r border-slate-700 text-slate-300"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className="w-full bg-transparent text-center font-mono text-lg font-bold text-white focus:outline-none appearance-none"
        />
        <button
          onClick={handleIncrement}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors border-l border-slate-700 text-slate-300"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};