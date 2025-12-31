
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, User, Package, Check } from 'lucide-react';
import { InventoryItem, TransactionLineItem, Transaction } from '../types';

interface TransactionFormProps {
  inventory: InventoryItem[];
  onSubmit: (transaction: Omit<Transaction, 'id' | 'totalAmount'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ inventory, onSubmit, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<Omit<TransactionLineItem, 'id'>[]>([
    { itemId: '', name: '', price: 0, quantity: 1 }
  ]);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Refs for managing suggestion menu positioning or closing
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setActiveSuggestionIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItemRow = () => {
    setItems([...items, { itemId: '', name: '', price: 0, quantity: 1 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx: number, updates: Partial<Omit<TransactionLineItem, 'id'>>) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], ...updates };
    setItems(newItems);
  };

  const filteredSuggestions = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectSuggestion = (idx: number, item: InventoryItem) => {
    updateItem(idx, { 
      itemId: item.id, 
      name: item.name, 
      price: item.price 
    });
    setActiveSuggestionIdx(null);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;
    
    const validItems = items.filter(i => i.name && i.itemId);
    if (validItems.length === 0) return;

    onSubmit({
      customerName,
      date: new Date().toISOString(),
      items: validItems.map(i => ({ ...i, id: Math.random().toString(36).substr(2, 9) }))
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Plus size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">New Sale Entry</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-8">
          {/* Customer Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Customer Information</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} />
              </div>
              <input 
                autoFocus
                type="text"
                placeholder="Enter Customer Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Purchase Items</label>
              <span className="text-xs text-slate-400">Auto-fills price from inventory</span>
            </div>
            
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                  <div className="flex-1 w-full relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                      <Package size={16} />
                    </div>
                    <input 
                      type="text"
                      placeholder="Search Item..."
                      value={item.name}
                      onFocus={() => {
                        setActiveSuggestionIdx(idx);
                        setSearchTerm(item.name);
                      }}
                      onChange={(e) => {
                        updateItem(idx, { name: e.target.value });
                        setSearchTerm(e.target.value);
                      }}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    
                    {/* Suggestions UI */}
                    {activeSuggestionIdx === idx && filteredSuggestions.length > 0 && (
                      <div 
                        ref={suggestionRef}
                        className="absolute z-[60] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-auto py-2"
                      >
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => selectSuggestion(idx, suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-indigo-50 flex items-center justify-between group"
                          >
                            <span className="text-sm font-medium text-slate-900">{suggestion.name}</span>
                            <span className="text-xs text-slate-400 font-mono group-hover:text-indigo-600 transition-colors">₹{suggestion.price.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="w-28 relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Qty</span>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) || 0 })}
                        className="w-full pl-10 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-mono text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div className="w-32 relative">
                       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                       <input 
                        type="number"
                        value={item.price}
                        readOnly
                        className="w-full pl-6 pr-2 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-right font-mono text-slate-600 cursor-not-allowed"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={handleAddItemRow}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all flex items-center justify-center space-x-2 group"
            >
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Add Item Line</span>
            </button>
          </div>
        </form>

        {/* Summary & Actions */}
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">Grand Total</span>
            <div className="text-3xl font-black text-indigo-400 tracking-tighter">
              ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!customerName || items.every(i => !i.itemId)}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <Check size={20} />
              <span>Complete Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
