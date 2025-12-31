
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, User, Package, Check, ArrowRight, ShoppingCart, Banknote } from 'lucide-react';
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
      // Logic changed: only require name and price >= 0. itemId is now optional.
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
    <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[100] flex items-end md:items-center justify-center">
      <div className="bg-white w-full max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Massive Header */}
        <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-blue-800 p-4 rounded-3xl text-white shadow-xl shadow-blue-200">
              <Plus size={40} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">Add Record</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">New Ledger Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={48} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-10 space-y-10">
          
          {/* Section 1: Customer */}
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">Who is the Customer?</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={32} />
              </div>
              <input 
                autoFocus
                type="text"
                placeholder="Type Customer Name..."
                value={customerName}
                onFocus={() => setShowCustomerSuggestions(true)}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="off"
                className="w-full pl-20 pr-8 py-8 bg-slate-50 border-4 border-slate-200 focus:border-blue-600 focus:bg-white rounded-3xl outline-none transition-all text-2xl font-black text-slate-900 placeholder:text-slate-300"
              />
              {showCustomerSuggestions && filteredCustomerSuggestions.length > 0 && (
                <div ref={suggestionRef} className="absolute z-[110] left-0 right-0 mt-4 bg-white border-2 border-slate-100 rounded-[32px] shadow-2xl p-4 space-y-2">
                  <p className="px-6 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Select Existing Customer</p>
                  {filteredCustomerSuggestions.map(name => (
                    <button 
                      key={name} 
                      type="button"
                      onClick={() => { setCustomerName(name); setShowCustomerSuggestions(false); }}
                      className="w-full text-left px-6 py-5 rounded-2xl hover:bg-blue-50 text-xl font-black text-slate-700 flex items-center justify-between group"
                    >
                      <span>{name}</span>
                      <ArrowRight size={24} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Type Toggle */}
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">What happened?</label>
            <div className="grid grid-cols-2 gap-6">
              <button 
                type="button"
                onClick={() => setType('SALE')}
                className={`flex items-center justify-center space-x-4 py-8 rounded-3xl border-4 transition-all ${type === 'SALE' ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-200' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <ShoppingCart size={32} />
                <span className="text-2xl font-black">Gave Goods</span>
              </button>
              <button 
                type="button"
                onClick={() => setType('PAYMENT')}
                className={`flex items-center justify-center space-x-4 py-8 rounded-3xl border-4 transition-all ${type === 'PAYMENT' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <Banknote size={32} />
                <span className="text-2xl font-black">Received Cash</span>
              </button>
            </div>
          </div>

          {/* Section 3: Sale Items */}
          {type === 'SALE' ? (
            <div className="space-y-6">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">Which items were taken?</label>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center p-6 bg-slate-50 rounded-[32px] border border-slate-200">
                    {/* Item Name Search / Manual Entry */}
                    <div className="flex-1 relative min-w-[200px]">
                      <input 
                        type="text"
                        placeholder="Item Name (e.g. Rice, Sugar...)"
                        value={item.name}
                        onFocus={() => { setActiveItemSuggestionIdx(idx); setSearchTerm(item.name); }}
                        onChange={(e) => { 
                          updateItem(idx, { name: e.target.value }); 
                          setSearchTerm(e.target.value); 
                        }}
                        className="w-full px-6 py-5 rounded-2xl bg-white border-2 border-slate-200 focus:border-blue-600 text-xl font-black text-slate-900 outline-none placeholder:text-slate-300"
                      />
                      {activeItemSuggestionIdx === idx && filteredItemSuggestions.length > 0 && (
                        <div ref={suggestionRef} className="absolute z-[110] left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl p-2 max-h-48 overflow-auto">
                          {filteredItemSuggestions.map(s => (
                            <button 
                              key={s.id}
                              type="button"
                              onClick={() => { 
                                updateItem(idx, { itemId: s.id, name: s.name, price: s.price }); 
                                setActiveItemSuggestionIdx(null); 
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex justify-between font-bold"
                            >
                              <span className="text-slate-800">{s.name}</span>
                              <span className="text-blue-600 font-black">₹{s.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {/* UNIT PRICE BOX - NOW EDITABLE */}
                      <div className="w-32 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-blue-600 px-4 py-4 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">PRICE</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={item.price || ''}
                          onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center text-xl font-black text-slate-900 bg-white outline-none border-none p-0 m-0"
                        />
                      </div>

                      {/* QTY BOX */}
                      <div className="w-24 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-blue-600 px-4 py-4 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">QTY</span>
                        <input 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-full text-center text-xl font-black text-slate-900 bg-white outline-none border-none p-0 m-0"
                        />
                      </div>

                      {/* ROW TOTAL */}
                      <div className="w-32 text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">TOTAL</div>
                        <div className="text-2xl font-black text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>

                      <button type="button" onClick={() => handleRemoveItemRow(idx)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors">
                        <Trash2 size={28} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleAddItemRow}
                className="w-full py-8 border-4 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all font-black text-xl flex items-center justify-center gap-4"
              >
                <Plus size={32} />
                <span>Add More Goods</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">How much cash was given?</label>
                <div className="relative">
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-300">₹</span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-20 pr-8 py-10 bg-slate-50 border-4 border-slate-200 focus:border-emerald-600 focus:bg-white rounded-[40px] outline-none transition-all text-6xl font-black text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest block">Extra Note (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Paid by Son, Gpay, or Part payment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none text-xl font-bold text-slate-800"
                />
              </div>
            </div>
          )}
        </form>

        {/* Final Big Action */}
        <div className={`p-10 flex flex-col md:flex-row items-center justify-between gap-8 ${type === 'SALE' ? 'bg-orange-50' : 'bg-emerald-50'}`}>
          <div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total Entry Value</span>
            <div className={`text-6xl font-black tracking-tighter ${type === 'SALE' ? 'text-orange-600' : 'text-emerald-600'}`}>
              ₹{total.toLocaleString('en-IN')}
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={!customerName || (type === 'SALE' && items.every(i => i.name.trim() === '')) || (type === 'PAYMENT' && !paymentAmount)}
            className={`w-full md:w-auto px-16 py-8 rounded-[40px] text-3xl font-black shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ${type === 'SALE' ? 'bg-orange-600 text-white shadow-orange-200' : 'bg-emerald-600 text-white shadow-emerald-200'}`}
          >
            Save Record Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
