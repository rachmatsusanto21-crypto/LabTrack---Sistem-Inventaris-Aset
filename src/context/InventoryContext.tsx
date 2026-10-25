import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  InventoryItem,
  LoanTransaction,
  SchoolProfile,
  OfficialDocument,
  GasDeploymentConfig,
  SystemAlert,
} from '../types/inventory';
import {
  INITIAL_INVENTORY,
  INITIAL_LOANS,
  INITIAL_SCHOOL_PROFILE,
  INITIAL_DOCUMENTS,
} from '../data/initialData';
import { pushDataToGas, pullDataFromGas } from '../services/googleSheetsService';

interface InventoryContextType {
  inventory: InventoryItem[];
  loans: LoanTransaction[];
  schoolProfile: SchoolProfile;
  documents: OfficialDocument[];
  gasConfig: GasDeploymentConfig;
  alerts: SystemAlert[];
  isOnline: boolean;
  isSyncing: boolean;
  syncMessage: string | null;
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  
  borrowItem: (data: {
    itemId: string;
    borrowerName: string;
    borrowerType: LoanTransaction['borrowerType'];
    borrowerContact: string;
    borrowerClassOrDept: string;
    quantity: number;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
    loanNotes?: string;
    officerName: string;
  }) => { success: boolean; message: string };

  returnItem: (data: {
    loanId: string;
    actualReturnDate: string;
    returnCondition: InventoryItem['condition'];
    returnNotes?: string;
  }) => { success: boolean; message: string };

  updateLoan: (id: string, updates: Partial<LoanTransaction>) => { success: boolean; message: string };
  deleteLoan: (id: string) => { success: boolean; message: string };
  deleteBatchLoans: (ids: string[]) => { success: boolean; message: string };

  updateSchoolProfile: (profile: SchoolProfile) => void;
  createDocument: (doc: Omit<OfficialDocument, 'id' | 'createdAt'>) => void;
  deleteDocument: (id: string) => void;
  
