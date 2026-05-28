import { useState } from 'react'
import { Plus, Trash2, ClipboardCheck, Info } from 'lucide-react'
import useAppStore from '../store/appStore'
import { hitungKapasitasTeoritis, hitungEfisiensi, formatAngka } from '../utils/calculations'

function today() {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM = {
  operatorId: '',
  mesinId: '',
  produkId: '',
  aktual: '',
  reject: '',
  jamKerja: '',
  catatan: '',
}

export default function InputProduksi() {
  const { operator, mesin, produk, settings, catatanProduksi, tambahCatatan, hapusCatatan, getMesinById, getProdukById, getOperatorById } = useAppStore()

  const [tanggal, setTanggal] = useState(today())
  const [form, setForm] = useState(EMPTY_FORM)
  const [saved, setSaved] = useState(false)

  const catatanHari = catatanProduksi
    .filter((c) => c.tanggal === tanggal)
    .sort((a, b) => b.id.localeCompare(a.id))

  // Hitung preview kapasitas
  const mesinTerpilih = getMesinById(form.mesinId)
  const produkTerpilih = getProdukById(form.produkId)
  const jamKerja = +form.jamKerja || settings.jamKerjaPerShift
  const kapasitasPreview = mesinTerpilih && produkTerpilih
    ? hitungKapasitasTeoritis(jamKerja, mesinTerpilih.rpm, produkTerpilih.stitchCount)
    : null

  const efisiensiPreview = kapasitasPreview && form.aktual
    ? hitungEfisiensi(+form.aktual, kapasitasPreview)
    : null

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.operatorId || !form.mesinId || !form.produkId || !form.aktual) return
    tambahCatatan({
      tanggal,
      operatorId: form.operatorId,
      mesinId: form.mesinId,
      produkId: form.produkId,
      aktual: +form.aktual,
      reject: +form.reject || 0,
      jamKerja: +form.jamKerja || settings.jamKerjaPerShift,
      catatan: form.catatan,
    })
    setForm(EMPTY_FORM)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const formValid = form.operatorId && form.mesinId && form.produkId && form.aktual

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">Input Produksi</h1>

      {/* Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Catat Produksi</h2>
          <div>
            <input
              type="date"
              className="input text-sm w-auto"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Operator */}
            <div>
              <label className="label">Operator *</label>
              <select
                className="input"
                value={form.operatorId}
                onChange={(e) => {
                  const op = operator.find((o) => o.id === e.target.value)
                  setForm({ ...form, operatorId: e.target.value, mesinId: op?.mesinId ?? form.mesinId })
                }}
              >
                <option value="">— pilih operator —</option>
                {operator.map((o) => (
                  <option key={o.id} value={o.id}>{o.nama}</option>
                ))}
              </select>
            </div>

            {/* Mesin */}
            <div>
              <label className="label">Mesin *</label>
              <select className="input" value={form.mesinId} onChange={(e) => setForm({ ...form, mesinId: e.target.value })}>
                <option value="">— pilih mesin —</option>
                {mesin.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama} ({m.rpm} RPM)</option>
                ))}
              </select>
            </div>

            {/* Produk */}
            <div className="sm:col-span-2">
              <label className="label">Jenis Produk *</label>
              <select className="input" value={form.produkId} onChange={(e) => setForm({ ...form, produkId: e.target.value })}>
                <option value="">— pilih produk —</option>
                {produk.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — {p.tipeBordir} — {p.stitchCount.toLocaleString('id-ID')} stitch
                  </option>
                ))}
              </select>
            </div>

            {/* Jam Kerja */}
            <div>
              <label className="label">Jam Kerja</label>
              <input
                className="input"
                type="number"
                step="0.5"
                placeholder={`default: ${settings.jamKerjaPerShift} jam`}
                value={form.jamKerja}
                onChange={(e) => setForm({ ...form, jamKerja: e.target.value })}
              />
            </div>

            {/* Preview kapasitas */}
            {kapasitasPreview !== null && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2.5 text-sm">
                <Info size={15} className="shrink-0" />
                <div>
                  <strong>Kapasitas teoritis: {kapasitasPreview} item</strong>
                  {efisiensiPreview !== null && (
                    <span className="ml-2 text-blue-500">→ efisiensi saat ini: {formatAngka(efisiensiPreview)}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Aktual */}
            <div>
              <label className="label">Hasil Aktual (item) *</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={form.aktual}
                onChange={(e) => setForm({ ...form, aktual: e.target.value })}
              />
            </div>

            {/* Reject */}
            <div>
              <label className="label">Jumlah Reject/Cacat</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={form.reject}
                onChange={(e) => setForm({ ...form, reject: e.target.value })}
              />
            </div>

            {/* Catatan */}
            <div className="sm:col-span-2">
              <label className="label">Catatan (opsional)</label>
              <input
                className="input"
                placeholder="cth: mesin sempat berhenti 30 menit"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2" disabled={!formValid}>
            <Plus size={16} />
            {saved ? '✓ Tersimpan!' : 'Simpan Catatan'}
          </button>

          {(operator.length === 0 || mesin.length === 0 || produk.length === 0) && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Pastikan sudah mengisi data di <strong>Master Data</strong> (Mesin, Operator, dan Produk) sebelum input produksi.
            </p>
          )}
        </form>
      </div>

      {/* Tabel catatan hari ini */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">
          Catatan Tanggal {new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>

        {catatanHari.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada catatan untuk tanggal ini.</p>
        ) : (
          <div className="space-y-2">
            {catatanHari.map((c) => {
              const op = getOperatorById(c.operatorId)
              const m = getMesinById(c.mesinId)
              const p = getProdukById(c.produkId)
              const kapasitas = m && p ? hitungKapasitasTeoritis(c.jamKerja, m.rpm, p.stitchCount) : 0
              const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
              return (
                <div key={c.id} className="border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-800 flex items-center gap-1.5 flex-wrap">
                      <ClipboardCheck size={14} className="text-green-500 shrink-0" />
                      {op?.nama ?? '?'} · {m?.nama ?? '?'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p?.nama ?? '?'} ({p?.tipeBordir}) · {c.aktual} item aktual · {c.reject} reject · efisiensi {formatAngka(efisiensi)}%
                    </div>
                    {c.catatan && <div className="text-xs text-gray-400 mt-0.5 italic">{c.catatan}</div>}
                  </div>
                  <button
                    className="text-gray-300 hover:text-red-400 shrink-0"
                    onClick={() => hapusCatatan(c.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
