
export interface InventoryItem {
  id: string;
  name: string;
  price: number;
}

export interface TransactionLineItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export type EntryType = 'SALE' | 'PAYMENT';

export interface LedgerEntry {
  id: string;
  customerName: string;
  date: string;
  type: EntryType;
  items?: TransactionLineItem[];
  amount: number; // Total value of goods or payment received
  note?: string;
}

// Added Transaction interface used by BillDetail and TransactionForm components
export interface Transaction {
  id: string;
  customerName: string;
  date: string;
  items: TransactionLineItem[];
  totalAmount: number;
}

export interface CustomerSummary {
  name: string;
  totalOwed: number;
  lastEntryDate: string;
}

export enum Tab {
  LEDGER = 'LEDGER',
  INVENTORY = 'INVENTORY',
  CUSTOMER_HISTORY = 'CUSTOMER_HISTORY'
}
