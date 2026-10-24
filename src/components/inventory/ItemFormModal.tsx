import React, { useState } from 'react';
import { InventoryItem, ItemCondition, SIMBADA_MASTER_CODES } from '../../types/inventory';
import { X, Save, Package, Upload, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface ItemFormModalProps {
  initialItem?: InventoryItem | null;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  existingCount: number;
}

const CONDITIONS: { value: ItemCondition; label: string; desc: string; badgeClass: string }[] = [
  {
    value: 'B',
    label: 'B - Baik',
    desc: 'Barang utuh, normal dan berfungsi optimal',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    value: 'KB',
    label: 'KB - Kurang Baik',
    desc: 'Ada kerusakan ringan/aus tapi masih dapat difungsikan',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    value: 'RB',
    label: 'RB - Rusak Berat',
    desc: 'Mati total/tidak ekonomis diperbaiki (Usul hapus SIMBADA)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  initialItem,
  onClose,
  onSave,
  existingCount,
}) => {
  const isEditing = Boolean(initialItem);

  const [code, setCode] = useState<string>(initialItem?.code || SIMBADA_MASTER_CODES[0].code);
  const [registerNumber, setRegisterNumber] = useState<string>(() => {
    if (initialItem?.registerNumber) return initialItem.registerNumber;
    const seq = String(existingCount + 1).padStart(4, '0');
    return `Reg. ${seq}`;
  });
  const [name, setName] = useState<string>(initialItem?.name || 'PC Desktop Client');
  const [category, setCategory] = useState<string>(
    initialItem?.category || SIMBADA_MASTER_CODES[0].category
  );
  const [brand, setBrand] = useState<string>(initialItem?.brand || 'Asus Chromebook / Lenovo');
  const [specifications, setSpecifications] = useState<string>(
    initialItem?.specifications || 'Intel Celeron / Core i3, RAM 8GB, SSD 256GB, Layar 21.5"'
  );
  const [material, setMaterial] = useState<string>(initialItem?.material || 'Plastik / Logam');
  const [serialNumber, setSerialNumber] = useState<string>(initialItem?.serialNumber || '');
  const [location, setLocation] = useState<string>(
    initialItem?.location || 'Ruang Lab Komputer - Meja Siswa'
  );
  const [totalStock, setTotalStock] = useState<number>(initialItem?.totalStock ?? 1);
  const [availableStock, setAvailableStock] = useState<number>(initialItem?.availableStock ?? 1);
  const [borrowedStock, setBorrowedStock] = useState<number>(initialItem?.borrowedStock ?? 0);
  const [minStockAlert, setMinStockAlert] = useState<number>(initialItem?.minStockAlert ?? 1);
  const [unit, setUnit] = useState<string>(initialItem?.unit || 'Unit');
  const [condition, setCondition] = useState<ItemCondition>(initialItem?.condition || 'B');
  const [unitPrice, setUnitPrice] = useState<number>(initialItem?.unitPrice || 5000000);
  const [sourceOfFund, setSourceOfFund] = useState<string>(
    initialItem?.sourceOfFund || 'Bantuan DAK Fisik 2023'
  );
  const [purchaseYear, setPurchaseYear] = useState<number>(initialItem?.purchaseYear || 2023);
  const [imageUrl, setImageUrl] = useState<string>(initialItem?.imageUrl || '');
  const [notes, setNotes] = useState<string>(initialItem?.notes || '');

  // Handle master code selection
  const handleSelectMasterCode = (selectedCode: string) => {
    setCode(selectedCode);
    const found = SIMBADA_MASTER_CODES.find((m) => m.code === selectedCode);
    if (found) {
      setCategory(found.category);
      if (!name || name === 'PC Desktop Client') {
        setName(found.name);
      }
      if (!material || material === 'Plastik / Logam') {
        setMaterial(found.defaultMaterial);
      }
    }
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran foto maksimal 3MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const calculatedTotalPrice = totalStock * unitPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Nama barang dan Kode SIMBADA wajib diisi!');
      return;
    }

    onSave({
      code: code.trim(),
      registerNumber: registerNumber.trim() || 'Reg. 0001',
      name: name.trim(),
      category,
      brand: brand.trim(),
      specifications: specifications.trim(),
      material: material.trim(),
      serialNumber: serialNumber.trim() || undefined,
      location: location.trim(),
      totalStock: Number(totalStock),
      availableStock: Number(availableStock),
      borrowedStock: Number(borrowedStock),
      minStockAlert: Number(minStockAlert),
      unit: unit.trim(),
      condition,
      unitPrice: Number(unitPrice),
      totalPrice: Number(calculatedTotalPrice),
      sourceOfFund: sourceOfFund.trim(),
      purchaseYear: Number(purchaseYear),
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                {isEditing ? 'Ubah Data Inventaris Lab Komputer' : 'Form Input Barang Inventaris Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Standar Kodifikasi Barang Milik Daerah (Permendagri No. 108 / SIMBADA BKAD Kota Malang)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto text-xs sm:text-sm">
          
          {/* SECTION 1: MASTER KODE SIMBADA & IDENTITAS */}
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-indigo-950 uppercase tracking-wider text-xs">
                Pilih Kodefikasi SIMBADA (Permendagri 108 / BKAD Kota Malang)
              </label>
              <span className="text-[11px] text-indigo-600 font-semibold">Otomatisasi Kode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-xs mb-1 font-medium">
                  Rujukan Master Aset IT & Mebel Lab:
                </label>
                <select
                  value={code}
                  onChange={(e) => handleSelectMasterCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  {SIMBADA_MASTER_CODES.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs mb-1 font-medium">
                  No. Register Barang (SIMBADA):
                </label>
                <input
                  type="text"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  placeholder="Contoh: Reg. 0001 atau 0001 - 0015"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SPESIFIKASI & FOTO FISIK BARANG (SESUAI REQUEST USER) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Spesifikasi Barang (2 Kolom) */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Barang / Jenis Barang
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: PC Desktop Client (Asus C214)"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Merk / Tipe</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Asus / Lenovo / TP-Link / Chitose"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bahan Utama</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Plastik / Logam / Kayu / Besi"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Spesifikasi Teknis / Ukuran
                </label>
                <textarea
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  placeholder="Contoh: Intel Celeron N4020, RAM 8GB, SSD 256GB NVMe, Layar 21.5 Inch FHD"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Pabrik / No. Seri (Chasis)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="SN: 202310928XX atau -"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lokasi Ruangan</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ruang Lab Komputer - Baris Meja 1"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* BOX KHUSUS INSERT FOTO FISIK BARANG (Excel Box H12:I21 Standar) */}
            <div className="bg-sky-50/70 border-2 border-dashed border-sky-400 rounded-2xl p-4 flex flex-col justify-between text-center relative overflow-hidden">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                  Foto Fisik Barang Aset
                </span>
                <p className="text-[11px] text-sky-700">
                  Wajib untuk lampiran KIR dan BAP Penghapusan Aset
                </p>
              </div>

              <div className="my-2 h-36 w-full rounded-xl bg-white border border-sky-200 overflow-hidden flex items-center justify-center p-1 relative shadow-inner">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview Fisik Barang"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-[10px]">Belum ada foto</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Insert / Unggah Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-rose-600 hover:underline block mx-auto"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: KONDISI BARANG (B / KB / RB) STANDAR SIMBADA */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Kondisi Barang Saat Ini (Standar SIMBADA & BKAD)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CONDITIONS.map((cond) => {
                const isSelected = condition === cond.value;
                return (
                  <div
                    key={cond.value}
                    onClick={() => setCondition(cond.value)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? `${cond.badgeClass} ring-2 ring-indigo-400`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{cond.label}</span>
                      {isSelected && <span className="text-xs">✓</span>}
                    </div>
                    <p className="text-[10.5px] mt-1 opacity-90 leading-tight">{cond.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: JUMLAH, HARGA SATUAN, & NILAI ASET (RUMUS EXCEL SIMBADA) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">
                Jumlah Barang
              </label>
              <input
                type="number"
                min={1}
                value={totalStock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalStock(val);
                  setAvailableStock(val - borrowedStock);
                }}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">
                Harga Satuan (Rp)
              </label>
              <input
                type="number"
                min={0}
                step={50000}
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-semibold font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">
                Total Nilai Aset (=H*J)
              </label>
              <div className="px-3 py-1.5 border border-slate-300 rounded-lg bg-slate-100 font-bold font-mono text-indigo-700 truncate">
                Rp {calculatedTotalPrice.toLocaleString('id-ID')}
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-semibold mb-1">Satuan</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit / Buah / Set"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* SECTION 5: TAHUN PEROLEHAN, SUMBER ANGGARAN & CATATAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Perolehan</label>
              <input
                type="number"
                min={2000}
                max={2030}
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sumber Anggaran / Asal-Usul</label>
              <input
                type="text"
                value={sourceOfFund}
                onChange={(e) => setSourceOfFund(e.target.value)}
                placeholder="Bantuan DAK / BOS / APBD Kota Malang"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan Mutasi</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Bantuan DAK 2023 / Usul Hapus RB"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan Aset' : 'Simpan ke Inventaris Lab'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
