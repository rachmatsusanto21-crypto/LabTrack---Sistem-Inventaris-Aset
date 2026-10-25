import React, { useState } from 'react';
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
  Plus,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LabDashboardProps {
  inventory: InventoryItem[];
  loans: LoanTransaction[];
  alerts: SystemAlert[];
  schoolProfile: SchoolProfile;
  onOpenScanner: () => void;
  onOpenNewLoan: () => void;
  onOpenNewItem?: () => void;
  onOpenQRPrinter: () => void;
  onOpenDocuments: () => void;
  onOpenSync: () => void;
  onDismissAlert: (id: string) => void;
  onViewItem: (item: InventoryItem) => void;
  onNavigateTab?: (tab: 'dashboard' | 'inventory' | 'loans' | 'documents' | 'profile' | 'sync') => void;
}

export const LabDashboard: React.FC<LabDashboardProps> = ({
  inventory,
  loans,
  alerts,
  schoolProfile,
  onOpenScanner,
  onOpenNewLoan,
  onOpenNewItem,
  onOpenQRPrinter,
  onOpenDocuments,
  onOpenSync,
  onDismissAlert,
  onViewItem,
  onNavigateTab,
}) => {
  const [isAlertsExpanded, setIsAlertsExpanded] = useState<boolean>(false);

  // Key stats
  const totalUnits = inventory.reduce((sum, item) => sum + item.totalStock, 0);
  const availableUnits = inventory.reduce((sum, item) => sum + item.availableStock, 0);
  const borrowedUnits = inventory.reduce((sum, item) => sum + item.borrowedStock, 0);
  
  const countBaik = inventory.filter((i) => i.condition === 'B').length;
  const countKurangBaik = inventory.filter((i) => i.condition === 'KB').length;
  const countRusakBerat = inventory.filter((i) => i.condition === 'RB').length;
  const totalItemsCount = Math.max(1, inventory.length);

  const goodConditionRate = Math.round((countBaik / totalItemsCount) * 100);
  const fairConditionRate = Math.round((countKurangBaik / totalItemsCount) * 100);
  const badConditionRate = Math.round((countRusakBerat / totalItemsCount) * 100);

  const activeLoans = loans.filter((l) => l.status === 'Dipinjam' || l.status === 'Terlambat');
  const overdueLoans = loans.filter((l) => l.status === 'Terlambat');
  const completedLoans = loans.filter((l) => l.status === 'Dikembalikan');

  // Utilization Rate (%)
  const utilizationRate = totalUnits > 0 ? Math.round((borrowedUnits / totalUnits) * 100) : 0;

  // Monthly Trend Data (Simulated / Calculated from loans)
  const monthlyData = [
    { month: 'Mei', loansCount: 8, util: 24 },
    { month: 'Jun', loansCount: 14, util: 38 },
    { month: 'Jul', loansCount: 19, util: 52 },
    { month: 'Agu', loansCount: 26, util: 68 },
    { month: 'Sep', loansCount: 32, util: 74 },
    { month: 'Okt', loansCount: Math.max(loans.length, 35), util: Math.max(utilizationRate, 82) },
  ];

  const maxMonthLoan = Math.max(...monthlyData.map((m) => m.loansCount), 1);

  // Top borrowed items
  const itemBorrowCounts: Record<string, { count: number; name: string; code: string }> = {};
  loans.forEach((l) => {
    if (!itemBorrowCounts[l.itemId]) {
      itemBorrowCounts[l.itemId] = { count: 0, name: l.itemName, code: l.itemCode };
    }
    itemBorrowCounts[l.itemId].count += l.quantity;
  });
  const topBorrowed = Object.values(itemBorrowCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Donut chart calculations (circumference = 2 * PI * r = 2 * 3.14159 * 42 ~= 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeBaik = (goodConditionRate / 100) * circumference;
  const strokeFair = (fairConditionRate / 100) * circumference;
  const strokeBad = (badConditionRate / 100) * circumference;

  return (
    <div className="space-y-6">
      
      {/* 1. TOP PROMINENT ACTION BAR (Aksi Utama yang Menonjol Sesuai Request User) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#23B2DA] animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3B4A6B]">
              {schoolProfile.schoolName} • {schoolProfile.labName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#3B4A6B] tracking-tight">
            Dashboard Pengelolaan Laboratorium Komputer
          </h1>
          <p className="text-xs text-slate-500">
            Akses langsung sirkulasi peminjaman, entri inventaris baru, dan pemantauan kelaikan perangkat
          </p>
        </div>

        {/* Action Buttons: Buat Peminjaman Baru (+) dan Input Inventaris Baru */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewLoan}
            className="px-5 py-3 bg-[#23B2DA] hover:bg-[#1ca2c7] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buat Peminjaman Baru</span>
          </button>

          {onOpenNewItem && (
            <button
              onClick={onOpenNewItem}
              className="px-5 py-3 bg-[#3B4A6B] hover:bg-[#2b3750] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#F1D43A]" />
              <span>Input Inventaris Baru</span>
            </button>
          )}

          <button
            onClick={onOpenScanner}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-[#3B4A6B] font-bold text-xs sm:text-sm rounded-2xl border border-slate-200 flex items-center gap-2 transition cursor-pointer"
            title="Scan QR Masuk/Keluar Cepat"
          >
            <QrCode className="w-4 h-4 text-[#23B2DA]" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>
        </div>
      </div>

      {/* 2. PEMBERITAHUAN YANG RAPI (Collapsible Alert Bar Sesuai Request User) */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#F1D43A]/60 shadow-xs overflow-hidden">
          <div
            onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
            className="px-4 py-3 bg-[#F1D43A]/15 hover:bg-[#F1D43A]/25 cursor-pointer flex items-center justify-between gap-3 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F1D43A] text-[#3B4A6B] flex items-center justify-center font-bold shrink-0 shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-xs font-bold text-[#3B4A6B]">
                  Pemberitahuan Sistem ({alerts.length} Perhatian):
                </strong>
                <span className="text-xs text-slate-700 truncate max-w-md sm:max-w-xl">
                  {alerts[0]?.title} — {alerts[0]?.message}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-[#3B4A6B]">
                {isAlertsExpanded ? 'Tutup' : 'Lihat Semua'}
              </span>
              {isAlertsExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#3B4A6B]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#3B4A6B]" />
              )}
            </div>
          </div>

          {/* Expanded Drawer Alerts */}
          {isAlertsExpanded && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white border-t border-[#F1D43A]/30">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                    alert.type === 'danger'
                      ? 'bg-[#F23456]/10 border-[#F23456]/30 text-slate-800'
                      : 'bg-[#F1D43A]/15 border-[#F1D43A]/40 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        alert.type === 'danger' ? 'bg-[#F23456]' : 'bg-[#F1D43A]'
                      }`}
                    ></span>
                    <div>
                      <strong className="font-bold block text-[#3B4A6B] uppercase tracking-wide text-[10px]">
                        {alert.title}
                      </strong>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissAlert(alert.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                    title="Abaikan"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. KPI METRIC CARDS (Dengan Palet Warna Terpasang) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Aset */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Aset</span>
            <span className="p-2.5 bg-[#3B4A6B]/10 text-[#3B4A6B] rounded-2xl">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#3B4A6B]">
              {totalUnits} <span className="text-xs font-semibold text-slate-400">Unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{inventory.length} jenis item terdaftar</span>
            </div>
          </div>
        </div>

        {/* Stok Siap Pakai */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Siap Pakai</span>
            <span className="p-2.5 bg-[#23B2DA]/15 text-[#23B2DA] rounded-2xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#23B2DA]">
              {availableUnits} <span className="text-xs font-semibold text-slate-400">Unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {Math.round((availableUnits / Math.max(1, totalUnits)) * 100)}% ketersediaan di rak lab
            </div>
          </div>
        </div>

        {/* Sedang Dipinjam */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dipinjam</span>
            <span className="p-2.5 bg-[#F1D43A]/30 text-[#3B4A6B] rounded-2xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#3B4A6B]">
              {borrowedUnits} <span className="text-xs font-semibold text-slate-400">Unit</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {activeLoans.length} aktif ({overdueLoans.length} terlambat)
            </div>
          </div>
        </div>

        {/* Kelaikan / Butuh Servis */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kelaikan Fisik</span>
            <span className="p-2.5 bg-[#F23456]/15 text-[#F23456] rounded-2xl">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-[#F23456]">
              {goodConditionRate}% <span className="text-xs font-semibold text-slate-400">Laik</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {countKurangBaik + countRusakBerat} alat butuh perhatian
            </div>
          </div>
        </div>
      </div>

      {/* 4. VISUALISASI DATA YANG INTUITIF (Grafik Donut Kelaikan + Grafik Batang Efisiensi) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAFIK 1: DONUT CHART TINGKAT KELAIKAN FISIK */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#3B4A6B] text-sm">
                Visualisasi Tingkat Kelaikan Aset
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg">
                SIMBADA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rasio kondisi fisik perangkat komputer di laboratorium
            </p>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex items-center justify-center relative py-2">
            <svg width="150" height="150" viewBox="0 0 100 100" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="11"
              />
              {/* Baik (Teal/Cyan #23B2DA) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#23B2DA"
                strokeWidth="11"
                strokeDasharray={`${strokeBaik} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Kurang Baik (Gold #F1D43A) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F1D43A"
                strokeWidth="11"
                strokeDasharray={`${strokeFair} ${circumference}`}
                strokeDashoffset={-strokeBaik}
                strokeLinecap="round"
              />
              {/* Rusak Berat (Coral #F23456) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#F23456"
                strokeWidth="11"
                strokeDasharray={`${strokeBad} ${circumference}`}
                strokeDashoffset={-(strokeBaik + strokeFair)}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-[#3B4A6B] leading-none">
                {goodConditionRate}%
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                Kondisi Baik
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
            <div className="text-center p-2 rounded-xl bg-[#23B2DA]/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#23B2DA] inline-block mb-1"></span>
              <div className="font-bold text-[#3B4A6B] text-[13px]">{countBaik}</div>
              <div className="text-[10px] text-slate-500">Baik (B)</div>
            </div>

            <div className="text-center p-2 rounded-xl bg-[#F1D43A]/20">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F1D43A] inline-block mb-1"></span>
              <div className="font-bold text-[#3B4A6B] text-[13px]">{countKurangBaik}</div>
              <div className="text-[10px] text-slate-500">Kurang (KB)</div>
            </div>

            <div className="text-center p-2 rounded-xl bg-[#F23456]/10">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F23456] inline-block mb-1"></span>
              <div className="font-bold text-[#F23456] text-[13px]">{countRusakBerat}</div>
              <div className="text-[10px] text-slate-500">Rusak (RB)</div>
            </div>
          </div>
        </div>

        {/* GRAFIK 2: GRAFIK BATANG & TREN EFISIENSI PENGGUNAAN BULANAN */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#23B2DA]" />
                <h3 className="font-bold text-[#3B4A6B] text-sm">
                  Laporan Tren Efisiensi & Peminjaman Bulanan
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Perkembangan sirkulasi peminjaman alat praktikum 6 bulan terakhir
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Rasio Utilitas:</span>
              <span className="px-2.5 py-1 bg-[#23B2DA] text-white font-bold rounded-lg text-xs">
                {utilizationRate}% Aktif
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-6 gap-3 items-end h-36 border-b border-slate-100 pb-2 px-2">
              {monthlyData.map((item, idx) => {
                const heightPct = Math.round((item.loansCount / maxMonthLoan) * 100);
                const isCurrent = idx === monthlyData.length - 1;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition">
                      {item.loansCount}
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isCurrent
                            ? 'bg-gradient-to-t from-[#23B2DA] to-[#3B4A6B]'
                            : 'bg-[#23B2DA]/40 group-hover:bg-[#23B2DA]/70'
                        }`}
                        style={{ height: `${Math.max(15, heightPct)}%` }}
                      ></div>
                    </div>
                    <span className={`text-[11px] font-semibold ${isCurrent ? 'text-[#3B4A6B] font-bold' : 'text-slate-400'}`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-gradient-to-t from-[#23B2DA] to-[#3B4A6B]"></span>
                  Bulan Berjalan (Okt)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#23B2DA]/40"></span>
                  Riwayat Sebelumnya
                </span>
              </div>

              <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Efisiensi Lab Meningkat +24%</span>
              </div>
            </div>
          </div>

          {/* Top Borrowed Highlights */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-[#3B4A6B] uppercase tracking-wider block mb-2">
              Perangkat Paling Sering Digunakan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {topBorrowed.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <strong className="text-slate-800 text-xs block truncate">{item.name}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#23B2DA]/15 text-[#23B2DA] font-bold rounded-lg text-xs shrink-0">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. TABEL PEMINJAMAN TERKINI YANG BERSIH DENGAN KODE WARNA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-[#3B4A6B] text-base">
              Aktivitas Peminjaman & Pengembalian Terkini
            </h3>
            <p className="text-xs text-slate-400">
              Transaksi sirkulasi alat komputer paling mutakhir di laboratorium
            </p>
          </div>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('loans')}
              className="text-xs font-bold text-[#23B2DA] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Kelola Semua Peminjaman</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {loans.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada data peminjaman yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#3B4A6B]/5 text-[#3B4A6B] font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">No. Pinjam</th>
                  <th className="py-3 px-3">Nama Alat & Spesifikasi</th>
                  <th className="py-3 px-3">Peminjam</th>
                  <th className="py-3 px-3">Tgl Pinjam</th>
                  <th className="py-3 px-3">Batas Kembali</th>
                  <th className="py-3 px-3 text-center">Status Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.slice(0, 5).map((loan) => {
                  const isOverdue = loan.status === 'Terlambat';
                  const isDone = loan.status === 'Dikembalikan';

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-[#3B4A6B]">
                        {loan.loanNumber}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block font-bold">{loan.itemName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {loan.itemCode} • {loan.quantity} Unit
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{loan.borrowerName}</span>
                        <span className="text-[10px] text-slate-400">
                          {loan.borrowerType} ({loan.borrowerClassOrDept})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">{loan.borrowDate}</td>
                      <td className="py-3 px-3 font-mono">
                        <span className={isOverdue ? 'text-[#F23456] font-bold' : 'text-slate-700'}>
                          {loan.expectedReturnDate}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block shadow-xs ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-[#F23456] text-white'
                              : 'bg-[#23B2DA] text-white'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
