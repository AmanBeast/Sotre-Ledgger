
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, User, ArrowRight, ShoppingCart, Banknote } from 'lucide-react';
import { InventoryItem, TransactionLineItem, LedgerEntry, EntryType } from '../types';

interface EntryFormProps {
  inventory: InventoryItem[];
  existingCustomers: string[];
  onSubmit: (entry: Omit<LedgerEntry, 'id'>) => void;
  onClose: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ inventory, existingCustomers, onSubmit, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState<EntryType>('SALE');
  const [items, setItems] = useState<Omit<TransactionLineItem, 'id'>[]>([
    { itemId: '', name: '', price: 0, quantity: 1 }
  ]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [note, setNote] = useState('');
  
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [activeItemSuggestionIdx, setActiveItemSuggestionIdx] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowCustomerSuggestions(false);
        setActiveItemSuggestionIdx(null);
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

  const filteredCustomerSuggestions = existingCustomers.filter(name => 
    name.toLowerCase().includes(customerName.toLowerCase())
  );

  const filteredItemSuggestions = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = type === 'SALE' 
    ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : parseFloat(paymentAmount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;
    
    if (type === 'SALE') {
      const validItems = items.filter(i => i.name.trim() !== '');
      if (validItems.length === 0) return;
      onSubmit({
        customerName,
        date: new Date().toISOString(),
        type: 'SALE',
        items: validItems.map(i => ({ ...i, id: Math.random().toString() })),
        amount: total
      });
    } else {
      if (!paymentAmount) return;
      onSubmit({
        customerName,
        date: new Date().toISOString(),
        type: 'PAYMENT',
        amount: total,
        note
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-4xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[20px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header - Compact */}
        <div className="px-4 py-3 md:px-8 md:py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-1.5 md:p-2.5 rounded-lg md:rounded-xl text-white">
              <Plus size={16} className="md:w-6 md:h-6" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-base md:text-2xl font-black text-slate-800 leading-none">New Record</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] mt-1">General Store Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={20} className="md:w-8 md:h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 md:p-8 space-y-4 md:space-y-6">
          
          {/* Customer Input - Optimized for mobile */}
          <div className="space-y-1.5">
            <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest block">Customer Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={14} className="md:w-5 md:h-5" />
              </div>
              <input 
                autoFocus
                type="text"
                placeholder="Search or enter name..."
                value={customerName}
                onFocus={() => setShowCustomerSuggestions(true)}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="off"
                className="w-full pl-9 md:pl-12 pr-4 py-2.5 md:py-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl outline-none transition-all text-sm md:text-lg font-bold text-slate-900 placeholder:text-slate-300"
              />
              {showCustomerSuggestions && filteredCustomerSuggestions.length > 0 && (
                <div ref={suggestionRef} className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1 max-h-40 overflow-auto">
                  {filteredCustomerSuggestions.map(name => (
                    <button 
                      key={name} 
                      type="button"
                      onClick={() => { setCustomerName(name); setShowCustomerSuggestions(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-blue-50 text-xs md:text-base font-bold text-slate-700 flex items-center justify-between"
                    >
                      <span>{name}</span>
                      <ArrowRight size={12} className="text-blue-500 opacity-50" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Type Toggle - Smaller buttons */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <button 
              type="button"
              onClick={() => setType('SALE')}
              className={`flex items-center justify-center space-x-2 py-2.5 md:py-4 rounded-xl border-2 transition-all ${type === 'SALE' ? 'bg-orange-600 border-orange-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              <ShoppingCart size={14} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-lg font-black uppercase">Goods Out</span>
            </button>
            <button 
              type="button"
              onClick={() => setType('PAYMENT')}
              className={`flex items-center justify-center space-x-2 py-2.5 md:py-4 rounded-xl border-2 transition-all ${type === 'PAYMENT' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              <Banknote size={14} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-lg font-black uppercase">Cash In</span>
            </button>
          </div>

          {/* Items Section - Very tight for mobile */}
          {type === 'SALE' ? (
            <div className="space-y-3">
              <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest block">Items List</label>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    {/* Item Name Input */}
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="What did they buy?"
                        value={item.name}
                        onFocus={() => { setActiveItemSuggestionIdx(idx); setSearchTerm(item.name); }}
                        onChange={(e) => { 
                          updateItem(idx, { name: e.target.value }); 
                          setSearchTerm(e.target.value); 
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-white border-2 border-slate-200 focus:border-blue-600 text-xs md:text-base font-bold text-slate-900 outline-none"
                      />
                      {activeItemSuggestionIdx === idx && filteredItemSuggestions.length > 0 && (
                        <div ref={suggestionRef} className="absolute z-[110] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-0.5 max-h-32 overflow-auto">
                          {filteredItemSuggestions.map(s => (
                            <button 
                              key={s.id}
                              type="button"
                              onClick={() => { 
                                updateItem(idx, { itemId: s.id, name: s.name, price: s.price }); 
                                setActiveItemSuggestionIdx(null); 
                              }}
                              className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex justify-between font-bold text-[10px]"
                            >
                              <span className="text-slate-800">{s.name}</span>
                              <span className="text-blue-600">₹{s.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2 items-end">
                      {/* Price input */}
                      <div className="col-span-4 space-y-0.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Price</span>
                        <input 
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-2 rounded-lg bg-white border-2 border-slate-200 text-xs font-black text-center"
                        />
                      </div>
                      {/* Qty input */}
                      <div className="col-span-3 space-y-0.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Qty</span>
                        <input 
                          type="number"
                          step="0.001"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-2 rounded-lg bg-white border-2 border-slate-200 text-xs font-black text-center"
                        />
                      </div>
                      {/* Subtotal display */}
                      <div className="col-span-3 pb-2 text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Subtotal</span>
                        <span className="text-xs font-black text-slate-800">₹{Math.round(item.price * item.quantity)}</span>
                      </div>
                      {/* Trash button */}
                      <div className="col-span-2 pb-1.5 flex justify-end">
                        <button type="button" onClick={() => handleRemoveItemRow(idx)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleAddItemRow}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest block">Cash Received (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white rounded-2xl outline-none text-3xl font-black text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest block">Note (Optional)</label>
                <input 
                  type="text"
                  placeholder="Gpay, Part payment, etc..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer - Compact and mobile friendly */}
        <div className={`px-4 py-4 md:px-8 md:py-6 flex items-center justify-between gap-3 ${type === 'SALE' ? 'bg-orange-50' : 'bg-emerald-50'}`}>
          <div className="flex-1">
            <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 block mb-0.5">Total Amount</span>
            <div className={`text-xl md:text-3xl font-black leading-none ${type === 'SALE' ? 'text-orange-600' : 'text-emerald-600'}`}>
              ₹{Math.round(total).toLocaleString('en-IN')}
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={!customerName || (type === 'SALE' && items.every(i => i.name.trim() === '')) || (type === 'PAYMENT' && !paymentAmount)}
            className={`px-6 md:px-10 py-3 md:py-4 rounded-xl text-sm md:text-xl font-black shadow-md transition-all active:scale-95 disabled:opacity-30 ${type === 'SALE' ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'}`}
          >
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
