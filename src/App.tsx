/**
 * LabTrack - Sistem Inventaris & Peminjaman Ruang Lab Komputer
 * Terintegrasi Google Sheets & Google Apps Script Backend
 * Desain Minimalis Modern dengan Sidebar Kiri & Palet Warna Resmi (#3B4A6B, #23B2DA, #F1D43A, #F23456)
 */

import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { LabDashboard } from './components/dashboard/LabDashboard';
import { InventoryList } from './components/inventory/InventoryList';
import { ItemFormModal } from './components/inventory/ItemFormModal';
import { LoanManager } from './components/loans/LoanManager';
import { LoanFormModal } from './components/loans/LoanFormModal';
import { ReturnModal } from './components/loans/ReturnModal';
import { DocumentViewer } from './components/documents/DocumentViewer';
import { SchoolProfileEditor } from './components/profile/SchoolProfileEditor';
import { GoogleSheetsSyncModal } from './components/sync/GoogleSheetsSyncModal';
import { QRLabelPrinter } from './components/QRLabelPrinter';
import { QRScannerModal } from './components/QRScannerModal';
import { InventoryItem, LoanTransaction } from './types/inventory';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileText,
  School,
  FileSpreadsheet,
  QrCode,
  Bell,
  Wifi,
  WifiOff,
  Menu,
  X,
  ExternalLink,
  RotateCcw,
  Printer,
  ChevronRight,
  Plus,
  Calendar,
} from 'lucide-react';

