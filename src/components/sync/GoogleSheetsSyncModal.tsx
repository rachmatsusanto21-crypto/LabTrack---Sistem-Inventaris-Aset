import React, { useState } from 'react';
import { GasDeploymentConfig } from '../../types/inventory';
import { GOOGLE_APPS_SCRIPT_CODE, testGasConnection } from '../../services/googleSheetsService';
import {
  FileSpreadsheet,
  Link,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  BookOpen,
  Wifi,
  WifiOff,
  Database,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface GoogleSheetsSyncModalProps {
  config: GasDeploymentConfig;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncMessage?: string | null;
  onUpdateConfig: (newConfig: Partial<GasDeploymentConfig>) => void;
  onSyncPush: () => Promise<void>;
  onSyncPull: () => Promise<void>;
  onExportJson: () => void;
  onImportJson: (json: string) => boolean;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  config,
  isOnline,
  isSyncing,
  lastSyncMessage,
  onUpdateConfig,
  onSyncPush,
  onSyncPull,
  onExportJson,
  onImportJson,
}) => {
  const [urlInput, setUrlInput] = useState<string>(config.webAppUrl || '');
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'backup'>('config');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ webAppUrl: urlInput.trim() });
    setTestResult({
      success: true,
      message: 'URL Web App Google Apps Script berhasil disimpan di pengaturan aplikasi!',
    });
  };

  const handleTestPing = async () => {
    if (!urlInput.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Web App Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    const result = await testGasConnection(urlInput.trim());
    setTestingConnection(false);
    setTestResult(result);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      const success = onImportJson(content);
      if (success) {
        alert('Data berhasil diimpor dari file backup!');
      } else {
        alert('File JSON tidak valid atau struktur data tidak sesuai.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              Google Workspace & Sheets Integration
              {config.webAppUrl ? (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                  Belum Ada URL Web App
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Sinkronisasi data otomatis dengan Google Sheets & Google Drive tanpa Firebase
            </p>
          </div>
        </div>

        {/* Network & Offline Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Wifi className="w-4 h-4 text-emerald-600" />
              Perangkat Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <WifiOff className="w-4 h-4 text-amber-600" />
              Mode Offline (Tersimpan Lokal)
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Link className="w-4 h-4" />
          Konfigurasi Web App URL
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'guide'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Kode Skrip & Panduan GAS
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Backup Offline & JSON
        </button>
      </div>

      {/* TAB 1: KONFIGURASI URL & SYNC ACTIONS */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h4 className="font-bold text-slate-800 text-base mb-1">
                Deployment Web App URL (Google Apps Script)
              </h4>
              <p className="text-xs text-slate-500">
                Masukkan URL eksekusi Web App dari deployment Google Apps Script Anda (dimulai dengan <code className="text-indigo-600 bg-slate-100 px-1 py-0.5 rounded">https://script.google.com/macros/s/.../exec</code>)
              </p>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Web App Executable URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow transition"
                  >
                    Simpan URL
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  {testingConnection ? 'Memeriksa Koneksi...' : 'Uji Koneksi (Test Ping)'}
                </button>

                {config.webAppUrl && (
                  <a
                    href={config.webAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Buka Endpoint di Tab Baru
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </form>

            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{testResult.success ? 'Berhasil' : 'Perhatian'}</div>
                  <div>{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Sync Operations Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-base">
              Aksi Sinkronisasi Database
            </h4>
            <p className="text-xs text-slate-500">
              Kirim perubahan inventaris lokal ke Google Sheets atau tarik data terbaru dari Google Sheets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Push to Sheets */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                    <UploadCloud className="w-5 h-5" />
                    <span>Kirim ke Google Sheets (Push)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Memperbarui seluruh lembar (sheet) <strong>Inventaris_Barang</strong>, <strong>Peminjaman_Alat</strong>, dan <strong>Profil_Sekolah</strong> di Google Drive Anda.
                  </p>
                </div>
                <button
                  onClick={onSyncPush}
                  disabled={isSyncing || !config.webAppUrl}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  {isSyncing ? 'Sedang Sinkronisasi...' : 'Sinkronkan Sekarang (Push)'}
                </button>
              </div>

              {/* Pull from Sheets */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <DownloadCloud className="w-5 h-5" />
                    <span>Tarik dari Google Sheets (Pull)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Mengambil data terbaru yang mungkin diubah langsung oleh rekan guru/laboran di dalam file Google Spreadsheet.
                  </p>
                </div>
                <button
                  onClick={onSyncPull}
                  disabled={isSyncing || !config.webAppUrl}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition"
                >
                  <DownloadCloud className="w-4 h-4" />
                  {isSyncing ? 'Sedang Mengunduh...' : 'Tarik Data Terbaru (Pull)'}
                </button>
              </div>
            </div>

            {lastSyncMessage && (
              <div className="mt-3 p-3 bg-slate-100 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                <span>Status Terakhir: <strong>{lastSyncMessage}</strong></span>
                {config.lastSyncTime && (
                  <span className="text-slate-500 text-[11px] font-mono">
                    {config.lastSyncTime}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN LENGKAP & KODE GOOGLE APPS SCRIPT */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  Skrip Google Apps Script (Server-Side Logic)
                </h4>
                <p className="text-xs text-slate-500">
                  Salin skrip ini dan tempelkan ke Apps Script di Google Sheets Anda
                </p>
              </div>
              <button
                onClick={handleCopyScript}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Skrip (.gs)'}
              </button>
            </div>

            {/* Step by step */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Langkah Pemasangan Mudah (Hanya 3 Menit):
              </h5>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Buka Google Drive (<a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">drive.google.com</a>), buat spreadsheet baru berjudul <strong>"Database Lab Komputer"</strong>.
                </li>
                <li>
                  Di menu atas Spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
                </li>
                <li>
                  Hapus semua kode bawaan (misal <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">function myFunction() ...</code>).
                </li>
                <li>
                  Klik tombol <strong>"Salin Seluruh Skrip"</strong> di atas, lalu tempelkan (Paste) ke editor Apps Script.
                </li>
                <li>
                  Klik ikon Disket (Simpan), lalu klik <strong>Terapkan (Deploy)</strong> &rarr; <strong>Penerapan baru (New deployment)</strong>.
                </li>
                <li>
                  Pilih jenis: <strong>Aplikasi web (Web app)</strong>.
                </li>
                <li>
                  Pengaturan penting:
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                    <li>Jalankan sebagai (Execute as): <strong>Saya (Me)</strong></li>
                    <li>Yang memiliki akses (Who has access): <strong>Siapa saja (Anyone)</strong></li>
                  </ul>
                </li>
                <li>
                  Klik <strong>Terapkan (Deploy)</strong>, setujui izin akses Google Workspace Anda, lalu salin <strong>URL Aplikasi Web</strong> dan tempelkan di tab Konfigurasi aplikasi ini.
                </li>
              </ol>
            </div>

            {/* Code Block Container */}
            <div className="relative mt-4">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-white font-mono text-xs rounded-lg backdrop-blur flex items-center gap-1.5 border border-slate-600 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Tersalin!' : 'Copy Code'}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP OFFLINE & JSON */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-base">
              Cadangan Data Mandiri (Offline Backup)
            </h4>
            <p className="text-xs text-slate-500">
              Seluruh data aplikasi (inventaris, transaksi peminjaman, profil sekolah, dan dokumen BAST) tersimpan aman di browser Anda dan dapat diekspor/diimpor kapan saja secara offline tanpa internet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Ekspor File JSON
                </div>
                <p className="text-xs text-slate-600">
                  Unduh seluruh database ke file komputer Anda sebagai arsip fisik.
                </p>
                <button
                  onClick={onExportJson}
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition"
                >
                  Unduh Backup JSON
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  Pulihkan / Impor JSON
                </div>
                <p className="text-xs text-slate-600">
                  Muat data dari file cadangan JSON yang telah disimpan sebelumnya.
                </p>
                <label className="w-full py-2 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl text-center cursor-pointer block transition">
                  Pilih File Backup JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
