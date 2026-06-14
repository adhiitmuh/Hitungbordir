import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, LineChart, Line, Legend
} from 'recharts'
import {
  TrendingUp, AlertTriangle, CheckCircle2, Info,
  Zap, Clock, Gauge, ChevronDown, ChevronUp, Camera
} from 'lucide-react'
import FotoUpload from '../components/FotoUpload'
import useAppStore from '../store/appStore'
import {
  hitungKapasitasTeoritis, hitungEfisiensi, statusPerforma,
  analisisNormalitas, hitungSelisihMenit, hitungWaktuAktif,
  hitungUtilisasi, hitungRpmEfektif, evaluasiKinerja,
  resolveJamKerja, formatAngka, formatRupiah
} from '../utils/calculations'

// ── Badge helpers ──────────────────────────────────────────────
function BadgeStatus({ status }) {
  if (status === 'baik') return <span className="badge-good"><CheckCircle2 size={11} />Baik ≥80%</span>
  if (status === 'cukup') return <span className="badge-warn"><AlertTriangle size={11} />Cukup 60–79%</span>
  return <span className="badge-bad"><AlertTriangle size={11} />Rendah &lt;60%</span>
}

const VERDICT_CONFIG = {
  optimal:           { label: 'Sudah Optimal',         cls: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  bisa_ditingkatkan: { label: 'Bisa Ditingkatkan',     cls: 'bg-harmoni-green-tint text-harmoni-green',    icon: TrendingUp },
  cek_mesin:         { label: 'Cek Mesin / Speed',     cls: 'bg-yellow-100 text-yellow-700',icon: Gauge },
  cek_kualitas:      { label: 'Cek Kualitas / Reject', cls: 'bg-red-100 text-red-700',      icon: AlertTriangle },
  perlu_perhatian:   { label: 'Perlu Perhatian',       cls: 'bg-orange-100 text-orange-700',icon: AlertTriangle },
}

function BadgeVerdict({ verdict }) {
  const cfg = VERDICT_CONFIG[verdict] ?? VERDICT_CONFIG.bisa_ditingkatkan
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.cls}`}>
      <Icon size={11} />{cfg.label}
    </span>
  )
}

const RENTANG = [
  { label: '7 Hari',  hari: 7 },
  { label: '14 Hari', hari: 14 },
  { label: '30 Hari', hari: 30 },
]

// ── Proses data per operator ───────────────────────────────────
function prosesDataOperator(catatanFiltered, settings, getMesinById, getProdukById, getOperatorById) {
  const map = {}

  for (const c of catatanFiltered) {
    const m = getMesinById(c.mesinId)
    const p = getProdukById(c.produkId)
    if (!m || !p) continue

    const speed = c.kecepatan || m.rpm
    const totalMin = hitungSelisihMenit(c.jamMulai, c.jamSelesai)
    const aktifMin = hitungWaktuAktif(c.jamMulai, c.jamSelesai, c.menitBerhenti)
    // Fallback untuk catatan lama yang hanya punya jamKerja
    const jamKerjaFallback = resolveJamKerja(c)
    const aktifMinEfektif = aktifMin > 0 ? aktifMin : jamKerjaFallback * 60

    const kapasitas = hitungKapasitasTeoritis(aktifMinEfektif / 60, speed, p.stitchCount)
    const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
    const utilisasi = totalMin > 0 ? hitungUtilisasi(aktifMin, totalMin) : null
    const rpmEfektif = aktifMinEfektif > 0
      ? hitungRpmEfektif(c.aktual, p.stitchCount, aktifMinEfektif)
      : null
    const rpmMaks = m.rpm

    if (!map[c.operatorId]) {
      map[c.operatorId] = {
        operatorId: c.operatorId,
        totalAktual: 0, totalKapasitas: 0, totalReject: 0, totalCatatan: 0,
        efisiensiList: [], utilisasiList: [], rpmEfektifList: [],
        totalDowntimeMenit: 0, alasanList: [],
        rpmMaksList: [], catatanList: [],
      }
    }
    const d = map[c.operatorId]
    d.totalAktual += c.aktual
    d.totalKapasitas += kapasitas
    d.totalReject += c.reject ?? 0
    d.totalCatatan++
    d.efisiensiList.push(efisiensi)
    if (utilisasi !== null) d.utilisasiList.push(utilisasi)
    if (rpmEfektif !== null) d.rpmEfektifList.push(rpmEfektif)
    d.totalDowntimeMenit += c.menitBerhenti ?? 0
    if (c.alasanBerhenti) d.alasanList.push(c.alasanBerhenti)
    d.rpmMaksList.push(rpmMaks)
    d.catatanList.push(c)
  }

  const semuaEfisiensiRata = Object.values(map).map((d) =>
    d.efisiensiList.reduce((a, b) => a + b, 0) / d.efisiensiList.length
  )

  return Object.values(map).map((d) => {
    const efisiensiRata = d.efisiensiList.reduce((a, b) => a + b, 0) / d.efisiensiList.length
    const utilisasiRata = d.utilisasiList.length
      ? d.utilisasiList.reduce((a, b) => a + b, 0) / d.utilisasiList.length
      : null
    const rpmEfektifRata = d.rpmEfektifList.length
      ? d.rpmEfektifList.reduce((a, b) => a + b, 0) / d.rpmEfektifList.length
      : null
    const rpmMaksRata = d.rpmMaksList.length
      ? d.rpmMaksList.reduce((a, b) => a + b, 0) / d.rpmMaksList.length
      : null
    const rejectRate = d.totalAktual ? (d.totalReject / d.totalAktual) * 100 : 0
    const normalitas = analisisNormalitas(efisiensiRata, semuaEfisiensiRata)
    const op = getOperatorById(d.operatorId)

    const evaluasi = evaluasiKinerja({
      utilisasi: utilisasiRata,
      efisiensi: efisiensiRata,
      rpmEfektif: rpmEfektifRata ?? 0,
      rpmMaks: rpmMaksRata,
      rejectRate,
    })

    return {
      ...d, nama: op?.nama ?? `Operator (${d.operatorId})`,
      efisiensiRata, utilisasiRata, rpmEfektifRata, rpmMaksRata,
      rejectRate, normalitas, status: statusPerforma(efisiensiRata),
      evaluasi,
      catatanList: d.catatanList,
    }
  }).sort((a, b) => b.efisiensiRata - a.efisiensiRata)
}

// ── Tab: Ringkasan ─────────────────────────────────────────────
function TabRingkasan({ data, filterOp, setFilterOp, operator }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-semibold text-gray-700 text-sm">Ringkasan Performa</h2>
        <select className="input text-sm w-auto" value={filterOp} onChange={(e) => setFilterOp(e.target.value)}>
          <option value="">Semua Operator</option>
          {operator.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
        </select>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Tidak ada data dalam rentang ini.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="pb-2 font-medium">Operator</th>
                <th className="pb-2 font-medium text-right">Aktual</th>
                <th className="pb-2 font-medium text-right">Reject%</th>
                <th className="pb-2 font-medium text-right">Utilisasi</th>
                <th className="pb-2 font-medium text-right">Efisiensi</th>
                <th className="pb-2 font-medium text-right">RPM Efektif</th>
                <th className="pb-2 font-medium">Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((r) => (
                <tr key={r.operatorId} className="hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-800">{r.nama}</td>
                  <td className="py-3 text-right text-gray-600">{r.totalAktual.toLocaleString('id-ID')}</td>
                  <td className="py-3 text-right">
                    <span className={r.rejectRate > 5 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                      {formatAngka(r.rejectRate)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {r.utilisasiRata !== null ? (
                      <span className={r.utilisasiRata >= 75 ? 'text-green-600 font-medium' : r.utilisasiRata >= 60 ? 'text-amber-500' : 'text-red-500 font-medium'}>
                        {formatAngka(r.utilisasiRata)}%
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.efisiensiRata >= 80 ? 'bg-green-400' : r.efisiensiRata >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${Math.min(r.efisiensiRata, 100)}%` }}
                        />
                      </div>
                      <span className="font-medium">{formatAngka(r.efisiensiRata)}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {r.rpmEfektifRata !== null ? (
                      <span>
                        {Math.round(r.rpmEfektifRata)}
                        {r.rpmMaksRata && (
                          <span className="text-gray-300 text-xs">/{Math.round(r.rpmMaksRata)}</span>
                        )}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3"><BadgeVerdict verdict={r.evaluasi.verdict} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Tab: Evaluasi per operator ─────────────────────────────────
function KartuEvaluasi({ r }) {
  const [open, setOpen] = useState(false)
  const cfg = VERDICT_CONFIG[r.evaluasi.verdict] ?? VERDICT_CONFIG.bisa_ditingkatkan
  const Icon = cfg.icon

  return (
    <div className="card border border-gray-100">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cfg.cls}`}><Icon size={16} /></div>
          <div className="text-left">
            <div className="font-semibold text-gray-800">{r.nama}</div>
            <div className="text-xs text-gray-400">{r.totalCatatan} sesi · {r.totalAktual.toLocaleString('id-ID')} item</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BadgeVerdict verdict={r.evaluasi.verdict} />
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-gray-50 pt-4">
          {/* Metrik ringkas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Efisiensi Output', val: `${formatAngka(r.efisiensiRata)}%`, ok: r.efisiensiRata >= 80 },
              { label: 'Utilisasi Waktu', val: r.utilisasiRata !== null ? `${formatAngka(r.utilisasiRata)}%` : '—', ok: r.utilisasiRata === null || r.utilisasiRata >= 75 },
              { label: 'RPM Efektif', val: r.rpmEfektifRata !== null ? `${Math.round(r.rpmEfektifRata)} / ${Math.round(r.rpmMaksRata ?? 0)}` : '—', ok: !r.rpmMaksRata || (r.rpmEfektifRata / r.rpmMaksRata) >= 0.7 },
              { label: 'Reject Rate', val: `${formatAngka(r.rejectRate)}%`, ok: r.rejectRate <= 5 },
            ].map(({ label, val, ok }) => (
              <div key={label} className={`rounded-lg px-3 py-2.5 text-center ${ok ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`font-bold text-lg ${ok ? 'text-green-700' : 'text-red-600'}`}>{val}</div>
              </div>
            ))}
          </div>

          {/* Total downtime */}
          {r.totalDowntimeMenit > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-sm">
              <Clock size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-700">Total downtime: {r.totalDowntimeMenit} menit</strong>
                {r.alasanList.length > 0 && (
                  <div className="text-amber-600 text-xs mt-1">
                    Alasan tercatat: {[...new Set(r.alasanList)].slice(0, 5).join(' · ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rekomendasi */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Zap size={14} className="text-harmoni-green" />
              Rekomendasi Sistem
            </div>
            <ul className="space-y-1.5">
              {r.evaluasi.rekomendasi.map((rek, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-harmoni-green-mid shrink-0 mt-0.5">•</span>
                  {rek}
                </li>
              ))}
            </ul>
          </div>

          {/* Normalitas */}
          {r.normalitas && (
            <div className={`text-xs rounded-lg px-3 py-2 ${r.normalitas.normal ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <strong>Normalitas vs rekan:</strong>{' '}
              {r.normalitas.normal
                ? `Normal (z-score: ${formatAngka(r.normalitas.zscore, 2)})`
                : `Di bawah rata-rata grup (z-score: ${formatAngka(r.normalitas.zscore, 2)}, rata-rata grup: ${formatAngka(r.normalitas.rata)}%)`}
            </div>
          )}

          {/* Foto Bukti */}
          {r.catatanList?.some((c) => c.fotoSebelum || c.fotoSetelah) && (
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Camera size={14} className="text-harmoni-green" />
                Foto Bukti Kerja
              </div>
              <div className="space-y-3">
                {r.catatanList
                  .filter((c) => c.fotoSebelum || c.fotoSetelah)
                  .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
                  .slice(0, 5)
                  .map((c) => (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-2">
                        {new Date(c.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {c.jamMulai && c.jamSelesai && ` · ${c.jamMulai}–${c.jamSelesai}`}
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {c.fotoSebelum && (
                          <FotoUpload label="Sebelum" value={c.fotoSebelum} onChange={() => {}} disabled />
                        )}
                        {c.fotoSetelah && (
                          <FotoUpload label="Setelah" value={c.fotoSetelah} onChange={() => {}} disabled />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TabEvaluasi({ data, filterOp }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        {filterOp
          ? 'Operator ini tidak memiliki data dalam rentang waktu yang dipilih.'
          : 'Tidak ada data untuk dievaluasi.'}
      </p>
    )
  }
  return (
    <div className="space-y-3">
      {data.map((r) => <KartuEvaluasi key={r.operatorId} r={r} />)}
    </div>
  )
}

// ── Grafik tren harian ─────────────────────────────────────────
function GrafikTren({ data, rpmMaks }) {
  return (
    <div className="card">
      <h2 className="font-semibold text-gray-700 mb-3 text-sm">Tren Harian</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="tgl" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 110]} />
          <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v, n) => [`${formatAngka(v)}%`, n]} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 2" />
          <ReferenceLine y={60} stroke="#d97706" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="efisiensi" name="Efisiensi %" stroke="#3b82f6" dot={{ r: 3 }} strokeWidth={2} />
          {data.some((d) => d.utilisasi !== null) && (
            <Line type="monotone" dataKey="utilisasi" name="Utilisasi %" stroke="#10b981" dot={{ r: 3 }} strokeWidth={2} strokeDasharray="5 3" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function LaporanOperator() {
  const { catatanProduksi, operator, mesin, produk, settings, getMesinById, getProdukById, getOperatorById } = useAppStore()
  const [rentangIdx, setRentangIdx] = useState(0)
  const [filterOp, setFilterOp] = useState('')
  const [activeTab, setActiveTab] = useState('ringkasan') // 'ringkasan' | 'evaluasi'

  const hari = RENTANG[rentangIdx].hari
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - hari)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const catatanFiltered = catatanProduksi.filter((c) => c.tanggal >= cutoffStr)

  const semuaData = useMemo(
    () => prosesDataOperator(catatanFiltered, settings, getMesinById, getProdukById, getOperatorById),
    [catatanFiltered, settings, operator, mesin, produk]
  )

  const dataTersaring = filterOp
    ? semuaData.filter((r) => r.operatorId === filterOp)
    : semuaData

  // Tren harian untuk operator terpilih
  const trenData = useMemo(() => {
    if (!filterOp) return []
    const catOp = catatanFiltered.filter((c) => c.operatorId === filterOp)
    const byDate = {}
    for (const c of catOp) {
      const m = getMesinById(c.mesinId)
      const p = getProdukById(c.produkId)
      if (!m || !p) continue
      const speed = c.kecepatan || m.rpm
      const totalMin = hitungSelisihMenit(c.jamMulai, c.jamSelesai)
      const aktifMin = hitungWaktuAktif(c.jamMulai, c.jamSelesai, c.menitBerhenti)
      const aktifEfektif = aktifMin > 0 ? aktifMin : resolveJamKerja(c) * 60
      const kapasitas = hitungKapasitasTeoritis(aktifEfektif / 60, speed, p.stitchCount)
      const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
      const utilisasi = totalMin > 0 ? hitungUtilisasi(aktifMin, totalMin) : null

      if (!byDate[c.tanggal]) byDate[c.tanggal] = { tanggal: c.tanggal, efisiensiList: [], utilisasiList: [] }
      byDate[c.tanggal].efisiensiList.push(efisiensi)
      if (utilisasi !== null) byDate[c.tanggal].utilisasiList.push(utilisasi)
    }
    return Object.values(byDate).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((d) => ({
      tgl: d.tanggal.slice(5),
      efisiensi: d.efisiensiList.reduce((a, b) => a + b, 0) / d.efisiensiList.length,
      utilisasi: d.utilisasiList.length
        ? d.utilisasiList.reduce((a, b) => a + b, 0) / d.utilisasiList.length
        : null,
    }))
  }, [filterOp, catatanFiltered])

  if (catatanProduksi.length === 0) {
    return (
      <div className="space-y-4">
        <h1 style={{ color: '#282828' }}>Laporan Operator</h1>
        <div className="card text-center py-16 rounded-2xl" style={{ background: '#FFFBD5', border: '1px solid #EDE9A8' }}>
          <div className="text-sm font-medium" style={{ color: '#034543', opacity: 0.5 }}>
            Belum ada data produksi. Mulai dengan{' '}
            <a href="/input" className="font-semibold hover:underline" style={{ color: '#034543' }}>Input Produksi</a>.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header + kontrol */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#034543', opacity: 0.6 }}>
            Analisis Kinerja
          </div>
          <h1 style={{ color: '#282828' }}>Laporan Operator</h1>
        </div>
        <div className="flex rounded-xl overflow-hidden text-sm" style={{ border: '1px solid #EDE9A8' }}>
          {RENTANG.map((r, i) => (
            <button key={r.hari} onClick={() => setRentangIdx(i)}
              className="px-3 py-1.5 text-sm font-semibold transition-colors"
              style={rentangIdx === i
                ? { background: '#034543', color: '#fff' }
                : { background: '#fff', color: '#6B7280' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grafik tren jika ada filter */}
      {filterOp && trenData.length > 1 && (
        <GrafikTren
          data={trenData}
          rpmMaks={semuaData.find((d) => d.operatorId === filterOp)?.rpmMaksRata}
        />
      )}

      {/* Tab */}
      <div className="flex gap-1" style={{ borderBottom: '2px solid #EDE9A8' }}>
        {[
          { key: 'ringkasan', label: 'Ringkasan' },
          { key: 'evaluasi',  label: 'Evaluasi Kinerja' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="px-4 py-2 text-sm font-semibold transition-colors -mb-0.5"
            style={activeTab === key
              ? { borderBottom: '2px solid #034543', color: '#034543' }
              : { borderBottom: '2px solid transparent', color: '#9CA3AF' }}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'ringkasan' && (
        <TabRingkasan data={dataTersaring} filterOp={filterOp} setFilterOp={setFilterOp} operator={operator} />
      )}
      {activeTab === 'evaluasi' && (
        <TabEvaluasi data={dataTersaring} filterOp={filterOp} />
      )}

      {/* Legenda */}
      <div className="card bg-harmoni-green-tint border-harmoni-green-tint flex items-start gap-2 text-sm text-harmoni-green">
        <Info size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Cara baca evaluasi:</strong>{' '}
          Utilisasi = % waktu mesin benar-benar berjalan dari total jam kerja.
          RPM Efektif = kecepatan rata-rata nyata selama produksi (total stitch ÷ menit aktif).
          Verdict ditentukan dari kombinasi utilisasi, efisiensi output, RPM efektif vs maks, dan reject rate.
        </div>
      </div>
    </div>
  )
}
