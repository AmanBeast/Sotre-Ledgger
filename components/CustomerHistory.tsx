
import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft, ReceiptText } from 'lucide-react';
import { LedgerEntry } from '../types';

interface CustomerHistoryProps {
  customerName: string;
  entries: LedgerEntry[];
  onDeleteEntry: (id: string) => void;
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customerName, entries, onDeleteEntry }) => {
  const currentBalance = entries.reduce((sum, e) => e.type === 'SALE' ? sum + e.amount : sum - e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-1">{customerName}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Full Account History</p>
        </div>
        <div className={`px-8 py-6 rounded-3xl flex flex-col items-center ${currentBalance > 0 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700'}`}>
          <span className="text-xs font-black uppercase tracking-widest mb-1">Final Balance</span>
          <span className="text-4xl font-black">₹{Math.abs(currentBalance).toLocaleString('en-IN')}</span>
          <span className="text-xs font-bold mt-1 uppercase">{currentBalance > 0 ? 'Dues (Bakaya)' : 'Advance Payment'}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Details</th>
                <th className="px-8 py-5 text-right">Items Price (Bakaya)</th>
                <th className="px-8 py-5 text-right">Cash Received (Jama)</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                <tr key={entry.id} className="text-lg">
                  <td className="px-8 py-6 font-bold text-slate-500">
                    {new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-8 py-6">
                    {entry.type === 'SALE' ? (
                      <div className="space-y-1">
                        <div className="font-black text-slate-800 flex items-center gap-2">
                          <ReceiptText size={18} className="text-blue-500" />
                          Goods Purchased
                        </div>
                        <div className="text-sm font-bold text-slate-400">
                          {entry.items?.map(i => `${i.name} (${i.quantity})`).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="font-black text-emerald-600 flex items-center gap-2">
                        <ArrowDownLeft size={18} />
                        Payment Received
                        {entry.note && <span className="text-xs text-slate-400 ml-2 font-normal italic">({entry.note})</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right font-black text-orange-600">
                    {entry.type === 'SALE' ? `+ ₹${entry.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-8 py-6 text-right font-black text-emerald-600">
                    {entry.type === 'PAYMENT' ? `- ₹${entry.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerHistory;
