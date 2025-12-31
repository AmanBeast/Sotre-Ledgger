
import React from 'react';
import { Printer, Download, Mail, Receipt, Calendar, User, Package } from 'lucide-react';
import { Transaction } from '../types';

interface BillDetailProps {
  transaction: Transaction;
}

const BillDetail: React.FC<BillDetailProps> = ({ transaction }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        {/* Bill Header */}
        <div className="bg-slate-900 text-white p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Receipt className="text-indigo-400 w-8 h-8" />
                <h2 className="text-2xl font-bold tracking-tight uppercase">Invoice / Bill</h2>
              </div>
              <p className="text-slate-400 text-sm">Transaction ID: <span className="text-white font-mono uppercase">{transaction.id}</span></p>
              <p className="text-slate-400 text-sm">Date Issued: <span className="text-white font-mono">{new Date(transaction.date).toLocaleDateString()}</span></p>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black text-indigo-400 italic">GENERAL STORE</h1>
              <p className="text-slate-400 text-sm">Main Street, Digital City</p>
              <p className="text-slate-400 text-sm">Contact: +91 98765 43210</p>
            </div>
          </div>
        </div>

        {/* Bill Details */}
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between border-b border-slate-100 pb-8">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Bill To</p>
              <h3 className="text-2xl font-bold text-slate-800">{transaction.customerName}</h3>
              <p className="text-slate-500 flex items-center space-x-2">
                <User size={14} />
                <span>Customer Ledger Account</span>
              </p>
            </div>
            <div className="mt-6 md:mt-0 text-right space-y-1">
               <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Amount Due</p>
               <div className="text-4xl font-black text-indigo-700">₹{transaction.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-400 text-xs uppercase font-bold">
                  <th className="py-4 font-semibold">Item Description</th>
                  <th className="py-4 font-semibold text-center">Qty</th>
                  <th className="py-4 font-semibold text-right">Rate</th>
                  <th className="py-4 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaction.items.map((item) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="py-5">
                      <div className="flex items-center space-x-3">
                        <Package size={14} className="text-slate-300" />
                        <span className="font-semibold text-slate-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-5 text-center font-mono">{item.quantity}</td>
                    <td className="py-5 text-right font-mono">₹{item.price.toFixed(2)}</td>
                    <td className="py-5 text-right font-mono font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono">₹{transaction.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (0%)</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-800 pt-3 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-indigo-700">₹{transaction.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-xs text-center">
              Terms: This is a system-generated digital invoice. No signature required. 
              <br />Thank you for your business!
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 print:hidden">
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
          <Printer size={18} />
          <span>Print Receipt</span>
        </button>
        <button className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold border border-slate-200 transition-all shadow-sm active:scale-95">
          <Download size={18} />
          <span>Export PDF</span>
        </button>
        <button className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold border border-slate-200 transition-all shadow-sm active:scale-95">
          <Mail size={18} />
          <span>Send via Email</span>
        </button>
      </div>
    </div>
  );
};

export default BillDetail;
