import React, { useState } from 'react';
import { LoanTransaction, InventoryItem } from '../../types/inventory';
import { X, Save, Edit3, Calendar, User, Phone, BookOpen, Layers, AlertCircle } from 'lucide-react';

interface LoanEditModalProps {
  loan: LoanTransaction;
  inventory: InventoryItem[];
  onSave: (id: string, updates: Partial<LoanTransaction>) => { success: boolean; message: string };
  onClose: () => void;
}

export const LoanEditModal: React.FC<LoanEditModalProps> = ({
  loan,
  inventory,
  onSave,
  onClose,
}) => {
  const [borrowerName, setBorrowerName] = useState(loan.borrowerName);
  const [borrowerType, setBorrowerType] = useState(loan.borrowerType);
  const [borrowerClassOrDept, setBorrowerClassOrDept] = useState(loan.borrowerClassOrDept);
  const [borrowerContact, setBorrowerContact] = useState(loan.borrowerContact);
  const [quantity, setQuantity] = useState(loan.quantity);
  const [borrowDate, setBorrowDate] = useState(loan.borrowDate);
  const [expectedReturnDate, setExpectedReturnDate] = useState(loan.expectedReturnDate);
  const [purpose, setPurpose] = useState(loan.purpose);
  const [loanNotes, setLoanNotes] = useState(loan.loanNotes || '');
  const [officerName, setOfficerName] = useState(loan.officerName);
  const [status, setStatus] = useState(loan.status);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetItem = inventory.find((i) => i.id === loan.itemId);
  const maxAvailable = targetItem ? targetItem.availableStock + loan.quantity : loan.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (quantity <= 0) {
      setErrorMessage('Jumlah unit harus lebih dari 0.');
      return;
    }

    if (loan.status !== 'Dikembalikan' && targetItem && quantity > maxAvailable) {
      setErrorMessage(`Kuantitas melebihi batas maksimal stok tersedia (${maxAvailable} unit).`);
      return;
    }

    const res = onSave(loan.id, {
      borrowerName,
      borrowerType,
      borrowerClassOrDept,
      borrowerContact,
      quantity,
      borrowDate,
      expectedReturnDate,
      purpose,
      loanNotes,
      officerName,
      status,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#3B4A6B] to-[#2b3750] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#23B2DA]/20 border border-[#23B2DA]/40 flex items-center justify-center text-[#23B2DA]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Edit Data Peminjaman</h3>
              <p className="text-xs text-slate-300 font-mono">
                No: {loan.loanNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-[#F23456]/10 border border-[#F23456]/30 text-[#F23456] rounded-xl flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info Alat yang Dipinjam */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Perangkat Terkait:</span>
              <strong className="text-slate-900 text-sm block font-bold">{loan.itemName}</strong>
              <span className="text-slate-500 font-mono text-[11px]">{loan.itemCode}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Ketersediaan Lab:</span>
              <span className="text-emerald-700 font-bold text-xs">{targetItem?.availableStock ?? 0} {targetItem?.unit || 'Unit'} Ready</span>
            </div>
          </div>

          {/* Identitas Peminjam */}
          <div className="space-y-3">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#23B2DA]" />
              Identitas Peminjam
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Peminjam</label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kategori Peminjam</label>
                <select
                  value={borrowerType}
                  onChange={(e) => setBorrowerType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
                >
                  <option value="Siswa">Siswa</option>
                  <option value="Guru">Guru</option>
                  <option value="Staff">Staff / Tenaga Kependidikan</option>
                  <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kelas / Unit / Mapel</label>
                <input
                  type="text"
                  value={borrowerClassOrDept}
                  onChange={(e) => setBorrowerClassOrDept(e.target.value)}
                  placeholder="Misal: Kelas 5B / TIK"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kontak / WhatsApp</label>
                <input
                  type="text"
                  value={borrowerContact}
                  onChange={(e) => setBorrowerContact(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rincian Peminjaman & Jumlah */}
          <div className="space-y-3 pt-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#23B2DA]" />
              Detail Peminjaman & Jadwal
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Jumlah Unit</label>
                <input
                  type="number"
                  min={1}
                  max={maxAvailable}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Maks: {maxAvailable}</span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tgl Pinjam</label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Batas Kembali</label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Keperluan Peminjaman</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Misal: Praktikum ANBK / Pembelajaran Informatika"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Petugas / Laboran</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status Transaksi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none font-semibold"
                >
                  <option value="Dipinjam">Dipinjam (Aktif)</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Dikembalikan">Dikembalikan (Selesai)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Catatan Tambahan (Opsional)</label>
              <textarea
                value={loanNotes}
                onChange={(e) => setLoanNotes(e.target.value)}
                rows={2}
                placeholder="Catatan kondisi saat dipinjam, nomor seri, dll."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-[#23B2DA] focus:ring-1 focus:ring-[#23B2DA] outline-none resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#23B2DA] hover:bg-[#1fa1c6] text-white font-bold rounded-xl shadow-md hover:shadow-lg flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
