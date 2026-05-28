import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, Cpu, TrendingUp, AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import useAppStore from '../store/appStore'
import StatCard from '../components/StatCard'
import {
  hitungKapasitasTeoritis, hitungEfisiensi, statusPerforma, formatAngka, formatRupiah
} from '../utils/calculations'

function badgeStatus(status) {
  if (status === 'baik') return <span className="badge-good"><CheckCircle2 size={11} />Baik</span>
  if (status === 'cukup') return <span className="badge-warn"><AlertTriangle size={11} />Cukup</span>
  return <span className="badge-bad"><AlertTriangle size={11} />Rendah</span>
}

export default function Dashboard() {
  const { catatanProduksi, mesin, operator, produk, settings, getMesinById, getProdukById, getOperatorById } = useAppStore()

  const today = new Date().toISOString().slice(0, 10)
  const catatanHariIni = catatanProduksi.filter((c) => c.tanggal === today)

  const ringkasan = useMemo(() => {
    let totalAktual = 0, totalTarget = 0, totalReject = 0

    const rows = catatanHariIni.map((c) => {
      const m = getMesinById(c.mesinId)
      const p = getProdukById(c.produkId)
      const o = getOperatorById(c.operatorId)
      const speed = c.kecepatan || m?.rpm || 0
      const kapasitas = p && m
        ? hitungKapasitasTeoritis(c.jamKerja ?? settings.jamKerjaPerShift, speed, p.stitchCount)
        : 0
      const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
      totalAktual += c.aktual
      totalTarget += kapasitas
      totalReject += c.reject ?? 0
      return { ...c, mesin: m, produk: p, operator: o, kapasitas, efisiensi, status: statusPerforma(efisiensi) }
    })

    return { rows, totalAktual, totalTarget, totalReject, efisiensiRata: totalTarget ? (totalAktual / totalTarget) * 100 : 0 }
  }, [catatanHariIni])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/input" className="btn-primary flex items-center gap-2 text-sm">
          <ClipboardList size={15} />
          Input Produksi
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Produksi Hari Ini"
          value={formatAngka(ringkasan.totalAktual, 0)}
          sub="item selesai"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          label="Efisiensi Rata-rata"
          value={`${formatAngka(ringkasan.efisiensiRata)}%`}
          sub="vs kapasitas teoritis"
          icon={TrendingUp}
          color={ringkasan.efisiensiRata >= 80 ? 'green' : ringkasan.efisiensiRata >= 60 ? 'yellow' : 'red'}
        />
        <StatCard
          label="Total Reject"
          value={formatAngka(ringkasan.totalReject, 0)}
          sub="item cacat/reject"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          label="Mesin Aktif Hari Ini"
          value={new Set(catatanHariIni.map((c) => c.mesinId)).size}
          sub={`dari ${mesin.length} mesin`}
          icon={Cpu}
          color="purple"
        />
      </div>

      {/* Ringkasan Setup */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Mesin" value={mesin.length} icon={Cpu} color="blue" />
        <StatCard label="Total Operator" value={operator.length} icon={Users} color="green" />
        <StatCard label="Jenis Produk" value={produk.length} icon={Package} color="yellow" />
      </div>

      {/* Tabel performa hari ini */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Performa Operator Hari Ini</h2>
          <Link to="/laporan" className="text-xs text-blue-600 hover:underline">Lihat semua →</Link>
        </div>

        {ringkasan.rows.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Belum ada catatan produksi hari ini.{' '}
            <Link to="/input" className="text-blue-500 hover:underline">Input sekarang</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-2 font-medium">Operator</th>
                  <th className="pb-2 font-medium">Mesin</th>
                  <th className="pb-2 font-medium">Produk</th>
                  <th className="pb-2 font-medium text-right">Speed</th>
                  <th className="pb-2 font-medium text-right">Stitch</th>
                  <th className="pb-2 font-medium text-right">Target</th>
                  <th className="pb-2 font-medium text-right">Aktual</th>
                  <th className="pb-2 font-medium text-right">Reject</th>
                  <th className="pb-2 font-medium text-right">Efisiensi</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ringkasan.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium text-gray-700">{row.operator?.nama ?? '-'}</td>
                    <td className="py-2.5 text-gray-500">{row.mesin?.nama ?? '-'}</td>
                    <td className="py-2.5">
                      <span className="text-gray-700">{row.produk?.nama ?? '-'}</span>
                      {row.produk && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({row.produk.tipeBordir})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-gray-600">
                      {(row.kecepatan || row.mesin?.rpm) ?? '-'}
                      {row.mesin && row.kecepatan && row.kecepatan < row.mesin.rpm && (
                        <span className="ml-1 text-amber-400 text-xs">↓</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-gray-500 text-xs">
                      {row.produk?.stitchCount?.toLocaleString('id-ID') ?? '-'}
                    </td>
                    <td className="py-2.5 text-right text-gray-500">{row.kapasitas}</td>
                    <td className="py-2.5 text-right font-medium text-gray-800">{row.aktual}</td>
                    <td className="py-2.5 text-right text-red-500">{row.reject ?? 0}</td>
                    <td className="py-2.5 text-right font-medium">{formatAngka(row.efisiensi)}%</td>
                    <td className="py-2.5">{badgeStatus(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
