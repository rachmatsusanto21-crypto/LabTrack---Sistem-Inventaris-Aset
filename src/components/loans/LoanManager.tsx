import React, { useState } from 'react';
import { LoanTransaction, InventoryItem, SchoolProfile } from '../../types/inventory';
import { LoanPrintModal } from './LoanPrintModal';
import { LoanEditModal } from './LoanEditModal';
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Calendar,
  Layers,
  FileSpreadsheet,
  Printer,
  UploadCloud,
  Check,
  RefreshCw,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  X,
} from 'lucide-react';

interface LoanManagerProps {
  loans: LoanTransaction[];
  inventory: InventoryItem[];
  schoolProfile: SchoolProfile;
  isSyncing?: boolean;
  lastSyncTime?: string;
  hasGasUrl?: boolean;
  onOpenNewLoan: () => void;
  onInitiateReturn: (loan: LoanTransaction) => void;
  onUpdateLoan?: (id: string, updates: Partial<LoanTransaction>) => { success: boolean; message: string };
  onDeleteLoan?: (id: string) => { success: boolean; message: string };
  onDeleteBatchLoans?: (ids: string[]) => { success: boolean; message: string };
  onSyncSheets?: () => Promise<void>;
  onOpenSyncSettings?: () => void;
}

export const LoanManager: React.FC<LoanManagerProps> = ({
  loans,
  inventory,
  schoolProfile,
  isSyncing,
  lastSyncTime,
  hasGasUrl,
  onOpenNewLoan,
  onInitiateReturn,
  onUpdateLoan,
  onDeleteLoan,
  onDeleteBatchLoans,
  onSyncSheets,
  onOpenSyncSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Dipinjam' | 'Terlambat' | 'Dikembalikan'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [selectedSlipLoan, setSelectedSlipLoan] = useState<LoanTransaction | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Selection state
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);
  
  // Edit modal state
  const [editingLoan, setEditingLoan] = useState<LoanTransaction | null>(null);

  // Delete confirmation modal state
  const [deletingLoan, setDeletingLoan] = useState<LoanTransaction | null>(null);
  const [isDeletingBatch, setIsDeletingBatch] = useState<boolean>(false);

  const filteredLoans = loans.filter((l) => {
    const matchSearch =
      l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.borrowerClassOrDept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeCount = loans.filter((l) => l.status === 'Dipinjam').length;
  const overdueCount = loans.filter((l) => l.status === 'Terlambat').length;
  const completedCount = loans.filter((l) => l.status === 'Dikembalikan').length;

  // Toggle selection
  const toggleSelectLoan = (id: string) => {
    setSelectedLoanIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLoanIds.length === filteredLoans.length && filteredLoans.length > 0) {
      setSelectedLoanIds([]);
    } else {
      setSelectedLoanIds(filteredLoans.map((l) => l.id));
    }
  };

  const handleTriggerSync = async () => {
    if (!hasGasUrl) {
      if (onOpenSyncSettings) {
        onOpenSyncSettings();
      } else {
        alert('Silakan masukkan Web App URL Google Apps Script terlebih dahulu di menu Sinkronisasi.');
      }
      return;
    }

    if (onSyncSheets) {
      setSyncFeedback('Sedang menyimpan dan menyinkronkan data peminjaman ke Google Sheets...');
      await onSyncSheets();
      setSyncFeedback('Data peminjaman & pengembalian berhasil disimpan ke Google Sheets!');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handlePrintSlip = (loan: LoanTransaction) => {
    setSelectedSlipLoan(loan);
    setIsPrintModalOpen(true);
  };

  const handlePrintRegister = () => {
    setSelectedSlipLoan(null);
    setIsPrintModalOpen(true);
  };

  const handlePrintSelected = () => {
    if (selectedLoanIds.length === 0) return;
    setIsPrintModalOpen(true);
  };

  // Confirm delete single loan
  const handleConfirmDelete = () => {
    if (!deletingLoan || !onDeleteLoan) return;
    const res = onDeleteLoan(deletingLoan.id);
    setSelectedLoanIds((prev) => prev.filter((id) => id !== deletingLoan.id));
    setDeletingLoan(null);
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  // Confirm delete batch loans
  const handleConfirmBatchDelete = () => {
    if (selectedLoanIds.length === 0 || !onDeleteBatchLoans) return;
    const res = onDeleteBatchLoans(selectedLoanIds);
    setSelectedLoanIds([]);
    setIsDeletingBatch(false);
    setSyncFeedback(res.message);
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const isAllSelected = filteredLoans.length > 0 && selectedLoanIds.length === filteredLoans.length;

  return (
    <div className="space-y-5">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#23B2DA]"></span>
            <span className="text-xs font-bold text-[#3B4A6B] uppercase tracking-wider">
              Sirkulasi & Peminjaman
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#3B4A6B] tracking-tight">
            Pencatatan Peminjaman & Pengembalian Alat
          </h2>
          <p className="text-xs text-slate-500">
            Log sirkulasi perangkat laboratorium komputer oleh siswa, guru, panitia, dan staf lab
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TOMBOL CETAK REGISTER */}
          <button
            onClick={handlePrintRegister}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-[#23B2DA] text-[#3B4A6B] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
            title="Cetak Buku Register Catatan Peminjaman"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Register</span>
          </button>

          {/* TOMBOL SIMPAN KE GOOGLE SHEETS */}
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-[#3B4A6B] hover:bg-[#2b3750] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
            title="Kirim dan simpan data peminjaman ke Google Sheets"
          >
            <FileSpreadsheet className={`w-4 h-4 text-[#F1D43A] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyimpan...' : 'Simpan ke GSheets'}</span>
          </button>

          {/* TOMBOL CATAT PEMINJAMAN BARU */}
          <button
            onClick={onOpenNewLoan}
            className="px-4 py-2 bg-[#23B2DA] hover:bg-[#1fa1c6] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Peminjaman</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            statusFilter === 'all'
              ? 'bg-[#3B4A6B] text-white border-[#3B4A6B]'
              : 'bg-white border-slate-200 hover:border-[#3B4A6B]/40'
          }`}
        >
          <span className={`block text-[11px] font-semibold ${statusFilter === 'all' ? 'text-slate-200' : 'text-slate-500'}`}>
            Total Transaksi
          </span>
          <div className="text-xl sm:text-2xl font-black mt-1">{loans.length}</div>
          <span className={`text-[10px] ${statusFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>
            Semua riwayat peminjaman
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('Dipinjam')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            statusFilter === 'Dipinjam'
              ? 'bg-[#23B2DA] text-white border-[#23B2DA]'
              : 'bg-white border-slate-200 hover:border-[#23B2DA]/50'
          }`}
        >
          <span className={`block text-[11px] font-semibold ${statusFilter === 'Dipinjam' ? 'text-white' : 'text-[#23B2DA]'}`}>
            Aktif Dipinjam
          </span>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${statusFilter === 'Dipinjam' ? 'text-white' : 'text-[#23B2DA]'}`}>
            {activeCount}
          </div>
          <span className={`text-[10px] ${statusFilter === 'Dipinjam' ? 'text-blue-100' : 'text-slate-400'}`}>
            Belum dikembalikan ke rak
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('Terlambat')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            statusFilter === 'Terlambat'
              ? 'bg-[#F23456] text-white border-[#F23456]'
              : 'bg-white border-slate-200 hover:border-[#F23456]/40'
          }`}
        >
          <span className={`block text-[11px] font-semibold ${statusFilter === 'Terlambat' ? 'text-white' : 'text-[#F23456]'}`}>
            Terlambat Tempo
          </span>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${statusFilter === 'Terlambat' ? 'text-white' : 'text-[#F23456]'}`}>
            {overdueCount}
          </div>
          <span className={`text-[10px] ${statusFilter === 'Terlambat' ? 'text-rose-100' : 'text-slate-400'}`}>
            Melebihi batas pengembalian
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('Dikembalikan')}
          className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs ${
            statusFilter === 'Dikembalikan'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white border-slate-200 hover:border-emerald-500'
          }`}
        >
          <span className={`block text-[11px] font-semibold ${statusFilter === 'Dikembalikan' ? 'text-white' : 'text-emerald-700'}`}>
            Selesai Kembali
          </span>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${statusFilter === 'Dikembalikan' ? 'text-white' : 'text-emerald-700'}`}>
            {completedCount}
          </div>
          <span className={`text-[10px] ${statusFilter === 'Dikembalikan' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Alat telah aman di rak
          </span>
        </div>
      </div>

      {/* Search, Filter & Batch Actions Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor pinjam, peminjam, kelas, atau nama alat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Status:</span>
          {(['all', 'Dipinjam', 'Terlambat', 'Dikembalikan'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                statusFilter === st
                  ? 'bg-[#3B4A6B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* BATCH ACTION BAR (Muncul saat ada transaksi terpilih) */}
      {selectedLoanIds.length > 0 && (
        <div className="p-3 bg-gradient-to-r from-[#3B4A6B] to-[#2b3750] text-white rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#23B2DA] text-white font-bold rounded-lg text-xs">
              {selectedLoanIds.length} Terpilih
            </span>
            <span className="text-slate-200 hidden sm:inline">
              dari {filteredLoans.length} transaksi ditampilkan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSelected}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#23B2DA]" />
              <span>Cetak Terpilih</span>
            </button>

            {onDeleteBatchLoans && (
              <button
                onClick={() => setIsDeletingBatch(true)}
                className="px-3 py-1.5 bg-[#F23456] hover:bg-[#d82846] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Terpilih</span>
              </button>
            )}

            <button
              onClick={() => setSelectedLoanIds([])}
              className="px-2.5 py-1.5 text-slate-300 hover:text-white rounded-xl transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-500" />
          <h4 className="font-bold text-slate-700 text-base">Tidak ada transaksi yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1">
            Ubah kata kunci pencarian atau sesuaikan filter status peminjaman.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#3B4A6B]/5 text-[#3B4A6B] font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  {/* Checkbox Select All */}
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-[#3B4A6B] hover:text-[#23B2DA] transition"
                      title={isAllSelected ? 'Batalkan pilih semua' : 'Pilih semua'}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#23B2DA]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">No. Pinjam</th>
                  <th className="py-3 px-3">Nama Alat & Kode</th>
                  <th className="py-3 px-3">Peminjam</th>
                  <th className="py-3 px-3">Keperluan</th>
                  <th className="py-3 px-3">Tgl Pinjam</th>
                  <th className="py-3 px-3">Batas Kembali</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const isOverdue = loan.status === 'Terlambat';
                  const isBorrowed = loan.status === 'Dipinjam';
                  const isDone = loan.status === 'Dikembalikan';
                  const isSelected = selectedLoanIds.includes(loan.id);

                  const waNumber = loan.borrowerContact.replace(/[^0-9]/g, '');
                  const waClean = waNumber.startsWith('0') ? `62${waNumber.slice(1)}` : waNumber;

                  return (
                    <tr
                      key={loan.id}
                      className={`transition ${
                        isSelected
                          ? 'bg-[#23B2DA]/10 hover:bg-[#23B2DA]/15'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Checkbox Row Selection */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectLoan(loan.id)}
                          className="text-slate-400 hover:text-[#23B2DA] transition"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#23B2DA]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#3B4A6B] bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit">
                          {loan.loanNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Petugas: {loan.officerName}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{loan.itemName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {loan.itemCode} • <strong className="text-[#23B2DA]">{loan.quantity} Unit</strong>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{loan.borrowerName}</div>
                        <div className="text-[10px] text-slate-500">
                          {loan.borrowerType} ({loan.borrowerClassOrDept})
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[180px] truncate text-slate-600">
                        {loan.purpose}
                      </td>

                      <td className="py-3 px-3 text-slate-600">{loan.borrowDate}</td>

                      <td className="py-3 px-3 font-semibold">
                        <span className={isOverdue ? 'text-[#F23456] font-bold' : 'text-slate-800'}>
                          {loan.expectedReturnDate}
                        </span>
                        {isDone && loan.actualReturnDate && (
                          <span className="block text-[10px] text-emerald-600 font-normal">
                            Kembali: {loan.actualReturnDate} ({loan.returnCondition})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-[#F23456]/15 text-[#F23456] font-black'
                              : 'bg-[#23B2DA]/15 text-[#23B2DA] font-bold'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* TOMBOL EDIT */}
                          <button
                            onClick={() => setEditingLoan(loan)}
                            className="p-1.5 text-slate-500 hover:text-[#23B2DA] hover:bg-slate-100 rounded-lg transition"
                            title="Edit Data Peminjaman"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Cetak Bukti Slip Satuan */}
                          <button
                            onClick={() => handlePrintSlip(loan)}
                            className="p-1.5 text-slate-500 hover:text-[#3B4A6B] hover:bg-slate-100 rounded-lg transition"
                            title="Cetak Surat / Slip Bukti Pinjam Pakai"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {(isBorrowed || isOverdue) && (
                            <>
                              <button
                                onClick={() => onInitiateReturn(loan)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1 shadow-xs transition"
                                title="Proses Pengembalian (Scan Masuk)"
                              >
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                                <span>Kembalikan</span>
                              </button>

                              {loan.borrowerContact && (
                                <a
                                  href={`https://wa.me/${waClean}?text=Halo%20${encodeURIComponent(
                                    loan.borrowerName
                                  )},%20kami%20dari%20Lab%20Komputer%20mengingatkan%20pengembalian%20alat%20${encodeURIComponent(
                                    loan.itemName
                                  )}%20(No:%20${loan.loanNumber}).%20Terima%20kasih.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                  title="Kirim Pesan WhatsApp Pengingat"
                                >
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                            </>
                          )}

                          {/* TOMBOL HAPUS */}
                          <button
                            onClick={() => setDeletingLoan(loan)}
                            className="p-1.5 text-slate-400 hover:text-[#F23456] hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Data Peminjaman Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Peminjaman */}
      {editingLoan && (
        <LoanEditModal
          loan={editingLoan}
          inventory={inventory}
          onSave={(id, updates) => {
            if (onUpdateLoan) {
              return onUpdateLoan(id, updates);
            }
            return { success: false, message: 'Fungsi edit belum tersedia.' };
          }}
          onClose={() => setEditingLoan(null)}
        />
      )}

      {/* Modal Konfirmasi Hapus Satuan */}
      {deletingLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#F23456]/15 text-[#F23456] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Hapus Data Peminjaman?
              </h3>
              <p className="text-slate-500">
                Anda akan menghapus data peminjaman <strong>{deletingLoan.loanNumber}</strong> atas nama <strong>{deletingLoan.borrowerName}</strong> ({deletingLoan.itemName}).
              </p>
              {deletingLoan.status !== 'Dikembalikan' && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl mt-2 text-left">
                  <strong>Catatan Otomatis:</strong> Karena barang belum dikembalikan, stok sebesar <strong>{deletingLoan.quantity} unit</strong> akan otomatis dikembalikan ke inventaris siap pakai.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLoan(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-[#F23456] hover:bg-[#d82846] text-white font-bold rounded-xl shadow-md transition"
              >
                Ya, Hapus Peminjaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Batch */}
      {isDeletingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#F23456]/15 text-[#F23456] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Hapus {selectedLoanIds.length} Transaksi Terpilih?
              </h3>
              <p className="text-slate-500">
                Tindakan ini akan menghapus seluruh data peminjaman yang dipilih secara permanen. Stok untuk transaksi aktif akan dikembalikan secara otomatis ke rak inventaris.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingBatch(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl font-semibold text-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-5 py-2 bg-[#F23456] hover:bg-[#d82846] text-white font-bold rounded-xl shadow-md transition"
              >
                Ya, Hapus Semua Terpilih
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cetak Peminjaman & Pengembalian */}
      {isPrintModalOpen && (
        <LoanPrintModal
          loans={
            selectedLoanIds.length > 0 && !selectedSlipLoan
              ? loans.filter((l) => selectedLoanIds.includes(l.id))
              : loans
          }
          schoolProfile={schoolProfile}
          selectedLoan={selectedSlipLoan}
          onClose={() => {
            setIsPrintModalOpen(false);
            setSelectedSlipLoan(null);
          }}
        />
      )}
    </div>
  );
};
