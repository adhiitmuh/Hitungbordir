import { useState, useMemo } from 'react'
import { Calculator, Info, ArrowRight } from 'lucide-react'
import useAppStore from '../store/appStore'
import {
  hitungKapasitasTeoritis, hitungWaktuPerItem, hitungBiayaBenang,
  hitungBiayaListrik, hitungGajiPerItem, hitungHargaBenangDariCone,
  hargaBenangPer1000, formatRupiah, formatAngka
} from '../utils/calculations'

function KalkulatorGulunganInline({ onApply }) {
  const [g, setG] = useState({ harga: '', meter: '', meterPer1000: '12' })
  const hasil = (g.harga && g.meter)
    ? hitungHargaBenangDariCone(+g.harga, +g.meter, +g.meterPer1000 || 12)
    : null
  return (
    <div className="col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
      <div className="text-xs font-medium text-blue-700">Hitung harga benang dari gulungan</div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label text-xs text-blue-700">Harga/gulungan (Rp)</label>
          <input className="input text-sm" type="number" placeholder="cth: 15000"
            value={g.harga} onChange={(e) => setG({ ...g, harga: e.target.value })} />
        </div>
        <div>
          <label className="label text-xs text-blue-700">Panjang gulungan (m)</label>
          <input className="input text-sm" type="number" placeholder="cth: 1000"
            value={g.meter} onChange={(e) => setG({ ...g, meter: e.target.value })} />
          <p className="text-xs text-gray-400 mt-0.5">Tertera di label gulungan</p>
        </div>
        <div>
          <label className="label text-xs text-blue-700">Meter/1.000 stitch</label>
          <input className="input text-sm" type="number" step="0.5" placeholder="12"
            value={g.meterPer1000} onChange={(e) => setG({ ...g, meterPer1000: e.target.value })} />
          <p className="text-xs text-gray-400 mt-0.5">Rata-rata: 10–14 m</p>
        </div>
      </div>
      {hasil && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Rp/meter: <strong>{formatRupiah(hasil.hargaPerMeter)}</strong></span>
          <ArrowRight size={12} className="text-blue-400" />
          <span className="text-xs text-blue-700 font-semibold">
            Rp/1.000 stitch: {formatRupiah(hasil.hargaPer1000Stitch)}
          </span>
          <button className="btn-primary text-xs py-1" onClick={() => onApply(hasil.hargaPer1000Stitch)}>
            Pakai →
          </button>
        </div>
      )}
    </div>
  )
}

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
  const { produk, mesin, operator, benang: benangList, settings } = useAppStore()

  const [produkId, setProdukId] = useState('')
  const [mesinId, setMesinId] = useState('')
  const [gajiHarianCustom, setGajiHarianCustom] = useState('')
  const [jamKerja, setJamKerja] = useState(settings.jamKerjaPerShift)
  const [produksiAktual, setProduksiAktual] = useState('')
  const [tarifCustom, setTarifCustom] = useState('')
  const [overheadCustom, setOverheadCustom] = useState('')
  // Benang — pakai master data jika ada, fallback ke manual
  const [benangAtasId, setBenangAtasId] = useState('')
  const [benangBawahId, setBenangBawahId] = useState('')
  const [benangManual, setBenangManual] = useState('')
  const [showKalkGulungan, setShowKalkGulungan] = useState(false)

  const adaBenangMaster = benangList.length > 0
  const p = produk.find((x) => x.id === produkId)
  const m = mesin.find((x) => x.id === mesinId)
  const bAtas = benangList.find((b) => b.id === benangAtasId)
  const bBawah = benangList.find((b) => b.id === benangBawahId)

  const tarif = +tarifCustom || settings.tarifListrikKwh
  const overhead = +overheadCustom || settings.overheadHarian
  const gaji = +gajiHarianCustom || settings.gajiHarianDefault

  const hasil = useMemo(() => {
    if (!p) return null
    const stitchCount = p.stitchCount
    const rpm = m?.rpm ?? 850
    const dayaWatt = m?.dayaWatt ?? 250
    const kapasitasTeoritis = hitungKapasitasTeoritis(+jamKerja, rpm, stitchCount)
    const totalProduksi = +produksiAktual || kapasitasTeoritis
    if (!totalProduksi) return null
    const waktuMenit = hitungWaktuPerItem(rpm, stitchCount)

    let biayaBenangAtas = 0
    let biayaBenangBawah = 0
    let biayaBenangManual = 0

    if (adaBenangMaster) {
      if (bAtas) biayaBenangAtas = hitungBiayaBenang(stitchCount, hargaBenangPer1000(bAtas))
      if (bBawah) biayaBenangBawah = hitungBiayaBenang(stitchCount, hargaBenangPer1000(bBawah))
    } else {
      const hargaManual = +benangManual || settings.hargaBenangPer1000Stitch
      biayaBenangManual = hitungBiayaBenang(stitchCount, hargaManual)
    }

    const biayaListrik = hitungBiayaListrik(dayaWatt, waktuMenit, tarif)
    const gajiPerItem = hitungGajiPerItem(gaji, totalProduksi)
    const overheadPerItem = totalProduksi > 0 ? overhead / totalProduksi : 0
    const totalBenang = adaBenangMaster ? biayaBenangAtas + biayaBenangBawah : biayaBenangManual
    const total = totalBenang + biayaListrik + gajiPerItem + overheadPerItem

    return {
      kapasitasTeoritis, totalProduksi, waktuMenit,
      biayaBenangAtas, biayaBenangBawah, biayaBenangManual, totalBenang,
      biayaListrik, gajiPerItem, overheadPerItem, total,
      marginJual: p.hargaJual ? p.hargaJual - total : null,
      marginPersen: p.hargaJual ? ((p.hargaJual - total) / p.hargaJual) * 100 : null,
    }
  }, [p, m, jamKerja, produksiAktual, tarif, bAtas, bBawah, benangManual, gaji, overhead, adaBenangMaster])

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

          {adaBenangMaster ? (
            <>
              <div>
                <label className="label">Benang Atas</label>
                <select className="input" value={benangAtasId} onChange={(e) => setBenangAtasId(e.target.value)}>
                  <option value="">— tidak dipilih / Rp 0 —</option>
                  {benangList.filter((b) => b.tipe === 'atas').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama} ({formatRupiah(hargaBenangPer1000(b))}/1.000 stitch)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Benang Bawah (Bobbin)</label>
                <select className="input" value={benangBawahId} onChange={(e) => setBenangBawahId(e.target.value)}>
                  <option value="">— tidak dipilih / Rp 0 —</option>
                  {benangList.filter((b) => b.tipe === 'bawah').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama} ({formatRupiah(hargaBenangPer1000(b))}/1.000 stitch)
                    </option>
                  ))}
                </select>
              </div>
              {!benangAtasId && !benangBawahId && (
                <div className="col-span-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Belum ada benang dipilih — biaya benang tidak dihitung. Pilih minimal satu benang untuk hasil yang akurat.
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="label">Harga Benang / 1.000 stitch (Rp)</label>
              <div className="flex gap-2">
                <input className="input" type="number" placeholder={`default: ${formatRupiah(settings.hargaBenangPer1000Stitch)}`}
                  value={benangManual} onChange={(e) => setBenangManual(e.target.value)} />
                <button
                  className="btn-secondary text-xs shrink-0 whitespace-nowrap"
                  onClick={() => setShowKalkGulungan(!showKalkGulungan)}
                >
                  {showKalkGulungan ? 'Tutup' : 'Hitung dari gulungan'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Tambahkan data benang di <strong>Master Data → Benang</strong> untuk perhitungan lebih akurat.
              </p>
            </div>
          )}

          {showKalkGulungan && (
            <KalkulatorGulunganInline
              onApply={(nilai) => {
                setBenangManual(String(Math.round(nilai * 10) / 10))
                setShowKalkGulungan(false)
              }}
            />
          )}

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
            {adaBenangMaster ? (
              <>
                {hasil.biayaBenangAtas > 0 && (
                  <RowBiaya
                    label={`Benang Atas${bAtas ? ` (${bAtas.nama})` : ''}`}
                    nilai={hasil.biayaBenangAtas}
                    persen={(hasil.biayaBenangAtas / hasil.total) * 100}
                  />
                )}
                {hasil.biayaBenangBawah > 0 && (
                  <RowBiaya
                    label={`Benang Bawah${bBawah ? ` (${bBawah.nama})` : ''}`}
                    nilai={hasil.biayaBenangBawah}
                    persen={(hasil.biayaBenangBawah / hasil.total) * 100}
                  />
                )}
                {hasil.totalBenang > 0 && (hasil.biayaBenangAtas > 0 || hasil.biayaBenangBawah > 0) && (
                  <RowBiaya label="Total Biaya Benang" nilai={hasil.totalBenang} persen={(hasil.totalBenang / hasil.total) * 100} />
                )}
              </>
            ) : (
              <RowBiaya
                label="Biaya Benang"
                nilai={hasil.biayaBenangManual}
                persen={(hasil.biayaBenangManual / hasil.total) * 100}
              />
            )}
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
                { val: hasil.totalBenang, color: 'bg-blue-400' },
                { val: hasil.biayaListrik, color: 'bg-yellow-400' },
                { val: hasil.gajiPerItem, color: 'bg-green-400' },
                { val: hasil.overheadPerItem, color: 'bg-purple-400' },
              ].map(({ val, color }) => (
                <div key={color} className={`${color} transition-all`}
                  style={{ width: `${(val / hasil.total) * 100}%` }} />
              ))}
            </div>
            <div className="flex gap-3 mt-1.5 flex-wrap">
              {[
                { color: 'bg-blue-400', label: 'Benang', val: hasil.totalBenang },
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
