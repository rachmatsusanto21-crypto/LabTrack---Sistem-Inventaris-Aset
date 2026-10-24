import React, { useState } from 'react';
import { InventoryItem, LoanTransaction } from '../../types/inventory';
import { X, ArrowUpRight, Calendar, User, Phone, BookOpen, Layers } from 'lucide-react';

interface LoanFormModalProps {
  inventory: InventoryItem[];
  preselectedItem?: InventoryItem | null;
  officerName: string;
  onClose: () => void;
  onSubmit: (data: {
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
}

export const LoanFormModal: React.FC<LoanFormModalProps> = ({
  inventory,
  preselectedItem,
  officerName,
  onClose,
  onSubmit,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    preselectedItem?.id || inventory[0]?.id || ''
  );
  const [borrowerName, setBorrowerName] = useState<string>('');
  const [borrowerType, setBorrowerType] = useState<LoanTransaction['borrowerType']>('Siswa');
  const [borrowerContact, setBorrowerContact] = useState<string>('');
  const [borrowerClassOrDept, setBorrowerClassOrDept] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [borrowDate, setBorrowDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3); // Default return 3 days
    return d.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState<string>('Praktikum Jaringan & Pemrograman');
  const [loanNotes, setLoanNotes] = useState<string>('');
  const [officer, setOfficer] = useState<string>(officerName);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentItem = inventory.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) {
      setErrorMsg('Nama peminjam wajib diisi!');
      return;
    }
    if (!currentItem) {
      setErrorMsg('Pilih barang yang akan dipinjam!');
      return;
    }

    const result = onSubmit({
      itemId: selectedItemId,
      borrowerName: borrowerName.trim(),
      borrowerType,
      borrowerContact: borrowerContact.trim() || '-',
      borrowerClassOrDept: borrowerClassOrDept.trim() || '-',
      quantity: Number(quantity),
      borrowDate,
      expectedReturnDate,
      purpose: purpose.trim(),
      loanNotes: loanNotes.trim() || undefined,
      officerName: officer.trim(),
    });

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-auto">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Catat Peminjaman Alat (Scan Keluar)
              </h3>
              <p className="text-xs text-slate-500">
                Peminjaman perangkat komputer untuk keperluan praktikum atau kegiatan sekolah
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          {/* Item Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pilih Barang yang Dipinjam</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id} disabled={item.availableStock <= 0}>
                  {item.code} - {item.name} (Tersedia: {item.availableStock} {item.unit})
                </option>
              ))}
            </select>
            {currentItem && (
              <div className="mt-1 text-xs text-slate-500 flex justify-between">
                <span>Lokasi: {currentItem.location}</span>
                <span className="font-semibold text-emerald-600">
                  Stok Siap: {currentItem.availableStock} {currentItem.unit}
                </span>
              </div>
            )}
          </div>

          {/* Borrower Information */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              Identitas Peminjam
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-xs mb-1">Nama Peminjam</label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="Contoh: Rifki Pratama"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs mb-1">Kategori Peminjam</label>
                <select
                  value={borrowerType}
                  onChange={(e) => setBorrowerType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Siswa">Siswa</option>
                  <option value="Guru">Guru / Tenaga Pendidik</option>
                  <option value="Staf Lab">Staf / Laboran</option>
                  <option value="Pihak Luar">Pihak Luar / Tamu</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs mb-1">Kelas / Bagian</label>
                <input
                  type="text"
                  value={borrowerClassOrDept}
                  onChange={(e) => setBorrowerClassOrDept(e.target.value)}
                  placeholder="XII RPL 1 / Guru Matematika"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={borrowerContact}
                  onChange={(e) => setBorrowerContact(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quantity & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Unit</label>
              <input
                type="number"
                min={1}
                max={currentItem?.availableStock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Pinjam</label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Kembali</label>
              <input
                type="date"
                value={expectedReturnDate}
                min={borrowDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Keperluan Peminjaman</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Praktikum Mandiri / Uji Kompetensi / Rapat OSIS"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan Peminjaman</label>
              <input
                type="text"
                value={loanNotes}
                onChange={(e) => setLoanNotes(e.target.value)}
                placeholder="Kelengkapan charger, tas, kondisi awal"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Petugas / Laboran</label>
              <input
                type="text"
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Simpan & Keluarkan Barang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
