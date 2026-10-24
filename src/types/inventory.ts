/**
 * Types definition for LabTrack - Computer Lab Inventory & BMD SIMBADA System
 * Standard: Badan Keuangan dan Aset Daerah (BKAD) Kota Malang & Dinas Pendidikan dan Kebudayaan Kota Malang
 * Regulations: Permendagri No. 19/2016, Permendagri No. 108/2016 & Permendagri No. 47/2021
 */

export type ItemCondition = 'B' | 'KB' | 'RB'; // B = Baik, KB = Kurang Baik, RB = Rusak Berat

export interface SimbadaMasterCode {
  code: string;
  name: string;
  category: string;
  defaultMaterial: string;
}

export const SIMBADA_MASTER_CODES: SimbadaMasterCode[] = [
  {
    code: '1.3.2.10.01.02.001',
    name: 'PC Unit / Personal Computer',
    category: 'Peralatan Komputer - Komputer Unit',
    defaultMaterial: 'Plastik / Logam',
  },
  {
    code: '1.3.2.10.01.02.002',
    name: 'Laptop / Notebook / Chromebook Client',
    category: 'Peralatan Komputer - Komputer Unit',
    defaultMaterial: 'Logam / Plastik',
  },
  {
    code: '1.3.2.10.01.01.001',
    name: 'Server Komputer / Mainframe',
    category: 'Peralatan Komputer - Mainframe/Server',
    defaultMaterial: 'Metal / Logam',
  },
  {
    code: '1.3.2.10.02.01.001',
    name: 'Printer Inkjet / Laser',
    category: 'Peralatan Komputer - Cetakan',
    defaultMaterial: 'Plastik / Komponen Elektronik',
  },
  {
    code: '1.3.2.10.02.01.003',
    name: 'Scanner Flatbed / Dokumen',
    category: 'Peralatan Komputer - Cetakan',
    defaultMaterial: 'Plastik / Kaca Optik',
  },
  {
    code: '1.3.2.10.02.04.001',
    name: 'LCD Projector / Proyektor Visual',
    category: 'Peralatan Komputer - Peralatan Visual',
    defaultMaterial: 'Plastik / Optik Logam',
  },
  {
    code: '1.3.2.10.02.03.001',
    name: 'UPS (Uninterruptible Power Supply)',
    category: 'Peralatan Komputer - Peralatan Pendukung',
    defaultMaterial: 'Metal / Plastik / Baterai Aki',
  },
  {
    code: '1.3.2.10.02.02.001',
    name: 'Switch / Hub Network',
    category: 'Peralatan Komputer - Jaringan',
    defaultMaterial: 'Logam / Metal',
  },
  {
    code: '1.3.2.10.02.02.005',
    name: 'Router Wireless / Access Point',
    category: 'Peralatan Komputer - Jaringan',
    defaultMaterial: 'Plastik / PCB',
  },
  {
    code: '1.3.2.04.01.01.002',
    name: 'Meja Komputer / Meja Lab Siswa',
    category: 'Mebel - Meja Kerja / Meja Tulis',
    defaultMaterial: 'Kayu Partikel / Rangka Besi',
  },
  {
    code: '1.3.2.04.01.02.001',
    name: 'Kursi Siswa / Kursi Lab',
    category: 'Mebel - Kursi Besi / Kayu',
    defaultMaterial: 'Besi Pipa / Busa Kulit Sintetis',
  },
  {
    code: '1.3.2.05.02.01.004',
    name: 'AC (Air Conditioner) Split',
    category: 'Alat Pendingin Ruangan',
    defaultMaterial: 'Plastik / Logam / Tembaga',
  },
];

