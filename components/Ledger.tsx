
import React from 'react';
import { ChevronRight, User, SearchX } from 'lucide-react';
import { CustomerSummary } from '../types';

interface LedgerProps {
  summaries: CustomerSummary[];
  onViewCustomer: (name: string) => void;
}

const Ledger: React.FC<LedgerProps> = ({ summaries, onViewCustomer }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr className="text-left text-xs font-black uppercase tracking-widest text-slate-400">
            <th className="px-8 py-5">Customer Name</th>
            <th className="px-8 py-5 text-right">Balance Owed (₹)</th>
            <th className="px-8 py-5 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {summaries.map((summary) => (
            <tr 
              key={summary.name} 
              className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
              onClick={() => onViewCustomer(summary.name)}
            >
              <td className="px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <User size={28} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-800 leading-none mb-1">{summary.name}</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                      Last Entry: {new Date(summary.lastEntryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <div className={`text-3xl font-black tracking-tighter ${summary.totalOwed > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                  ₹{Math.abs(summary.totalOwed).toLocaleString('en-IN')}
                  {summary.totalOwed < 0 && <span className="text-sm ml-1 font-bold">(Advance)</span>}
                </div>
              </td>
              <td className="px-8 py-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight size={24} />
                </div>
              </td>
            </tr>
          ))}
          {summaries.length === 0 && (
            <tr>
              <td colSpan={3} className="px-8 py-20 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-slate-50 p-6 rounded-full text-slate-300">
                    <User size={48} />
                  </div>
                  <p className="text-slate-400 font-black text-lg">
                    No matching customers found.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Ledger;
