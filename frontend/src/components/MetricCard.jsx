import React from 'react';

const MetricCard = ({ title, value, icon: Icon, colorClass, description }) => {
  return (
    <div className="bg-[#111827]/60 border border-slate-800/60 p-6 rounded-2xl backdrop-blur-sm shadow-inner transition-all duration-300 hover:border-slate-700/60">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-white mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {description && (
        <div className="mt-4 pt-3 border-t border-slate-850">
          <p className="text-xs text-slate-400 font-medium">{description}</p>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
