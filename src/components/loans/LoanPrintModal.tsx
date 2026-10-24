import React, { useState } from 'react';
import { LoanTransaction, SchoolProfile } from '../../types/inventory';
import { Printer, X, FileText, CheckCircle2, Clock, Calendar, User } from 'lucide-react';

interface LoanPrintModalProps {
  loans: LoanTransaction[];
  schoolProfile: SchoolProfile;
  selectedLoan?: LoanTransaction | null;
  onClose: () => void;
}

export const LoanPrintModal: React.FC<LoanPrintModalProps> = ({
  loans,
  schoolProfile,
  selectedLoan,
  onClose,
}) => {
  const [printMode, setPrintMode] = useState<'register' | 'slip'>(
    selectedLoan ? 'slip' : 'register'
  );
  const [activeSlipLoan, setActiveSlipLoan] = useState<LoanTransaction | null>(
    selectedLoan || loans[0] || null
  );
  const [filterType, setFilterType] = useState<'all' | 'Dipinjam' | 'Dikembalikan'>('all');

  const filteredLoans = loans.filter((l) => {
    if (filterType === 'all') return true;
    if (filterType === 'Dipinjam') return l.status === 'Dipinjam' || l.status === 'Terlambat';
    return l.status === 'Dikembalikan';
  });

  const handlePrint = () => {
    window.print();
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
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Cetak Pencatatan Peminjaman & Pengembalian Alat
              </h2>
              <p className="text-xs text-slate-500">
                Pilihan cetak Buku Register Rekapitulasi atau Lembar Bukti Pinjam Pakai Satuan
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

        {/* Toolbar Controls - Hidden on Print */}
        <div className="no-print px-4 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintMode('register')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                printMode === 'register'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Buku Register Peminjaman (Tabel Lengkap)
            </button>
            <button
              onClick={() => setPrintMode('slip')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                printMode === 'slip'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lembar Bukti Pinjam Pakai (Slip Satuan)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {printMode === 'register' ? (
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
                <span className="px-2 text-slate-500 text-xs">Filter Status:</span>
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-1 text-xs rounded ${
                    filterType === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Semua ({loans.length})
                </button>
                <button
                  onClick={() => setFilterType('Dipinjam')}
                  className={`px-2 py-1 text-xs rounded ${
                    filterType === 'Dipinjam' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Aktif / Dipinjam
                </button>
                <button
                  onClick={() => setFilterType('Dikembalikan')}
                  className={`px-2 py-1 text-xs rounded ${
                    filterType === 'Dikembalikan' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  Selesai Kembali
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-slate-600">Pilih Transaksi:</span>
                <select
                  value={activeSlipLoan?.id || ''}
                  onChange={(e) => {
                    const found = loans.find((l) => l.id === e.target.value);
                    if (found) setActiveSlipLoan(found);
                  }}
                  className="px-2 py-1 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                >
                  {loans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.loanNumber} - {l.borrowerName} ({l.itemName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Ctrl+P)</span>
            </button>
          </div>
        </div>

        {/* Printable Viewport */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-100 print:bg-white print:p-0">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-slate-900 font-sans">
            
            {/* Kop Surat Pemkot Malang */}
            <div className="border-b-[3px] border-slate-900 pb-2 mb-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center p-1">
                  {schoolProfile.logoUrl ? (
                    <img
                      src={schoolProfile.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon points="50,5 92,28 92,72 50,95 8,72 8,28" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="4" />
                      <circle cx="50" cy="50" r="30" fill="#ffffff" />
                      <text x="50" y="47" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#1e3a8a" textAnchor="middle">PEMKOT</text>
                      <text x="50" y="59" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#b91c1c" textAnchor="middle">MALANG</text>
                    </svg>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-800">
                    {schoolProfile.government || 'PEMERINTAH KOTA MALANG'}
                  </h2>
                  <h1 className="text-xs sm:text-sm uppercase font-extrabold tracking-wide text-slate-900">
                    {schoolProfile.opd || 'DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG'}
                  </h1>
                  <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight text-blue-950 mt-0.5">
                    {schoolProfile.schoolName || 'SD NEGERI KAUMAN 1 KOTA MALANG'}
                  </h3>
                  <p className="text-[9.5px] sm:text-xs text-slate-600 mt-0.5 font-medium">
                    NPSN: {schoolProfile.npsn} • {schoolProfile.address}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-600">
                    Telepon: {schoolProfile.phone} | Email: {schoolProfile.email}
                  </p>
                </div>
              </div>
              <div className="w-full h-0.5 bg-slate-900 mt-2"></div>
            </div>

            {/* ============================================================== */}
            {/* FORMAT 1: BUKU REGISTER PEMINJAMAN & PENGEMBALIAN ALAT (TABEL) */}
            {/* ============================================================== */}
            {printMode === 'register' && (
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                    BUKU CATATAN PEMINJAMAN DAN PENGEMBALIAN ALAT LABORATORIUM KOMPUTER
                  </h2>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    RUANGAN: {schoolProfile.labName.toUpperCase()} • TAHUN 2026
                  </div>
                </div>

                <div className="text-xs mb-3 flex justify-between font-medium">
                  <span>Unit Kerja: <strong>{schoolProfile.schoolName}</strong></span>
                  <span>Kode Lokasi: <strong className="font-mono">{schoolProfile.roomLocationCode}</strong></span>
                </div>

                <div className="overflow-x-auto my-3">
                  <table className="w-full border-collapse border border-slate-900 text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-slate-900 p-1.5 w-7">No</th>
                        <th className="border border-slate-900 p-1.5 w-24">No. Pinjam</th>
                        <th className="border border-slate-900 p-1.5 w-18">Tgl Pinjam</th>
                        <th className="border border-slate-900 p-1.5">Nama Barang & Kode SIMBADA</th>
                        <th className="border border-slate-900 p-1.5">Nama Peminjam / Kelas</th>
                        <th className="border border-slate-900 p-1.5 w-12">Jumlah</th>
                        <th className="border border-slate-900 p-1.5 w-18">Batas Kembali</th>
                        <th className="border border-slate-900 p-1.5 w-18">Tgl Kembali</th>
                        <th className="border border-slate-900 p-1.5 w-14">Kondisi</th>
                        <th className="border border-slate-900 p-1.5 w-16">Petugas</th>
                        <th className="border border-slate-900 p-1.5 w-16">Paraf Peminjam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((l, idx) => (
                        <tr key={l.id} className="border border-slate-900">
                          <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-1.5 font-mono font-bold text-[10px]">{l.loanNumber}</td>
                          <td className="border border-slate-900 p-1.5 text-center">{l.borrowDate}</td>
                          <td className="border border-slate-900 p-1.5">
                            <div className="font-bold">{l.itemName}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{l.itemCode}</div>
                          </td>
                          <td className="border border-slate-900 p-1.5">
                            <div className="font-semibold">{l.borrowerName}</div>
                            <div className="text-[9px] text-slate-500">{l.borrowerClassOrDept}</div>
                          </td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold">{l.quantity} Unit</td>
                          <td className="border border-slate-900 p-1.5 text-center">{l.expectedReturnDate}</td>
                          <td className="border border-slate-900 p-1.5 text-center">
                            {l.actualReturnDate || '-'}
                          </td>
                          <td className="border border-slate-900 p-1.5 text-center font-bold">
                            {l.returnCondition || (l.status === 'Terlambat' ? 'Terlambat' : 'Dipinjam')}
                          </td>
                          <td className="border border-slate-900 p-1.5 text-center text-[9.5px]">
                            {l.officerName.split(',')[0]}
                          </td>
                          <td className="border border-slate-900 p-1.5 text-center text-slate-400">
                            {/* Tempat TTD Paraf */}
                            [ . . . ]
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Pengesahan */}
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
            {/* FORMAT 2: LEMBAR BUKTI PINJAM PAKAI ALAT (SLIP SATUAN) */}
            {/* ============================================================== */}
            {printMode === 'slip' && activeSlipLoan && (
              <div>
                <div className="text-center mb-5">
                  <h2 className="text-sm sm:text-base font-black tracking-wide uppercase underline decoration-2 underline-offset-4">
                    SURAT BUKTI PEMINJAMAN & PENGEMBALIAN ALAT LABORATORIUM
                  </h2>
                  <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                    NOMOR BUKTI : {activeSlipLoan.loanNumber}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block">Identitas Peminjam:</span>
                      <strong className="text-sm text-slate-900 block">{activeSlipLoan.borrowerName}</strong>
                      <span className="text-slate-600">{activeSlipLoan.borrowerType} ({activeSlipLoan.borrowerClassOrDept})</span>
                      <div className="text-slate-500 font-mono mt-0.5">Kontak / WA: {activeSlipLoan.borrowerContact}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Jadwal Peminjaman:</span>
                      <div>Tanggal Pinjam: <strong>{formatIndoDate(activeSlipLoan.borrowDate)}</strong></div>
                      <div>Batas Tanggal Kembali: <strong className="text-indigo-900">{formatIndoDate(activeSlipLoan.expectedReturnDate)}</strong></div>
                      <div>Realisasi Pengembalian: <strong>{formatIndoDate(activeSlipLoan.actualReturnDate)}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="my-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-800">
                    Rincian Barang yang Dipinjam:
                  </h4>
                  <table className="w-full border-collapse border border-slate-900 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-slate-900 p-2 w-10">No</th>
                        <th className="border border-slate-900 p-2 w-36">Kode SIMBADA</th>
                        <th className="border border-slate-900 p-2">Nama Barang / Spesifikasi</th>
                        <th className="border border-slate-900 p-2 w-20">Jumlah</th>
                        <th className="border border-slate-900 p-2 w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border border-slate-900">
                        <td className="border border-slate-900 p-2 text-center">1</td>
                        <td className="border border-slate-900 p-2 font-mono font-bold">{activeSlipLoan.itemCode}</td>
                        <td className="border border-slate-900 p-2">
                          <div className="font-bold">{activeSlipLoan.itemName}</div>
                          <div className="text-[11px] text-slate-600">{activeSlipLoan.purpose}</div>
                        </td>
                        <td className="border border-slate-900 p-2 text-center font-bold">{activeSlipLoan.quantity} Unit</td>
                        <td className="border border-slate-900 p-2 text-center font-bold">
                          {activeSlipLoan.status} {activeSlipLoan.returnCondition && `(${activeSlipLoan.returnCondition})`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1 mb-6">
                  <strong>TATA TERTIB & KETENTUAN PINJAM PAKAI:</strong>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Peminjam bertanggung jawab penuh atas keutuhan dan kebersihan perangkat yang dipinjam.</li>
                    <li>Barang wajib dikembalikan paling lambat pada tanggal jatuh tempo yang tertera di atas.</li>
                    <li>Segala bentuk kerusakan fisik/kehilangan akibat kelalaian pemakaian menjadi tanggung jawab pihak peminjam.</li>
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
                  <div>
                    <p className="font-semibold mb-16">
                      Peminjam / Pengguna,
                    </p>
                    <p className="font-bold underline uppercase">{activeSlipLoan.borrowerName}</p>
                    <p className="text-[11px] text-slate-600">{activeSlipLoan.borrowerClassOrDept}</p>
                  </div>

                  <div>
                    <p className="font-semibold mb-16">
                      Petugas / Penanggung Jawab Lab,
                    </p>
                    <p className="font-bold underline uppercase">{activeSlipLoan.officerName}</p>
                    <p className="text-[11px] text-slate-600">NIP. {schoolProfile.labHeadNip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="no-print p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Format cetak dioptimalkan untuk kertas A4 / F4 landscape atau portrait.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-200 text-slate-700 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
