
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
    <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full max-w-5xl h-[94vh] md:h-auto md:max-h-[90vh] rounded-t-[24px] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="px-5 py-3 md:px-10 md:py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-6">
            <div className="bg-blue-800 p-2 md:p-3 rounded-xl md:rounded-2xl text-white shadow-lg shadow-blue-200/50">
              <Plus size={18} className="md:w-8 md:h-8" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-lg md:text-3xl font-black text-slate-800 tracking-tight">Add Record</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-xs">New Ledger Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
            <X size={24} className="md:w-10 md:h-10" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 md:p-8 space-y-5 md:space-y-8">
          
          {/* Section 1: Customer */}
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest block">Customer Name</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <User size={18} className="md:w-6 md:h-6" />
              </div>
              <input 
                autoFocus
                type="text"
                placeholder="Type name..."
                value={customerName}
                onFocus={() => setShowCustomerSuggestions(true)}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="off"
                className="w-full pl-11 md:pl-16 pr-4 py-3 md:py-6 bg-slate-50 border-2 border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl md:rounded-2xl outline-none transition-all text-base md:text-xl font-black text-slate-900 placeholder:text-slate-300"
              />
              {showCustomerSuggestions && filteredCustomerSuggestions.length > 0 && (
                <div ref={suggestionRef} className="absolute z-[110] left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-xl md:rounded-[24px] shadow-2xl p-1 md:p-2 space-y-0.5">
                  {filteredCustomerSuggestions.map(name => (
                    <button 
                      key={name} 
                      type="button"
                      onClick={() => { setCustomerName(name); setShowCustomerSuggestions(false); }}
                      className="w-full text-left px-3 md:px-5 py-2.5 md:py-4 rounded-lg md:rounded-xl hover:bg-blue-50 text-sm md:text-lg font-black text-slate-700 flex items-center justify-between group"
                    >
                      <span>{name}</span>
                      <ArrowRight size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity md:w-5 md:h-5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Type Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest block">Entry Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setType('SALE')}
                className={`flex items-center justify-center space-x-2 py-3 md:py-6 rounded-xl md:rounded-2xl border-2 transition-all ${type === 'SALE' ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <ShoppingCart size={18} className="md:w-6 md:h-6" />
                <span className="text-sm md:text-xl font-black">Gave Goods</span>
              </button>
              <button 
                type="button"
                onClick={() => setType('PAYMENT')}
                className={`flex items-center justify-center space-x-2 py-3 md:py-6 rounded-xl md:rounded-2xl border-2 transition-all ${type === 'PAYMENT' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
              >
                <Banknote size={18} className="md:w-6 md:h-6" />
                <span className="text-sm md:text-xl font-black">Received Cash</span>
              </button>
            </div>
          </div>

          {/* Section 3: Sale Items */}
          {type === 'SALE' ? (
            <div className="space-y-3">
              <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest block">Goods Taken</label>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-3 md:p-5 bg-slate-50 rounded-xl md:rounded-[24px] border border-slate-200 gap-3">
                    {/* Item Name Search / Manual Entry */}
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Item name..."
                        value={item.name}
                        onFocus={() => { setActiveItemSuggestionIdx(idx); setSearchTerm(item.name); }}
                        onChange={(e) => { 
                          updateItem(idx, { name: e.target.value }); 
                          setSearchTerm(e.target.value); 
                        }}
                        className="w-full px-4 py-2.5 md:py-4 rounded-lg md:rounded-xl bg-white border-2 border-slate-200 focus:border-blue-600 text-sm md:text-lg font-black text-slate-900 outline-none"
                      />
                      {activeItemSuggestionIdx === idx && filteredItemSuggestions.length > 0 && (
                        <div ref={suggestionRef} className="absolute z-[110] left-0 right-0 mt-1 bg-white border-2 border-slate-100 rounded-lg md:rounded-xl shadow-xl p-0.5 max-h-32 overflow-auto">
                          {filteredItemSuggestions.map(s => (
                            <button 
                              key={s.id}
                              type="button"
                              onClick={() => { 
                                updateItem(idx, { itemId: s.id, name: s.name, price: s.price }); 
                                setActiveItemSuggestionIdx(null); 
                              }}
                              className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 flex justify-between font-bold text-xs"
                            >
                              <span className="text-slate-800">{s.name}</span>
                              <span className="text-blue-600 font-black">₹{s.price}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-12 items-center gap-2">
                      {/* UNIT PRICE BOX */}
                      <div className="col-span-4 bg-white rounded-lg md:rounded-xl border-2 border-slate-200 focus-within:border-blue-600 px-2 py-1.5 md:px-3 md:py-3 flex flex-col items-center justify-center">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">PRICE</span>
                        <input 
                          type="number"
                          placeholder="0"
                          value={item.price || ''}
                          onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center text-xs md:text-lg font-black text-slate-900 bg-white outline-none border-none p-0"
                        />
                      </div>

                      {/* QTY BOX */}
                      <div className="col-span-3 bg-white rounded-lg md:rounded-xl border-2 border-slate-200 focus-within:border-blue-600 px-2 py-1.5 md:px-3 md:py-3 flex flex-col items-center justify-center">
                        <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">QTY</span>
                        <input 
                          type="number"
                          step="0.001"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center text-xs md:text-lg font-black text-slate-900 bg-white outline-none border-none p-0"
                        />
                      </div>

                      {/* ROW TOTAL */}
                      <div className="col-span-3 text-right">
                        <div className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL</div>
                        <div className="text-sm md:text-xl font-black text-slate-800">₹{Math.round(item.price * item.quantity).toLocaleString()}</div>
                      </div>

                      {/* REMOVE BUTTON */}
                      <div className="col-span-2 flex justify-end">
                        <button type="button" onClick={() => handleRemoveItemRow(idx)} className="p-1.5 md:p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} className="md:w-6 md:h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleAddItemRow}
                className="w-full py-3 md:py-5 border-2 border-dashed border-slate-200 rounded-xl md:rounded-[24px] text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all font-black text-sm md:text-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>Add Item</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest block">Cash Received Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl md:text-4xl font-black text-slate-300">₹</span>
                  <input 
                    type="number"
                    placeholder="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 md:pl-16 pr-4 py-5 md:py-10 bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl md:rounded-[32px] outline-none transition-all text-2xl md:text-5xl font-black text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest block">Note</label>
                <input 
                  type="text"
                  placeholder="Gpay, Cash, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 md:py-5 bg-slate-50 border-2 border-slate-200 rounded-lg md:rounded-xl outline-none text-sm md:text-lg font-bold text-slate-800"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer with Summary and Action */}
        <div className={`px-5 py-4 md:px-10 md:py-8 flex items-center justify-between gap-4 ${type === 'SALE' ? 'bg-orange-50' : 'bg-emerald-50'}`}>
          <div>
            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
            <div className={`text-2xl md:text-5xl font-black tracking-tighter ${type === 'SALE' ? 'text-orange-600' : 'text-emerald-600'}`}>
              ₹{Math.round(total).toLocaleString('en-IN')}
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={!customerName || (type === 'SALE' && items.every(i => i.name.trim() === '')) || (type === 'PAYMENT' && !paymentAmount)}
            className={`px-6 md:px-12 py-3 md:py-6 rounded-xl md:rounded-[32px] text-base md:text-2xl font-black shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ${type === 'SALE' ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'}`}
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