  updateGasConfig: (config: Partial<GasDeploymentConfig>) => void;
  syncWithSheets: () => Promise<void>;
  pullFromSheets: () => Promise<void>;
  resetToDemoData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
  dismissAlert: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INVENTORY: 'labtrack_inventory_simbada_v2',
  LOANS: 'labtrack_loans_simbada_v2',
  PROFILE: 'labtrack_profile_simbada_v2',
  DOCUMENTS: 'labtrack_documents_simbada_v2',
  GAS_CONFIG: 'labtrack_gas_config_simbada_v2',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch (e) {
      return INITIAL_INVENTORY;
    }
  });

  const [loans, setLoans] = useState<LoanTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
      return saved ? JSON.parse(saved) : INITIAL_LOANS;
    } catch (e) {
      return INITIAL_LOANS;
    }
  });

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_PROFILE;
    } catch (e) {
      return INITIAL_SCHOOL_PROFILE;
    }
  });

  const [documents, setDocuments] = useState<OfficialDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch (e) {
      return INITIAL_DOCUMENTS;
    }
  });

  const [gasConfig, setGasConfig] = useState<GasDeploymentConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAS_CONFIG);
      return saved ? JSON.parse(saved) : {
        webAppUrl: '',
        spreadsheetUrl: '',
        autoSync: true,
        syncStatus: 'idle',
      };
    } catch (e) {
      return {
        webAppUrl: '',
        autoSync: true,
        syncStatus: 'idle',
      };
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Monitor online / offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAS_CONFIG, JSON.stringify(gasConfig));
  }, [gasConfig]);

  // Automated Overdue Loan Checker (Current date logic)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let hasOverdueUpdate = false;
    const updated = loans.map((loan) => {
      if (loan.status === 'Dipinjam' && loan.expectedReturnDate < today) {
        hasOverdueUpdate = true;
        return { ...loan, status: 'Terlambat' as const };
      }
      return loan;
    });

    if (hasOverdueUpdate) {
      setLoans(updated);
    }
  }, [loans]);

  // Automated System Alerts calculation
  const alerts = useMemo(() => {
    const list: SystemAlert[] = [];
    const today = new Date().toISOString().split('T')[0];

    // 1. Check Low Stock Items
    inventory.forEach((item) => {
      if (item.availableStock <= item.minStockAlert) {
        list.push({
          id: `alert-low-${item.id}`,
          type: item.availableStock === 0 ? 'danger' : 'warning',
          category: 'low_stock',
          title: item.availableStock === 0 ? 'Stok Habis!' : 'Stok Menipis!',
          message: `${item.name} (${item.code}) tersisa ${item.availableStock} ${item.unit} (ambang batas: ${item.minStockAlert} ${item.unit}). Segera lakukan restock atau tindak lanjuti pengembalian.`,
          targetId: item.id,
          timestamp: today,
          isRead: false,
        });
      }

      // 2. Check Damaged / Maintenance Items (KB / RB Standar SIMBADA)
      if (item.condition === 'KB' || item.condition === 'RB') {
        list.push({
          id: `alert-damage-${item.id}`,
          type: item.condition === 'RB' ? 'danger' : 'warning',
          category: 'damaged_item',
          title: item.condition === 'RB' ? 'Perhatian: Rusak Berat (RB)' : 'Perhatian: Kurang Baik (KB)',
          message: `${item.name} (${item.code}) berstatus ${item.condition === 'RB' ? 'Rusak Berat (RB) - segera buat BAP & usul penghapusan SIMBADA' : 'Kurang Baik (KB) - perlu pemeliharaan/servis teknis'}.`,
          targetId: item.id,
          timestamp: today,
          isRead: false,
        });
      }
    });

    // 3. Check Overdue Loans
    loans.forEach((loan) => {
      if (loan.status === 'Terlambat' || (loan.status === 'Dipinjam' && loan.expectedReturnDate < today)) {
        list.push({
          id: `alert-loan-${loan.id}`,
          type: 'danger',
          category: 'overdue_loan',
          title: 'Pengembalian Alat Terlambat!',
          message: `${loan.itemName} (${loan.quantity} unit) dipinjam oleh ${loan.borrowerName} (${loan.borrowerClassOrDept}) jatuh tempo tgl ${loan.expectedReturnDate}. Kontak: ${loan.borrowerContact}`,
          targetId: loan.id,
          timestamp: today,
          isRead: false,
        });
      }
    });

    return list.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [inventory, loans, dismissedAlertIds]);

  const dismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  // Add Item
  const addItem = useCallback((itemData: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newItem, ...prev]);
  }, []);

  // Update Item
  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : item
      )
    );
  }, []);

  // Delete Item
  const deleteItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Borrow Item Action
  const borrowItem = useCallback((data: {
    itemId: string;
    borrowerName: string;
    borrowerType: LoanTransaction['borrowerType'];
    borrowerContact: string;
    borrowerClassOrDept: string;
    quantity: number;
    borrowDate: string;
    expectedReturnDate: string;
    purpose: string;
    loanNotes?: string;
    officerName: string;
  }) => {
    const targetItem = inventory.find((it) => it.id === data.itemId);
    if (!targetItem) {
      return { success: false, message: 'Barang tidak ditemukan dalam inventaris!' };
    }

    if (targetItem.availableStock < data.quantity) {
      return {
        success: false,
        message: `Stok tidak mencukupi! Tersedia hanya ${targetItem.availableStock} ${targetItem.unit}.`,
      };
    }

    // Generate loan number
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomSeq = String(loans.length + 1).padStart(3, '0');
    const loanNumber = `PJM/${year}/${month}/${randomSeq}`;

    const newLoan: LoanTransaction = {
      id: `loan-${Date.now()}`,
      loanNumber,
      itemId: targetItem.id,
      itemCode: targetItem.code,
      itemName: targetItem.name,
      borrowerName: data.borrowerName,
      borrowerType: data.borrowerType,
      borrowerContact: data.borrowerContact,
      borrowerClassOrDept: data.borrowerClassOrDept,
      quantity: data.quantity,
      borrowDate: data.borrowDate,
      expectedReturnDate: data.expectedReturnDate,
      status: 'Dipinjam',
      purpose: data.purpose,
      loanNotes: data.loanNotes,
      officerName: data.officerName || schoolProfile.labHeadName,
      createdAt: new Date().toISOString(),
    };

    // Update Item stock
    setInventory((prev) =>
      prev.map((it) =>
        it.id === targetItem.id
          ? {
              ...it,
              availableStock: it.availableStock - data.quantity,
              borrowedStock: it.borrowedStock + data.quantity,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : it
      )
    );

    // Add Loan
    setLoans((prev) => [newLoan, ...prev]);

    return {
      success: true,
      message: `Peminjaman nomor ${loanNumber} berhasil dicatat! Stok ${targetItem.name} berkurang ${data.quantity} ${targetItem.unit}.`,
    };
  }, [inventory, loans.length, schoolProfile.labHeadName]);

  // Return Item Action
  const returnItem = useCallback((data: {
    loanId: string;
    actualReturnDate: string;
    returnCondition: InventoryItem['condition'];
    returnNotes?: string;
  }) => {
    const targetLoan = loans.find((l) => l.id === data.loanId);
    if (!targetLoan) {
      return { success: false, message: 'Data peminjaman tidak ditemukan!' };
    }

    if (targetLoan.status === 'Dikembalikan') {
      return { success: false, message: 'Alat ini sudah tercatat dikembalikan sebelumnya.' };
    }

    // Update Loan record
    setLoans((prev) =>
      prev.map((l) =>
        l.id === data.loanId
          ? {
              ...l,
              status: 'Dikembalikan' as const,
              actualReturnDate: data.actualReturnDate,
              returnCondition: data.returnCondition,
              returnNotes: data.returnNotes,
            }
          : l
      )
    );

    // Update Inventory stock & condition if changed
    setInventory((prev) =>
      prev.map((it) => {
        if (it.id === targetLoan.itemId) {
          const newCondition = data.returnCondition !== 'B' ? data.returnCondition : it.condition;
          return {
            ...it,
            availableStock: it.availableStock + targetLoan.quantity,
            borrowedStock: Math.max(0, it.borrowedStock - targetLoan.quantity),
            condition: newCondition,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return it;
      })
    );

    return {
      success: true,
      message: `Barang ${targetLoan.itemName} (${targetLoan.quantity} unit) berhasil dikembalikan ke rak inventaris!`,
    };
  }, [loans]);

  // Update Loan Transaction
  const updateLoan = useCallback((id: string, updates: Partial<LoanTransaction>) => {
    const existing = loans.find((l) => l.id === id);
    if (!existing) {
      return { success: false, message: 'Transaksi peminjaman tidak ditemukan!' };
    }

    // Check if quantity changed and loan is still active (not yet returned)
    if (updates.quantity !== undefined && updates.quantity !== existing.quantity && existing.status !== 'Dikembalikan') {
      const diff = updates.quantity - existing.quantity;
      const targetItem = inventory.find((it) => it.id === existing.itemId);
      if (targetItem && diff > 0 && targetItem.availableStock < diff) {
        return {
          success: false,
          message: `Stok tidak mencukupi untuk penambahan ${diff} unit! Tersedia: ${targetItem.availableStock} ${targetItem.unit}.`,
        };
      }

      // Adjust inventory stock
      setInventory((prev) =>
        prev.map((it) =>
          it.id === existing.itemId
            ? {
                ...it,
                availableStock: Math.max(0, it.availableStock - diff),
                borrowedStock: Math.max(0, it.borrowedStock + diff),
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : it
        )
      );
    }

    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );

    return { success: true, message: 'Data peminjaman berhasil diperbarui!' };
  }, [loans, inventory]);

  // Delete Loan Transaction
  const deleteLoan = useCallback((id: string) => {
    const existing = loans.find((l) => l.id === id);
    if (!existing) {
      return { success: false, message: 'Data peminjaman tidak ditemukan!' };
    }

    // If active (not returned), restore borrowed stock back to inventory
    if (existing.status !== 'Dikembalikan') {
      setInventory((prev) =>
        prev.map((it) =>
          it.id === existing.itemId
            ? {
                ...it,
                availableStock: it.availableStock + existing.quantity,
                borrowedStock: Math.max(0, it.borrowedStock - existing.quantity),
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : it
        )
      );
    }

    setLoans((prev) => prev.filter((l) => l.id !== id));
    return {
      success: true,
      message: `Peminjaman ${existing.loanNumber} berhasil dihapus.${
        existing.status !== 'Dikembalikan' ? ` Stok ${existing.quantity} unit dikembalikan ke rak.` : ''
      }`,
    };
  }, [loans]);

  // Delete Batch Loans
  const deleteBatchLoans = useCallback((ids: string[]) => {
    if (ids.length === 0) return { success: false, message: 'Tidak ada peminjaman yang dipilih.' };

    const toDelete = loans.filter((l) => ids.includes(l.id));
    
    // Restore stock for active loans being deleted
    toDelete.forEach((loan) => {
      if (loan.status !== 'Dikembalikan') {
        setInventory((prev) =>
          prev.map((it) =>
            it.id === loan.itemId
              ? {
                  ...it,
                  availableStock: it.availableStock + loan.quantity,
                  borrowedStock: Math.max(0, it.borrowedStock - loan.quantity),
                  lastUpdated: new Date().toISOString().split('T')[0],
                }
              : it
          )
        );
      }
    });

    setLoans((prev) => prev.filter((l) => !ids.includes(l.id)));
    return { success: true, message: `${toDelete.length} data peminjaman berhasil dihapus.` };
  }, [loans]);

  // Update School Profile
  const updateSchoolProfile = useCallback((profile: SchoolProfile) => {
    setSchoolProfile(profile);
  }, []);

  // Create Official Document (BAST / Berita Acara / KIR)
  const createDocument = useCallback((docData: Omit<OfficialDocument, 'id' | 'createdAt'>) => {
    const newDoc: OfficialDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateGasConfig = useCallback((config: Partial<GasDeploymentConfig>) => {
    setGasConfig((prev) => ({ ...prev, ...config }));
  }, []);

  // Manual Sync to Google Sheets
  const syncWithSheets = useCallback(async () => {
    if (!gasConfig.webAppUrl) {
      setSyncMessage('Silakan masukkan Web App URL Google Apps Script terlebih dahulu di menu Sinkronisasi.');
      return;
    }

    setIsSyncing(true);
    setGasConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));

    const res = await pushDataToGas(gasConfig.webAppUrl, {
      inventory,
      loans,
      schoolProfile,
      documents,
    });

    setIsSyncing(false);
    if (res.success) {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        lastSyncTime: res.timestamp || new Date().toLocaleString('id-ID'),
        errorMessage: undefined,
      }));
      setSyncMessage('Berhasil menyinkronkan seluruh database ke Google Sheets!');
    } else {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: res.message,
      }));
      setSyncMessage(res.message);
    }
  }, [gasConfig.webAppUrl, inventory, loans, schoolProfile, documents]);

  // Pull latest from Google Sheets
  const pullFromSheets = useCallback(async () => {
    if (!gasConfig.webAppUrl) {
      setSyncMessage('Silakan masukkan Web App URL Google Apps Script terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    setGasConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));

    const res = await pullDataFromGas(gasConfig.webAppUrl);
    setIsSyncing(false);

    if (res.success) {
      if (res.inventory && res.inventory.length > 0) setInventory(res.inventory);
      if (res.loans && res.loans.length > 0) setLoans(res.loans);
      if (res.schoolProfile) setSchoolProfile((prev) => ({ ...prev, ...res.schoolProfile }));
      if (res.documents && res.documents.length > 0) setDocuments(res.documents);

      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'success',
        lastSyncTime: res.syncedAt || new Date().toLocaleString('id-ID'),
        errorMessage: undefined,
      }));
      setSyncMessage('Berhasil memuat data terbaru dari Google Sheets!');
    } else {
      setGasConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: res.message,
      }));
      setSyncMessage(res.message);
    }
  }, [gasConfig.webAppUrl]);

  // Reset demo
  const resetToDemoData = useCallback(() => {
    setInventory(INITIAL_INVENTORY);
    setLoans(INITIAL_LOANS);
    setSchoolProfile(INITIAL_SCHOOL_PROFILE);
    setDocuments(INITIAL_DOCUMENTS);
    setDismissedAlertIds([]);
    setSyncMessage('Database berhasil direset ke data sampel lab komputer.');
  }, []);

  // Export JSON
  const exportDatabaseJson = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      schoolProfile,
      inventory,
      loans,
      documents,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LabTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [schoolProfile, inventory, loans, documents]);

  // Import JSON
  const importDatabaseJson = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.inventory && Array.isArray(parsed.inventory)) {
        setInventory(parsed.inventory);
      }
      if (parsed.loans && Array.isArray(parsed.loans)) {
        setLoans(parsed.loans);
      }
      if (parsed.schoolProfile) {
        setSchoolProfile(parsed.schoolProfile);
      }
      if (parsed.documents && Array.isArray(parsed.documents)) {
        setDocuments(parsed.documents);
      }
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        loans,
        schoolProfile,
        documents,
        gasConfig,
        alerts,
        isOnline,
        isSyncing,
        syncMessage,
        addItem,
        updateItem,
        deleteItem,
        borrowItem,
        returnItem,
        updateLoan,
        deleteLoan,
        deleteBatchLoans,
        updateSchoolProfile,
        createDocument,
        deleteDocument,
        updateGasConfig,
        syncWithSheets,
        pullFromSheets,
        resetToDemoData,
        exportDatabaseJson,
        importDatabaseJson,
        dismissAlert,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
