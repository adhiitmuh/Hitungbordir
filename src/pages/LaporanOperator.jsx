import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import useAppStore from '../store/appStore'
import {
  hitungKapasitasTeoritis, hitungEfisiensi, statusPerforma,
  analisisNormalitas, formatAngka, formatRupiah
} from '../utils/calculations'

function BadgeStatus({ status }) {
  if (status === 'baik') return <span className="badge-good"><CheckCircle2 size={11} />Baik ≥80%</span>
  if (status === 'cukup') return <span className="badge-warn"><AlertTriangle size={11} />Cukup 60–79%</span>
  return <span className="badge-bad"><AlertTriangle size={11} />Rendah &lt;60%</span>
}

function BadgeNormal({ normal }) {
  if (normal === null) return null
  return normal
    ? <span className="badge-good"><CheckCircle2 size={11} />Normal</span>
    : <span className="badge-bad"><AlertTriangle size={11} />Di bawah rata-rata</span>
}

const RENTANG = [
  { label: '7 Hari', hari: 7 },
  { label: '14 Hari', hari: 14 },
  { label: '30 Hari', hari: 30 },
]

export default function LaporanOperator() {
  const { catatanProduksi, operator, mesin, produk, settings, getMesinById, getProdukById, getOperatorById } = useAppStore()
  const [rentangIdx, setRentangIdx] = useState(0)
  const [filterOp, setFilterOp] = useState('')

  const hari = RENTANG[rentangIdx].hari
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - hari)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const catatanFiltered = catatanProduksi.filter((c) => c.tanggal >= cutoffStr)

  const ringkasanPerOperator = useMemo(() => {
    const map = {}
    for (const c of catatanFiltered) {
      const m = getMesinById(c.mesinId)
      const p = getProdukById(c.produkId)
      if (!m || !p) continue
      const speed = c.kecepatan || m.rpm
      const kapasitas = hitungKapasitasTeoritis(c.jamKerja ?? settings.jamKerjaPerShift, speed, p.stitchCount)
      const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
      if (!map[c.operatorId]) {
        map[c.operatorId] = {
          operatorId: c.operatorId,
          totalAktual: 0,
          totalKapasitas: 0,
          totalReject: 0,
          totalCatatan: 0,
          efisiensiList: [],
        }
      }
      map[c.operatorId].totalAktual += c.aktual
      map[c.operatorId].totalKapasitas += kapasitas
      map[c.operatorId].totalReject += c.reject ?? 0
      map[c.operatorId].totalCatatan++
      map[c.operatorId].efisiensiList.push(efisiensi)
    }

    // Semua efisiensi untuk normalitas
    const semuaEfisiensiRata = Object.values(map).map((d) =>
      d.efisiensiList.reduce((a, b) => a + b, 0) / d.efisiensiList.length
    )

    return Object.values(map).map((d) => {
      const efisiensiRata = d.efisiensiList.reduce((a, b) => a + b, 0) / d.efisiensiList.length
      const normalitas = analisisNormalitas(efisiensiRata, semuaEfisiensiRata)
      const op = getOperatorById(d.operatorId)
      return {
        ...d,
        nama: op?.nama ?? `Operator (${d.operatorId})`,
        efisiensiRata,
        status: statusPerforma(efisiensiRata),
        normalitas,
        rejectRate: d.totalAktual ? (d.totalReject / d.totalAktual) * 100 : 0,
      }
    }).sort((a, b) => b.efisiensiRata - a.efisiensiRata)
  }, [catatanFiltered, settings])

  const dataTersaring = filterOp
    ? ringkasanPerOperator.filter((r) => r.operatorId === filterOp)
    : ringkasanPerOperator

  // Grafik tren per hari untuk operator terpilih
  const trenData = useMemo(() => {
    if (!filterOp) return []
    const catOp = catatanFiltered.filter((c) => c.operatorId === filterOp)
    const byDate = {}
    for (const c of catOp) {
      const m = getMesinById(c.mesinId)
      const p = getProdukById(c.produkId)
      if (!m || !p) continue
      const speed = c.kecepatan || m.rpm
      const kapasitas = hitungKapasitasTeoritis(c.jamKerja ?? settings.jamKerjaPerShift, speed, p.stitchCount)
      const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
      if (!byDate[c.tanggal]) byDate[c.tanggal] = { tanggal: c.tanggal, efisiensiList: [], aktual: 0 }
      byDate[c.tanggal].efisiensiList.push(efisiensi)
      byDate[c.tanggal].aktual += c.aktual
    }
    return Object.values(byDate)
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      .map((d) => ({
        ...d,
        efisiensi: d.efisiensiList.reduce((a, b) => a + b, 0) / d.efisiensiList.length,
        tgl: d.tanggal.slice(5), // MM-DD
      }))
  }, [filterOp, catatanFiltered, settings])

  if (catatanProduksi.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Laporan Operator</h1>
        <div className="card text-center py-16 text-gray-400 text-sm">
          Belum ada data produksi. Mulai dengan <a href="/input" className="text-blue-500 hover:underline">Input Produksi</a>.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800">Laporan Operator</h1>
        <div className="flex items-center gap-2">
          {/* Filter rentang */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {RENTANG.map((r, i) => (
              <button
                key={r.hari}
                onClick={() => setRentangIdx(i)}
                className={`px-3 py-1.5 ${rentangIdx === i ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Filter operator */}
          <select
            className="input text-sm w-auto"
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
          >
            <option value="">Semua Operator</option>
            {operator.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {/* Tren grafik (hanya jika filter operator) */}
      {filterOp && trenData.length > 1 && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">
            Tren Efisiensi — {operator.find((o) => o.id === filterOp)?.nama}
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={trenData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="tgl" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 110]} />
              <Tooltip
                formatter={(val) => [`${formatAngka(val)}%`, 'Efisiensi']}
                contentStyle={{ fontSize: 12 }}
              />
              <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 2" label={{ value: '80%', position: 'right', fontSize: 10, fill: '#16a34a' }} />
              <ReferenceLine y={60} stroke="#d97706" strokeDasharray="4 2" label={{ value: '60%', position: 'right', fontSize: 10, fill: '#d97706' }} />
              <Bar dataKey="efisiensi" radius={[4, 4, 0, 0]}>
                {trenData.map((entry) => (
                  <Cell
                    key={entry.tanggal}
                    fill={entry.efisiensi >= 80 ? '#22c55e' : entry.efisiensi >= 60 ? '#f59e0b' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabel operator */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 text-sm">Ringkasan Performa ({RENTANG[rentangIdx].label})</h2>
          <div className="flex gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" />≥80%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400" />60–79%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" />&lt;60%</span>
          </div>
        </div>

        {dataTersaring.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Tidak ada data dalam rentang ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-2 font-medium">Operator</th>
                  <th className="pb-2 font-medium text-right">Total Produksi</th>
                  <th className="pb-2 font-medium text-right">Reject</th>
                  <th className="pb-2 font-medium text-right">Reject%</th>
                  <th className="pb-2 font-medium text-right">Efisiensi</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Normalitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataTersaring.map((r) => (
                  <tr key={r.operatorId} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{r.nama}</td>
                    <td className="py-3 text-right text-gray-600">{r.totalAktual.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-right text-red-500">{r.totalReject}</td>
                    <td className="py-3 text-right text-gray-500">{formatAngka(r.rejectRate)}%</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${r.efisiensiRata >= 80 ? 'bg-green-400' : r.efisiensiRata >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${Math.min(r.efisiensiRata, 100)}%` }}
                          />
                        </div>
                        <span className="font-medium">{formatAngka(r.efisiensiRata)}%</span>
                      </div>
                    </td>
                    <td className="py-3"><BadgeStatus status={r.status} /></td>
                    <td className="py-3">
                      <BadgeNormal normal={r.normalitas?.normal ?? null} />
                      {r.normalitas && !r.normalitas.normal && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          z={formatAngka(r.normalitas.zscore, 2)} (rata: {formatAngka(r.normalitas.rata)}%)
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legenda normalitas */}
      <div className="card bg-blue-50 border-blue-100 flex items-start gap-2 text-sm text-blue-700">
        <Info size={16} className="shrink-0 mt-0.5" />
        <div>
          <strong>Analisis Normalitas:</strong> Operator dianggap "normal" jika efisiensinya tidak lebih dari 1,5 standar deviasi
          di bawah rata-rata semua operator. Jika ditandai "Di bawah rata-rata", perlu perhatian khusus — cek kondisi mesin,
          keterampilan operator, atau kompleksitas produk yang dikerjakan.
        </div>
      </div>
    </div>
  )
}
