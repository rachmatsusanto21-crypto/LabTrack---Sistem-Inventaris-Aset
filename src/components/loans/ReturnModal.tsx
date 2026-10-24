import React, { useState } from 'react';
import { LoanTransaction, InventoryItem } from '../../types/inventory';
import { X, ArrowDownLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReturnModalProps {
  loan: LoanTransaction;
  onClose: () => void;
  onSubmit: (data: {
    loanId: string;
    actualReturnDate: string;
    returnCondition: InventoryItem['condition'];
    returnNotes?: string;
  }) => { success: boolean; message: string };
}

export const ReturnModal: React.FC<ReturnModalProps> = ({ loan, onClose, onSubmit }) => {
  const [actualReturnDate, setActualReturnDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [returnCondition, setReturnCondition] = useState<InventoryItem['condition']>('B');
  const [returnNotes, setReturnNotes] = useState<string>('Barang dikembalikan dalam kondisi lengkap & berfungsi normal');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSubmit({
      loanId: loan.id,
      actualReturnDate,
      returnCondition,
      returnNotes: returnNotes.trim() || undefined,
    });

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Pengembalian Alat (Scan Masuk)
              </h3>
              <p className="text-xs text-slate-500">
                Pemeriksaan fisik barang dan pemulihan stok rak inventaris lab
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mx-4 sm:mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Summary Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                {loan.loanNumber}
              </span>
              <span className="text-slate-500 text-xs">
                Tgl Pinjam: <strong>{loan.borrowDate}</strong>
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">{loan.itemName}</div>
            <div className="text-xs text-slate-600 flex justify-between">
              <span>Peminjam: <strong>{loan.borrowerName}</strong> ({loan.borrowerClassOrDept})</span>
              <span className="font-bold text-indigo-700">{loan.quantity} Unit</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengembalian Aktual</label>
            <input
              type="date"
              value={actualReturnDate}
              onChange={(e) => setActualReturnDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kondisi Barang Saat Dikembalikan (SIMBADA)
            </label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
            >
              <option value="B">B - Baik (Utuh, Bersih, dan Berfungsi Normal)</option>
              <option value="KB">KB - Kurang Baik (Ada goresan/port longgar/perlu servis)</option>
              <option value="RB">RB - Rusak Berat (Mati total / pecah / usul penghapusan)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Pengecekan Laboran</label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={3}
              placeholder="Kelengkapan adaptor kabel, kondisi baut, kebersihan alat"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Masuk & Kembalikan Stok</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
