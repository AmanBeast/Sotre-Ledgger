
import React, { useState } from 'react';
import { Package, Trash2, Edit2, Plus, Check, X, Search } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, onAddItem, onRemoveItem, onUpdateItem }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<Partial<InventoryItem>>({});

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (newItem.name && newItem.price > 0) {
      onAddItem(newItem);
      setNewItem({ name: '', price: 0 });
      setIsAdding(false);
    }
  };

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditBuffer({ name: item.name, price: item.price });
  };

  const saveEdit = (id: string) => {
    onUpdateItem(id, editBuffer);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Control Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            <span>Add Row</span>
          </button>
        )}
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="sheet-header">
              <th className="px-6 py-3 text-left w-12 border-r border-slate-200">#</th>
              <th className="px-6 py-3 text-left border-r border-slate-200">Item Name</th>
              <th className="px-6 py-3 text-right border-r border-slate-200">Default Price (₹)</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAdding && (
              <tr className="bg-indigo-50/50">
                <td className="px-6 py-3 text-slate-400 font-mono text-sm border-r border-slate-200">*</td>
                <td className="px-4 py-2 border-r border-slate-200">
                  <input 
                    autoFocus
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Enter item name..."
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-200">
                  <input 
                    type="number"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-right"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-6 py-2 flex items-center justify-center space-x-2">
                  <button onClick={handleAdd} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full transition-colors">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setIsAdding(false)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </td>
              </tr>
            )}

            {filteredItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-slate-400 font-mono text-sm border-r border-slate-200">{idx + 1}</td>
                <td className="px-6 py-4 border-r border-slate-200">
                  {editingId === item.id ? (
                    <input 
                      type="text"
                      value={editBuffer.name}
                      onChange={(e) => setEditBuffer({ ...editBuffer, name: e.target.value })}
                      className="w-full px-3 py-1 rounded border border-indigo-300 focus:outline-none text-sm"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        <Package size={14} />
                      </div>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-mono border-r border-slate-200">
                  {editingId === item.id ? (
                    <input 
                      type="number"
                      value={editBuffer.price}
                      onChange={(e) => setEditBuffer({ ...editBuffer, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-1 rounded border border-indigo-300 focus:outline-none text-sm text-right"
                    />
                  ) : (
                    <span className="text-slate-600">₹{item.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === item.id ? (
                      <>
                        <button onClick={() => saveEdit(item.id)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-md transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditing(item)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => onRemoveItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredItems.length === 0 && !isAdding && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <Package size={40} className="mb-2 opacity-20" />
                    <p>No inventory items found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
