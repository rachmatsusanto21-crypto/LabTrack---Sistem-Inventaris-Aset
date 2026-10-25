import React, { useState } from 'react';
import { SchoolProfile } from '../../types/inventory';
import { LOGO_PEMKOT_MALANG_SVG, LOGO_TUT_WURI_SVG } from '../../data/initialData';
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
  Shield,
  Eye,
  Check,
} from 'lucide-react';

interface SchoolProfileEditorProps {
  profile: SchoolProfile;
  onSave: (updated: SchoolProfile) => void;
}

export const SchoolProfileEditor: React.FC<SchoolProfileEditorProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<SchoolProfile>({
    ...profile,
    pemkotLogoUrl: profile.pemkotLogoUrl || LOGO_PEMKOT_MALANG_SVG,
    showPemkotLogo: profile.showPemkotLogo !== false,
    logoUrl: profile.logoUrl || LOGO_TUT_WURI_SVG,
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [pemkotPreview, setPemkotPreview] = useState<string>(
    profile.pemkotLogoUrl || LOGO_PEMKOT_MALANG_SVG
  );
  const [schoolLogoPreview, setSchoolLogoPreview] = useState<string>(
    profile.logoUrl || LOGO_TUT_WURI_SVG
  );

  const handleChange = (field: keyof SchoolProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePemkotLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo Pemkot maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPemkotPreview(result);
      setFormData((prev) => ({ ...prev, pemkotLogoUrl: result, showPemkotLogo: true }));
    };
    reader.readAsDataURL(file);
  };

  const handleSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo sekolah maksimal 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSchoolLogoPreview(result);
      setFormData((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSetDefaultPemkotLogo = () => {
    setPemkotPreview(LOGO_PEMKOT_MALANG_SVG);
    setFormData((prev) => ({
      ...prev,
      pemkotLogoUrl: LOGO_PEMKOT_MALANG_SVG,
      showPemkotLogo: true,
    }));
  };

  const handleSetDefaultSchoolLogo = () => {
    setSchoolLogoPreview(LOGO_TUT_WURI_SVG);
    setFormData((prev) => ({ ...prev, logoUrl: LOGO_TUT_WURI_SVG }));
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

          <div className="flex items-center gap-2.5 shrink-0">
            {formData.showPemkotLogo && pemkotPreview && (
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-1.5 flex items-center justify-center" title="Logo Pemkot Malang">
                <img
                  src={pemkotPreview}
                  alt="Logo Pemkot Malang"
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
            )}
            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-1.5 flex items-center justify-center" title="Logo Sekolah / Tut Wuri">
              {schoolLogoPreview ? (
                <img
                  src={schoolLogoPreview}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain drop-shadow"
                />
              ) : (
                <Building2 className="w-8 h-8 text-blue-300 opacity-80" />
              )}
            </div>
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

        {/* Section Pengaturan Logo & Kop Surat Resmi (Standar Kota Malang) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Pengaturan Logo & Kop Surat Resmi Kedinasan
                </h3>
                <p className="text-xs text-slate-500">
                  Konfigurasi Lambang Pemkot Malang (sisi kiri) dan Logo Sekolah / Tut Wuri Handayani (sisi kanan)
                </p>
              </div>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition">
              <input
                type="checkbox"
                checked={formData.showPemkotLogo !== false}
                onChange={(e) => handleChange('showPemkotLogo', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer"
              />
              <span>Tampilkan Logo Pemkot di Kop</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. KONTROL LOGO PEMKOT MALANG (SISI KIRI KOP SURAT) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    1. Logo Pemerintah Kota Malang (Kiri Kop)
                  </h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                  Sisi Kiri
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-28 rounded-xl border-2 border-dashed border-blue-300 bg-white p-2 flex items-center justify-center shrink-0 shadow-inner">
                  {pemkotPreview ? (
                    <img
                      src={pemkotPreview}
                      alt="Logo Pemkot Malang"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center">Kosong</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={handleSetDefaultPemkotLogo}
                      className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Pasang Lambang Pemkot Malang</span>
                    </button>

                    <label className="w-full px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Unggah Logo Pemkot Sendiri</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePemkotLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={formData.pemkotLogoUrl || ''}
                      onChange={(e) => {
                        handleChange('pemkotLogoUrl', e.target.value);
                        setPemkotPreview(e.target.value);
                      }}
                      placeholder="Atau tempel URL gambar Web..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[11px] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. KONTROL LOGO SEKOLAH / TUT WURI (SISI KANAN KOP SURAT) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    2. Logo Satuan Pendidikan (Kanan Kop)
                  </h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  Sisi Kanan
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-24 h-28 rounded-xl border-2 border-dashed border-emerald-300 bg-white p-2 flex items-center justify-center shrink-0 shadow-inner">
                  {schoolLogoPreview ? (
                    <img
                      src={schoolLogoPreview}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center">Kosong</span>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={handleSetDefaultSchoolLogo}
                      className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Pasang Logo Tut Wuri / Dikbud</span>
                    </button>

                    <label className="w-full px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Unggah Logo Sekolah Sendiri</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSchoolLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={formData.logoUrl || ''}
                      onChange={(e) => {
                        handleChange('logoUrl', e.target.value);
                        setSchoolLogoPreview(e.target.value);
                      }}
                      placeholder="Atau tempel URL gambar Web..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[11px] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PRATINJAU LANGSUNG KOP SURAT (LIVE PREVIEW) */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Pratinjau Kop Surat Resmi pada Dokumen KIR & BAST:
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                {formData.showPemkotLogo !== false ? 'Mode Logo Ganda (Pemkot Kiri & Sekolah Kanan)' : 'Mode Logo Tunggal'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                {/* Logo Kiri (Pemkot) */}
                <div className="w-16 h-18 shrink-0 flex items-center justify-center">
                  {formData.showPemkotLogo !== false && pemkotPreview ? (
                    <img src={pemkotPreview} alt="Logo Pemkot" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-12 h-14 border border-dashed border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400">
                      Off
                    </div>
                  )}
                </div>

                {/* Teks Tengah */}
                <div className="flex-1 text-center">
                  <div className="text-[11px] uppercase font-bold tracking-wider text-slate-800">
                    {formData.government || 'PEMERINTAH KOTA MALANG'}
                  </div>
                  <div className="text-[12px] uppercase font-bold text-slate-900">
                    {formData.opd || 'DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG'}
                  </div>
                  <div className="text-[14px] font-black uppercase text-blue-950">
                    {formData.schoolName || 'SD NEGERI KAUMAN 1 KOTA MALANG'}
                  </div>
                  <div className="text-[9.5px] text-slate-600">
                    NPSN: {formData.npsn || '20533812'} • {formData.address || 'Kota Malang'}
                  </div>
                </div>

                {/* Logo Kanan (Sekolah) */}
                <div className="w-16 h-18 shrink-0 flex items-center justify-center">
                  {schoolLogoPreview ? (
                    <img src={schoolLogoPreview} alt="Logo Sekolah" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-12 h-14 border border-dashed border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400">
                      Off
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full h-0.5 bg-slate-900 mt-2"></div>
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
