
import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ArrowLeft,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search
} from 'lucide-react';
import { Tab, InventoryItem, LedgerEntry, CustomerSummary } from './types';
import Inventory from './components/Inventory';
import Ledger from './components/Ledger';
import CustomerHistory from './components/CustomerHistory';
import EntryForm from './components/EntryForm';

const STORAGE_KEYS = {
  INVENTORY: 'store_ledger_inventory',
  ENTRIES: 'store_ledger_entries'
};

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Basmati Rice 1kg', price: 120 },
  { id: '2', name: 'Cooking Oil 1L', price: 180 },
  { id: '3', name: 'Sugar 1kg', price: 45 },
  { id: '4', name: 'Wheat Flour 5kg', price: 250 },
  { id: '5', name: 'Tea Leaves 250g', price: 90 },
];

const DEFAULT_ENTRIES: LedgerEntry[] = [
  {
    id: 'e1',
    customerName: 'Sample Customer',
    date: new Date().toISOString(),
    type: 'SALE',
    items: [{ id: 'li1', itemId: '1', name: 'Basmati Rice 1kg', price: 120, quantity: 2 }],
    amount: 240
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.LEDGER);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Initialize inventory from LocalStorage or use defaults
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : DEFAULT_INVENTORY;
  });

  // Initialize entries from LocalStorage or use defaults
  const [entries, setEntries] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return saved ? JSON.parse(saved) : DEFAULT_ENTRIES;
  });

  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Sync state to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }, [entries]);

  // Compute Customer Summaries (Balances)
  const customerSummaries = useMemo(() => {
    const map = new Map<string, CustomerSummary>();
    entries.forEach(entry => {
      const current = map.get(entry.customerName) || { 
        name: entry.customerName, 
        totalOwed: 0, 
        lastEntryDate: entry.date 
      };
      
      if (entry.type === 'SALE') {
        current.totalOwed += entry.amount;
      } else {
        current.totalOwed -= entry.amount;
      }
      
      if (new Date(entry.date) > new Date(current.lastEntryDate)) {
        current.lastEntryDate = entry.date;
      }
      
      map.set(entry.customerName, current);
    });
    return Array.from(map.values()).sort((a, b) => b.totalOwed - a.totalOwed);
  }, [entries]);

  const filteredCustomerSummaries = useMemo(() => {
    return customerSummaries.filter(summary => 
      summary.name.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customerSummaries, customerSearch]);

  const totalMarketDebt = useMemo(() => 
    customerSummaries.reduce((sum, c) => sum + c.totalOwed, 0), 
    [customerSummaries]
  );

  const handleAddEntry = (newEntry: Omit<LedgerEntry, 'id'>) => {
    const entry: LedgerEntry = {
      ...newEntry,
      id: Math.random().toString(36).substr(2, 9)
    };
    setEntries(prev => [entry, ...prev]);
    setIsAddingEntry(false);
  };

  const deleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const viewCustomer = (name: string) => {
    setSelectedCustomer(name);
    setActiveTab(Tab.CUSTOMER_HISTORY);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-slate-900">
      {/* Super Simple Navbar */}
      <header className="bg-blue-800 text-white shadow-xl z-20">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-white p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-inner">
              <Wallet className="text-blue-800 w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight leading-none uppercase">Store Ledger</h1>
              <p className="text-blue-200 text-[9px] md:text-sm font-bold uppercase tracking-widest mt-1">Old Shop Accounts</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1 md:space-x-2">
            <button 
              onClick={() => setActiveTab(Tab.LEDGER)}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-black text-sm md:text-lg transition-all flex items-center space-x-2 ${activeTab === Tab.LEDGER || activeTab === Tab.CUSTOMER_HISTORY ? 'bg-white text-blue-800 shadow-md' : 'hover:bg-blue-700'}`}
            >
              <Users size={18} className="md:w-6 md:h-6" />
              <span className="hidden sm:inline">Customers</span>
            </button>
            <button 
              onClick={() => setActiveTab(Tab.INVENTORY)}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-black text-sm md:text-lg transition-all flex items-center space-x-2 ${activeTab === Tab.INVENTORY ? 'bg-white text-blue-800 shadow-md' : 'hover:bg-blue-700'}`}
            >
              <Package size={18} className="md:w-6 md:h-6" />
              <span className="hidden sm:inline">Inventory</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 overflow-auto p-3 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          
          {activeTab === Tab.LEDGER && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
              {/* Massive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border-l-4 md:border-l-8 border-orange-500 flex flex-col justify-center">
                  <p className="text-slate-500 font-black text-[10px] md:text-sm uppercase tracking-widest mb-1">Total Udhaar (Outstanding)</p>
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">₹{totalMarketDebt.toLocaleString('en-IN')}</h2>
                </div>
                <div className="bg-blue-800 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl flex items-center justify-between text-white group cursor-pointer active:scale-95 transition-all" onClick={() => setIsAddingEntry(true)}>
                  <div>
                    <h2 className="text-xl md:text-3xl font-black mb-1">New Entry</h2>
                    <p className="text-blue-200 font-bold uppercase text-[9px] md:text-xs tracking-widest">Sale or Payment</p>
                  </div>
                  <div className="bg-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl group-hover:bg-white/30 transition-colors">
                    <PlusCircle size={32} className="md:w-12 md:h-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Customer List Section */}
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm overflow-hidden border border-slate-200">
                <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-slate-50 gap-4">
                  <div>
                    <h3 className="text-base md:text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Balances</h3>
                    <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredCustomerSummaries.length} Found</div>
                  </div>
                  
                  {/* Senior-Friendly Search Bar */}
                  <div className="relative flex-1 max-w-sm">
                    <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search size={18} className="md:w-6 md:h-6" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search Customer..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-4 bg-white border-2 border-slate-200 rounded-xl md:rounded-2xl text-sm md:text-lg font-black text-slate-900 focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                
                <Ledger 
                  summaries={filteredCustomerSummaries} 
                  onViewCustomer={viewCustomer} 
                />
              </div>
            </div>
          )}

          {activeTab === Tab.INVENTORY && (
            <div className="animate-in slide-in-from-right duration-300">
              <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center space-x-3">
                <Package size={24} className="md:w-8 md:h-8 text-blue-600" />
                <span>Goods & Prices</span>
              </h2>
              <Inventory 
                items={inventory} 
                onAddItem={(item) => setInventory([...inventory, { ...item, id: Math.random().toString() }])} 
                onRemoveItem={(id) => {
                  if (window.confirm('Delete this item from inventory?')) {
                    setInventory(inventory.filter(i => i.id !== id));
                  }
                }}
                onUpdateItem={(id, u) => setInventory(inventory.map(i => i.id === id ? {...i, ...u} : i))}
              />
            </div>
          )}

          {activeTab === Tab.CUSTOMER_HISTORY && selectedCustomer && (
            <div className="animate-in slide-in-from-left duration-300">
              <button 
                onClick={() => setActiveTab(Tab.LEDGER)}
                className="mb-6 md:mb-8 flex items-center space-x-2 md:space-x-3 text-blue-800 bg-white px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-sm font-black text-sm md:text-lg hover:shadow-md transition-all active:scale-95"
              >
                <ArrowLeft size={20} className="md:w-7 md:h-7" />
                <span>Back to All</span>
              </button>
              
              <CustomerHistory 
                customerName={selectedCustomer} 
                entries={entries.filter(e => e.customerName === selectedCustomer)} 
                onDeleteEntry={deleteEntry}
              />
            </div>
          )}
        </div>
      </main>

      {/* Simplified Fullscreen Modal for Entry */}
      {isAddingEntry && (
        <EntryForm 
          inventory={inventory} 
          existingCustomers={customerSummaries.map(c => c.name)}
          onSubmit={handleAddEntry} 
          onClose={() => setIsAddingEntry(false)} 
        />
      )}
    </div>
  );
};

export default App;
