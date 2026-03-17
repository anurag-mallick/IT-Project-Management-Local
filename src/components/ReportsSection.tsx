"use client";
import React from 'react';

const ReportsSection = () => {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass-card p-6 border-l-4 border-indigo-500">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Total Open Tickets</p>
        <h2 className="text-4xl">24</h2>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-green-500 font-bold">
          <span>↑ 12% from last week</span>
        </div>
      </div>
      
      <div className="glass-card p-6 border-l-4 border-orange-500">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">SLA At Risk</p>
        <h2 className="text-4xl">03</h2>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-orange-500/60 font-bold">
          <span>Attention required</span>
        </div>
      </div>

      <div className="glass-card p-6 border-l-4 border-emerald-500">
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Avg. Resolution Time</p>
        <h2 className="text-4xl text-emerald-400">4.2h</h2>
        <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-500/60 font-bold">
          <span>Target: 6.0h</span>
        </div>
      </div>

      <div className="md:col-span-2 glass-card p-8 h-80 flex items-end gap-2">
        {/* Simple Bar Chart Mockup */}
        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
          <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-lg relative group transition-all hover:bg-indigo-500/40" style={{ height: `${h}%` }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/10 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Vol: {h}</div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8 flex flex-col justify-center text-center">
        <h3 className="text-xl mb-4">SLA Compliance</h3>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset="40" className="text-indigo-500" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl">89%</div>
        </div>
        <p className="text-xs text-white/40">Within target threshold</p>
      </div>
    </div>
  );
};

export default ReportsSection;
