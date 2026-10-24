import React, { useState } from 'react';
import { LoanTransaction, InventoryItem, SchoolProfile } from '../../types/inventory';
import { LoanPrintModal } from './LoanPrintModal';
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
  onSyncSheets,
  onOpenSyncSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Dipinjam' | 'Terlambat' | 'Dikembalikan'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [selectedSlipLoan, setSelectedSlipLoan] = useState<LoanTransaction | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Pencatatan Peminjaman & Pengembalian Alat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Log sirkulasi peminjaman perangkat komputer oleh siswa, guru, panitia, dan staf lab
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TOMBOL CETAK REGISTER PEMINJAMAN & SLIP */}
          <button
            onClick={handlePrintRegister}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
            title="Cetak Buku Register Catatan Peminjaman atau Lembar Bukti Satuan"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Catatan Peminjaman</span>
          </button>

          {/* TOMBOL SIMPAN KE GOOGLE SHEETS */}
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition"
            title="Kirim dan simpan data peminjaman langsung ke lembar Peminjaman_Alat di Google Sheets"
          >
            <FileSpreadsheet className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyimpan ke Sheets...' : 'Simpan ke Google Sheets'}</span>
          </button>

          <button
            onClick={onOpenNewLoan}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Peminjaman Baru</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast Alert */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          {lastSyncTime && (
            <span className="font-mono text-[11px] text-emerald-700">Waktu: {lastSyncTime}</span>
          )}
        </div>
      )}

      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs block opacity-80">Semua Riwayat</span>
          <strong className="text-xl font-bold">{loans.length}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('Dipinjam')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            statusFilter === 'Dipinjam'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs block opacity-80">Sedang Dipinjam</span>
          <strong className="text-xl font-bold">{activeCount}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('Terlambat')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            statusFilter === 'Terlambat'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs block opacity-80">Terlambat (Overdue)</span>
          <strong className="text-xl font-bold">{overdueCount}</strong>
        </button>

        <button
          onClick={() => setStatusFilter('Dikembalikan')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            statusFilter === 'Dikembalikan'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-xs block opacity-80">Selesai Dikembalikan</span>
          <strong className="text-xl font-bold">{completedCount}</strong>
        </button>
      </div>

      {/* Search Bar & Fast Print Action */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama peminjam, kelas, nomor peminjaman (PJM/...), atau nama alat..."
            className="flex-1 text-xs sm:text-sm border-none focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2"
            >
              Hapus
            </button>
          )}
        </div>

        <button
          onClick={handlePrintRegister}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Format {statusFilter === 'all' ? 'Semua' : statusFilter}</span>
        </button>
      </div>

      {/* Loans Table */}
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
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
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

                  const waNumber = loan.borrowerContact.replace(/[^0-9]/g, '');
                  const waClean = waNumber.startsWith('0') ? `62${waNumber.slice(1)}` : waNumber;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit">
                          {loan.loanNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Petugas: {loan.officerName}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{loan.itemName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {loan.itemCode} • <strong>{loan.quantity} Unit</strong>
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
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}>
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
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Cetak Bukti Slip Satuan */}
                          <button
                            onClick={() => handlePrintSlip(loan)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Cetak Surat / Slip Bukti Pinjam Pakai"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {(isBorrowed || isOverdue) && (
                            <>
                              <button
                                onClick={() => onInitiateReturn(loan)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1 shadow-sm transition"
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
                          {isDone && (
                            <span className="text-[11px] text-slate-400 italic">
                              Selesai
                            </span>
                          )}
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

      {/* Modal Cetak Peminjaman & Pengembalian */}
      {isPrintModalOpen && (
        <LoanPrintModal
          loans={loans}
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
