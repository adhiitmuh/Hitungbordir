import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const KATEGORI_PRODUK = ['lambang', 'lokasi', 'papan_nama']
const TIPE_BORDIR = ['2D', '3D']

const defaultSettings = {
  tarifListrikKwh: 1500,
  hargaBenangPer1000Stitch: 50,
  gajiHarianDefault: 100000,
  jamKerjaPerShift: 8,
  overheadHarian: 10000,
  adminPassword: 'admin123',
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const useAppStore = create(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      mesin: [],
      operator: [],
      produk: [],
      benang: [],
      catatanProduksi: [],

      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),

      // ── Mesin ──────────────────────────────────────────────
      tambahMesin: (data) =>
        set((s) => ({ mesin: [...s.mesin, { id: generateId(), ...data }] })),
      updateMesin: (id, data) =>
        set((s) => ({ mesin: s.mesin.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
      hapusMesin: (id) =>
        set((s) => ({ mesin: s.mesin.filter((m) => m.id !== id) })),

      // ── Operator ───────────────────────────────────────────
      tambahOperator: (data) =>
        set((s) => ({ operator: [...s.operator, { id: generateId(), ...data }] })),
      updateOperator: (id, data) =>
        set((s) => ({ operator: s.operator.map((o) => (o.id === id ? { ...o, ...data } : o)) })),
      hapusOperator: (id) =>
        set((s) => ({ operator: s.operator.filter((o) => o.id !== id) })),

      // ── Produk ─────────────────────────────────────────────
      tambahProduk: (data) =>
        set((s) => ({ produk: [...s.produk, { id: generateId(), ...data }] })),
      updateProduk: (id, data) =>
        set((s) => ({ produk: s.produk.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
      hapusProduk: (id) =>
        set((s) => ({ produk: s.produk.filter((p) => p.id !== id) })),

      // ── Benang ─────────────────────────────────────────────
      tambahBenang: (data) =>
        set((s) => ({ benang: [...s.benang, { id: generateId(), ...data }] })),
      updateBenang: (id, data) =>
        set((s) => ({ benang: s.benang.map((b) => (b.id === id ? { ...b, ...data } : b)) })),
      hapusBenang: (id) =>
        set((s) => ({ benang: s.benang.filter((b) => b.id !== id) })),

      // ── Catatan Produksi ───────────────────────────────────
      tambahCatatan: (data) =>
        set((s) => ({
          catatanProduksi: [
            ...s.catatanProduksi,
            { id: generateId(), tanggal: new Date().toISOString().slice(0, 10), ...data },
          ],
        })),
      updateCatatan: (id, data) =>
        set((s) => ({
          catatanProduksi: s.catatanProduksi.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      hapusCatatan: (id) =>
        set((s) => ({ catatanProduksi: s.catatanProduksi.filter((c) => c.id !== id) })),

      // ── Selectors ─────────────────────────────────────────
      getMesinById: (id) => get().mesin.find((m) => m.id === id),
      getOperatorById: (id) => get().operator.find((o) => o.id === id),
      getProdukById: (id) => get().produk.find((p) => p.id === id),
      getBenangById: (id) => get().benang.find((b) => b.id === id),

      getCatatanByTanggal: (tanggal) =>
        get().catatanProduksi.filter((c) => c.tanggal === tanggal),

      getCatatanByOperator: (operatorId) =>
        get().catatanProduksi.filter((c) => c.operatorId === operatorId),
    }),
    { name: 'harmonibordir-storage' }
  )
)

export { KATEGORI_PRODUK, TIPE_BORDIR }
export default useAppStore
