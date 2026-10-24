import React, { useState } from 'react';
import { OfficialDocument, SchoolProfile, InventoryItem, LoanTransaction } from '../../types/inventory';
import {
  Printer,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  Download,
  Share2,
  AlertTriangle,
  Send,
  Image as ImageIcon,
  FileSpreadsheet,
} from 'lucide-react';

import { exportKIRToExcel } from '../../utils/excelExporter';

interface DocumentViewerProps {
  documents: OfficialDocument[];
  schoolProfile: SchoolProfile;
  inventory: InventoryItem[];
  loans: LoanTransaction[];
  onCreateDocument: (doc: Omit<OfficialDocument, 'id' | 'createdAt'>) => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  schoolProfile,
  inventory,
  loans,
  onCreateDocument,
  onDeleteDocument,
}) => {
  const [activeTab, setActiveTab] = useState<
    'kir' | 'bap' | 'surat_hapus' | 'bast' | 'laporan_bulanan'
  >('kir');

  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [isCreatingModal, setIsCreatingModal] = useState<boolean>(false);
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);

  // Auto Calculations (Rumus Excel SIMBADA: SUM, COUNTIF)
  const totalPhysicalUnits = inventory.reduce((sum, it) => sum + it.totalStock, 0);
  const totalAssetValue = inventory.reduce(
    (sum, it) => sum + (it.totalPrice || it.unitPrice * it.totalStock || 0),
    0
  );
  const countBaik = inventory.filter((it) => it.condition === 'B').length;
  const countKurangBaik = inventory.filter((it) => it.condition === 'KB').length;
  const countRusakBerat = inventory.filter((it) => it.condition === 'RB').length;

  const itemsRusakBerat = inventory.filter((it) => it.condition === 'RB');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    setIsExportingExcel(true);
    try {
      exportKIRToExcel(inventory, schoolProfile);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      alert('Gagal mengekspor berkas Excel. Silakan coba lagi.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const formatIndoDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Navigation Tabs (Hidden on print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('kir')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'kir'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            Kartu Inventaris Ruangan (KIR)
          </button>

          <button
            onClick={() => setActiveTab('bap')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'bap'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            Berita Acara Pemeriksaan (BAP Rusak Berat)
          </button>

          <button
            onClick={() => setActiveTab('surat_hapus')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'surat_hapus'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Surat Usulan Hapus Aset ke Kadis Dikbud
          </button>

          <button
            onClick={() => setActiveTab('bast')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'bast'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            BAST Pengadaan / Bantuan Baru
          </button>

          <button
            onClick={() => setActiveTab('laporan_bulanan')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'laporan_bulanan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Laporan Bulanan Lab
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TOMBOL UNDUH EXCEL STANDAR KOTA MALANG */}
          <button
            onClick={handleDownloadExcel}
            disabled={isExportingExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition"
            title="Unduh berkas Excel .xlsx dengan 3 worksheet (KIR, Master Kode SIMBADA, Template Stiker) dan rumus =SUM() & =COUNTIF()"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingExcel ? 'Menyiapkan Excel...' : 'Unduh Template KIR (.xlsx)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            Cetak Dokumen Resmi (Ctrl+P)
          </button>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-slate-900 leading-normal font-sans">
        
        {/* KOP RESMI PEMERINTAH KOTA MALANG & DINAS PENDIDIKAN */}
        <div className="border-b-[3px] border-slate-900 pb-2 mb-5 relative">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo Pemkot Malang / Sekolah */}
            <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center p-1">
              {schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Emblem Standar Pemkot Malang / Tut Wuri Handayani */
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="50,5 92,28 92,72 50,95 8,72 8,28" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="4" />
                  <circle cx="50" cy="50" r="30" fill="#ffffff" />
                  <text x="50" y="47" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#1e3a8a" textAnchor="middle">PEMKOT</text>
                  <text x="50" y="59" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#b91c1c" textAnchor="middle">MALANG</text>
                </svg>
              )}
            </div>

            {/* Kop Surat Header */}
            <div className="flex-1 text-center">
              <h2 className="text-xs sm:text-sm uppercase font-extrabold tracking-wider text-slate-800">
                {schoolProfile.government || 'PEMERINTAH KOTA MALANG'}
              </h2>
              <h1 className="text-xs sm:text-base uppercase font-extrabold tracking-wide text-slate-900">
                {schoolProfile.opd || 'DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG'}
              </h1>
              <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-blue-950 mt-0.5">
                {schoolProfile.schoolName || 'SD NEGERI KAUMAN 1 KOTA MALANG'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5 font-medium">
                NPSN: {schoolProfile.npsn} • {schoolProfile.address}
              </p>
              <p className="text-[9.5px] sm:text-[11px] text-slate-600">
                Telepon: {schoolProfile.phone} | Email: {schoolProfile.email} | Web: {schoolProfile.website}
              </p>
            </div>
          </div>
          {/* Garis Ganda Standar Kedinasan */}
          <div className="w-full h-0.5 bg-slate-900 mt-2"></div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: KARTU INVENTARIS RUANGAN (KIR) SESUAI STANDAR SIMBADA */}
        {/* ============================================================== */}
        {activeTab === 'kir' && (
          <div>
            {/* Banner Fitur Excel Standar SD Kota Malang (Hidden on Print) */}
            <div className="no-print mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-emerald-900 block text-xs">
                    Template Berkas Excel (.xlsx) Standar Sekolah Dasar Kota Malang Siap Diunduh
                  </strong>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Memuat 3 Worksheet: <strong>1. KIR Lab Komputer</strong> (rumus otomatis <code className="bg-emerald-100 px-1 py-0.5 rounded">=SUM()</code> & <code className="bg-emerald-100 px-1 py-0.5 rounded">=COUNTIF()</code> kondisi B/KB/RB serta TTD 3 Pihak), <strong>2. Master Kode SIMBADA</strong>, dan <strong>3. Template Stiker Label Fisik</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadExcel}
                disabled={isExportingExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg shrink-0 shadow-sm transition flex items-center justify-center gap-1.5 self-end sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingExcel ? 'Mengunduh...' : 'Unduh File Excel'}</span>
              </button>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                KARTU INVENTARIS RUANGAN (KIR)
              </h2>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                STANDAR PENGELOLAAN BARANG MILIK DAERAH (BMD) KOTA MALANG
              </div>
            </div>

            {/* Identitas Lokasi SIMBADA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 text-xs mb-3 font-medium bg-slate-50 p-3 rounded-lg border border-slate-200 print:bg-transparent print:border-none print:p-0">
              <div className="space-y-1">
                <div className="grid grid-cols-[140px_10px_1fr]">
                  <span>OPD</span>
                  <span>:</span>
                  <span className="font-bold">{schoolProfile.opd}</span>
                </div>
                <div className="grid grid-cols-[140px_10px_1fr]">
                  <span>Unit / Sub Unit</span>
                  <span>:</span>
                  <span className="font-bold">{schoolProfile.schoolName}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="grid grid-cols-[140px_10px_1fr]">
                  <span>Ruangan</span>
                  <span>:</span>
                  <span className="font-bold">{schoolProfile.labName}</span>
                </div>
                <div className="grid grid-cols-[140px_10px_1fr]">
                  <span>Kode Lokasi Ruangan</span>
                  <span>:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {schoolProfile.roomLocationCode || '12.03.25.01.01.01.01.05'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabel KIR Standar BKAD Malang */}
            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-slate-900 text-[10.5px]">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold text-slate-900">
                    <th className="border border-slate-900 p-1.5 w-7">No</th>
                    <th className="border border-slate-900 p-1.5 w-28">Kode Barang (SIMBADA)</th>
                    <th className="border border-slate-900 p-1.5">Nama Barang / Jenis</th>
                    <th className="border border-slate-900 p-1.5 w-24">Merk / Tipe</th>
                    <th className="border border-slate-900 p-1.5 w-24">No. Pabrik / Seri</th>
                    <th className="border border-slate-900 p-1.5 w-16">Bahan</th>
                    <th className="border border-slate-900 p-1.5 w-12">Tahun</th>
                    <th className="border border-slate-900 p-1.5 w-12">Jumlah</th>
                    <th className="border border-slate-900 p-1.5 w-24 text-right">Nilai Total (Rp)</th>
                    <th className="border border-slate-900 p-1.5 w-12 text-center">Kondisi</th>
                    <th className="border border-slate-900 p-1.5 w-14 text-center">Foto Fisik</th>
                    <th className="border border-slate-900 p-1.5 w-24">Catatan / Mutasi</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item, idx) => (
                    <tr key={item.id} className="border border-slate-900">
                      <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-1.5 font-mono font-bold text-[10px]">
                        {item.code}
                      </td>
                      <td className="border border-slate-900 p-1.5">
                        <div className="font-bold">{item.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono">{item.registerNumber}</div>
                      </td>
                      <td className="border border-slate-900 p-1.5 text-[10px]">{item.brand}</td>
                      <td className="border border-slate-900 p-1.5 font-mono text-[9px] text-center">
                        {item.serialNumber || '-'}
                      </td>
                      <td className="border border-slate-900 p-1.5 text-center text-[10px]">{item.material || '-'}</td>
                      <td className="border border-slate-900 p-1.5 text-center">{item.purchaseYear}</td>
                      <td className="border border-slate-900 p-1.5 text-center font-bold">{item.totalStock}</td>
                      <td className="border border-slate-900 p-1.5 text-right font-mono text-[10px]">
                        {(item.totalPrice || item.unitPrice * item.totalStock || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="border border-slate-900 p-1.5 text-center font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            item.condition === 'B'
                              ? 'text-emerald-800'
                              : item.condition === 'KB'
                              ? 'text-amber-800'
                              : 'text-rose-800'
                          }`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      {/* Kolom Foto Fisik Aset */}
                      <td className="border border-slate-900 p-1 text-center">
                        {item.imageUrl ? (
                          <div className="w-10 h-10 mx-auto rounded overflow-hidden border border-slate-300">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-400 italic">No Pic</span>
                        )}
                      </td>
                      <td className="border border-slate-900 p-1.5 text-[9.5px]">
                        {item.notes || item.sourceOfFund}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* REKAPITULASI KONDISI BARANG OTOMATIS (RUMUS EXCEL SIMBADA BKAD) */}
            <div className="my-4 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-2">
              <div className="font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                <span>Rekapitulasi Fisik & Kondisi Barang (Rumus SIMBADA):</span>
                <span className="font-mono text-blue-900 font-extrabold text-sm">
                  Total Nilai: Rp {totalAssetValue.toLocaleString('id-ID')},-
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Total Fisik [=SUM]:</span>
                  <strong className="text-slate-900 text-sm">{totalPhysicalUnits} Unit</strong>
                </div>
                <div className="p-2 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-emerald-700 block">Baik (B) [=COUNTIF]:</span>
                  <strong className="text-emerald-800 text-sm">{countBaik} Jenis</strong>
                </div>
                <div className="p-2 bg-amber-50 rounded border border-amber-200">
                  <span className="text-amber-700 block">Kurang Baik (KB) [=COUNTIF]:</span>
                  <strong className="text-amber-800 text-sm">{countKurangBaik} Jenis</strong>
                </div>
                <div className="p-2 bg-rose-50 rounded border border-rose-200">
                  <span className="text-rose-700 block">Rusak Berat (RB) [=COUNTIF]:</span>
                  <strong className="text-rose-800 text-sm">{countRusakBerat} Jenis (Usul Hapus)</strong>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 italic">
                * Keterangan Kondisi: B (Baik), KB (Kurang Baik / Masih Dapat Digunakan), RB (Rusak Berat / Tidak Dapat Difungsikan).
              </div>
            </div>

            {/* PENGESAHAN 3 PIHAK STANDAR SIMBADA KOTA MALANG */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 page-break-inside-avoid font-sans">
              <div>
                <p className="font-semibold mb-16">
                  Mengetahui,
                  <br />
                  Kepala {schoolProfile.schoolName}
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.headmasterName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.headmasterNip}</p>
              </div>

              <div>
                <p className="font-semibold mb-16">
                  Pengurus / Pengelola Barang Sekolah,
                  <br />
                  <span className="text-[10px] text-slate-500 font-normal">Kota Malang</span>
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.propertyOfficerName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.propertyOfficerNip}</p>
              </div>

              <div>
                <p className="font-semibold mb-16">
                  Malang, {formatIndoDate(new Date().toISOString().split('T')[0])}
                  <br />
                  Penanggung Jawab Ruang Lab Komputer
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.labHeadName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.labHeadNip}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: BERITA ACARA PEMERIKSAAN BARANG (BAP RUSAK BERAT) */}
        {/* ============================================================== */}
        {activeTab === 'bap' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                BERITA ACARA PEMERIKSAAN BARANG INVENTARIS
              </h2>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                NOMOR : 050 / 014 / BAP / 2026
              </div>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-4">
              Pada hari ini <strong>{formatIndoDate(new Date().toISOString().split('T')[0])}</strong>, kami yang bertanda tangan di bawah ini Tim Pemeriksa Inventaris Barang {schoolProfile.schoolName} Kota Malang:
            </p>

            <div className="text-xs space-y-2 mb-4 pl-4 font-medium">
              <div className="grid grid-cols-[140px_10px_1fr]">
                <span>1. Nama</span>
                <span>:</span>
                <span className="font-bold">{schoolProfile.propertyOfficerName}</span>
                <span>NIP</span>
                <span>:</span>
                <span>{schoolProfile.propertyOfficerNip}</span>
                <span>Jabatan</span>
                <span>:</span>
                <span>Pengurus Barang Sekolah</span>
              </div>

              <div className="grid grid-cols-[140px_10px_1fr] pt-2">
                <span>2. Nama</span>
                <span>:</span>
                <span className="font-bold">{schoolProfile.labHeadName}</span>
                <span>NIP</span>
                <span>:</span>
                <span>{schoolProfile.labHeadNip}</span>
                <span>Jabatan</span>
                <span>:</span>
                <span>Penanggung Jawab Laboratorium Komputer</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-4">
              Telah melakukan pemeriksaan fisik atas barang milik daerah (BMD) yang bertempat di {schoolProfile.labName} {schoolProfile.schoolName} dengan hasil pemeriksaan sebagai berikut:
            </p>

            {/* Tabel Barang Rusak Berat */}
            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-2 w-8">No</th>
                    <th className="border border-slate-900 p-2 w-32">Kode Barang</th>
                    <th className="border border-slate-900 p-2">Nama Barang</th>
                    <th className="border border-slate-900 p-2 w-28">Merk / Tipe</th>
                    <th className="border border-slate-900 p-2 w-16">Jumlah</th>
                    <th className="border border-slate-900 p-2 w-16">Tahun</th>
                    <th className="border border-slate-900 p-2 w-28 text-right">Nilai Total</th>
                    <th className="border border-slate-900 p-2">Kondisi / Kerusakan</th>
                  </tr>
                </thead>
                <tbody>
                  {(itemsRusakBerat.length > 0 ? itemsRusakBerat : inventory.slice(5, 6)).map((item, idx) => (
                    <tr key={idx} className="border border-slate-900">
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-mono font-bold">{item.code}</td>
                      <td className="border border-slate-900 p-2 font-bold">{item.name}</td>
                      <td className="border border-slate-900 p-2">{item.brand}</td>
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        {item.totalStock} {item.unit}
                      </td>
                      <td className="border border-slate-900 p-2 text-center">{item.purchaseYear}</td>
                      <td className="border border-slate-900 p-2 text-right font-mono">
                        Rp {(item.totalPrice || item.unitPrice * item.totalStock).toLocaleString('id-ID')}
                      </td>
                      <td className="border border-slate-900 p-2 text-rose-700 font-semibold">
                        {item.notes || 'Baterai drop, mati total, biaya perbaikan melebihi nilai barang'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kesimpulan & Rekomendasi */}
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs my-4 space-y-1">
              <strong className="text-rose-900 block uppercase">KESIMPULAN & REKOMENDASI:</strong>
              <p className="text-rose-800 leading-relaxed">
                Barang tersebut di atas telah mengalami kerusakan berat dan secara teknis serta ekonomis tidak memungkinkan untuk diperbaiki kembali. Oleh karena itu, Tim Pemeriksa merekomendasikan barang tersebut untuk diusulkan <strong>Penghapusan dari Daftar Inventaris SIMBADA Kota Malang</strong> ke Dinas Pendidikan dan Kebudayaan Kota Malang serta BKAD Kota Malang.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-6">
              Demikian Berita Acara Pemeriksaan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
            </p>

            <div className="grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
              <div>
                <p className="font-semibold mb-16">
                  1. Pengurus Barang Sekolah,
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.propertyOfficerName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.propertyOfficerNip}</p>
              </div>

              <div>
                <p className="font-semibold mb-16">
                  2. PJ Laboratorium Komputer,
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.labHeadName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.labHeadNip}</p>
              </div>

              <div className="col-span-2 pt-4 text-center">
                <p className="font-semibold mb-16">
                  Mengetahui / Menyetujui,
                  <br />
                  <span className="font-bold">Kepala {schoolProfile.schoolName}</span>
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.headmasterName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.headmasterNip}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: SURAT USULAN PENGHAPUSAN ASET BMD KE KADIS DIKBUD */}
        {/* ============================================================== */}
        {activeTab === 'surat_hapus' && (
          <div>
            <div className="grid grid-cols-2 text-xs mb-4">
              <div className="space-y-1">
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <span>Nomor</span>
                  <span>:</span>
                  <span className="font-mono font-bold">050 / 112 / 35.73.401.01 / 2026</span>
                </div>
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <span>Sifat</span>
                  <span>:</span>
                  <span>Biasa</span>
                </div>
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <span>Lampiran</span>
                  <span>:</span>
                  <span>1 (Satu) Berkas KIR & Berita Acara Pemeriksaan Barang</span>
                </div>
                <div className="grid grid-cols-[80px_10px_1fr]">
                  <span>Hal</span>
                  <span>:</span>
                  <span className="font-bold">Usulan Penghapusan / Pemindahtanganan Aset BMD</span>
                </div>
              </div>

              <div className="text-right">
                <p>Malang, {formatIndoDate(new Date().toISOString().split('T')[0])}</p>
                <div className="mt-2 text-left inline-block">
                  <p>Yth. <strong>Kepala Dinas Pendidikan dan Kebudayaan Kota Malang</strong></p>
                  <p className="text-[11px] text-slate-600">c.q. Pengelola Barang Milik Daerah / Subbag Keuangan dan Aset</p>
                  <p>di MALANG</p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-3">
              Dengan hormat,
            </p>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-4">
              Sehubungan dengan pelaksanaan inventarisasi Barang Milik Daerah (BMD) pada unit kerja kami, bersama ini kami sampaikan usulan penghapusan aset inventaris yang berada di {schoolProfile.labName} {schoolProfile.schoolName} dikarenakan kondisi barang dalam keadaan <strong>Rusak Berat (RB)</strong> dan tidak ekonomis untuk diperbaiki.
            </p>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-2 font-semibold">
              Adapun rincian aset yang diusulkan untuk dihapus adalah sebagai berikut:
            </p>

            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-2 w-8">No</th>
                    <th className="border border-slate-900 p-2 w-32">Kode Barang</th>
                    <th className="border border-slate-900 p-2">Nama Barang</th>
                    <th className="border border-slate-900 p-2 w-28">Merk / Tipe</th>
                    <th className="border border-slate-900 p-2 w-16">Jumlah</th>
                    <th className="border border-slate-900 p-2 w-16">Tahun</th>
                    <th className="border border-slate-900 p-2 w-28 text-right">Nilai Perolehan</th>
                  </tr>
                </thead>
                <tbody>
                  {(itemsRusakBerat.length > 0 ? itemsRusakBerat : inventory.slice(5, 6)).map((item, idx) => (
                    <tr key={idx} className="border border-slate-900">
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-mono font-bold">{item.code}</td>
                      <td className="border border-slate-900 p-2 font-bold">{item.name}</td>
                      <td className="border border-slate-900 p-2">{item.brand}</td>
                      <td className="border border-slate-900 p-2 text-center font-bold">{item.totalStock} {item.unit}</td>
                      <td className="border border-slate-900 p-2 text-center">{item.purchaseYear}</td>
                      <td className="border border-slate-900 p-2 text-right font-mono">
                        Rp {(item.totalPrice || item.unitPrice * item.totalStock).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-2 font-semibold">
              Sebagai bahan pertimbangan, bersama surat ini kami lampirkan:
            </p>
            <ol className="list-decimal pl-6 text-xs sm:text-sm space-y-1 mb-6">
              <li>Lembar Kartu Inventaris Ruangan (KIR) Laboratorium Komputer.</li>
              <li>Berita Acara Pemeriksaan Fisik Barang (BAP).</li>
              <li>Foto fisik kondisi barang rusak berat.</li>
            </ol>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-8">
              Demikian surat usulan ini kami sampaikan. Atas perhatian dan tindak lanjut Bapak/Ibu, kami ucapkan terima kasih.
            </p>

            <div className="flex justify-end text-center text-xs page-break-inside-avoid">
              <div className="w-64">
                <p className="font-semibold mb-16">
                  Kepala {schoolProfile.schoolName}
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.headmasterName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.headmasterNip}</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: BAST (BERITA ACARA SERAH TERIMA PENGADAAN BARU) */}
        {/* ============================================================== */}
        {activeTab === 'bast' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                BERITA ACARA SERAH TERIMA (BAST) BARANG INVENTARIS
              </h2>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                NOMOR : 050 / 024 / BAST / 2026
              </div>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-3">
              Pada hari ini <strong>{formatIndoDate('2026-10-15')}</strong>, kami yang bertanda tangan di bawah ini:
            </p>

            <div className="text-xs space-y-2 mb-4 pl-4 font-medium">
              <div className="grid grid-cols-[140px_10px_1fr]">
                <span>1. Nama</span>
                <span>:</span>
                <span className="font-bold">Bambang Triyono, S.T., M.T.</span>
                <span>NIP</span>
                <span>:</span>
                <span>19790614 200501 1 005</span>
                <span>Jabatan</span>
                <span>:</span>
                <span>Pejabat Pembuat Komitmen (PPK) / Penyedia Barang</span>
                <span>Alamat</span>
                <span>:</span>
                <span>Kota Malang</span>
              </div>
              <p className="text-xs italic text-slate-600 pl-4">
                Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
              </p>

              <div className="grid grid-cols-[140px_10px_1fr] pt-2">
                <span>2. Nama</span>
                <span>:</span>
                <span className="font-bold">{schoolProfile.headmasterName}</span>
                <span>NIP</span>
                <span>:</span>
                <span>{schoolProfile.headmasterNip}</span>
                <span>Jabatan</span>
                <span>:</span>
                <span>Kepala {schoolProfile.schoolName}</span>
                <span>Alamat</span>
                <span>:</span>
                <span>{schoolProfile.address}</span>
              </div>
              <p className="text-xs italic text-slate-600 pl-4">
                Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-3">
              PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA menerima dari PIHAK PERTAMA Barang Milik Daerah (BMD) berupa peralatan laboratorium komputer dengan rincian sebagai berikut:
            </p>

            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-2 w-8">No</th>
                    <th className="border border-slate-900 p-2 w-32">Kode Barang</th>
                    <th className="border border-slate-900 p-2">Nama Barang</th>
                    <th className="border border-slate-900 p-2 w-28">Merk / Tipe</th>
                    <th className="border border-slate-900 p-2 w-16">Jumlah</th>
                    <th className="border border-slate-900 p-2 w-28 text-right">Harga Satuan (Rp)</th>
                    <th className="border border-slate-900 p-2 w-28 text-right">Total Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border border-slate-900">
                    <td className="border border-slate-900 p-2 text-center">1</td>
                    <td className="border border-slate-900 p-2 font-mono font-bold">1.3.2.10.01.02.001</td>
                    <td className="border border-slate-900 p-2 font-bold">Chromebook Client Siswa</td>
                    <td className="border border-slate-900 p-2">Asus Chromebook C214</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">15 Unit</td>
                    <td className="border border-slate-900 p-2 text-right font-mono">Rp 5.000.000,-</td>
                    <td className="border border-slate-900 p-2 text-right font-mono font-bold">Rp 75.000.000,-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs my-4 space-y-1">
              <strong className="block uppercase text-slate-800">KETENTUAN:</strong>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                <li>Barang yang diserahterimakan dalam keadaan 100% Baru dan Berfungsi dengan Baik (Baik / B).</li>
                <li>Sejak ditandatanganinya BAST ini, hak pengelolaan dan kewajiban pencatatan barang dalam SIMBADA serta KIR Laboratorium Komputer menjadi tanggung jawab PIHAK KEDUA.</li>
              </ol>
            </div>

            <p className="text-xs sm:text-sm text-justify leading-relaxed mb-6">
              Demikian Berita Acara Serah Terima ini dibuat dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya.
            </p>

            <div className="grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
              <div>
                <p className="font-semibold mb-16">
                  PIHAK KEDUA (Penerima),
                  <br />
                  Kepala {schoolProfile.schoolName}
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.headmasterName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.headmasterNip}</p>
              </div>

              <div>
                <p className="font-semibold mb-16">
                  PIHAK PERTAMA (Pemberi),
                  <br />
                  Pejabat Pembuat Komitmen / Penyedia
                </p>
                <p className="font-bold underline uppercase">Bambang Triyono, S.T., M.T.</p>
                <p className="text-[11px] text-slate-600">NIP. 19790614 200501 1 005</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: LAPORAN BULANAN PENGGUNAAN & EFISIENSI */}
        {/* ============================================================== */}
        {activeTab === 'laporan_bulanan' && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                LAPORAN BULANAN PENGGUNAAN & EFISIENSI LAB KOMPUTER
              </h2>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                PERIODE: OKTOBER 2026 • {schoolProfile.schoolName}
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs">
              <div>
                <span className="text-slate-500 block">Total Aset Tercatat</span>
                <strong className="text-base text-slate-900">{totalPhysicalUnits} Unit</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Total Nilai BMD</span>
                <strong className="text-base text-indigo-700 font-mono">
                  Rp {totalAssetValue.toLocaleString('id-ID')}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tingkat Kelaikan Fisik</span>
                <strong className="text-base text-emerald-700">
                  {Math.round((countBaik / Math.max(1, inventory.length)) * 100)}% Laik
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto my-3">
              <table className="w-full border-collapse border border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-2 w-8">No</th>
                    <th className="border border-slate-900 p-2 w-28">No Pinjam</th>
                    <th className="border border-slate-900 p-2">Barang</th>
                    <th className="border border-slate-900 p-2">Peminjam</th>
                    <th className="border border-slate-900 p-2 w-20">Tgl Pinjam</th>
                    <th className="border border-slate-900 p-2 w-20">Tempo</th>
                    <th className="border border-slate-900 p-2 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, idx) => (
                    <tr key={loan.id} className="border border-slate-900">
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-mono font-bold">{loan.loanNumber}</td>
                      <td className="border border-slate-900 p-2 font-bold">{loan.itemName} ({loan.quantity} unit)</td>
                      <td className="border border-slate-900 p-2">{loan.borrowerName} ({loan.borrowerClassOrDept})</td>
                      <td className="border border-slate-900 p-2 text-center">{loan.borrowDate}</td>
                      <td className="border border-slate-900 p-2 text-center">{loan.expectedReturnDate}</td>
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        {loan.status === 'Dikembalikan' ? (
                          <span className="text-emerald-700">Kembali</span>
                        ) : loan.status === 'Terlambat' ? (
                          <span className="text-rose-700">Terlambat</span>
                        ) : (
                          <span className="text-blue-700">Dipinjam</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs pt-6 page-break-inside-avoid">
              <div>
                <p className="font-semibold mb-16">
                  Mengetahui,
                  <br />
                  Kepala {schoolProfile.schoolName}
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.headmasterName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.headmasterNip}</p>
              </div>

              <div>
                <p className="font-semibold mb-16">
                  Penanggung Jawab Lab Komputer,
                </p>
                <p className="font-bold underline uppercase">{schoolProfile.labHeadName}</p>
                <p className="text-[11px] text-slate-600">NIP. {schoolProfile.labHeadNip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
