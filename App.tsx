import React, { useState, useMemo, useEffect } from 'react';
import { NumberInput } from './components/NumberInput';
import { StatCard } from './components/StatCard';
import { StepData, GlobalParams } from './types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { Calculator, TrendingUp, AlertTriangle, Activity, Settings2, DollarSign, Wallet } from 'lucide-react';

// Default lot sequence from the Excel image
const DEFAULT_LOTS_SEQUENCE = [1, 1, 2, 3, 4, 5, 8, 11, 19, 27, 40, 40, 39, 40, 41, 42, 43, 44, 45, 46];

const App: React.FC = () => {
  // Global Parameters State
  const [params, setParams] = useState<GlobalParams>({
    stopPerLotto: 9,
    profitPerLotto: 21,
    costPerLotto: 75,
    numSteps: 20,
  });

  // Lots Array State - initializing with the specific sequence, filling rest with 1
  const [lots, setLots] = useState<number[]>(() => {
    const initial = new Array(20).fill(1);
    DEFAULT_LOTS_SEQUENCE.forEach((val, idx) => {
      if (idx < 20) initial[idx] = val;
    });
    return initial;
  });

  // Effect to resize lots array if numSteps changes
  useEffect(() => {
    setLots(prev => {
      if (prev.length === params.numSteps) return prev;
      if (prev.length < params.numSteps) {
        return [...prev, ...new Array(params.numSteps - prev.length).fill(prev[prev.length - 1] || 1)];
      }
      return prev.slice(0, params.numSteps);
    });
  }, [params.numSteps]);

  const handleLotChange = (index: number, newVal: number) => {
    const newLots = [...lots];
    newLots[index] = newVal;
    setLots(newLots);
  };

  // The Core Calculation Engine
  const tableData: StepData[] = useMemo(() => {
    let runningCumulativeLoss = 0;
    let runningCumulativeCost = 0;
    
    return lots.map((lotSize, index) => {
      const step = index + 1;
      const stopMoney = lotSize * params.stopPerLotto;
      
      // Cumulative loss (Stops only)
      const currentCumulativeLoss = runningCumulativeLoss + stopMoney;
      
      const profit = lotSize * params.profitPerLotto;
      const totalSpend = lotSize * params.costPerLotto;

      // Cumulative Cost
      const currentCumulativeCost = runningCumulativeCost + totalSpend;
      
      // Total Capital Needed = Cumulative Loss + Cumulative Cost
      const totalCapital = currentCumulativeLoss + currentCumulativeCost;
      
      // NET logic: Profit (if win now) - Losses accumulated BEFORE this step.
      const net = profit - runningCumulativeLoss;

      // Update running totals for NEXT iteration
      runningCumulativeLoss = currentCumulativeLoss;
      runningCumulativeCost = currentCumulativeCost;

      return {
        step,
        lots: lotSize,
        stopMoney,
        cumulativeLoss: currentCumulativeLoss,
        profit,
        totalSpend,
        totalCapital,
        net
      };
    });
  }, [lots, params]);

  // Derived Summary Stats
  const riskRewardRatio = (params.stopPerLotto / params.profitPerLotto).toFixed(2);
  const maxDrawdown = tableData.length > 0 ? tableData[tableData.length - 1].cumulativeLoss : 0;
  const maxCapitalNeeded = tableData.length > 0 ? tableData[tableData.length - 1].totalCapital : 0;
  const maxNet = Math.max(...tableData.map(d => d.net));

  return (
    <div className="min-h-screen bg-background text-slate-200 pb-20 selection:bg-primary/30">
      
      {/* Header / Top Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-900/20">
              <Calculator className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">Money Management <span className="text-primary">Pro</span></h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Advanced Risk Calculator</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                v2.5.0-beta
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Global Controls Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4 mb-2 flex items-center space-x-2 text-primary">
            <Settings2 size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">Global Configuration</h2>
          </div>
          
          <NumberInput 
            label="Stop Loss (€) / Lot" 
            value={params.stopPerLotto} 
            onChange={(v) => setParams({...params, stopPerLotto: v})}
          />
          <NumberInput 
            label="Take Profit (€) / Lot" 
            value={params.profitPerLotto} 
            onChange={(v) => setParams({...params, profitPerLotto: v})}
          />
          <NumberInput 
            label="Cost (€) / Lot" 
            value={params.costPerLotto} 
            onChange={(v) => setParams({...params, costPerLotto: v})}
          />
          <NumberInput 
            label="Total Steps" 
            value={params.numSteps} 
            max={50}
            onChange={(v) => setParams({...params, numSteps: v})}
          />
        </section>

        {/* Dashboard Summary */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Max Capital Needed" 
            value={`€${maxCapitalNeeded.toLocaleString()}`}
            subValue="Loss + Costs (Total Risk)"
            trend="down"
            icon={<Wallet size={20} />}
          />
          <StatCard 
            title="Max Drawdown" 
            value={`€${maxDrawdown.toLocaleString()}`}
            subValue="Pure Loss (Stops only)"
            trend="down"
            icon={<AlertTriangle size={20} />}
          />
          <StatCard 
            title="Max Potential Net" 
            value={`€${maxNet.toLocaleString()}`}
            subValue={`Best Step: ${tableData.find(d => d.net === maxNet)?.step}`}
            trend="up"
            icon={<TrendingUp size={20} />}
          />
           <StatCard 
            title="Risk / Reward" 
            value={riskRewardRatio}
            subValue="Base Ratio"
            trend="neutral"
            icon={<Activity size={20} />}
          />
        </section>

        {/* Visualization & Table Split */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Table */}
          <div className="xl:col-span-2 bg-surface border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[800px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center">
                <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
                Strategy Sequence
              </h3>
              <div className="text-xs text-slate-500 font-mono">Editable Lots Column</div>
            </div>
            
            <div className="overflow-auto flex-1 relative">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-16">Step</th>
                    <th className="p-4 text-xs font-bold text-primary uppercase tracking-wider text-center w-32 border-x border-slate-800">Lots (Adj)</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Stop (€)</th>
                    <th className="p-4 text-xs font-bold text-rose-400 uppercase tracking-wider text-right bg-rose-500/5">Cum. Loss</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right hidden sm:table-cell">Cost</th>
                    <th className="p-4 text-xs font-bold text-amber-400 uppercase tracking-wider text-right bg-amber-500/5">Total Cap.</th>
                    <th className="p-4 text-xs font-bold text-emerald-400 uppercase tracking-wider text-right">Profit</th>
                    <th className="p-4 text-xs font-bold text-white uppercase tracking-wider text-right bg-slate-800">NET (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {tableData.map((row, idx) => (
                    <tr key={row.step} className="hover:bg-white/5 transition-colors group">
                      <td className="p-3 text-center font-mono text-slate-500">{row.step}</td>
                      <td className="p-1 text-center border-x border-slate-800 bg-slate-900/30">
                        <NumberInput 
                          value={row.lots} 
                          onChange={(val) => handleLotChange(idx, val)} 
                          variant="table"
                        />
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">{row.stopMoney}</td>
                      <td className="p-3 text-right font-mono text-rose-400 font-medium bg-rose-500/5">
                        {row.cumulativeLoss}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500 hidden sm:table-cell">
                        {row.totalSpend}
                      </td>
                      <td className="p-3 text-right font-mono text-amber-400 font-medium bg-amber-500/5">
                        {row.totalCapital}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-medium">
                        {row.profit}
                      </td>
                      <td className={`p-3 text-right font-mono font-bold border-l border-slate-800 ${
                        row.net > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {row.net}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualizations Panel */}
          <div className="space-y-6">
            
            {/* Net Profit Chart */}
            <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl h-[380px]">
               <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center">
                <DollarSign size={16} className="mr-2 text-emerald-400"/>
                Net Performance Curve
               </h3>
               <ResponsiveContainer width="100%" height="85%">
                 <ComposedChart data={tableData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="step" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val}`}/>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Bar dataKey="net" fill="url(#colorNet)" radius={[4, 4, 0, 0]} barSize={8} />
                    <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} dot={false} />
                 </ComposedChart>
               </ResponsiveContainer>
            </div>

            {/* Total Capital vs Risk Chart */}
            <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl h-[380px]">
               <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center">
                <Wallet size={16} className="mr-2 text-amber-400"/>
                Capital Requirement
               </h3>
               <ResponsiveContainer width="100%" height="85%">
                 <LineChart data={tableData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="step" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#f59e0b" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="totalCapital" stroke="#f59e0b" strokeWidth={2} dot={false} name="Total Cap." />
                    <Line yAxisId="left" type="monotone" dataKey="cumulativeLoss" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Pure Loss" />
                 </LineChart>
               </ResponsiveContainer>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default App;