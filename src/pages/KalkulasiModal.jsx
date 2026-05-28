import { useState, useMemo } from 'react'
import { Calculator, Info } from 'lucide-react'
import useAppStore from '../store/appStore'
import {
  hitungKapasitasTeoritis, hitungWaktuPerItem, hitungBiayaBenang,
  hitungBiayaListrik, hitungGajiPerItem, formatRupiah, formatAngka
} from '../utils/calculations'

function RowBiaya({ label, nilai, persen, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-50 ${highlight ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
      <span className="text-sm">{label}</span>
      <div className="text-right">
        <span className="text-sm">{formatRupiah(nilai)}</span>
        {persen !== undefined && (
          <span className="ml-2 text-xs text-gray-400">{formatAngka(persen)}%</span>
        )}
      </div>
    </div>
  )
}

export default function KalkulasiModal() {
  const { produk, mesin, operator, settings } = useAppStore()

  const [produkId, setProdukId] = useState('')
  const [mesinId, setMesinId] = useState('')
  const [gajiHarianCustom, setGajiHarianCustom] = useState('')
  const [jamKerja, setJamKerja] = useState(settings.jamKerjaPerShift)
  const [produksiAktual, setProduksiAktual] = useState('')
  const [tarifCustom, setTarifCustom] = useState('')
  const [benangCustom, setBenangCustom] = useState('')
  const [overheadCustom, setOverheadCustom] = useState('')

  const p = produk.find((x) => x.id === produkId)
  const m = mesin.find((x) => x.id === mesinId)

  const tarif = +tarifCustom || settings.tarifListrikKwh
  const benang = +benangCustom || settings.hargaBenangPer1000Stitch
  const overhead = +overheadCustom || settings.overheadHarian
  const gaji = +gajiHarianCustom || settings.gajiHarianDefault

  const hasil = useMemo(() => {
    if (!p) return null
    const stitchCount = p.stitchCount
    const rpm = m?.rpm ?? 850
    const dayaWatt = m?.dayaWatt ?? 250
    const kapasitasTeoritis = hitungKapasitasTeoritis(+jamKerja, rpm, stitchCount)
    const totalProduksi = +produksiAktual || kapasitasTeoritis
    const waktuMenit = hitungWaktuPerItem(rpm, stitchCount)
    const biayaBenang = hitungBiayaBenang(stitchCount, benang)
    const biayaListrik = hitungBiayaListrik(dayaWatt, waktuMenit, tarif)
    const gajiPerItem = hitungGajiPerItem(gaji, totalProduksi)
    const overheadPerItem = overhead / totalProduksi
    const total = biayaBenang + biayaListrik + gajiPerItem + overheadPerItem

    return {
      kapasitasTeoritis,
      totalProduksi,
      waktuMenit,
      biayaBenang,
      biayaListrik,
      gajiPerItem,
      overheadPerItem,
      total,
      marginJual: p.hargaJual ? p.hargaJual - total : null,
      marginPersen: p.hargaJual ? ((p.hargaJual - total) / p.hargaJual) * 100 : null,
    }
  }, [p, m, jamKerja, produksiAktual, tarif, benang, gaji, overhead])

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">Kalkulasi Modal</h1>

      {/* Input */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
          <Calculator size={16} className="text-blue-500" />
          Parameter Kalkulasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Jenis Produk *</label>
            <select className="input" value={produkId} onChange={(e) => setProdukId(e.target.value)}>
              <option value="">— pilih produk —</option>
              {produk.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} — {p.tipeBordir} — {p.stitchCount.toLocaleString('id-ID')} stitch
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Mesin</label>
            <select className="input" value={mesinId} onChange={(e) => setMesinId(e.target.value)}>
              <option value="">— gunakan default (850 RPM, 250W) —</option>
              {mesin.map((m) => (
                <option key={m.id} value={m.id}>{m.nama} ({m.rpm} RPM, {m.dayaWatt}W)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Jam Kerja per Shift</label>
            <input className="input" type="number" step="0.5" value={jamKerja}
              onChange={(e) => setJamKerja(e.target.value)} />
          </div>

          <div>
            <label className="label">Produksi Aktual (item)</label>
            <input className="input" type="number" placeholder="kosongkan = gunakan kapasitas teoritis"
              value={produksiAktual} onChange={(e) => setProduksiAktual(e.target.value)} />
          </div>

          <div>
            <label className="label">Gaji Harian Operator (Rp)</label>
            <input className="input" type="number" placeholder={`default: ${formatRupiah(settings.gajiHarianDefault)}`}
              value={gajiHarianCustom} onChange={(e) => setGajiHarianCustom(e.target.value)} />
          </div>

          <div>
            <label className="label">Harga Benang / 1.000 stitch (Rp)</label>
            <input className="input" type="number" placeholder={`default: ${formatRupiah(settings.hargaBenangPer1000Stitch)}`}
              value={benangCustom} onChange={(e) => setBenangCustom(e.target.value)} />
          </div>

          <div>
            <label className="label">Tarif Listrik (Rp/kWh)</label>
            <input className="input" type="number" placeholder={`default: ${formatRupiah(settings.tarifListrikKwh)}`}
              value={tarifCustom} onChange={(e) => setTarifCustom(e.target.value)} />
          </div>

          <div>
            <label className="label">Overhead per Shift (Rp)</label>
            <input className="input" type="number" placeholder={`default: ${formatRupiah(settings.overheadHarian)}`}
              value={overheadCustom} onChange={(e) => setOverheadCustom(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Hasil */}
      {hasil && p ? (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-1">Hasil Kalkulasi: {p.nama}</h2>
          <p className="text-xs text-gray-400 mb-4">
            {p.tipeBordir} · {p.stitchCount.toLocaleString('id-ID')} stitch · {formatAngka(hasil.waktuMenit, 2)} menit/item
            · kapasitas teoritis: {hasil.kapasitasTeoritis} item/shift
            {+produksiAktual > 0 && ` · dihitung untuk ${hasil.totalProduksi} item aktual`}
          </p>

          <div className="divide-y divide-gray-50">
            <RowBiaya
              label="Biaya Benang"
              nilai={hasil.biayaBenang}
              persen={(hasil.biayaBenang / hasil.total) * 100}
            />
            <RowBiaya
              label="Biaya Listrik"
              nilai={hasil.biayaListrik}
              persen={(hasil.biayaListrik / hasil.total) * 100}
            />
            <RowBiaya
              label="Upah Operator per Item"
              nilai={hasil.gajiPerItem}
              persen={(hasil.gajiPerItem / hasil.total) * 100}
            />
            <RowBiaya
              label="Overhead per Item"
              nilai={hasil.overheadPerItem}
              persen={(hasil.overheadPerItem / hasil.total) * 100}
            />
            <RowBiaya
              label="TOTAL MODAL per Item"
              nilai={hasil.total}
              highlight
            />
            {p.hargaJual > 0 && (
              <>
                <RowBiaya label="Harga Jual" nilai={p.hargaJual} />
                <div className={`flex items-center justify-between py-2 font-semibold ${hasil.marginJual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="text-sm">Margin Keuntungan</span>
                  <span className="text-sm">
                    {formatRupiah(hasil.marginJual)} ({formatAngka(hasil.marginPersen)}%)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Visual bar */}
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-1">Komposisi Modal</p>
            <div className="flex rounded-full overflow-hidden h-4">
              {[
                { val: hasil.biayaBenang, color: 'bg-blue-400', label: 'Benang' },
                { val: hasil.biayaListrik, color: 'bg-yellow-400', label: 'Listrik' },
                { val: hasil.gajiPerItem, color: 'bg-green-400', label: 'Gaji' },
                { val: hasil.overheadPerItem, color: 'bg-purple-400', label: 'Overhead' },
              ].map(({ val, color }) => (
                <div
                  key={color}
                  className={`${color} transition-all`}
                  style={{ width: `${(val / hasil.total) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-1.5 flex-wrap">
              {[
                { color: 'bg-blue-400', label: 'Benang', val: hasil.biayaBenang },
                { color: 'bg-yellow-400', label: 'Listrik', val: hasil.biayaListrik },
                { color: 'bg-green-400', label: 'Gaji', val: hasil.gajiPerItem },
                { color: 'bg-purple-400', label: 'Overhead', val: hasil.overheadPerItem },
              ].map(({ color, label, val }) => (
                <div key={label} className="flex items-center gap-1 text-xs text-gray-500">
                  <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                  {label}: {formatAngka((val / hasil.total) * 100)}%
                </div>
              ))}
            </div>
          </div>

          {hasil.biayaListrik < 1 && (
            <div className="mt-3 flex items-start gap-2 bg-blue-50 text-blue-600 text-xs rounded-lg px-3 py-2">
              <Info size={13} className="shrink-0 mt-0.5" />
              Biaya listrik sangat kecil karena mesin bordir berdaya rendah. Komponen terbesar biasanya adalah upah operator.
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-400 text-sm">
          Pilih jenis produk untuk melihat kalkulasi modal.
        </div>
      )}
    </div>
  )
}
