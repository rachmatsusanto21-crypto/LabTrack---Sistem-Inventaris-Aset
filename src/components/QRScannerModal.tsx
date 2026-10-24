import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { InventoryItem, LoanTransaction } from '../types/inventory';
import {
  Camera,
  X,
  RefreshCw,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Keyboard,
} from 'lucide-react';

interface QRScannerModalProps {
  items: InventoryItem[];
  loans: LoanTransaction[];
  onClose: () => void;
  onInitiateBorrow: (item: InventoryItem) => void;
  onInitiateReturn: (item: InventoryItem, loan?: LoanTransaction) => void;
  onViewItemDetail: (item: InventoryItem) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  items,
  loans,
  onClose,
  onInitiateBorrow,
  onInitiateReturn,
  onViewItemDetail,
}) => {
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual' | 'file'>('camera');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [relatedLoans, setRelatedLoans] = useState<LoanTransaction[]>([]);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'qr-reader-container';

  // Sound beep helper using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz (A5)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext maybe blocked or not supported
    }
  };

  // Process any raw decoded string
  const processDecodedText = (decodedText: string) => {
    playBeep();
    setScannedCode(decodedText);

    let extractedCode = decodedText.trim();
    // Check if json
    if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.code) extractedCode = parsed.code;
      } catch (e) {
        // Fallback to raw text
      }
    }

    // Match in inventory
    const found = items.find(
      (it) =>
        it.code.toLowerCase() === extractedCode.toLowerCase() ||
        it.id.toLowerCase() === extractedCode.toLowerCase() ||
        it.serialNumber?.toLowerCase() === extractedCode.toLowerCase()
    );

    if (found) {
      setMatchedItem(found);
      setScannerError(null);

      // Check for active loans of this item
      const activeLoans = loans.filter(
        (l) => l.itemId === found.id && (l.status === 'Dipinjam' || l.status === 'Terlambat')
      );
      setRelatedLoans(activeLoans);
    } else {
      setMatchedItem(null);
      setRelatedLoans([]);
      setScannerError(`Kode "${extractedCode}" tidak terdaftar dalam database inventaris.`);
    }
  };

  // Start Camera
  useEffect(() => {
    if (scannerMode !== 'camera') return;

    let html5QrCode: Html5Qrcode;

    const startCamera = async () => {
      try {
        setScannerError(null);
        html5QrCode = new Html5Qrcode(readerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
          ],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            processDecodedText(decodedText);
          },
          () => {
            // scan failure callback (ignored per-frame)
          }
        );
        setCameraActive(true);
      } catch (err: any) {
        console.warn('Camera failed:', err);
        setCameraActive(false);
        setScannerError(
          'Tidak dapat mengakses kamera. Periksa izin akses kamera browser atau gunakan mode input manual / unggah foto.'
        );
      }
    };

    startCamera();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {}).then(() => {
          scannerRef.current?.clear();
        });
      }
    };
  }, [scannerMode]);

  // Handle manual code submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processDecodedText(manualInput.trim());
  };

  // Handle File Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError(null);
      const scanner = new Html5Qrcode('qr-file-dummy');
      const result = await scanner.scanFile(file, true);
      processDecodedText(result);
    } catch (err: any) {
      setScannerError('Tidak dapat mendeteksi QR Code dari gambar yang diunggah.');
    }
  };

  const handleResetScan = () => {
    setScannedCode('');
    setMatchedItem(null);
    setRelatedLoans([]);
    setScannerError(null);
    setManualInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                QR Scanner Masuk / Keluar Lab
              </h3>
              <p className="text-xs text-slate-500">
                Pindai stiker QR pada alat untuk peminjaman cepat atau pengembalian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Mode Buttons */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1">
          <button
            onClick={() => {
              setScannerMode('camera');
              handleResetScan();
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              scannerMode === 'camera'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Kamera Langsung
          </button>
          <button
            onClick={() => {
              setScannerMode('manual');
              handleResetScan();
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              scannerMode === 'manual'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Input Kode / USB Scanner
          </button>
          <button
            onClick={() => {
              setScannerMode('file');
              handleResetScan();
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              scannerMode === 'file'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Unggah Foto
          </button>
        </div>

        {/* Scanner View Area */}
        <div className="p-4 sm:p-6 bg-slate-50 flex flex-col items-center">
          {scannerMode === 'camera' && (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-[320px] aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner border-2 border-indigo-500/40">
                <div id={readerElementId} className="w-full h-full"></div>
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                    <Camera className="w-10 h-10 mb-2 animate-pulse text-indigo-400" />
                    <span className="text-xs">Mengaktifkan kamera...</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Arahkan kamera ke stiker QR code inventaris pada fisik barang
              </p>
            </div>
          )}

          {scannerMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="w-full max-w-md py-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Masukkan Kode Inventaris / Scan dengan USB Barcode Scanner
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Contoh: LABKOMP/PC/001"
                  autoFocus
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow transition"
                >
                  Cari
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-xs text-slate-400">Contoh cepat:</span>
                {items.slice(0, 3).map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      setManualInput(it.code);
                      processDecodedText(it.code);
                    }}
                    className="text-[11px] bg-slate-200 hover:bg-indigo-100 hover:text-indigo-700 px-2 py-0.5 rounded text-slate-700 font-mono transition"
                  >
                    {it.code}
                  </button>
                ))}
              </div>
            </form>
          )}

          {scannerMode === 'file' && (
            <div className="w-full max-w-md py-6 flex flex-col items-center">
              <div id="qr-file-dummy" className="hidden"></div>
              <label className="w-full border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-indigo-50/30 transition text-center">
                <Upload className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  Pilih Foto / Screenshot QR Code
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Format PNG, JPG, WEBP dari galeri perangkat
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Feedback error alert */}
          {scannerError && (
            <div className="w-full mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{scannerError}</div>
              <button
                onClick={handleResetScan}
                className="text-rose-500 hover:text-rose-800 font-semibold text-xs ml-1"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Scanned Result Card */}
          {matchedItem && (
            <div className="w-full mt-4 bg-white border-2 border-emerald-500 rounded-2xl p-4 shadow-lg animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-xs rounded">
                      {matchedItem.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-0.5">
                      {matchedItem.name}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={handleResetScan}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  title="Scan ulang"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Item Info Summary */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Kategori & Brand:</span>
                  <span className="font-semibold text-slate-800">
                    {matchedItem.brand} ({matchedItem.category})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lokasi Penyimpanan:</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {matchedItem.location}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Stok Tersedia:</span>
                  <span
                    className={`font-bold ${
                      matchedItem.availableStock > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {matchedItem.availableStock} / {matchedItem.totalStock} {matchedItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kondisi Alat:</span>
                  <span className="font-semibold text-slate-800">{matchedItem.condition}</span>
                </div>
              </div>

              {/* Active Loans Indicator */}
              {relatedLoans.length > 0 && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Sedang Dipinjam ({relatedLoans.length} transaksi aktif):
                  </div>
                  <ul className="mt-1 space-y-1 pl-4 list-disc text-[11px]">
                    {relatedLoans.map((l) => (
                      <li key={l.id}>
                        <strong>{l.borrowerName}</strong> ({l.borrowerClassOrDept}) - {l.quantity} unit, tempo: {l.expectedReturnDate}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: Scan Keluar (Pinjam) / Scan Masuk (Kembali) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onInitiateBorrow(matchedItem);
                    onClose();
                  }}
                  disabled={matchedItem.availableStock <= 0}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Scan Keluar (Pinjamkan)</span>
                </button>

                <button
                  onClick={() => {
                    const firstLoan = relatedLoans[0];
                    onInitiateReturn(matchedItem, firstLoan);
                    onClose();
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Scan Masuk (Kembalikan)</span>
                </button>

                <button
                  onClick={() => {
                    onViewItemDetail(matchedItem);
                    onClose();
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition"
                >
                  Detail
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Kamera terenkripsi & berjalan langsung di peramban (client-side).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