function MainApp() {
  const {
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
  } = useInventory();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inventory' | 'loans' | 'documents' | 'profile' | 'sync'
  >('dashboard');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState<boolean>(false);
  const [preselectedItemForLoan, setPreselectedItemForLoan] = useState<InventoryItem | null>(null);
  const [activeReturnLoan, setActiveReturnLoan] = useState<LoanTransaction | null>(null);
  
  // QR Stiker Printing state
  const [isQRPrinterOpen, setIsQRPrinterOpen] = useState<boolean>(false);
  const [printSelectedItemIds, setPrintSelectedItemIds] = useState<string[]>([]);

  // Mobile navigation drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Quick Action Handlers
  const handleOpenBorrowForItem = (item: InventoryItem) => {
    setPreselectedItemForLoan(item);
    setIsLoanModalOpen(true);
  };

  const handleOpenReturnForLoan = (loan: LoanTransaction) => {
    setActiveReturnLoan(loan);
  };

  const handleOpenPrintSingleQR = (item: InventoryItem) => {
    setPrintSelectedItemIds([item.id]);
    setIsQRPrinterOpen(true);
  };

  const handleOpenPrintBatchQR = (itemIds: string[]) => {
    setPrintSelectedItemIds(itemIds);
    setIsQRPrinterOpen(true);
  };

  const overdueLoansCount = loans.filter((l) => l.status === 'Terlambat').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Inventaris',
      icon: Package,
      badge: inventory.length.toString(),
    },
    {
      id: 'loans',
      label: 'Peminjaman Alat',
      icon: ArrowLeftRight,
      badge: overdueLoansCount > 0 ? `${overdueLoansCount} Terlambat` : null,
      badgeColor: overdueLoansCount > 0 ? 'bg-[#F23456] text-white' : undefined,
    },
    {
      id: 'documents',
      label: 'Dokumen & KIR',
      icon: FileText,
      badge: null,
    },
    {
      id: 'profile',
      label: 'Profil Sekolah',
      icon: School,
      badge: null,
    },
    {
      id: 'sync',
      label: 'Sinkron GSheets',
      icon: FileSpreadsheet,
      badge: gasConfig.webAppUrl ? 'Terkoneksi' : 'Setup',
      badgeColor: gasConfig.webAppUrl ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#F1D43A]/20 text-[#F1D43A]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row">
      
      {/* ============================================================== */}
      {/* 1. SIDEBAR NAVIGASI KIRI (Desktop & Tablet Landscape) */}
      {/* ============================================================== */}
      <aside className="no-print hidden md:flex md:w-64 xl:w-72 bg-[#3B4A6B] text-white flex-col justify-between shrink-0 h-screen sticky top-0 z-30 shadow-xl border-r border-[#2b3750]">
        
        {/* Sidebar Header & Brand */}
        <div className="p-5 border-b border-white/10">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#23B2DA] text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition shrink-0 p-1">
              {schoolProfile.pemkotLogoUrl || schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.pemkotLogoUrl || schoolProfile.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain drop-shadow"
                />
              ) : (
                <span className="text-sm font-mono tracking-tighter">LAB</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-base font-black text-white tracking-tight leading-tight flex items-center gap-1.5">
                LabTrack
                <span className="text-[9px] bg-[#23B2DA] text-white font-extrabold px-1.5 py-0.5 rounded uppercase">
                  SIMBADA
                </span>
              </div>
              <div className="text-[11px] text-slate-300 truncate mt-0.5" title={schoolProfile.schoolName}>
                {schoolProfile.schoolName}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Menu */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-between group cursor-pointer ${
                  isActive
                    ? 'bg-[#23B2DA] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Bottom Shortcuts & Status Card */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#2f3b55]">
          {/* Quick Action Tools in Sidebar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 transition text-[11px]"
              title="Buka Kamera / Barcode Scanner"
            >
              <QrCode className="w-3.5 h-3.5 text-[#23B2DA]" />
              <span>Scan QR</span>
            </button>

            <button
              onClick={() => {
                setPrintSelectedItemIds(inventory.map((i) => i.id));
                setIsQRPrinterOpen(true);
              }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 transition text-[11px]"
              title="Cetak Stiker Label Barcode"
            >
              <Printer className="w-3.5 h-3.5 text-[#F1D43A]" />
              <span>Label QR</span>
            </button>
          </div>

          {/* Connection status pill */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-[#F1D43A]'}`}></span>
              {isOnline ? 'Online Google Workspace' : 'Offline Mode'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">v2.5</span>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE TOP BAR & SLIDE-OVER DRAWER */}
      {/* ============================================================== */}
      <div className="no-print md:hidden bg-[#3B4A6B] text-white px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight">LabTrack</span>
            <span className="text-[9px] bg-[#23B2DA] px-1.5 py-0.5 rounded font-bold">SIMBADA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 bg-[#23B2DA] rounded-xl text-white shadow-xs"
            title="Scan QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="no-print md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-xs bg-[#3B4A6B] text-white h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="font-black text-sm">LabTrack Menu</div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between ${
                        isActive ? 'bg-[#23B2DA] text-white' : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-slate-300 space-y-2">
              <div>{schoolProfile.schoolName}</div>
              <div className="text-[11px] text-slate-400">PJ: {schoolProfile.labHeadName}</div>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT VIEWPORT */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Main Content Header Strip */}
        <header className="no-print bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 md:static z-20 shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#3B4A6B]">LabTrack</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600 capitalize">
              {activeTab === 'dashboard'
                ? 'Dashboard Minimalis'
                : activeTab === 'inventory'
                ? 'Daftar Inventaris Laboratorium'
                : activeTab === 'loans'
                ? 'Peminjaman & Pengembalian'
                : activeTab === 'documents'
                ? 'Dokumen Resmi & KIR'
                : activeTab === 'profile'
                ? 'Profil Satuan Pendidikan'
                : 'Sinkronisasi Google Sheets'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Today Date Context */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#23B2DA]" />
              <span>
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Quick Action Button: Input Barang Baru */}
            <button
              onClick={() => setIsNewItemOpen(true)}
              className="px-3 py-1.5 bg-[#3B4A6B] hover:bg-[#2b3750] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#F1D43A]" />
              <span className="hidden sm:inline">Input Barang</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Tab */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <LabDashboard
              inventory={inventory}
              loans={loans}
              alerts={alerts}
              schoolProfile={schoolProfile}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenNewLoan={() => {
                setPreselectedItemForLoan(null);
                setIsLoanModalOpen(true);
              }}
              onOpenNewItem={() => setIsNewItemOpen(true)}
              onOpenQRPrinter={() => {
                setPrintSelectedItemIds(inventory.map((i) => i.id));
                setIsQRPrinterOpen(true);
              }}
              onOpenDocuments={() => setActiveTab('documents')}
              onOpenSync={() => setActiveTab('sync')}
              onDismissAlert={dismissAlert}
              onViewItem={(item) => setActiveTab('inventory')}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryList
              items={inventory}
              onAddNew={() => setIsNewItemOpen(true)}
              onEditItem={(item) => setEditingItem(item)}
              onDeleteItem={(id) => deleteItem(id)}
              onBorrowItem={(item) => handleOpenBorrowForItem(item)}
              onPrintSingleQR={(item) => handleOpenPrintSingleQR(item)}
              onPrintBatchQR={(ids) => handleOpenPrintBatchQR(ids)}
            />
          )}

          {activeTab === 'loans' && (
            <LoanManager
              loans={loans}
              inventory={inventory}
              schoolProfile={schoolProfile}
              isSyncing={isSyncing}
              lastSyncTime={gasConfig.lastSyncTime}
              hasGasUrl={Boolean(gasConfig.webAppUrl)}
              onOpenNewLoan={() => {
                setPreselectedItemForLoan(null);
                setIsLoanModalOpen(true);
              }}
              onInitiateReturn={(loan) => handleOpenReturnForLoan(loan)}
              onUpdateLoan={updateLoan}
              onDeleteLoan={deleteLoan}
              onDeleteBatchLoans={deleteBatchLoans}
              onSyncSheets={syncWithSheets}
              onOpenSyncSettings={() => setActiveTab('sync')}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentViewer
              documents={documents}
              schoolProfile={schoolProfile}
              inventory={inventory}
              loans={loans}
              onCreateDocument={createDocument}
              onDeleteDocument={deleteDocument}
            />
          )}

          {activeTab === 'profile' && (
            <SchoolProfileEditor
              profile={schoolProfile}
              onSave={updateSchoolProfile}
            />
          )}

          {activeTab === 'sync' && (
            <GoogleSheetsSyncModal
              config={gasConfig}
              isOnline={isOnline}
              isSyncing={isSyncing}
              lastSyncMessage={syncMessage}
              onUpdateConfig={updateGasConfig}
              onSyncPush={syncWithSheets}
              onSyncPull={pullFromSheets}
              onExportJson={exportDatabaseJson}
              onImportJson={importDatabaseJson}
            />
          )}
        </main>

        {/* Footer - Hidden on print */}
        <footer className="no-print bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <span className="font-bold text-[#3B4A6B]">
                LabTrack • Standar SIMBADA & BKAD Kota Malang
              </span>
              <span className="hidden sm:inline"> — {schoolProfile.schoolName}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (confirm('Reset seluruh database inventaris ke data bawaan simulasi lab?')) {
                    resetToDemoData();
                  }
                }}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Demo</span>
              </button>
              <span>•</span>
              <button
                onClick={exportDatabaseJson}
                className="text-[#23B2DA] hover:underline font-semibold cursor-pointer"
              >
                Backup JSON
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* 4. MODALS & OVERLAYS */}
      {/* ============================================================== */}

      {/* Item Create / Edit Modal */}
      {(isNewItemOpen || editingItem) && (
        <ItemFormModal
          initialItem={editingItem}
          existingCount={inventory.length}
          onSave={(itemData) => {
            if (editingItem) {
              updateItem(editingItem.id, itemData);
            } else {
              addItem(itemData);
            }
            setIsNewItemOpen(false);
            setEditingItem(null);
          }}
          onClose={() => {
            setIsNewItemOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Loan Create Modal */}
      {isLoanModalOpen && (
        <LoanFormModal
          inventory={inventory}
          preselectedItem={preselectedItemForLoan}
          officerName={schoolProfile.labHeadName}
          onSubmit={(loanData) => {
            const res = borrowItem(loanData);
            if (res.success) {
              setIsLoanModalOpen(false);
              setPreselectedItemForLoan(null);
            }
            return res;
          }}
          onClose={() => {
            setIsLoanModalOpen(false);
            setPreselectedItemForLoan(null);
          }}
        />
      )}

      {/* Loan Return Modal */}
      {activeReturnLoan && (
        <ReturnModal
          loan={activeReturnLoan}
          onSubmit={(returnData) => {
            const res = returnItem(returnData);
            if (res.success) {
              setActiveReturnLoan(null);
            }
            return res;
          }}
          onClose={() => setActiveReturnLoan(null)}
        />
      )}

      {/* QR Stiker Label Printer Modal */}
      {isQRPrinterOpen && (
        <QRLabelPrinter
          items={inventory}
          schoolProfile={schoolProfile}
          initialSelectedItemIds={printSelectedItemIds}
          onClose={() => {
            setIsQRPrinterOpen(false);
            setPrintSelectedItemIds([]);
          }}
        />
      )}

      {/* QR Scanner Camera & Barcode Modal */}
      {isScannerOpen && (
        <QRScannerModal
          items={inventory}
          loans={loans}
          onClose={() => setIsScannerOpen(false)}
          onInitiateBorrow={(item: InventoryItem) => {
            setIsScannerOpen(false);
            handleOpenBorrowForItem(item);
          }}
          onInitiateReturn={(item: InventoryItem, loan?: LoanTransaction) => {
            setIsScannerOpen(false);
            if (loan) {
              handleOpenReturnForLoan(loan);
            } else {
              const active = loans.find((l) => l.itemId === item.id && l.status !== 'Dikembalikan');
              if (active) handleOpenReturnForLoan(active);
            }
          }}
          onViewItemDetail={(item: InventoryItem) => {
            setIsScannerOpen(false);
            setActiveTab('inventory');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainApp />
    </InventoryProvider>
  );
}
