import React from 'react';
import {
  InventoryItem,
  LoanTransaction,
  SystemAlert,
  SchoolProfile,
} from '../../types/inventory';
import {
  Package,
  Layers,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  QrCode,
  FileText,
  Printer,
  Bell,
  RefreshCw,
  Phone,
  BarChart3,
  Percent,
  X,
  ExternalLink,
} from 'lucide-react';

interface LabDashboardProps {
  inventory: InventoryItem[];
  loans: LoanTransaction[];
  alerts: SystemAlert[];
  schoolProfile: SchoolProfile;
  onOpenScanner: () => void;
  onOpenNewLoan: () => void;
  onOpenQRPrinter: () => void;
  onOpenDocuments: () => void;
  onOpenSync: () => void;
  onDismissAlert: (id: string) => void;
  onViewItem: (item: InventoryItem) => void;
}

export const LabDashboard: React.FC<LabDashboardProps> = ({
  inventory,
  loans,
  alerts,
  schoolProfile,
  onOpenScanner,
  onOpenNewLoan,
  onOpenQRPrinter,
  onOpenDocuments,
  onOpenSync,
  onDismissAlert,
  onViewItem,
}) => {
  // Calculations for Lab Head's monthly efficiency
  const totalUnits = inventory.reduce((sum, item) => sum + item.totalStock, 0);
  const availableUnits = inventory.reduce((sum, item) => sum + item.availableStock, 0);
  const borrowedUnits = inventory.reduce((sum, item) => sum + item.borrowedStock, 0);
  const damagedItems = inventory.filter((i) => i.condition === 'KB' || i.condition === 'RB');
  
  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const overdueLoans = loans.filter((l) => l.status === 'Terlambat');

  // Utilization Rate (%)
  const utilizationRate = totalUnits > 0 ? Math.round((borrowedUnits / totalUnits) * 100) : 0;
  const goodConditionRate = totalUnits > 0
    ? Math.round((inventory.filter((i) => i.condition === 'B').length / Math.max(1, inventory.length)) * 100)
    : 100;

  // Monthly loans count (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthLoans = loans.filter((l) => {
    const d = new Date(l.borrowDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Top borrowed items calculation
  const itemBorrowCounts: Record<string, { count: number; name: string; code: string }> = {};
  loans.forEach((l) => {
    if (!itemBorrowCounts[l.itemId]) {
      itemBorrowCounts[l.itemId] = { count: 0, name: l.itemName, code: l.itemCode };
    }
    itemBorrowCounts[l.itemId].count += l.quantity;
  });
  const topBorrowed = Object.values(itemBorrowCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Category statistics
  const categoryCounts: Record<string, number> = {};
  inventory.forEach((i) => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + i.totalStock;
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Lab Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                {schoolProfile.schoolName}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Tahun Ajaran 2026/2027
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {schoolProfile.labName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dashboard monitoring inventaris, peminjaman alat, efisiensi praktikum siswa, dan otomasi sinkronisasi Google Sheets.
            </p>
          </div>

          {/* Quick Scanner & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2.5 transition transform active:scale-95"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan QR Masuk/Keluar</span>
            </button>
            <button
              onClick={onOpenNewLoan}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-2xl border border-white/20 backdrop-blur flex items-center gap-2 transition"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Pinjam Alat</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUTOMATED STOCK & LOAN ALERTS BANNER (SISTEM NOTIFIKASI OTOMATIS) */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              Pemberitahuan Otomatis Inventaris ({alerts.length})
            </h3>
            <span className="text-xs text-slate-500">
              Sistem memantau stok kritis dan keterlambatan barang secara real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition shadow-sm ${
                  alert.type === 'danger'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    alert.type === 'danger' ? 'bg-rose-200/80 text-rose-700' : 'bg-amber-200/80 text-amber-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {alert.title}
                    </span>
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="text-slate-400 hover:text-slate-600 transition"
                      title="Sembunyikan"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed text-slate-700 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Aset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Aset Fisik</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalUnits} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Dari {inventory.length} jenis item terdaftar
            </div>
          </div>
        </div>

        {/* Stok Tersedia di Lab */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Stok Siap Pakai</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {availableUnits} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {Math.round((availableUnits / Math.max(1, totalUnits)) * 100)}% ketersediaan di rak lab
            </div>
          </div>
        </div>

        {/* Sedang Dipinjam */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sedang Dipinjam</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {borrowedUnits} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {activeLoans.length} peminjaman aktif ({overdueLoans.length} terlambat)
            </div>
          </div>
        </div>

        {/* Kondisi Laik / Rusak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tingkat Kelaikan</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
              {goodConditionRate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {damagedItems.length} alat butuh pemeliharaan/servis
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY USAGE REPORT & LAB EFFICIENCY SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Activity & Utilitas Lab */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Laporan Efisiensi & Utilitas Alat Lab (Bulan Ini)
              </h3>
              <p className="text-xs text-slate-500">
                Memantau perputaran alat praktikum dan efisiensi belanja sarana prasarana sekolah
              </p>
            </div>
            <button
              onClick={onOpenDocuments}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
            >
              Lihat Format Cetak Laporan
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Efficiency Metric Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Rasio Utilitas Alat</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">{utilizationRate}%</div>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, utilizationRate * 2.5)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Tingkat perputaran aktif</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Peminjaman Bulan Ini</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{currentMonthLoans.length} Kali</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-2 block">
                +18% dibanding bulan lalu
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Kepatuhan Pengembalian</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {loans.length > 0
                  ? Math.round(((loans.length - overdueLoans.length) / loans.length) * 100)
                  : 100}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Tepat waktu sesuai jadwal</span>
            </div>
          </div>

          {/* Top Borrowed Items (Paling Sering Digunakan) */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
              Perangkat Paling Sering Digunakan / Dipinjam Praktikum
            </h4>
            <div className="space-y-2">
              {topBorrowed.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-xs transition border border-slate-200/60"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-700">{item.count} Unit</span>
                    <span className="text-slate-500 text-[10px] block">Total perputaran</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-base">Aksi Cepat Laboran</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onOpenQRPrinter}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 font-medium text-slate-700 flex flex-col items-center justify-center text-center gap-1.5 transition"
              >
                <Printer className="w-5 h-5 text-indigo-600" />
                <span>Cetak Label QR</span>
              </button>
              <button
                onClick={onOpenDocuments}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 font-medium text-slate-700 flex flex-col items-center justify-center text-center gap-1.5 transition"
              >
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Lembar BAST</span>
              </button>
              <button
                onClick={onOpenSync}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 font-medium text-slate-700 flex flex-col items-center justify-center text-center gap-1.5 transition"
              >
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <span>Sync GSheets</span>
              </button>
              <button
                onClick={onOpenScanner}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 font-medium text-slate-700 flex flex-col items-center justify-center text-center gap-1.5 transition"
              >
                <QrCode className="w-5 h-5 text-purple-600" />
                <span>Scan Masuk/Keluar</span>
              </button>
            </div>
          </div>

          {/* Distribution by Category */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-base">Distribusi Kategori Alat</h3>
            <div className="space-y-2 text-xs">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = Math.round((count / Math.max(1, totalUnits)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>{cat}</span>
                      <span className="font-semibold">{count} Unit ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* OVERDUE & ACTIVE LOANS WATCHLIST */}
      {activeLoans.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Daftar Peminjaman Aktif & Jatuh Tempo
              </h3>
              <p className="text-xs text-slate-500">
                Peminjam yang saat ini membawa perangkat keluar dari laboratorium
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
              {activeLoans.length} Alat di Luar Lab
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No Pinjam</th>
                  <th className="py-2.5 px-3">Barang & Kode</th>
                  <th className="py-2.5 px-3">Peminjam</th>
                  <th className="py-2.5 px-3">Keperluan</th>
                  <th className="py-2.5 px-3">Tgl Pinjam</th>
                  <th className="py-2.5 px-3">Batas Kembali</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Kontak WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((loan) => {
                  const isOverdue = loan.status === 'Terlambat';
                  const waNumber = loan.borrowerContact.replace(/[^0-9]/g, '');
                  const waClean = waNumber.startsWith('0') ? `62${waNumber.slice(1)}` : waNumber;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                        {loan.loanNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{loan.itemName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {loan.itemCode} ({loan.quantity} unit)
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{loan.borrowerName}</div>
                        <div className="text-[10px] text-slate-500">
                          {loan.borrowerType} • {loan.borrowerClassOrDept}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-slate-600">
                        {loan.purpose}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{loan.borrowDate}</td>
                      <td className="py-3 px-3 font-semibold">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {loan.expectedReturnDate}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {isOverdue ? 'Terlambat' : 'Dipinjam'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`https://wa.me/${waClean}?text=Halo%20${encodeURIComponent(
                            loan.borrowerName
                          )},%20kami%20dari%20Lab%20Komputer%20mengingatkan%20pengembalian%20alat%20${encodeURIComponent(
                            loan.itemName
                          )}%20(No:%20${loan.loanNumber}).%20Terima%20kasih.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] transition"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Hubungi</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
