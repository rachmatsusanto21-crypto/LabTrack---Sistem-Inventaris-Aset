import * as XLSX from 'xlsx';
import { InventoryItem, SchoolProfile, SIMBADA_MASTER_CODES } from '../types/inventory';

/**
 * Exports inventory data to a multi-worksheet Excel (.xlsx) file
 * formatted according to Dinas Pendidikan dan Kebudayaan Kota Malang
 * and BKAD SIMBADA standards.
 */
export function exportKIRToExcel(
  inventory: InventoryItem[],
  schoolProfile: SchoolProfile
) {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // SHEET 1: KIR Lab Komputer
  // ==========================================
  const startRow = 12; // 1-indexed Excel row for first data item
  const endRow = startRow + inventory.length - 1;

  // Build grid data row by row
  const wsData: any[][] = [
    ['PEMERINTAH KOTA MALANG'],
    [schoolProfile.opd ? schoolProfile.opd.toUpperCase() : 'DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG'],
    [schoolProfile.schoolName ? schoolProfile.schoolName.toUpperCase() : 'SD NEGERI KAUMAN 1 KOTA MALANG'],
    ['KARTU INVENTARIS RUANGAN (KIR)'],
    [],
    ['OPD', ':', schoolProfile.opd || 'Dinas Pendidikan dan Kebudayaan Kota Malang'],
    ['Unit / Sub Unit', ':', schoolProfile.schoolName || 'SD Negeri Kauman 1 Kota Malang'],
    ['Ruangan', ':', schoolProfile.labName || 'Ruang Laboratorium Komputer'],
    ['Kode Lokasi Ruangan', ':', schoolProfile.roomLocationCode || '12.03.25.01.01.01.01.05'],
    [],
    [
      'No',
      'Kode Barang (SIMBADA)',
      'No. Register',
      'Nama Barang / Jenis Barang',
      'Merk / Tipe',
      'No. Pabrik / Seri',
      'Bahan',
      'Tahun Perolehan',
      'Jumlah (Unit)',
      'Nilai Total (Rp)',
      'Kondisi Barang',
      'Keterangan / Mutasi'
    ]
  ];

  // Populate inventory rows
  inventory.forEach((item, index) => {
    wsData.push([
      index + 1,
      item.code,
      item.registerNumber || `Reg. ${String(index + 1).padStart(4, '0')}`,
      item.name,
      item.brand,
      item.serialNumber || '-',
      item.material || '-',
      item.purchaseYear,
      item.totalStock,
      item.totalPrice || item.unitPrice * item.totalStock || 0,
      item.condition, // B, KB, RB
      item.notes || item.sourceOfFund || '-'
    ]);
  });

  // Total summary row with Excel formulas
  const totalRowIndex = endRow + 1; // 1-indexed
  wsData.push([
    '',
    'TOTAL FISIK & NILAI ASET',
    '',
    '',
    '',
    '',
    '',
    '',
    { t: 'n', f: `SUM(I${startRow}:I${endRow})` }, // Formula Sum Unit
    { t: 'n', f: `SUM(J${startRow}:J${endRow})` }, // Formula Sum Rupiah
    '',
    ''
  ]);

  // Blank row
  wsData.push([]);

  // Automated Rekapitulasi Kondisi Barang (COUNTIF formulas)
  wsData.push(['REKAPITULASI KONDISI BARANG (STANDAR SIMBADA):']);
  wsData.push([
    'Baik (B)',
    { t: 'n', f: `COUNTIF(K${startRow}:K${endRow}, "B")` },
    'Jenis Aset',
    'Keterangan: Utuh, normal & berfungsi optimal'
  ]);
  wsData.push([
    'Kurang Baik (KB)',
    { t: 'n', f: `COUNTIF(K${startRow}:K${endRow}, "KB")` },
    'Jenis Aset',
    'Keterangan: Ada kerusakan ringan / perlu perbaikan'
  ]);
  wsData.push([
    'Rusak Berat (RB)',
    { t: 'n', f: `COUNTIF(K${startRow}:K${endRow}, "RB")` },
    'Jenis Aset',
    'Keterangan: Rusak total / usul penghapusan aset di SIMBADA'
  ]);

  // Blank rows for spacing
  wsData.push([]);
  wsData.push([]);

  // Signatory Block (3 Columns)
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  wsData.push([
    'Mengetahui,',
    '',
    '',
    '',
    'Pengurus / Pengelola Barang Sekolah,',
    '',
    '',
    '',
    `Malang, ${todayStr}`,
    '',
    'Penanggung Jawab Ruang Lab Komputer,'
  ]);
  wsData.push([
    `Kepala ${schoolProfile.schoolName}`,
    '',
    '',
    '',
    'Kota Malang',
    '',
    '',
    '',
    '',
    '',
    ''
  ]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([]);
  wsData.push([
    `( ${schoolProfile.headmasterName} )`,
    '',
    '',
    '',
    `( ${schoolProfile.propertyOfficerName} )`,
    '',
    '',
    '',
    '',
    '',
    `( ${schoolProfile.labHeadName} )`
  ]);
  wsData.push([
    `NIP. ${schoolProfile.headmasterNip}`,
    '',
    '',
    '',
    `NIP. ${schoolProfile.propertyOfficerNip}`,
    '',
    '',
    '',
    '',
    '',
    `NIP. ${schoolProfile.labHeadNip}`
  ]);

  const wsKIR = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for beautiful layout
  wsKIR['!cols'] = [
    { wch: 6 },  // No
    { wch: 24 }, // Kode Barang
    { wch: 16 }, // No. Register
    { wch: 32 }, // Nama Barang
    { wch: 26 }, // Merk / Tipe
    { wch: 20 }, // No. Pabrik / Seri
    { wch: 18 }, // Bahan
    { wch: 14 }, // Tahun
    { wch: 14 }, // Jumlah (Unit)
    { wch: 18 }, // Nilai Total (Rp)
    { wch: 15 }, // Kondisi
    { wch: 30 }, // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, wsKIR, 'KIR Lab Komputer');

  // ==========================================
  // SHEET 2: Master Kode SIMBADA
  // ==========================================
  const masterData: any[][] = [
    ['MASTER KODEFIKASI ASET BARANG MILIK DAERAH (PERMENDAGRI NO. 108 / SIMBADA KOTA MALANG)'],
    ['Peralatan & Mebel Khusus Laboratorium Komputer Sekolah Dasar'],
    [],
    ['No', 'Kode Barang (SIMBADA)', 'Nama / Jenis Barang', 'Kelompok Utama SIMBADA', 'Standar Bahan']
  ];

  SIMBADA_MASTER_CODES.forEach((m, idx) => {
    masterData.push([
      idx + 1,
      m.code,
      m.name,
      m.category,
      m.defaultMaterial
    ]);
  });

  const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
  wsMaster['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 34 },
    { wch: 38 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master Kode SIMBADA');

  // ==========================================
  // SHEET 3: Template Stiker Label
  // ==========================================
  const stikerData: any[][] = [
    ['TEMPLATE DATA STIKER FISIK INVENTARIS SIMBADA KOTA MALANG'],
    ['Ukuran Cetak Fisik: 7 cm x 3 cm atau 8 cm x 4 cm'],
    [],
    ['No', 'Kode Lokasi Ruangan', 'Kode Barang', 'No. Register', 'Nama Aset', 'Tahun', 'Teks Label Gabungan (=Formula)']
  ];

  inventory.forEach((item, idx) => {
    const rowIdx = idx + 4; // 1-indexed in Excel
    stikerData.push([
      idx + 1,
      schoolProfile.roomLocationCode || '12.03.25.01.01.01.01.05',
      item.code,
      item.registerNumber || `Reg. ${String(idx + 1).padStart(4, '0')}`,
      item.name,
      item.purchaseYear,
      { t: 's', f: `B${rowIdx} & " | " & C${rowIdx} & " | " & D${rowIdx} & " | " & E${rowIdx}` }
    ]);
  });

  const wsStiker = XLSX.utils.aoa_to_sheet(stikerData);
  wsStiker['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 24 },
    { wch: 16 },
    { wch: 32 },
    { wch: 12 },
    { wch: 65 },
  ];
  XLSX.utils.book_append_sheet(wb, wsStiker, 'Template Stiker Label');

  // Generate file download
  const cleanSchoolName = (schoolProfile.schoolName || 'SDN')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const fileName = `KIR_Lab_Komputer_${cleanSchoolName}_Malang_${new Date().getFullYear()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
