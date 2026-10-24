/**
 * Google Apps Script & Google Sheets Integration Service
 * Provides complete GAS server-side code generator, offline queue management,
 * and live bidirectional synchronization via Web App deployment URL.
 */

import { InventoryItem, LoanTransaction, SchoolProfile, OfficialDocument } from '../types/inventory';

export interface SyncPayload {
  action: 'syncAll' | 'pushLocal' | 'pullRemote' | 'ping';
  inventory?: InventoryItem[];
  loans?: LoanTransaction[];
  schoolProfile?: SchoolProfile;
  documents?: OfficialDocument[];
  timestamp: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  inventory?: InventoryItem[];
  loans?: LoanTransaction[];
  schoolProfile?: SchoolProfile;
  documents?: OfficialDocument[];
  syncedAt?: string;
}

/**
 * Google Apps Script server-side code that the user pastes into script.google.com
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * SISTEM INVENTARIS LAB KOMPUTER & PEMINJAMAN - GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka Google Sheets baru di Google Drive Anda (misal: "Database Inventaris Lab Komputer").
 * 2. Klik menu "Ekstensi" -> "Apps Script".
 * 3. Hapus kode yang ada, lalu tempelkan (Paste) seluruh skrip di bawah ini.
 * 4. Klik tombol "Simpan" (ikon disket).
 * 5. Klik "Terapkan" (Deploy) -> "Penerapan Baru" (New Deployment).
 * 6. Pilih Jenis: "Aplikasi Web" (Web app).
 * 7. Deskripsi: "Backend LabTrack v1.0".
 * 8. Jalankan sebagai: "Saya" (Me).
 * 9. Yang memiliki akses: "Siapa saja" (Anyone) -> SANGAT PENTING agar Web App bisa sync!
 * 10. Klik "Terapkan", salin "URL Aplikasi Web" (Web app URL), dan tempelkan di aplikasi.
 * ==============================================================================
 */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureSheetStructure(ss);

    // Ambil parameter atau payload
    var postData = null;
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = null;
      }
    }

    var action = (postData && postData.action) || (e && e.parameter && e.parameter.action) || 'pullRemote';

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'Koneksi ke Google Sheets & Google Apps Script Berhasil Aktif!',
        spreadsheetName: ss.getName(),
        syncedAt: new Date().toISOString()
      });
    }

    // Aksi PUSH data dari aplikasi ke Google Sheets
    if (action === 'syncAll' || action === 'pushLocal') {
      if (postData.inventory) {
        writeInventorySheet(ss, postData.inventory);
      }
      if (postData.loans) {
        writeLoansSheet(ss, postData.loans);
      }
      if (postData.schoolProfile) {
        writeProfileSheet(ss, postData.schoolProfile);
      }
      if (postData.documents) {
        writeDocumentsSheet(ss, postData.documents);
      }

      logActivity(ss, 'SYNC_PUSH', 'Sinkronisasi data dari aplikasi LabTrack.');

      return jsonResponse({
        success: true,
        message: 'Data inventaris berhasil disinkronkan ke Google Sheets!',
        syncedAt: new Date().toISOString()
      });
    }

    // Aksi PULL data dari Google Sheets ke aplikasi
    var inventory = readInventorySheet(ss);
    var loans = readLoansSheet(ss);
    var schoolProfile = readProfileSheet(ss);
    var documents = readDocumentsSheet(ss);

    return jsonResponse({
      success: true,
      message: 'Data berhasil ditarik dari Google Sheets.',
      inventory: inventory,
      loans: loans,
      schoolProfile: schoolProfile,
      documents: documents,
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Terjadi kesalahan di Google Apps Script: ' + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Inisialisasi sheet & header jika belum ada
function ensureSheetStructure(ss) {
  var sheetNames = ['Inventaris_Barang', 'Peminjaman_Alat', 'Profil_Sekolah', 'Dokumen_BAST', 'Log_Aktivitas'];
  
  sheetNames.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      setupHeaders(sheet, name);
    }
  });
}