export interface InventoryItem {
  id: string;
  code: string;               // Kode Barang SIMBADA: misal 1.3.2.10.01.02.001
  registerNumber: string;     // No Register: misal Reg. 0001 atau 0001-0015
  name: string;               // Nama Barang / Jenis Barang: PC Desktop Client (Asus C214)
  category: string;           // Kelompok Utama SIMBADA
  brand: string;              // Merk / Tipe: Asus Chromebook / Lenovo / TP-Link
  specifications: string;     // Ukuran / Spek: Intel Celeron, RAM 4GB, eMMC 32GB
  material: string;           // Bahan: Logam / Plastik, Kayu / Besi
  serialNumber?: string;      // No. Pabrik / No. Chasis / No. Seri
  location: string;           // Ruangan / Baris Meja
  totalStock: number;         // Jumlah Barang (Eks/Set/Unit)
  availableStock: number;
  borrowedStock: number;
  minStockAlert: number;
  unit: string;               // Unit, Set, Buah
  condition: ItemCondition;   // B (Baik), KB (Kurang Baik), RB (Rusak Berat)
  unitPrice: number;          // Harga Satuan (Rp)
  totalPrice: number;         // Nilai Total Aset (Rp)
  sourceOfFund: string;       // Bantuan DAK, BOS Reguler, APBD Kota Malang
  purchaseYear: number;       // Tahun Pembelian / Perolehan
  imageUrl?: string;          // Foto Fisik Barang (Base64 atau image URL)
  notes?: string;             // Catatan / Keterangan Mutasi / Kerusakan
  lastUpdated: string;
}

export type BorrowerType = 'Siswa' | 'Guru' | 'Staf Lab' | 'Pihak Luar';
export type LoanStatus = 'Dipinjam' | 'Dikembalikan' | 'Terlambat';

export interface LoanTransaction {
  id: string;
  loanNumber: string;         // e.g. PJM/2026/10/001
  itemId: string;
  itemCode: string;           // Kode SIMBADA
  itemName: string;
  borrowerName: string;
  borrowerType: BorrowerType;
  borrowerContact: string;    // No HP / WhatsApp
  borrowerClassOrDept: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: LoanStatus;
  purpose: string;
  loanNotes?: string;
  returnCondition?: ItemCondition;
  returnNotes?: string;
  officerName: string;
  createdAt: string;
}

export interface SchoolProfile {
  government: string;          // PEMERINTAH KOTA MALANG
  opd: string;                 // DINAS PENDIDIKAN DAN KEBUDAYAAN KOTA MALANG
  schoolName: string;          // SD NEGERI KAUMAN 1 KOTA MALANG
  npsn: string;
  roomLocationCode: string;    // Kode Lokasi Ruangan SIMBADA: 12.03.25.01.01.01.01.05
  address: string;
  phone: string;
  email: string;
  website: string;
  city: string;                // Kota Malang
  province: string;            // Jawa Timur
  labName: string;             // Ruang Laboratorium Komputer
  
  // Pejabat Pengesahan Standar SIMBADA Kota Malang
  headmasterName: string;      // Kepala SD Negeri
  headmasterNip: string;
  propertyOfficerName: string; // Pengurus / Pengelola Barang Sekolah
  propertyOfficerNip: string;
  labHeadName: string;         // Penanggung Jawab Ruangan Lab. Komputer
  labHeadNip: string;
  
  logoUrl: string;             // Logo Pemkot Malang / Tut Wuri Handayani
  letterPrefix: string;        // 050 / ... / 35.73.401.01
}

export type ReportType = 
  | 'KIR' 
  | 'BAP_PENGHAPUSAN' 
  | 'SURAT_PENGHAPUSAN' 
  | 'BAST' 
  | 'LAPORAN_BULANAN';

export interface OfficialDocument {
  id: string;
  type: ReportType;
  docNumber: string;
  date: string;
  title: string;
  firstPartyName: string;
  firstPartyRole: string;
  firstPartyNip: string;
  secondPartyName: string;
  secondPartyRole: string;
  secondPartyNip: string;
  secondPartyInstitution?: string;
  purpose: string;
  items: Array<{
    code: string;
    register?: string;
    name: string;
    brandType?: string;
    specs: string;
    material?: string;
    qty: number;
    unit: string;
    year?: number;
    unitPrice?: number;
    totalPrice?: number;
    condition: ItemCondition;
    imageUrl?: string;
    notes?: string;
  }>;
  statementClause?: string;
  createdAt: string;
}

export interface GasDeploymentConfig {
  webAppUrl: string;
  spreadsheetUrl?: string;
  autoSync: boolean;
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface SystemAlert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  category: 'low_stock' | 'overdue_loan' | 'damaged_item' | 'system';
  title: string;
  message: string;
  targetId?: string;
  timestamp: string;
  isRead: boolean;
}
