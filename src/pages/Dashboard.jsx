import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, Cpu, TrendingUp, AlertTriangle, CheckCircle2, ClipboardList } from 'lucide-react'
import useAppStore from '../store/appStore'
import StatCard from '../components/StatCard'
import {
  hitungKapasitasTeoritis, hitungEfisiensi, statusPerforma,
  hitungWaktuAktif, hitungSelisihMenit, hitungUtilisasi,
  resolveJamKerja, formatAngka
} from '../utils/calculations'

function badgeStatus(status) {
  if (status === 'baik') return <span className="badge-good"><CheckCircle2 size={11} />Baik</span>
  if (status === 'cukup') return <span className="badge-warn"><AlertTriangle size={11} />Cukup</span>
  return <span className="badge-bad"><AlertTriangle size={11} />Rendah</span>
}

export default function Dashboard() {
  const { catatanProduksi, mesin, operator, produk, getMesinById, getProdukById, getOperatorById } = useAppStore()

  const today = new Date().toISOString().slice(0, 10)
  const catatanHariIni = catatanProduksi.filter((c) => c.tanggal === today)

  const ringkasan = useMemo(() => {
    let totalAktual = 0, totalTarget = 0, totalReject = 0

    const rows = catatanHariIni.map((c) => {
      const m = getMesinById(c.mesinId)
      const p = getProdukById(c.produkId)
      const o = getOperatorById(c.operatorId)
      const speed = c.kecepatan || m?.rpm || 0
      const totalMin = hitungSelisihMenit(c.jamMulai, c.jamSelesai)
      const aktifMin = hitungWaktuAktif(c.jamMulai, c.jamSelesai, c.menitBerhenti)
      const jamEfektif = aktifMin > 0 ? aktifMin / 60 : resolveJamKerja(c)
      const utilisasi = totalMin > 0 ? hitungUtilisasi(aktifMin, totalMin) : null
      const kapasitas = p && m ? hitungKapasitasTeoritis(jamEfektif, speed, p.stitchCount) : 0
      const efisiensi = hitungEfisiensi(c.aktual, kapasitas)
      totalAktual += c.aktual
      totalTarget += kapasitas
      totalReject += c.reject ?? 0
      return { ...c, mesin: m, produk: p, operator: o, kapasitas, efisiensi, utilisasi, status: statusPerforma(efisiensi) }
    })

    return { rows, totalAktual, totalTarget, totalReject, efisiensiRata: totalTarget ? (totalAktual / totalTarget) * 100 : 0 }
  }, [catatanHariIni])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#034543', opacity: 0.6 }}>
            Harmoni Bordir
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#282828' }}>Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/input" className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
          <ClipboardList size={15} />
          Input Produksi
        </Link>
      </div>

      {/* Stat cards — produksi hari ini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Produksi Hari Ini"
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
          label="Mesin Aktif"
          value={new Set(catatanHariIni.map((c) => c.mesinId)).size}
          sub={`dari ${mesin.length} mesin terdaftar`}
          icon={Cpu}
          color="purple"
        />
      </div>

      {/* Ringkasan master data */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Mesin" value={mesin.length} icon={Cpu} color="blue" />
        <StatCard label="Total Operator" value={operator.length} icon={Users} color="green" />
        <StatCard label="Jenis Produk" value={produk.length} icon={Package} color="yellow" />
      </div>

      {/* Tabel performa hari ini */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#034543', opacity: 0.6 }}>Hari Ini</div>
            <h2 className="font-bold" style={{ color: '#282828' }}>Performa Operator</h2>
          </div>
          <Link to="/laporan" className="text-xs font-semibold hover:underline" style={{ color: '#034543' }}>
            Lihat semua →
          </Link>
        </div>

        {ringkasan.rows.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ background: '#FFFBD5' }}>
            <div className="text-sm font-medium" style={{ color: '#034543', opacity: 0.6 }}>Belum ada catatan produksi hari ini.</div>
            <Link to="/input" className="text-sm font-semibold hover:underline mt-1 block" style={{ color: '#034543' }}>
              Input sekarang →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs border-b" style={{ borderColor: '#EDE9A8' }}>
                  {['Operator','Mesin','Produk','Speed','Stitch','Target','Aktual','Reject','Utilisasi','Efisiensi','Status'].map((h, i) => (
                    <th key={h} className={`pb-3 font-semibold uppercase tracking-wide ${i > 3 ? 'text-right' : ''}`}
                      style={{ color: '#034543', opacity: 0.6, fontSize: '0.65rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ringkasan.rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-harmoni-beige transition-colors"
                    style={{ borderColor: '#F5F2BE' }}>
                    <td className="py-3 font-semibold" style={{ color: '#282828' }}>{row.operator?.nama ?? '-'}</td>
                    <td className="py-3 text-gray-500">{row.mesin?.nama ?? '-'}</td>
                    <td className="py-3">
                      <span style={{ color: '#282828' }}>{row.produk?.nama ?? '-'}</span>
                      {row.produk && <span className="ml-1 text-xs text-gray-400">({row.produk.tipeBordir})</span>}
                    </td>
                    <td className="py-3 text-right text-gray-600">
                      {(row.kecepatan || row.mesin?.rpm) ?? '-'}
                      {row.mesin && row.kecepatan && row.kecepatan < row.mesin.rpm && (
                        <span className="ml-1 text-amber-400 text-xs">↓</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-gray-400 text-xs">
                      {row.produk?.stitchCount?.toLocaleString('id-ID') ?? '-'}
                    </td>
                    <td className="py-3 text-right text-gray-400">{row.kapasitas}</td>
                    <td className="py-3 text-right font-bold" style={{ color: '#282828' }}>{row.aktual}</td>
                    <td className="py-3 text-right text-red-500">{row.reject ?? 0}</td>
                    <td className="py-3 text-right">
                      {row.utilisasi !== null
                        ? <span className={`font-semibold ${row.utilisasi >= 75 ? 'text-green-600' : row.utilisasi >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {formatAngka(row.utilisasi)}%
                          </span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-3 text-right font-semibold" style={{ color: '#282828' }}>{formatAngka(row.efisiensi)}%</td>
                    <td className="py-3">{badgeStatus(row.status)}</td>
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
