import { useState } from 'react'
import { Plus, Trash2, ClipboardCheck, Clock, Camera, User, Cpu, Package } from 'lucide-react'
import useAppStore from '../store/appStore'
import useAuthStore from '../store/authStore'
import FotoUpload from '../components/FotoUpload'
import {
  hitungKapasitasTeoritis, hitungEfisiensi, hitungSelisihMenit,
  hitungWaktuAktif, hitungUtilisasi, hitungRpmEfektif, formatAngka
} from '../utils/calculations'

function today() { return new Date().toISOString().slice(0, 10) }

function emptyForm(operatorId = '') {
  return {
    operatorId, mesinId: '', produkId: '', kecepatan: '',
    jamMulai: '', jamSelesai: '', menitBerhenti: '', alasanBerhenti: '',
    aktual: '', reject: '', catatan: '',
    benangAtasId: '', benangBawahId: '',
    fotoSebelum: null, fotoSetelah: null,
  }
}

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #EDE9A8' }}>
      <div className="p-1.5 rounded-lg" style={{ background: '#EBF4F3' }}>
        <Icon size={14} style={{ color: '#034543' }} />
      </div>
      <div>
        <div className="text-sm font-bold" style={{ color: '#282828' }}>{title}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

export default function InputProduksi() {
  const {
    operator, mesin, produk, benang, catatanProduksi,
    tambahCatatan, hapusCatatan, getMesinById, getProdukById, getOperatorById, getBenangById
  } = useAppStore()
  const { role, operatorId: sessionOpId } = useAuthStore()

  const [tanggal, setTanggal] = useState(today())
  const [form, setForm] = useState(emptyForm(sessionOpId ?? ''))
  const [saved, setSaved] = useState(false)

  const catatanHari = catatanProduksi
    .filter((c) => c.tanggal === tanggal)
    .sort((a, b) => b.id.localeCompare(a.id))

  const mesinTerpilih  = getMesinById(form.mesinId)
  const produkTerpilih = getProdukById(form.produkId)
  const kecepatanEfektif = +form.kecepatan || mesinTerpilih?.rpm || 0

  const totalMenit    = hitungSelisihMenit(form.jamMulai, form.jamSelesai)
  const waktuAktif    = hitungWaktuAktif(form.jamMulai, form.jamSelesai, +form.menitBerhenti)
  const jamAktif      = waktuAktif / 60

  const kapasitasPreview = mesinTerpilih && produkTerpilih && waktuAktif > 0
    ? hitungKapasitasTeoritis(jamAktif, kecepatanEfektif, produkTerpilih.stitchCount) : null
  const utilisasiPreview  = totalMenit > 0 ? hitungUtilisasi(waktuAktif, totalMenit) : null
  const efisiensiPreview  = kapasitasPreview && form.aktual ? hitungEfisiensi(+form.aktual, kapasitasPreview) : null
  const rpmEfektifPreview = form.aktual && produkTerpilih && waktuAktif > 0
    ? hitungRpmEfektif(+form.aktual, produkTerpilih.stitchCount, waktuAktif) : null

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.operatorId || !form.mesinId || !form.produkId || !form.aktual) return
    tambahCatatan({
      tanggal,
      operatorId: form.operatorId, mesinId: form.mesinId, produkId: form.produkId,
      kecepatan: +form.kecepatan || mesinTerpilih?.rpm || 0,
      jamMulai: form.jamMulai, jamSelesai: form.jamSelesai,
      menitBerhenti: +form.menitBerhenti || 0, alasanBerhenti: form.alasanBerhenti,
      aktual: +form.aktual, reject: +form.reject || 0, catatan: form.catatan,
      benangAtasId: form.benangAtasId || null, benangBawahId: form.benangBawahId || null,
      fotoSebelum: form.fotoSebelum, fotoSetelah: form.fotoSetelah,
    })
    setForm(emptyForm(sessionOpId ?? ''))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isStaff  = role === 'staff'
  const formValid = form.operatorId && form.mesinId && form.produkId && form.aktual

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#034543', opacity: 0.6 }}>
            {isStaff ? 'Laporan Kerja' : 'Rekap Harian'}
          </div>
          <h1 style={{ color: '#282828' }}>Input Produksi</h1>
          {isStaff && (
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
        {!isStaff && (
          <input type="date" className="input text-sm w-auto"
            value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: Operator & Mesin */}
        <div className="card">
          <SectionHeader icon={User} title="Operator & Mesin" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isStaff ? (
              <div className="sm:col-span-2 flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: '#EBF4F3', border: '1px solid #C8E0DF' }}>
                <User size={14} style={{ color: '#034543' }} />
                <span className="text-sm font-semibold" style={{ color: '#034543' }}>
                  {getOperatorById(sessionOpId)?.nama ?? '—'}
                </span>
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

            <div>
              <label className="label">Speed Aktual (RPM)</label>
              <input className="input" type="number"
                placeholder={mesinTerpilih ? `maks: ${mesinTerpilih.rpm}` : '—'}
                value={form.kecepatan}
                onChange={(e) => setForm({ ...form, kecepatan: e.target.value })} />
              {mesinTerpilih && form.kecepatan && +form.kecepatan < mesinTerpilih.rpm && (
                <p className="text-xs text-amber-500 mt-1">↓ diturunkan dari {mesinTerpilih.rpm} RPM</p>
              )}
              {mesinTerpilih && form.kecepatan && +form.kecepatan > mesinTerpilih.rpm && (
                <p className="text-xs text-red-500 mt-1">⚠ melebihi kapasitas maks {mesinTerpilih.rpm} RPM</p>
              )}
            </div>

            <div className={isStaff ? '' : 'sm:col-span-2'}>
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
          </div>
        </div>

        {/* Section 2: Waktu Kerja */}
        <div className="card">
          <SectionHeader icon={Clock} title="Waktu Kerja" sub="Jam mulai, selesai, dan total downtime" />
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
            <div>
              <label className="label">Total Berhenti (menit)</label>
              <input className="input" type="number" placeholder="0" value={form.menitBerhenti}
                onChange={(e) => setForm({ ...form, menitBerhenti: e.target.value })} />
              <p className="text-xs text-gray-400 mt-1">Ganti benang, macet, istirahat, dll.</p>
            </div>
            <div>
              <label className="label">Alasan Berhenti</label>
              <input className="input" placeholder="cth: benang putus 2x, ganti jarum"
                value={form.alasanBerhenti}
                onChange={(e) => setForm({ ...form, alasanBerhenti: e.target.value })} />
            </div>
          </div>

          {/* Preview waktu */}
          {form.jamMulai && form.jamSelesai && (
            <div className="preview-panel mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Durasi Total', val: `${totalMenit} menit` },
                { label: 'Waktu Aktif', val: `${waktuAktif} menit` },
                {
                  label: 'Utilisasi',
                  val: utilisasiPreview !== null ? `${formatAngka(utilisasiPreview)}%` : '—',
                  highlight: utilisasiPreview !== null,
                  ok: utilisasiPreview >= 75,
                },
                {
                  label: 'Kapasitas Teoritis',
                  val: kapasitasPreview !== null ? `${kapasitasPreview} item` : '—',
                },
              ].map(({ label, val, highlight, ok }) => (
                <div key={label}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#034543', opacity: 0.6 }}>{label}</div>
                  <div className={`font-bold text-base ${highlight ? (ok ? 'text-green-600' : 'text-amber-500') : ''}`}
                    style={!highlight ? { color: '#034543' } : {}}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Hasil Produksi */}
        <div className="card">
          <SectionHeader icon={Package} title="Hasil Produksi" />
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Preview efisiensi */}
          {form.aktual && kapasitasPreview !== null && (
            <div className="preview-panel mt-4 flex gap-4 flex-wrap">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#034543', opacity: 0.6 }}>Efisiensi</div>
                <div className={`font-bold text-lg ${efisiensiPreview >= 80 ? 'text-green-600' : efisiensiPreview >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                  {formatAngka(efisiensiPreview)}%
                </div>
              </div>
              {rpmEfektifPreview !== null && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#034543', opacity: 0.6 }}>RPM Efektif</div>
                  <div className="font-bold text-lg" style={{ color: '#282828' }}>
                    {Math.round(rpmEfektifPreview)}
                    {mesinTerpilih && <span className="text-sm font-normal text-gray-400">/{mesinTerpilih.rpm}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-3">
            <label className="label">Catatan Tambahan</label>
            <input className="input" placeholder="opsional — cth: mesin sempat overheat"
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
          </div>
        </div>

        {/* Section 4: Foto Bukti */}
        <div className="card">
          <SectionHeader icon={Camera} title="Foto Bukti Kerja" sub="Opsional — foto sebelum dan sesudah kerja" />
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

        {/* Submit */}
        <div className="space-y-3">
          <button type="submit" className="btn-primary flex items-center gap-2 w-full justify-center py-3" disabled={!formValid}>
            <Plus size={16} />
            {saved ? '✓ Laporan Tersimpan!' : 'Simpan Laporan'}
          </button>

          {(operator.length === 0 || mesin.length === 0 || produk.length === 0) && (
            <div className="text-xs text-amber-700 rounded-xl px-4 py-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              Pastikan Admin sudah mengisi <strong>Master Data</strong> (Mesin, Operator, Produk) sebelum input.
            </div>
          )}
        </div>
      </form>

      {/* Riwayat hari ini */}
      <div className="card">
        <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #EDE9A8' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#034543', opacity: 0.6 }}>
            {isStaff ? 'Laporan Kamu' : new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
          </div>
          <h2 style={{ color: '#282828' }}>{isStaff ? 'Riwayat Hari Ini' : 'Catatan Produksi'}</h2>
        </div>

        {catatanHari.filter((c) => isStaff ? c.operatorId === sessionOpId : true).length === 0 ? (
          <div className="text-center py-10 rounded-xl" style={{ background: '#FFFBD5' }}>
            <p className="text-sm font-medium" style={{ color: '#034543', opacity: 0.5 }}>
              Belum ada catatan{isStaff ? ' dari kamu' : ''} untuk hari ini.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {catatanHari
              .filter((c) => isStaff ? c.operatorId === sessionOpId : true)
              .map((c) => {
                const op = getOperatorById(c.operatorId)
                const m  = getMesinById(c.mesinId)
                const p  = getProdukById(c.produkId)
                const speed = c.kecepatan || m?.rpm || 0
                const totalMin = hitungSelisihMenit(c.jamMulai, c.jamSelesai)
                const aktifMin = hitungWaktuAktif(c.jamMulai, c.jamSelesai, c.menitBerhenti)
                const utilisasi = totalMin > 0 ? hitungUtilisasi(aktifMin, totalMin) : null
                const kapasitas = m && p && aktifMin > 0
                  ? hitungKapasitasTeoritis(aktifMin / 60, speed, p.stitchCount) : 0
                const efisiensi = hitungEfisiensi(c.aktual, kapasitas)

                return (
                  <div key={c.id} className="rounded-xl px-4 py-3 hover:bg-harmoni-beige flex items-start justify-between gap-2 transition-colors"
                    style={{ border: '1px solid #EDE9A8' }}>
                    <div className="min-w-0 space-y-1">
                      <div className="font-semibold text-sm flex items-center gap-1.5 flex-wrap" style={{ color: '#282828' }}>
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
                        <div className="text-xs text-amber-700 rounded-lg px-2 py-0.5 inline-block" style={{ background: '#FFFBEB' }}>
                          Berhenti: {c.alasanBerhenti}
                        </div>
                      )}
                      {(c.benangAtasId || c.benangBawahId) && (
                        <div className="text-xs text-purple-600 flex gap-3 flex-wrap">
                          {c.benangAtasId && <span>↑ {getBenangById(c.benangAtasId)?.nama ?? '?'}</span>}
                          {c.benangBawahId && <span>↓ {getBenangById(c.benangBawahId)?.nama ?? '?'}</span>}
                        </div>
                      )}
                      {c.catatan && <div className="text-xs text-gray-400 italic">{c.catatan}</div>}
                      {(c.fotoSebelum || c.fotoSetelah) && (
                        <div className="flex gap-2 mt-1">
                          {c.fotoSebelum && <FotoUpload label="Sebelum" value={c.fotoSebelum} onChange={() => {}} disabled />}
                          {c.fotoSetelah && <FotoUpload label="Setelah" value={c.fotoSetelah} onChange={() => {}} disabled />}
                        </div>
                      )}
                    </div>
                    {!isStaff && (
                      <button className="text-gray-300 hover:text-red-400 shrink-0 transition-colors" onClick={() => hapusCatatan(c.id)}>
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