function setupHeaders(sheet, sheetName) {
  sheet.clear();
  var headers = [];
  if (sheetName === 'Inventaris_Barang') {
    headers = [
      'ID',
      'Kode SIMBADA',
      'No Register',
      'Nama Barang',
      'Kelompok SIMBADA',
      'Merk / Tipe',
      'Spesifikasi',
      'Bahan',
      'Nomor Seri',
      'Lokasi Ruangan',
      'Total Unit',
      'Stok Tersedia',
      'Stok Dipinjam',
      'Ambang Batas',
      'Satuan',
      'Kondisi (B/KB/RB)',
      'Harga Satuan (Rp)',
      'Total Nilai (Rp)',
      'Sumber Dana',
      'Tahun Perolehan',
      'Foto Fisik URL',
      'Keterangan Mutasi',
      'Terakhir Diperbarui'
    ];
  } else if (sheetName === 'Peminjaman_Alat') {
    headers = ['ID', 'No Peminjaman', 'ID Barang', 'Kode Barang', 'Nama Barang', 'Nama Peminjam', 'Tipe Peminjam', 'Kontak / No HP', 'Kelas / Bagian', 'Jumlah', 'Tgl Pinjam', 'Tgl Rencana Kembali', 'Tgl Realisasi Kembali', 'Status', 'Keperluan Praktikum', 'Catatan Pinjam', 'Kondisi Kembali', 'Catatan Kembali', 'Petugas Lab', 'Dibuat Pada'];
  } else if (sheetName === 'Profil_Sekolah') {
    headers = ['Kunci Parameter', 'Nilai'];
  } else if (sheetName === 'Dokumen_BAST') {
    headers = ['ID Dokumen', 'Jenis', 'Nomor Dokumen', 'Tanggal', 'Judul Dokumen', 'Pihak Pertama', 'NIP Pihak 1', 'Pihak Kedua', 'NIP Pihak 2', 'Instansi Pihak 2', 'Keperluan / Rincian', 'Dibuat Pada'];
  } else if (sheetName === 'Log_Aktivitas') {
    headers = ['Timestamp', 'Jenis Aktivitas', 'Keterangan'];
  }

  if (headers.length > 0) {
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setBackground('#1e293b');
    range.setFontColor('#ffffff');
    range.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function writeInventorySheet(ss, items) {
  var sheet = ss.getSheetByName('Inventaris_Barang');
  setupHeaders(sheet, 'Inventaris_Barang');
  if (!items || items.length === 0) return;

  var rows = items.map(function(item) {
    return [
      item.id,
      item.code,
      item.registerNumber || 'Reg. 0001',
      item.name,
      item.category,
      item.brand,
      item.specifications,
      item.material || '-',
      item.serialNumber || '-',
      item.location,
      item.totalStock,
      item.availableStock,
      item.borrowedStock,
      item.minStockAlert,
      item.unit,
      item.condition,
      item.unitPrice || 0,
      item.totalPrice || (item.unitPrice * item.totalStock) || 0,
      item.sourceOfFund,
      item.purchaseYear,
      item.imageUrl ? 'Data Terlampir' : '-',
      item.notes || '-',
      item.lastUpdated
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function readInventorySheet(ss) {
  var sheet = ss.getSheetByName('Inventaris_Barang');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 23).getValues();
  return data.map(function(row) {
    return {
      id: String(row[0]),
      code: String(row[1]),
      registerNumber: String(row[2]),
      name: String(row[3]),
      category: String(row[4]),
      brand: String(row[5]),
      specifications: String(row[6]),
      material: String(row[7]),
      serialNumber: String(row[8]),
      location: String(row[9]),
      totalStock: Number(row[10]),
      availableStock: Number(row[11]),
      borrowedStock: Number(row[12]),
      minStockAlert: Number(row[13]),
      unit: String(row[14]),
      condition: String(row[15]),
      unitPrice: Number(row[16]),
      totalPrice: Number(row[17]),
      sourceOfFund: String(row[18]),
      purchaseYear: Number(row[19]),
      imageUrl: '',
      notes: String(row[21]),
      lastUpdated: String(row[22])
    };
  });
}

function writeLoansSheet(ss, loans) {
  var sheet = ss.getSheetByName('Peminjaman_Alat');
  setupHeaders(sheet, 'Peminjaman_Alat');
  if (!loans || loans.length === 0) return;

  var rows = loans.map(function(l) {
    return [
      l.id,
      l.loanNumber,
      l.itemId,
      l.itemCode,
      l.itemName,
      l.borrowerName,
      l.borrowerType,
      l.borrowerContact,
      l.borrowerClassOrDept,
      l.quantity,
      l.borrowDate,
      l.expectedReturnDate,
      l.actualReturnDate || '-',
      l.status,
      l.purpose,
      l.loanNotes || '-',
      l.returnCondition || '-',
      l.returnNotes || '-',
      l.officerName,
      l.createdAt
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function readLoansSheet(ss) {
  var sheet = ss.getSheetByName('Peminjaman_Alat');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 20).getValues();
  return data.map(function(row) {
    return {
      id: String(row[0]),
      loanNumber: String(row[1]),
      itemId: String(row[2]),
      itemCode: String(row[3]),
      itemName: String(row[4]),
      borrowerName: String(row[5]),
      borrowerType: String(row[6]),
      borrowerContact: String(row[7]),
      borrowerClassOrDept: String(row[8]),
      quantity: Number(row[9]),
      borrowDate: String(row[10]),
      expectedReturnDate: String(row[11]),
      actualReturnDate: row[12] === '-' ? undefined : String(row[12]),
      status: String(row[13]),
      purpose: String(row[14]),
      loanNotes: String(row[15]),
      returnCondition: row[16] === '-' ? undefined : String(row[16]),
      returnNotes: String(row[17]),
      officerName: String(row[18]),
      createdAt: String(row[19])
    };
  });
}

function writeProfileSheet(ss, profile) {
  var sheet = ss.getSheetByName('Profil_Sekolah');
  sheet.clear();
  sheet.appendRow(['Kunci Parameter', 'Nilai']);
  var rows = [
    ['government', profile.government || 'PEMERINTAH KOTA MALANG'],
    ['opd', profile.opd || 'DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG'],
    ['schoolName', profile.schoolName],
    ['npsn', profile.npsn],
    ['roomLocationCode', profile.roomLocationCode || '12.03.25.01.01.01.01.05'],
    ['address', profile.address],
    ['phone', profile.phone],
    ['email', profile.email],
    ['website', profile.website],
    ['labName', profile.labName],
    ['headmasterName', profile.headmasterName],
    ['headmasterNip', profile.headmasterNip],
    ['propertyOfficerName', profile.propertyOfficerName],
    ['propertyOfficerNip', profile.propertyOfficerNip],
    ['labHeadName', profile.labHeadName],
    ['labHeadNip', profile.labHeadNip],
    ['letterPrefix', profile.letterPrefix]
  ];
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}

function readProfileSheet(ss) {
  var sheet = ss.getSheetByName('Profil_Sekolah');
  if (!sheet) return null;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  var profile = {};
  data.forEach(function(row) {
    profile[row[0]] = row[1];
  });
  return Object.keys(profile).length > 0 ? profile : null;
}

function writeDocumentsSheet(ss, docs) {
  var sheet = ss.getSheetByName('Dokumen_BAST');
  setupHeaders(sheet, 'Dokumen_BAST');
  if (!docs || docs.length === 0) return;

  var rows = docs.map(function(d) {
    return [
      d.id,
      d.type,
      d.docNumber,
      d.date,
      d.title,
      d.firstPartyName,
      d.firstPartyNip,
      d.secondPartyName,
      d.secondPartyNip,
      d.secondPartyInstitution || '-',
      d.purpose,
      d.createdAt
    ];
  });
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function readDocumentsSheet(ss) {
  var sheet = ss.getSheetByName('Dokumen_BAST');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  var data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  return data.map(function(row) {
    return {
      id: String(row[0]),
      type: String(row[1]),
      docNumber: String(row[2]),
      date: String(row[3]),
      title: String(row[4]),
      firstPartyName: String(row[5]),
      firstPartyNip: String(row[6]),
      secondPartyName: String(row[7]),
      secondPartyNip: String(row[8]),
      secondPartyInstitution: String(row[9]),
      purpose: String(row[10]),
      items: [],
      createdAt: String(row[11])
    };
  });
}

function logActivity(ss, type, notes) {
  try {
    var sheet = ss.getSheetByName('Log_Aktivitas');
    if (sheet) {
      sheet.appendRow([new Date(), type, notes]);
    }
  } catch (e) {}
}
`;

/**
 * Ping test to Google Apps Script Web App URL
 */
export async function testGasConnection(webAppUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return {
      success: false,
      message: 'URL Google Apps Script tidak valid. Pastikan dimulai dengan https://script.google.com/macros/s/...',
    };
  }

  try {
    // Attempt standard fetch with ping parameter
    const pingUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping&t=${Date.now()}`;
    const response = await fetch(pingUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server merespon dengan status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Koneksi ke Google Apps Script berhasil terhubung!',
    };
  } catch (err: any) {
    // If CORS prevents direct reading, provide helpful feedback
    return {
      success: false,
      message: `Gagal menghubungi Google Apps Script: ${err.message || 'Periksa izin "Siapa saja / Anyone" pada deployment.'}`,
    };
  }
}

/**
 * Push all local data to Google Apps Script
 */
export async function pushDataToGas(
  webAppUrl: string,
  payload: {
    inventory: InventoryItem[];
    loans: LoanTransaction[];
    schoolProfile: SchoolProfile;
    documents: OfficialDocument[];
  }
): Promise<{ success: boolean; message: string; timestamp?: string }> {
  if (!webAppUrl) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const postBody: SyncPayload = {
      action: 'syncAll',
      inventory: payload.inventory,
      loans: payload.loans,
      schoolProfile: payload.schoolProfile,
      documents: payload.documents,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webAppUrl, {
      method: 'POST',
      body: JSON.stringify(postBody),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS doPost standard
      },
    });

    const result = await response.json();
    return {
      success: result.success,
      message: result.message || 'Data berhasil disinkronkan ke Google Sheets.',
      timestamp: result.syncedAt || new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal sinkronisasi ke Google Apps Script: ${err.message}`,
    };
  }
}

/**
 * Pull latest data from Google Apps Script
 */
export async function pullDataFromGas(webAppUrl: string): Promise<SyncResponse> {
  if (!webAppUrl) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
    };
  }

  try {
    const fetchUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=pullRemote&t=${Date.now()}`;
    const response = await fetch(fetchUrl);
    const result = await response.json();

    return result;
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menarik data dari Google Sheets: ${err.message}`,
    };
  }
}
