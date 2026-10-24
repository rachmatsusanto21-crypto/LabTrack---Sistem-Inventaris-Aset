/**
 * LabTrack - Sistem Inventaris & Peminjaman Ruang Lab Komputer
 * Terintegrasi Google Sheets & Google Apps Script Backend
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

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col">
      {/* Top Navigation Bar - Hidden on print */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Lab Branding */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md group-hover:bg-indigo-700 transition">
                  {schoolProfile.logoUrl ? (
                    <img
                      src={schoolProfile.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain p-1 rounded-xl"
                    />
                  ) : (
                    <span className="text-sm font-mono tracking-tighter">LAB</span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                    LabTrack
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">
                      Lab Komputer
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                    {schoolProfile.schoolName}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'inventory'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                Inventaris ({inventory.length})
              </button>

              <button
                onClick={() => setActiveTab('loans')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                  activeTab === 'loans'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Peminjaman
                {loans.filter((l) => l.status === 'Terlambat').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'documents'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Lembar BAST & Cetak
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <School className="w-4 h-4" />
                Profil Sekolah
              </button>

              <button
                onClick={() => setActiveTab('sync')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'sync'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Google Sheets
              </button>
            </nav>

            {/* Quick Actions & Status */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Online / Offline status */}
              <div className="hidden sm:flex items-center">
                {isOnline ? (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200"
                    title="Perangkat online. Siap sinkron dengan Google Workspace"
                  >
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    Online
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200"
                    title="Mode offline aktif. Data tersimpan lokal di browser"
                  >
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    Offline
                  </span>
                )}
              </div>

              {/* QR Scanner Trigger */}
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard & Utilitas
            </button>
            <button
              onClick={() => {
                setActiveTab('inventory');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <Package className="w-4 h-4" /> Inventaris ({inventory.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('loans');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === 'loans' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" /> Peminjaman & Pengembalian
            </button>
            <button
              onClick={() => {
                setActiveTab('documents');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === 'documents' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" /> Lembar BAST, Berita Acara & KIR
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <School className="w-4 h-4" /> Profil Sekolah & Penanggung Jawab
            </button>
            <button
              onClick={() => {
                setActiveTab('sync');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                activeTab === 'sync' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Google Sheets & Apps Script
            </button>
          </div>
        )}
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onOpenQRPrinter={() => {
              setPrintSelectedItemIds(inventory.map((i) => i.id));
              setIsQRPrinterOpen(true);
            }}
            onOpenDocuments={() => setActiveTab('documents')}
            onOpenSync={() => setActiveTab('sync')}
            onDismissAlert={dismissAlert}
            onViewItem={(item) => {
              setActiveTab('inventory');
            }}
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
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="font-bold text-slate-700">
              LabTrack • Sistem Manajemen Inventaris & Peminjaman Lab Komputer
            </div>
            <div>
              {schoolProfile.schoolName} — Terintegrasi Google Sheets & Google Drive
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Reset seluruh database inventaris ke data bawaan simulasi lab?')) {
                  resetToDemoData();
                }
              }}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Contoh</span>
            </button>
            <span>•</span>
            <button
              onClick={exportDatabaseJson}
              className="text-indigo-600 hover:underline font-medium"
            >
              Cadangkan Data
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL: QR SCANNER (MASUK & KELUAR) */}
      {isScannerOpen && (
        <QRScannerModal
          items={inventory}
          loans={loans}
          onClose={() => setIsScannerOpen(false)}
          onInitiateBorrow={(item) => {
            handleOpenBorrowForItem(item);
          }}
          onInitiateReturn={(item, loan) => {
            if (loan) {
              setActiveReturnLoan(loan);
            } else {
              // Find loan
              const active = loans.find(
                (l) => l.itemId === item.id && (l.status === 'Dipinjam' || l.status === 'Terlambat')
              );
              if (active) {
                setActiveReturnLoan(active);
              } else {
                alert(`Tidak ada transaksi peminjaman aktif untuk ${item.name}.`);
              }
            }
          }}
          onViewItemDetail={(item) => {
            setActiveTab('inventory');
          }}
        />
      )}

      {/* MODAL: TAMBAH BARANG BARU */}
      {isNewItemOpen && (
        <ItemFormModal
          existingCount={inventory.length}
          onClose={() => setIsNewItemOpen(false)}
          onSave={(itemData) => {
            addItem(itemData);
            setIsNewItemOpen(false);
          }}
        />
      )}

      {/* MODAL: EDIT BARANG */}
      {editingItem && (
        <ItemFormModal
          initialItem={editingItem}
          existingCount={inventory.length}
          onClose={() => setEditingItem(null)}
          onSave={(itemData) => {
            updateItem(editingItem.id, itemData);
            setEditingItem(null);
          }}
        />
      )}

      {/* MODAL: PINJAM ALAT (SCAN KELUAR) */}
      {isLoanModalOpen && (
        <LoanFormModal
          inventory={inventory}
          preselectedItem={preselectedItemForLoan}
          officerName={schoolProfile.labHeadName}
          onClose={() => {
            setIsLoanModalOpen(false);
            setPreselectedItemForLoan(null);
          }}
          onSubmit={borrowItem}
        />
      )}

      {/* MODAL: KEMBALIKAN ALAT (SCAN MASUK) */}
      {activeReturnLoan && (
        <ReturnModal
          loan={activeReturnLoan}
          onClose={() => setActiveReturnLoan(null)}
          onSubmit={returnItem}
        />
      )}

      {/* MODAL: CETAK STIKER LABEL QR */}
      {isQRPrinterOpen && (
        <QRLabelPrinter
          items={inventory}
          schoolProfile={schoolProfile}
          initialSelectedItemIds={printSelectedItemIds}
          onClose={() => setIsQRPrinterOpen(false)}
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
