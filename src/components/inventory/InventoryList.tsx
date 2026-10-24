import React, { useState, useMemo } from 'react';
import { InventoryItem, ItemCondition } from '../../types/inventory';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Edit,
  Trash2,
  ArrowUpRight,
  Printer,
  CheckSquare,
  Square,
  AlertTriangle,
  Layers,
  LayoutGrid,
  List,
  Eye,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  onAddNew: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onBorrowItem: (item: InventoryItem) => void;
  onPrintSingleQR: (item: InventoryItem) => void;
  onPrintBatchQR: (itemIds: string[]) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onAddNew,
  onEditItem,
  onDeleteItem,
  onBorrowItem,
  onPrintSingleQR,
  onPrintBatchQR,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [detailedItem, setDetailedItem] = useState<InventoryItem | null>(null);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchLowStock = !showLowStockOnly || item.availableStock <= item.minStockAlert;

      return matchSearch && matchCategory && matchCondition && matchLowStock;
    });
  }, [items, searchTerm, selectedCategory, selectedCondition, showLowStockOnly]);

  const toggleSelect = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItemIds(filteredItems.map((i) => i.id));
  };

  const deselectAll = () => {
    setSelectedItemIds([]);
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));

  // Total valuation calculation
  const totalValuation = filteredItems.reduce(
    (sum, i) => sum + (i.totalPrice || i.unitPrice * i.totalStock || 0),
    0
  );

  return (
    <div className="space-y-5">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Daftar Inventaris Ruang Lab Komputer
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold font-mono">
              SIMBADA BKAD
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan aset tetap dan barang bergerak (Permendagri No. 108/2016 & Standar Pemkot Malang)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedItemIds.length > 0 && (
            <button
              onClick={() => onPrintBatchQR(selectedItemIds)}
              className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-100 flex items-center gap-2 transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Cetak Label SIMBADA ({selectedItemIds.length})</span>
            </button>
          )}

          <button
            onClick={() => onPrintBatchQR(filteredItems.map((i) => i.id))}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Semua Stiker Fisik</span>
          </button>

          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Barang Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode SIMBADA (1.3.2...), register, nama aset, merk..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Kelompok SIMBADA ({items.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Condition Filter Standar SIMBADA */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Kondisi Fisik</option>
            <option value="B">B - Baik (Kelaikan Normal)</option>
            <option value="KB">KB - Kurang Baik (Perlu Servis)</option>
            <option value="RB">RB - Rusak Berat (Usul Hapus)</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
              title="Tampilan Tabel KIR"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Filter Badges & Financial Value Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition ${
                showLowStockOnly
                  ? 'bg-rose-100 border-rose-300 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Stok Kritis Saja</span>
            </button>

            <span className="text-slate-500">
              Menampilkan <strong>{filteredItems.length}</strong> jenis aset • Total Nilai:{' '}
              <strong className="text-indigo-700 font-mono font-bold">
                Rp {totalValuation.toLocaleString('id-ID')}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Pilih Semua
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={deselectAll}
              className="text-xs text-slate-500 hover:underline"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      {/* Item Display: Table or Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-500" />
          <h4 className="font-bold text-slate-700 text-base">Tidak ada barang yang cocok</h4>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan kata kunci pencarian atau filter kondisi fisik barang.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8 text-center">
                    <button
                      onClick={() =>
                        selectedItemIds.length === filteredItems.length ? deselectAll() : selectAll()
                      }
                      title="Pilih semua yang difilter"
                    >
                      {selectedItemIds.length > 0 &&
                      selectedItemIds.length === filteredItems.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-14 text-center">Foto</th>
                  <th className="py-3 px-3 w-36">Kode SIMBADA</th>
                  <th className="py-3 px-3">Nama Barang & Spesifikasi</th>
                  <th className="py-3 px-3">Bahan</th>
                  <th className="py-3 px-3 text-center">Thn</th>
                  <th className="py-3 px-3 text-center">Jumlah</th>
                  <th className="py-3 px-3 text-right">Nilai Total (Rp)</th>
                  <th className="py-3 px-3 text-center">Kondisi</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  const isLow = item.availableStock <= item.minStockAlert;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button onClick={() => toggleSelect(item.id)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Foto Fisik Aset Thumbnail */}
                      <td className="py-2 px-2 text-center">
                        <div
                          onClick={() => setDetailedItem(item)}
                          className="w-11 h-11 mx-auto rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-80 transition"
                          title="Klik untuk melihat foto lebih besar"
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400 opacity-50" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] block w-fit">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          {item.registerNumber || 'Reg. 0001'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {item.brand} • {item.specifications}
                        </div>
                        {item.serialNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.serialNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600 text-[11px]">{item.material || '-'}</td>

                      <td className="py-3 px-3 text-center text-slate-600">{item.purchaseYear}</td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-900 text-xs">
                          {item.totalStock} {item.unit}
                        </span>
                        {item.borrowedStock > 0 && (
                          <span className="block text-[10px] text-amber-600 font-medium">
                            ({item.borrowedStock} dipinjam)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                        Rp {(item.totalPrice || item.unitPrice * item.totalStock || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                            item.condition === 'B'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.condition === 'KB'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                          title={
                            item.condition === 'B'
                              ? 'Baik'
                              : item.condition === 'KB'
                              ? 'Kurang Baik'
                              : 'Rusak Berat (Usul Hapus SIMBADA)'
                          }
                        >
                          {item.condition}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPrintSingleQR(item)}
                            title="Cetak Stiker Label SIMBADA"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onBorrowItem(item)}
                            disabled={item.availableStock <= 0}
                            title="Pinjamkan Alat Ini"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 rounded-lg transition"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDetailedItem(item)}
                            title="Lihat Detail & Foto"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditItem(item)}
                            title="Ubah Data"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus ${item.name} (${item.code}) dari inventaris?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            title="Hapus"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition relative ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                      {item.code}
                    </span>
                    <button onClick={() => toggleSelect(item.id)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Photo & Title */}
                  <div className="flex gap-3 mt-3 items-start">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400 opacity-40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.registerNumber || 'Reg. 0001'}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-2">
                    {item.specifications}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bahan / Asal:</span>
                      <span className="font-medium truncate max-w-[150px]">{item.material}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kondisi:</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          item.condition === 'B'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.condition === 'KB'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.condition === 'B'
                          ? 'Baik'
                          : item.condition === 'KB'
                          ? 'Kurang Baik'
                          : 'Rusak Berat'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Nilai:</span>
                      <span className="font-bold text-indigo-700 font-mono">
                        Rp {(item.totalPrice || item.unitPrice * item.totalStock || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onPrintSingleQR(item)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Label SIMBADA</span>
                  </button>

                  <button
                    onClick={() => onBorrowItem(item)}
                    disabled={item.availableStock <= 0}
                    className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Pinjam</span>
                  </button>

                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal with Large Photo Display */}
      {detailedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-0.5 rounded">
                  {detailedItem.code}
                </span>
                <span className="ml-2 font-mono text-xs text-slate-500 font-semibold">
                  {detailedItem.registerNumber}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">{detailedItem.name}</h3>
              </div>
              <button
                onClick={() => setDetailedItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Large Physical Photo Display */}
            <div className="w-full h-52 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-2 relative shadow-inner">
              {detailedItem.imageUrl ? (
                <img
                  src={detailedItem.imageUrl}
                  alt={detailedItem.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <ImageIcon className="w-10 h-10 mx-auto mb-1 opacity-40" />
                  Belum ada foto fisik yang disematkan
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 border-t border-b border-slate-100 py-3">
              <div><strong>Kelompok SIMBADA:</strong> {detailedItem.category}</div>
              <div><strong>Merk / Tipe:</strong> {detailedItem.brand}</div>
              <div className="col-span-2"><strong>Spesifikasi:</strong> {detailedItem.specifications}</div>
              <div><strong>Bahan Utama:</strong> {detailedItem.material}</div>
              <div><strong>No. Seri / Pabrik:</strong> {detailedItem.serialNumber || '-'}</div>
              <div><strong>Lokasi Ruangan:</strong> {detailedItem.location}</div>
              <div>
                <strong>Kondisi:</strong>{' '}
                <span className="font-bold text-indigo-700">
                  {detailedItem.condition === 'B'
                    ? 'B (Baik)'
                    : detailedItem.condition === 'KB'
                    ? 'KB (Kurang Baik)'
                    : 'RB (Rusak Berat - Usul Hapus)'}
                </span>
              </div>
              <div><strong>Total Stok:</strong> {detailedItem.totalStock} {detailedItem.unit}</div>
              <div><strong>Harga Satuan:</strong> Rp {detailedItem.unitPrice?.toLocaleString('id-ID')}</div>
              <div><strong>Total Nilai:</strong> Rp {detailedItem.totalPrice?.toLocaleString('id-ID')}</div>
              <div><strong>Asal-Usul Dana:</strong> {detailedItem.sourceOfFund} ({detailedItem.purchaseYear})</div>
              <div><strong>Catatan:</strong> {detailedItem.notes || '-'}</div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => {
                  onPrintSingleQR(detailedItem);
                  setDetailedItem(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> Cetak Label SIMBADA
              </button>
              <button
                onClick={() => setDetailedItem(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
