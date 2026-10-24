import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { InventoryItem, SchoolProfile } from '../types/inventory';
import { Printer, CheckSquare, Square, X, QrCode, Tag, SlidersHorizontal } from 'lucide-react';

interface QRLabelPrinterProps {
  items: InventoryItem[];
  schoolProfile: SchoolProfile;
  initialSelectedItemIds?: string[];
  onClose: () => void;
}

export const QRLabelPrinter: React.FC<QRLabelPrinterProps> = ({
  items,
  schoolProfile,
  initialSelectedItemIds,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedItemIds && initialSelectedItemIds.length > 0
      ? initialSelectedItemIds
      : items.map((i) => i.id)
  );

  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [columns, setColumns] = useState<2 | 3>(2);

  // Generate QR code data URLs for all items
  useEffect(() => {
    const generateQRs = async () => {
      const mapping: Record<string, string> = {};
      for (const item of items) {
        try {
          const qrPayload = JSON.stringify({
            app: 'SIMBADA_MALANG',
            lokasi: schoolProfile.roomLocationCode || '12.03.25.01.01.01.01.05',
            kode: item.code,
            reg: item.registerNumber || 'Reg. 0001',
            nama: item.name,
            thn: item.purchaseYear,
          });

          const url = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 256,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
          });
          mapping[item.id] = url;
        } catch (err) {
          console.error('Failed to generate QR for', item.code, err);
        }
      }
      setQrImages(mapping);
    };

    generateQRs();
  }, [items, schoolProfile]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(items.map((i) => i.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedItems = items.filter((i) => selectedIds.includes(i.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Header - Hidden on Print */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                Cetak Stiker Label SIMBADA Fisik (Standar Kota Malang)
              </h2>
              <p className="text-xs text-slate-500">
                Ukuran standar 7x3 cm / 8x4 cm untuk ditempelkan pada fisik unit PC, Chromebook, UPS, Switch & Projector
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

        {/* Toolbar - Hidden on Print */}
        <div className="no-print px-4 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              Pilih Semua ({items.length})
            </button>
            <button
              onClick={deselectAll}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 flex items-center gap-1.5 hover:bg-slate-50"
            >
              <Square className="w-3.5 h-3.5" />
              Batal Pilih
            </button>
            <span className="text-slate-500 ml-1">
              Terpilih: <strong className="text-blue-700 font-bold">{selectedIds.length}</strong> stiker
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5">
              <span className="px-2 text-slate-500 text-xs">Format:</span>
              <button
                onClick={() => setColumns(2)}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  columns === 2 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                2 Kolom (Standar)
              </button>
              <button
                onClick={() => setColumns(3)}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  columns === 3 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                3 Kolom (Kompak)
              </button>
            </div>

            <button
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Ctrl+P)</span>
            </button>
          </div>
        </div>

        {/* Printable Labels Canvas */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100 print:bg-white print:p-0">
          {selectedItems.length === 0 ? (
            <div className="no-print p-12 text-center text-slate-400">
              <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Belum ada barang yang dipilih untuk dicetak.</p>
            </div>
          ) : (
            <div
              className={`grid gap-4 print:gap-3 ${
                columns === 2
                  ? 'grid-cols-1 sm:grid-cols-2 print:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-3 print:grid-cols-3'
              }`}
            >
              {selectedItems.map((item) => {
                const qrUrl = qrImages[item.id];
                const isSelected = selectedIds.includes(item.id);

                return (
                  /* EXACT STANDAR STIKER LABEL SIMBADA KOTA MALANG */
                  <div
                    key={item.id}
                    className="relative bg-white border-2 border-slate-900 rounded-lg p-2.5 print:p-2 shadow-xs page-break-inside-avoid print:shadow-none print:border-black font-sans text-slate-900"
                  >
                    {/* Checkbox (Hidden on print) */}
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="no-print absolute top-1.5 right-1.5 text-blue-600"
                      title="Klik untuk memilih"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    {/* Stiker Header Pemkot Malang */}
                    <div className="border-b border-slate-900 pb-1 mb-1.5 text-center">
                      <div className="text-[9.5px] font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
                        {schoolProfile.government || 'PEMERINTAH KOTA MALANG'}
                      </div>
                      <div className="text-[8.5px] font-bold text-slate-800 uppercase leading-tight">
                        {schoolProfile.opd || 'DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG'}
                      </div>
                      <div className="text-[9px] font-extrabold text-blue-900 uppercase">
                        {schoolProfile.schoolName || 'SD NEGERI KAUMAN 1 KOTA MALANG'}
                      </div>
                    </div>

                    {/* Stiker Content: Detail + QR Code */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0 text-[9px] space-y-0.5 leading-tight font-mono">
                        <div className="flex">
                          <span className="w-20 text-slate-600 shrink-0 font-sans font-semibold">KODE LOKASI</span>
                          <span>: <strong>{schoolProfile.roomLocationCode || '12.03.25.01.01.01.01.05'}</strong></span>
                        </div>
                        <div className="flex">
                          <span className="w-20 text-slate-600 shrink-0 font-sans font-semibold">KODE BARANG</span>
                          <span>: <strong className="text-blue-900">{item.code}</strong></span>
                        </div>
                        <div className="flex">
                          <span className="w-20 text-slate-600 shrink-0 font-sans font-semibold">NAMA BARANG</span>
                          <span className="font-sans font-bold truncate">: {item.name}</span>
                        </div>
                        <div className="flex">
                          <span className="w-20 text-slate-600 shrink-0 font-sans font-semibold">THN / NO. REG</span>
                          <span>: {item.purchaseYear} / <strong>{item.registerNumber || 'Reg. 0001'}</strong></span>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="w-16 h-16 shrink-0 bg-white border border-slate-300 rounded p-0.5 flex items-center justify-center">
                        {qrUrl ? (
                          <img
                            src={qrUrl}
                            alt={`QR ${item.code}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[8px] text-slate-400">QR</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="mt-1 pt-0.5 border-t border-dashed border-slate-400 text-center text-[7px] font-bold text-slate-700 tracking-tighter uppercase">
                      BARANG MILIK DAERAH (BMD) • SIMBADA KOTA MALANG
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="no-print p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Stiker siap dipotong dan ditempelkan pada fisik barang inventaris lab.</span>
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
