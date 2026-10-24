import React, { useState } from 'react';
import { SchoolProfile } from '../../types/inventory';
import {
  Building2,
  UserCheck,
  Award,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Save,
  RotateCcw,
  GraduationCap,
  Sparkles,
  MapPin,
  FileCode,
} from 'lucide-react';

interface SchoolProfileEditorProps {
  profile: SchoolProfile;
  onSave: (updated: SchoolProfile) => void;
}

export const SchoolProfileEditor: React.FC<SchoolProfileEditorProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string>(profile.logoUrl || '');

  const handleChange = (field: keyof SchoolProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setFormData((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSetMalangLogo = () => {
    const malangSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,5 92,28 92,72 50,95 8,72 8,28" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="4"/><circle cx="50" cy="50" r="30" fill="%23ffffff"/><text x="50" y="47" font-family="Arial" font-size="9" font-weight="bold" fill="%231e3a8a" text-anchor="middle">PEMKOT</text><text x="50" y="59" font-family="Arial" font-size="9" font-weight="bold" fill="%23b91c1c" text-anchor="middle">MALANG</text></svg>`;
    setLogoPreview(malangSvg);
    setFormData((prev) => ({ ...prev, logoUrl: malangSvg }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-1 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-lg text-xs font-semibold uppercase tracking-wider inline-block">
              Standar SIMBADA & BKAD Kota Malang
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Profil Satuan Pendidikan & Pejabat Aset
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Identitas ini digunakan secara otomatis pada Kop Surat Resmi, Kartu Inventaris Ruangan (KIR), Lembar BAST, Berita Acara Pemeriksaan (BAP), dan Stiker Label SIMBADA.
            </p>
          </div>

          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-2 flex items-center justify-center shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo Sekolah"
                className="w-full h-full object-contain drop-shadow"
              />
            ) : (
              <Building2 className="w-10 h-10 text-blue-300 opacity-80" />
            )}
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Profil sekolah dan pejabat pengelola aset berhasil disimpan!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Identitas Instansi & OPD Kota Malang */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Identitas Instansi & Unit Kerja</h3>
              <p className="text-xs text-slate-500">Pemerintah Kota Malang dan Satuan Pendidikan Sekolah Dasar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pemerintah Daerah</label>
              <input
                type="text"
                value={formData.government}
                onChange={(e) => handleChange('government', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organisasi Perangkat Daerah (OPD)</label>
              <input
                type="text"
                value={formData.opd}
                onChange={(e) => handleChange('opd', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Satuan Pendidikan (Sekolah)</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                placeholder="SD NEGERI KAUMAN 1 KOTA MALANG"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-extrabold text-blue-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            {/* KODE LOKASI RUANGAN SIMBADA */}
            <div>
              <label className="block font-bold text-blue-900 mb-1 flex items-center gap-1">
                <FileCode className="w-4 h-4 text-blue-600" />
                Kode Lokasi Ruangan (SIMBADA)
              </label>
              <input
                type="text"
                value={formData.roomLocationCode}
                onChange={(e) => handleChange('roomLocationCode', e.target.value)}
                placeholder="12.03.25.01.01.01.01.05"
                required
                className="w-full px-3.5 py-2.5 border-2 border-blue-300 bg-blue-50/50 rounded-xl font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Kode lokasi ruangan sesuai DPA/SIMBADA BKAD Kota Malang
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Nama Ruangan</label>
              <input
                type="text"
                value={formData.labName}
                onChange={(e) => handleChange('labName', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Sekolah</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Format Awalan Nomor Surat (Prefix)</label>
              <input
                type="text"
                value={formData.letterPrefix}
                onChange={(e) => handleChange('letterPrefix', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section Logo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Logo Resmi Instansi</h3>
              <p className="text-xs text-slate-500">Muncul pada Kop Surat, Stiker SIMBADA, dan KIR</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-2">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-400">Belum ada logo</span>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap gap-2.5">
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer shadow flex items-center gap-2 transition">
                  <Upload className="w-4 h-4" />
                  <span>Unggah Logo (PNG / JPG)</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleSetMalangLogo}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Gunakan Lambang Pemkot Malang
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Atau masukkan URL Web Logo:
                </label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => {
                    handleChange('logoUrl', e.target.value);
                    setLogoPreview(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Pejabat Penandatangan Standar SIMBADA BKAD Malang (3 Pihak) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Pejabat Pengesahan Inventaris (Standar SIMBADA Kota Malang)
              </h3>
              <p className="text-xs text-slate-500">
                Wajib ditandatangani 3 pihak: Kepala Sekolah, Pengurus Barang, dan PJ Ruang Lab
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            {/* Kepala Sekolah */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Kepala SD Negeri</span>
              </div>
              <div>
                <label className="block text-slate-600 text-xs mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={formData.headmasterName}
                  onChange={(e) => handleChange('headmasterName', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs mb-1">NIP</label>
                <input
                  type="text"
                  value={formData.headmasterNip}
                  onChange={(e) => handleChange('headmasterNip', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Pengurus / Pengelola Barang Sekolah */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Award className="w-4 h-4 text-blue-700" />
                <span>Pengurus Barang Sekolah</span>
              </div>
              <div>
                <label className="block text-slate-600 text-xs mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.propertyOfficerName}
                  onChange={(e) => handleChange('propertyOfficerName', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs mb-1">NIP</label>
                <input
                  type="text"
                  value={formData.propertyOfficerNip}
                  onChange={(e) => handleChange('propertyOfficerNip', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Penanggung Jawab Ruangan Lab */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Penanggung Jawab Lab Komputer</span>
              </div>
              <div>
                <label className="block text-slate-600 text-xs mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.labHeadName}
                  onChange={(e) => handleChange('labHeadName', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-xs mb-1">NIP</label>
                <input
                  type="text"
                  value={formData.labHeadNip}
                  onChange={(e) => handleChange('labHeadNip', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Data Profil & Pengesahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
