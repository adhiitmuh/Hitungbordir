import { useState } from 'react'
import { Plus, Trash2, ClipboardCheck, Info, Clock, Camera } from 'lucide-react'
import useAppStore from '../store/appStore'
import useAuthStore from '../store/authStore'
import FotoUpload from '../components/FotoUpload'
import {
  hitungKapasitasTeoritis, hitungEfisiensi, hitungSelisihMenit,
  hitungWaktuAktif, hitungUtilisasi, hitungRpmEfektif, formatAngka
} from '../utils/calculations'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function nowTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function emptyForm(operatorId = '') {
  return {
    operatorId,
    mesinId: '',
    produkId: '',
    kecepatan: '',
    jamMulai: '',
    jamSelesai: '',
    menitBerhenti: '',
    alasanBerhenti: '',
    aktual: '',
    reject: '',
    catatan: '',
    benangAtasId: '',
    benangBawahId: '',
    fotoSebelum: null,
    fotoSetelah: null,
  }
}

export default function InputProduksi() {
  const {
    operator, mesin, produk, benang, settings, catatanProduksi,
    tambahCatatan, hapusCatatan, getMesinById, getProdukById, getOperatorById
  } = useAppStore()
  const { role, operatorId: sessionOpId } = useAuthStore()

  const [tanggal, setTanggal] = useState(today())
  const [form, setForm] = useState(emptyForm(sessionOpId ?? ''))
  const [saved, setSaved] = useState(false)

  const catatanHari = catatanProduksi
    .filter((c) => c.tanggal === tanggal)
    .sort((a, b) => b.id.localeCompare(a.id))

  // Preview kalkulasi
  const mesinTerpilih = getMesinById(form.mesinId)
  const produkTerpilih = getProdukById(form.produkId)
  const kecepatanEfektif = +form.kecepatan || mesinTerpilih?.rpm || 0

  const totalMenit = hitungSelisihMenit(form.jamMulai, form.jamSelesai)
  const waktuAktif = hitungWaktuAktif(form.jamMulai, form.jamSelesai, +form.menitBerhenti)
  const jamAktif = waktuAktif / 60

  const kapasitasPreview = mesinTerpilih && produkTerpilih && waktuAktif > 0
    ? hitungKapasitasTeoritis(jamAktif, kecepatanEfektif, produkTerpilih.stitchCount)
    : null

  const utilisasiPreview = totalMenit > 0 ? hitungUtilisasi(waktuAktif, totalMenit) : null
  const efisiensiPreview = kapasitasPreview && form.aktual
    ? hitungEfisiensi(+form.aktual, kapasitasPreview)
    : null
  const rpmEfektifPreview = form.aktual && produkTerpilih && waktuAktif > 0
    ? hitungRpmEfektif(+form.aktual, produkTerpilih.stitchCount, waktuAktif)
    : null

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.operatorId || !form.mesinId || !form.produkId || !form.aktual) return
    tambahCatatan({
      tanggal,
      operatorId: form.operatorId,
      mesinId: form.mesinId,
      produkId: form.produkId,
      kecepatan: +form.kecepatan || mesinTerpilih?.rpm || 0,
      jamMulai: form.jamMulai,
      jamSelesai: form.jamSelesai,
      menitBerhenti: +form.menitBerhenti || 0,
      alasanBerhenti: form.alasanBerhenti,
      aktual: +form.aktual,
      reject: +form.reject || 0,
      catatan: form.catatan,
      benangAtasId: form.benangAtasId || null,
      benangBawahId: form.benangBawahId || null,
      fotoSebelum: form.fotoSebelum,
      fotoSetelah: form.fotoSetelah,
    })
    setForm(emptyForm(sessionOpId ?? ''))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isStaff = role === 'staff'
  const formValid = form.operatorId && form.mesinId && form.produkId && form.aktual

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Input Produksi</h1>
        {!isStaff && (
          <input type="date" className="input text-sm w-auto"
            value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        )}
      </div>

      {/* Form */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">
          {isStaff ? 'Laporan Kerja Kamu' : 'Catat Produksi'}
          {isStaff && (
            <span className="ml-2 text-xs text-gray-400 font-normal">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Operator — hidden jika staff (auto dari session) */}
            {isStaff ? (
              <div className="sm:col-span-2 bg-blue-50 rounded-lg px-3 py-2.5 text-sm text-blue-700 font-medium">
                Operator: {getOperatorById(sessionOpId)?.nama ?? '—'}
              </div>
            ) : (
              <div>
                <label className="label">Operator *</label>
                <select className="input" value={form.operatorId}
                  onChange={(e) => {
                    const op = operator.find((o) => o.id === e.target.value)
                    setForm({ ...form, operatorId: e.target.value, mesinId: op?.mesinId ?? form.mesinId })
                  }}>
                  <option value="">— pilih operator —</option>
                  {operator.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
                </select>
              </div>
            )}

            {/* Mesin */}
            <div>
              <label className="label">Mesin *</label>
              <select className="input" value={form.mesinId}
                onChange={(e) => {
                  const m = mesin.find((x) => x.id === e.target.value)
                  setForm({ ...form, mesinId: e.target.value, kecepatan: m ? String(m.rpm) : '' })
                }}>
                <option value="">— pilih mesin —</option>
                {mesin.map((m) => <option key={m.id} value={m.id}>{m.nama} (maks {m.rpm} RPM)</option>)}
              </select>
            </div>

            {/* Speed aktual */}
            <div>
              <label className="label">Speed Aktual (RPM)</label>
              <input className="input" type="number"
                placeholder={mesinTerpilih ? `maks: ${mesinTerpilih.rpm}` : '—'}
                value={form.kecepatan}
                onChange={(e) => setForm({ ...form, kecepatan: e.target.value })} />
              {mesinTerpilih && form.kecepatan && +form.kecepatan !== mesinTerpilih.rpm && (
                <p className="text-xs text-amber-500 mt-0.5">↓ diturunkan dari {mesinTerpilih.rpm} RPM</p>
              )}
            </div>

            {/* Produk */}
            <div className="sm:col-span-2">
              <label className="label">Jenis Produk *</label>
              <select className="input" value={form.produkId}
                onChange={(e) => setForm({ ...form, produkId: e.target.value })}>
                <option value="">— pilih produk —</option>
                {produk.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — {p.tipeBordir} — {p.stitchCount.toLocaleString('id-ID')} stitch
                  </option>
                ))}
              </select>
            </div>

            {/* Benang (tampil hanya jika ada data benang) */}
            {benang.length > 0 && (
              <>
                <div>
                  <label className="label">Benang Atas</label>
                  <select className="input" value={form.benangAtasId}
                    onChange={(e) => setForm({ ...form, benangAtasId: e.target.value })}>
                    <option value="">— pilih benang atas —</option>
                    {benang.filter((b) => b.tipe === 'atas').map((b) => (
                      <option key={b.id} value={b.id}>{b.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Benang Bawah (Bobbin)</label>
                  <select className="input" value={form.benangBawahId}
                    onChange={(e) => setForm({ ...form, benangBawahId: e.target.value })}>
                    <option value="">— pilih benang bawah —</option>
                    {benang.filter((b) => b.tipe === 'bawah').map((b) => (
                      <option key={b.id} value={b.id}>{b.nama}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* ── Waktu kerja ── */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Waktu Kerja</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Jam Mulai</label>
                  <input className="input" type="time" value={form.jamMulai}
                    onChange={(e) => setForm({ ...form, jamMulai: e.target.value })} />
                </div>
                <div>
                  <label className="label">Jam Selesai</label>
                  <input className="input" type="time" value={form.jamSelesai}
                    onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Downtime */}
            <div>
              <label className="label">Total Berhenti (menit)</label>
              <input className="input" type="number" placeholder="0" value={form.menitBerhenti}
                onChange={(e) => setForm({ ...form, menitBerhenti: e.target.value })} />
              <p className="text-xs text-gray-400 mt-0.5">Ganti benang, macet, istirahat, dll.</p>
            </div>
            <div>
              <label className="label">Alasan Berhenti</label>
              <input className="input" placeholder="cth: benang putus 2x, ganti jarum"
                value={form.alasanBerhenti}
                onChange={(e) => setForm({ ...form, alasanBerhenti: e.target.value })} />
            </div>

            {/* Preview kalkulasi waktu */}
            {form.jamMulai && form.jamSelesai && (
              <div className="sm:col-span-2 bg-blue-50 rounded-xl px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-xs text-blue-400">Durasi Total</div>
                  <div className="font-semibold text-blue-700">{totalMenit} menit</div>
                </div>
                <div>
                  <div className="text-xs text-blue-400">Waktu Aktif</div>
                  <div className="font-semibold text-blue-700">{waktuAktif} menit</div>
                </div>
                <div>
                  <div className="text-xs text-blue-400">Utilisasi</div>
                  <div className={`font-semibold ${utilisasiPreview >= 75 ? 'text-green-600' : utilisasiPreview >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                    {utilisasiPreview !== null ? `${formatAngka(utilisasiPreview)}%` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-400">Kapasitas Teoritis</div>
                  <div className="font-semibold text-blue-700">
                    {kapasitasPreview !== null ? `${kapasitasPreview} item` : '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Hasil aktual */}
            <div>
              <label className="label">Hasil Aktual (item) *</label>
              <input className="input" type="number" placeholder="0" value={form.aktual}
                onChange={(e) => setForm({ ...form, aktual: e.target.value })} />
            </div>
            <div>
              <label className="label">Jumlah Reject/Cacat</label>
              <input className="input" type="number" placeholder="0" value={form.reject}
                onChange={(e) => setForm({ ...form, reject: e.target.value })} />
            </div>

            {/* Preview efisiensi + RPM efektif */}
            {form.aktual && kapasitasPreview !== null && (
              <div className="sm:col-span-2 flex gap-3 text-sm flex-wrap">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-400">Efisiensi: </span>
                  <strong className={efisiensiPreview >= 80 ? 'text-green-600' : efisiensiPreview >= 60 ? 'text-amber-500' : 'text-red-500'}>
                    {formatAngka(efisiensiPreview)}%
                  </strong>
                </div>
                {rpmEfektifPreview !== null && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-gray-400">RPM efektif: </span>
                    <strong className="text-gray-700">{Math.round(rpmEfektifPreview)}</strong>
                    {mesinTerpilih && (
                      <span className="text-gray-400 text-xs ml-1">/ maks {mesinTerpilih.rpm}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Catatan */}
            <div className="sm:col-span-2">
              <label className="label">Catatan Tambahan</label>
              <input className="input" placeholder="opsional — cth: mesin sempat overheat"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
            </div>

            {/* Foto Bukti Kerja */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Camera size={14} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Foto Bukti Kerja</span>
                <span className="text-xs text-gray-400">(opsional)</span>
              </div>
              <div className="flex gap-6 flex-wrap">
                <FotoUpload
                  label="Foto Sebelum Kerja"
                  value={form.fotoSebelum}
                  onChange={(v) => setForm({ ...form, fotoSebelum: v })}
                />
                <FotoUpload
                  label="Foto Setelah Kerja"
                  value={form.fotoSetelah}
                  onChange={(v) => setForm({ ...form, fotoSetelah: v })}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2" disabled={!formValid}>
            <Plus size={16} />
            {saved ? '✓ Laporan Tersimpan!' : 'Simpan Laporan'}
          </button>

          {(operator.length === 0 || mesin.length === 0 || produk.length === 0) && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Pastikan Admin sudah mengisi <strong>Master Data</strong> (Mesin, Operator, Produk) sebelum input.
            </p>
          )}
        </form>
      </div>

      {/* Riwayat hari ini */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">
          {isStaff ? 'Laporan Kamu Hari Ini' : `Catatan ${new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`}
        </h2>

        {catatanHari.filter((c) => isStaff ? c.operatorId === sessionOpId : true).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada catatan{isStaff ? ' dari kamu' : ''} untuk hari ini.</p>
        ) : (
          <div className="space-y-2">
            {catatanHari
              .filter((c) => isStaff ? c.operatorId === sessionOpId : true)
              .map((c) => {
                const op = getOperatorById(c.operatorId)
                const m = getMesinById(c.mesinId)
                const p = getProdukById(c.produkId)
                const speed = c.kecepatan || m?.rpm || 0
                const totalMin = hitungSelisihMenit(c.jamMulai, c.jamSelesai)
                const aktifMin = hitungWaktuAktif(c.jamMulai, c.jamSelesai, c.menitBerhenti)
                const utilisasi = totalMin > 0 ? hitungUtilisasi(aktifMin, totalMin) : null
                const kapasitas = m && p && aktifMin > 0
                  ? hitungKapasitasTeoritis(aktifMin / 60, speed, p.stitchCount)
                  : 0
                const efisiensi = hitungEfisiensi(c.aktual, kapasitas)

                return (
                  <div key={c.id} className="border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-medium text-sm text-gray-800 flex items-center gap-1.5 flex-wrap">
                        <ClipboardCheck size={14} className="text-green-500 shrink-0" />
                        {!isStaff && <span>{op?.nama ?? '?'} · </span>}
                        {m?.nama ?? '?'} · {p?.nama ?? '?'}
                        <span className="text-xs text-gray-400">({p?.tipeBordir})</span>
                      </div>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-3">
                        {c.jamMulai && c.jamSelesai && (
                          <span>{c.jamMulai}–{c.jamSelesai}
                            {c.menitBerhenti > 0 && <span className="text-amber-500"> (berhenti {c.menitBerhenti}m)</span>}
                          </span>
                        )}
                        {utilisasi !== null && (
                          <span>utilisasi <strong className={utilisasi >= 75 ? 'text-green-600' : 'text-amber-500'}>{formatAngka(utilisasi)}%</strong></span>
                        )}
                        <span>{c.aktual} item · reject {c.reject}</span>
                        <span>efisiensi <strong>{formatAngka(efisiensi)}%</strong></span>
                      </div>
                      {c.alasanBerhenti && (
                        <div className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-0.5 inline-block">
                          Berhenti: {c.alasanBerhenti}
                        </div>
                      )}
                      {c.catatan && <div className="text-xs text-gray-400 italic">{c.catatan}</div>}
                      {(c.fotoSebelum || c.fotoSetelah) && (
                        <div className="flex gap-2 mt-1">
                          {c.fotoSebelum && (
                            <FotoUpload label="Sebelum" value={c.fotoSebelum} onChange={() => {}} disabled />
                          )}
                          {c.fotoSetelah && (
                            <FotoUpload label="Setelah" value={c.fotoSetelah} onChange={() => {}} disabled />
                          )}
                        </div>
                      )}
                    </div>
                    {!isStaff && (
                      <button className="text-gray-300 hover:text-red-400 shrink-0" onClick={() => hapusCatatan(c.id)}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
