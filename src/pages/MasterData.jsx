import { useState } from 'react'
import { Cpu, Users, Package, Settings2, Trash2, Pencil, Plus, Save, X, ChevronDown, ChevronUp, ArrowRight, Layers } from 'lucide-react'
import useAppStore, { KATEGORI_PRODUK, TIPE_BORDIR } from '../store/appStore'
import { formatRupiah, formatAngka, hitungHargaBenangDariCone, hargaBenangPer1000 } from '../utils/calculations'

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: '#EBF4F3' }}>
            <Icon size={14} style={{ color: '#034543' }} />
          </div>
          <span className="font-bold text-sm" style={{ color: '#282828' }}>{title}</span>
        </div>
        {open
          ? <ChevronUp size={16} style={{ color: '#9CA3AF' }} />
          : <ChevronDown size={16} style={{ color: '#9CA3AF' }} />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  )
}

// ── Mesin ────────────────────────────────────────────────────
function FormMesin({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial ?? { nama: '', rpm: '', dayaWatt: '', keterangan: '' })
  const ok = f.nama && f.rpm && f.dayaWatt
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl p-4 mt-3" style={{ background: '#F5F2BE', border: '1px solid #EDE9A8' }}>
      <div className="col-span-2 sm:col-span-1">
        <label className="label">Nama Mesin *</label>
        <input className="input" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="cth: Mesin 1 - Brother" />
      </div>
      <div>
        <label className="label">Kecepatan Maks (RPM) *</label>
        <input className="input" type="number" value={f.rpm} onChange={(e) => setF({ ...f, rpm: e.target.value })} placeholder="850" />
        <p className="text-xs text-gray-400 mt-0.5">Kecepatan penuh mesin ini</p>
      </div>
      <div>
        <label className="label">Daya (Watt) *</label>
        <input className="input" type="number" value={f.dayaWatt} onChange={(e) => setF({ ...f, dayaWatt: e.target.value })} placeholder="250" />
      </div>
      <div className="col-span-2">
        <label className="label">Keterangan</label>
        <input className="input" value={f.keterangan} onChange={(e) => setF({ ...f, keterangan: e.target.value })} placeholder="opsional" />
      </div>
      <div className="col-span-2 flex gap-2">
        <button className="btn-primary flex items-center gap-1 text-sm" disabled={!ok} onClick={() => onSave({ ...f, rpm: +f.rpm, dayaWatt: +f.dayaWatt })}>
          <Save size={14} />Simpan
        </button>
        <button className="btn-secondary text-sm" onClick={onCancel}><X size={14} />Batal</button>
      </div>
    </div>
  )
}

function TableMesin() {
  const { mesin, tambahMesin, updateMesin, hapusMesin } = useAppStore()
  const [tambah, setTambah] = useState(false)
  const [editId, setEditId] = useState(null)

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-1 text-sm" onClick={() => { setTambah(true); setEditId(null) }}>
          <Plus size={14} />Tambah Mesin
        </button>
      </div>
      {tambah && (
        <FormMesin
          onSave={(d) => { tambahMesin(d); setTambah(false) }}
          onCancel={() => setTambah(false)}
        />
      )}
      {mesin.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Belum ada mesin. Tambahkan mesin terlebih dahulu.</p>
      ) : (
        <div className="space-y-2">
          {mesin.map((m) => (
            <div key={m.id}>
              {editId === m.id ? (
                <FormMesin
                  initial={m}
                  onSave={(d) => { updateMesin(m.id, d); setEditId(null) }}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-harmoni-beige transition-colors" style={{ border: '1px solid #EDE9A8' }}>
                  <div>
                    <div className="font-medium text-gray-700 text-sm">{m.nama}</div>
                    <div className="text-xs text-gray-400">Maks {m.rpm} RPM · {m.dayaWatt}W {m.keterangan && `· ${m.keterangan}`}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-harmoni-green" onClick={() => setEditId(m.id)}><Pencil size={15} /></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={() => hapusMesin(m.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Operator ─────────────────────────────────────────────────
function FormOperator({ initial, onSave, onCancel }) {
  const { mesin } = useAppStore()
  const [f, setF] = useState(initial ?? { nama: '', mesinId: '', gajiHarian: '' })
  const ok = f.nama && f.gajiHarian
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl p-4 mt-3" style={{ background: '#F5F2BE', border: '1px solid #EDE9A8' }}>
      <div className="col-span-2 sm:col-span-1">
        <label className="label">Nama Operator *</label>
        <input className="input" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="cth: Budi" />
      </div>
      <div>
        <label className="label">Mesin Utama</label>
        <select className="input" value={f.mesinId} onChange={(e) => setF({ ...f, mesinId: e.target.value })}>
          <option value="">— pilih —</option>
          {mesin.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Gaji Harian (Rp) *</label>
        <input className="input" type="number" value={f.gajiHarian} onChange={(e) => setF({ ...f, gajiHarian: e.target.value })} placeholder="100000" />
      </div>
      <div className="col-span-2 flex gap-2">
        <button className="btn-primary flex items-center gap-1 text-sm" disabled={!ok} onClick={() => onSave({ ...f, gajiHarian: +f.gajiHarian })}>
          <Save size={14} />Simpan
        </button>
        <button className="btn-secondary text-sm" onClick={onCancel}><X size={14} />Batal</button>
      </div>
    </div>
  )
}

function TableOperator() {
  const { operator, mesin, tambahOperator, updateOperator, hapusOperator } = useAppStore()
  const [tambah, setTambah] = useState(false)
  const [editId, setEditId] = useState(null)
  const getMesin = (id) => mesin.find((m) => m.id === id)

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-1 text-sm" onClick={() => { setTambah(true); setEditId(null) }}>
          <Plus size={14} />Tambah Operator
        </button>
      </div>
      {tambah && (
        <FormOperator
          onSave={(d) => { tambahOperator(d); setTambah(false) }}
          onCancel={() => setTambah(false)}
        />
      )}
      {operator.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Belum ada operator.</p>
      ) : (
        <div className="space-y-2">
          {operator.map((o) => (
            <div key={o.id}>
              {editId === o.id ? (
                <FormOperator
                  initial={o}
                  onSave={(d) => { updateOperator(o.id, d); setEditId(null) }}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-harmoni-beige transition-colors" style={{ border: '1px solid #EDE9A8' }}>
                  <div>
                    <div className="font-medium text-gray-700 text-sm">{o.nama}</div>
                    <div className="text-xs text-gray-400">
                      {getMesin(o.mesinId)?.nama ?? 'Mesin belum dipilih'} · {formatRupiah(o.gajiHarian)}/hari
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-harmoni-green" onClick={() => setEditId(o.id)}><Pencil size={15} /></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={() => hapusOperator(o.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Produk ────────────────────────────────────────────────────
function FormProduk({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial ?? {
    nama: '', kategori: 'lambang', tipeBordir: '2D', stitchCount: '', hargaJual: '', keterangan: ''
  })
  const ok = f.nama && f.stitchCount
  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl p-4 mt-3" style={{ background: '#F5F2BE', border: '1px solid #EDE9A8' }}>
      <div className="col-span-2">
        <label className="label">Nama Produk *</label>
        <input className="input" value={f.nama} onChange={(e) => setF({ ...f, nama: e.target.value })} placeholder="cth: Lambang Sekolah A" />
      </div>
      <div>
        <label className="label">Kategori *</label>
        <select className="input" value={f.kategori} onChange={(e) => setF({ ...f, kategori: e.target.value })}>
          {KATEGORI_PRODUK.map((k) => (
            <option key={k} value={k}>{k.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Tipe Bordir *</label>
        <select className="input" value={f.tipeBordir} onChange={(e) => setF({ ...f, tipeBordir: e.target.value })}>
          {TIPE_BORDIR.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Jumlah Stitch *</label>
        <input className="input" type="number" value={f.stitchCount} onChange={(e) => setF({ ...f, stitchCount: e.target.value })} placeholder="cth: 12000" />
        <p className="text-xs text-gray-400 mt-0.5">Lihat di file desain bordir (.DST/.EMB)</p>
      </div>
      <div>
        <label className="label">Harga Jual (Rp)</label>
        <input className="input" type="number" value={f.hargaJual} onChange={(e) => setF({ ...f, hargaJual: e.target.value })} placeholder="opsional" />
      </div>
      <div className="col-span-2">
        <label className="label">Keterangan</label>
        <input className="input" value={f.keterangan} onChange={(e) => setF({ ...f, keterangan: e.target.value })} placeholder="opsional" />
      </div>
      <div className="col-span-2 flex gap-2">
        <button className="btn-primary flex items-center gap-1 text-sm" disabled={!ok}
          onClick={() => onSave({ ...f, stitchCount: +f.stitchCount, hargaJual: +f.hargaJual || 0 })}>
          <Save size={14} />Simpan
        </button>
        <button className="btn-secondary text-sm" onClick={onCancel}><X size={14} />Batal</button>
      </div>
    </div>
  )
}

function TableProduk() {
  const { produk, tambahProduk, updateProduk, hapusProduk } = useAppStore()
  const [tambah, setTambah] = useState(false)
  const [editId, setEditId] = useState(null)

  const labelKategori = { lambang: 'Lambang', lokasi: 'Lokasi', papan_nama: 'Papan Nama' }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-1 text-sm" onClick={() => { setTambah(true); setEditId(null) }}>
          <Plus size={14} />Tambah Produk
        </button>
      </div>
      {tambah && (
        <FormProduk
          onSave={(d) => { tambahProduk(d); setTambah(false) }}
          onCancel={() => setTambah(false)}
        />
      )}
      {produk.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Belum ada produk.</p>
      ) : (
        <div className="space-y-2">
          {produk.map((p) => (
            <div key={p.id}>
              {editId === p.id ? (
                <FormProduk
                  initial={p}
                  onSave={(d) => { updateProduk(p.id, d); setEditId(null) }}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-harmoni-beige transition-colors" style={{ border: '1px solid #EDE9A8' }}>
                  <div>
                    <div className="font-medium text-gray-700 text-sm">
                      {p.nama}
                      <span className="ml-2 text-xs bg-harmoni-green-tint text-harmoni-green px-1.5 py-0.5 rounded font-medium">{p.tipeBordir}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {labelKategori[p.kategori]} · {p.stitchCount.toLocaleString('id-ID')} stitch
                      {p.hargaJual ? ` · Jual: ${formatRupiah(p.hargaJual)}` : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-harmoni-green" onClick={() => setEditId(p.id)}><Pencil size={15} /></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={() => hapusProduk(p.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Benang ───────────────────────────────────────────────────
function FormBenang({ initial, onSave, onCancel }) {
  const defaultMeterPer1000 = initial?.tipe === 'bawah' ? '6' : '12'
  const [f, setF] = useState(initial ?? {
    nama: '', tipe: 'atas', hargaPerGulungan: '', meterPerGulungan: '', meterPer1000Stitch: defaultMeterPer1000
  })
  const ok = f.nama && f.tipe && f.hargaPerGulungan && f.meterPerGulungan

  const preview = (f.hargaPerGulungan && f.meterPerGulungan)
    ? hargaBenangPer1000({ ...f, hargaPerGulungan: +f.hargaPerGulungan, meterPerGulungan: +f.meterPerGulungan, meterPer1000Stitch: +f.meterPer1000Stitch || 12 })
    : null

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl p-4 mt-3" style={{ background: '#F5F2BE', border: '1px solid #EDE9A8' }}>
      <div className="col-span-2">
        <label className="label">Nama Benang / Merk *</label>
        <input className="input" value={f.nama}
          onChange={(e) => setF({ ...f, nama: e.target.value })}
          placeholder="cth: Madeira Rayon 40 Putih, Coats Epic Merah" />
      </div>
      <div>
        <label className="label">Tipe *</label>
        <select className="input" value={f.tipe}
          onChange={(e) => setF({ ...f, tipe: e.target.value, meterPer1000Stitch: e.target.value === 'bawah' ? '6' : '12' })}>
          <option value="atas">Benang Atas</option>
          <option value="bawah">Benang Bawah (Bobbin)</option>
        </select>
      </div>
      <div>
        <label className="label">Harga per Gulungan (Rp) *</label>
        <input className="input" type="number" value={f.hargaPerGulungan}
          onChange={(e) => setF({ ...f, hargaPerGulungan: e.target.value })}
          placeholder="cth: 15000" />
      </div>
      <div>
        <label className="label">Panjang Benang (meter) *</label>
        <input className="input" type="number" value={f.meterPerGulungan}
          onChange={(e) => setF({ ...f, meterPerGulungan: e.target.value })}
          placeholder="cth: 1000" />
        <p className="text-xs text-gray-400 mt-0.5">Tertera di label gulungan</p>
      </div>
      <div>
        <label className="label">Pemakaian per 1.000 stitch (m)</label>
        <input className="input" type="number" step="0.5" value={f.meterPer1000Stitch}
          onChange={(e) => setF({ ...f, meterPer1000Stitch: e.target.value })}
          placeholder={f.tipe === 'bawah' ? '6' : '12'} />
        <p className="text-xs text-gray-400 mt-0.5">{f.tipe === 'bawah' ? 'Bobbin: rata-rata 5–8 m' : 'Atas: rata-rata 10–14 m'}</p>
      </div>
      {preview !== null && (
        <div className="col-span-2 bg-harmoni-green-tint border border-harmoni-green-tint rounded-lg px-3 py-2 flex items-center gap-3 text-sm">
          <span className="text-gray-500">Harga per 1.000 stitch:</span>
          <strong className="text-harmoni-green">{formatRupiah(preview)}</strong>
        </div>
      )}
      <div className="col-span-2 flex gap-2">
        <button className="btn-primary flex items-center gap-1 text-sm" disabled={!ok}
          onClick={() => onSave({
            ...f,
            hargaPerGulungan: +f.hargaPerGulungan,
            meterPerGulungan: +f.meterPerGulungan,
            meterPer1000Stitch: +f.meterPer1000Stitch || (f.tipe === 'bawah' ? 6 : 12),
          })}>
          <Save size={14} />Simpan
        </button>
        <button className="btn-secondary text-sm" onClick={onCancel}><X size={14} />Batal</button>
      </div>
    </div>
  )
}

function TableBenang() {
  const { benang, tambahBenang, updateBenang, hapusBenang } = useAppStore()
  const [tambah, setTambah] = useState(false)
  const [editId, setEditId] = useState(null)

  const atas = benang.filter((b) => b.tipe === 'atas')
  const bawah = benang.filter((b) => b.tipe === 'bawah')

  function BenangGroup({ items, label }) {
    if (items.length === 0) return null
    return (
      <div>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 mt-3">{label}</div>
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id}>
              {editId === b.id ? (
                <FormBenang
                  initial={b}
                  onSave={(d) => { updateBenang(b.id, d); setEditId(null) }}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-harmoni-beige transition-colors" style={{ border: '1px solid #EDE9A8' }}>
                  <div>
                    <div className="font-medium text-gray-700 text-sm">{b.nama}</div>
                    <div className="text-xs text-gray-400">
                      {formatRupiah(b.hargaPerGulungan)}/gulungan · {b.meterPerGulungan.toLocaleString('id-ID')} m · {b.meterPer1000Stitch} m/1.000 stitch
                      <span className="ml-2 text-harmoni-green font-medium">→ {formatRupiah(hargaBenangPer1000(b))}/1.000 stitch</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-harmoni-green" onClick={() => setEditId(b.id)}><Pencil size={15} /></button>
                    <button className="text-gray-400 hover:text-red-500" onClick={() => hapusBenang(b.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-1 text-sm" onClick={() => { setTambah(true); setEditId(null) }}>
          <Plus size={14} />Tambah Benang
        </button>
      </div>
      {tambah && (
        <FormBenang
          onSave={(d) => { tambahBenang(d); setTambah(false) }}
          onCancel={() => setTambah(false)}
        />
      )}
      {benang.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Belum ada data benang. Tambahkan merk dan tipe benang yang digunakan.</p>
      ) : (
        <>
          <BenangGroup items={atas} label="Benang Atas" />
          <BenangGroup items={bawah} label="Benang Bawah (Bobbin)" />
        </>
      )}
    </div>
  )
}

// ── Kalkulator Harga Benang dari Gulungan ────────────────────
function KalkulatorGulungan({ onApply }) {
  const [g, setG] = useState({ harga: '', meter: '', meterPer1000: '12' })
  const hasil = (g.harga && g.meter)
    ? hitungHargaBenangDariCone(+g.harga, +g.meter, +g.meterPer1000 || 12)
    : null

  return (
    <div className="col-span-2 bg-harmoni-green-tint border border-harmoni-green-tint rounded-xl p-4 space-y-3">
      <div className="text-sm font-medium text-harmoni-green">Hitung dari harga gulungan benang</div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label text-harmoni-green">Harga per gulungan (Rp)</label>
          <input className="input" type="number" placeholder="cth: 15000"
            value={g.harga} onChange={(e) => setG({ ...g, harga: e.target.value })} />
        </div>
        <div>
          <label className="label text-harmoni-green">Panjang benang (meter)</label>
          <input className="input" type="number" placeholder="cth: 1000"
            value={g.meter} onChange={(e) => setG({ ...g, meter: e.target.value })} />
          <p className="text-xs text-gray-400 mt-0.5">Tertera di label gulungan</p>
        </div>
        <div>
          <label className="label text-harmoni-green">Pemakaian per 1.000 stitch (m)</label>
          <input className="input" type="number" step="0.5" placeholder="12"
            value={g.meterPer1000} onChange={(e) => setG({ ...g, meterPer1000: e.target.value })} />
          <p className="text-xs text-gray-400 mt-0.5">Rata-rata bordir: 10–14 m</p>
        </div>
      </div>

      {hasil && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white border border-harmoni-green-tint rounded-lg px-3 py-2 text-sm">
            <span className="text-gray-500">Harga/meter: </span>
            <strong className="text-gray-800">{formatRupiah(hasil.hargaPerMeter)}</strong>
          </div>
          <ArrowRight size={14} className="text-harmoni-green-mid shrink-0" />
          <div className="bg-white border border-harmoni-green-tint rounded-lg px-3 py-2 text-sm">
            <span className="text-gray-500">Harga per 1.000 stitch: </span>
            <strong className="text-harmoni-green">{formatRupiah(hasil.hargaPer1000Stitch)}</strong>
          </div>
          <button
            className="btn-primary text-xs py-1.5"
            onClick={() => onApply(hasil.hargaPer1000Stitch)}
          >
            Pakai nilai ini →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Pengaturan Global ─────────────────────────────────────────
function PengaturanGlobal() {
  const { settings, updateSettings } = useAppStore()
  const [f, setF] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [showKalkGulungan, setShowKalkGulungan] = useState(false)

  function handleSave() {
    updateSettings({
      tarifListrikKwh: +f.tarifListrikKwh,
      hargaBenangPer1000Stitch: +f.hargaBenangPer1000Stitch,
      gajiHarianDefault: +f.gajiHarianDefault,
      jamKerjaPerShift: +f.jamKerjaPerShift,
      overheadHarian: +f.overheadHarian,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label">Tarif Listrik (Rp/kWh)</label>
        <input className="input" type="number" value={f.tarifListrikKwh} onChange={(e) => setF({ ...f, tarifListrikKwh: e.target.value })} />
      </div>
      <div>
        <label className="label">Harga Benang per 1.000 stitch (Rp)</label>
        <div className="flex gap-2">
          <input className="input" type="number" value={f.hargaBenangPer1000Stitch}
            onChange={(e) => setF({ ...f, hargaBenangPer1000Stitch: e.target.value })} />
          <button
            className="btn-secondary text-xs shrink-0 whitespace-nowrap"
            onClick={() => setShowKalkGulungan(!showKalkGulungan)}
          >
            {showKalkGulungan ? 'Tutup' : '📐 Hitung dari gulungan'}
          </button>
        </div>
      </div>

      {showKalkGulungan && (
        <KalkulatorGulungan
          onApply={(nilai) => {
            setF({ ...f, hargaBenangPer1000Stitch: String(Math.round(nilai)) })
            setShowKalkGulungan(false)
          }}
        />
      )}

      <div>
        <label className="label">Gaji Harian Default (Rp)</label>
        <input className="input" type="number" value={f.gajiHarianDefault} onChange={(e) => setF({ ...f, gajiHarianDefault: e.target.value })} />
      </div>
      <div>
        <label className="label">Jam Kerja per Shift</label>
        <input className="input" type="number" value={f.jamKerjaPerShift} onChange={(e) => setF({ ...f, jamKerjaPerShift: e.target.value })} />
      </div>
      <div>
        <label className="label">Overhead Harian per Mesin (Rp)</label>
        <input className="input" type="number" value={f.overheadHarian} onChange={(e) => setF({ ...f, overheadHarian: e.target.value })} />
        <p className="text-xs text-gray-400 mt-0.5">Biaya perawatan, sewa, dll.</p>
      </div>
      <div className="col-span-2">
        <button className="btn-primary text-sm" onClick={handleSave}>
          {saved ? '✓ Tersimpan' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* Ganti password admin */}
      <div className="col-span-2 border-t border-gray-100 pt-4">
        <GantiPasswordAdmin />
      </div>
    </div>
  )
}

function GantiPasswordAdmin() {
  const { settings, updateSettings } = useAppStore()
  const [f, setF] = useState({ lama: '', baru: '', konfirmasi: '' })
  const [msg, setMsg] = useState(null) // { type: 'ok'|'err', text }
  const [show, setShow] = useState(false)

  function handleGanti(e) {
    e.preventDefault()
    if (f.lama !== (settings.adminPassword ?? 'admin123')) {
      setMsg({ type: 'err', text: 'Password lama salah.' }); return
    }
    if (f.baru.length < 6) {
      setMsg({ type: 'err', text: 'Password baru minimal 6 karakter.' }); return
    }
    if (f.baru !== f.konfirmasi) {
      setMsg({ type: 'err', text: 'Konfirmasi password tidak cocok.' }); return
    }
    updateSettings({ adminPassword: f.baru })
    setF({ lama: '', baru: '', konfirmasi: '' })
    setMsg({ type: 'ok', text: 'Password admin berhasil diubah.' })
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div>
      <button
        className="text-sm text-harmoni-green hover:underline font-medium"
        onClick={() => { setShow(!show); setMsg(null) }}
      >
        {show ? 'Tutup' : '🔑 Ganti Password Admin'}
      </button>

      {show && (
        <form onSubmit={handleGanti} className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {msg && (
            <div className={`sm:col-span-3 text-sm rounded-lg px-3 py-2 ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}
          <div>
            <label className="label">Password Lama</label>
            <input className="input" type="password" value={f.lama}
              onChange={(e) => setF({ ...f, lama: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <label className="label">Password Baru</label>
            <input className="input" type="password" value={f.baru}
              onChange={(e) => setF({ ...f, baru: e.target.value })} placeholder="min. 6 karakter" />
          </div>
          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <input className="input" type="password" value={f.konfirmasi}
              onChange={(e) => setF({ ...f, konfirmasi: e.target.value })} placeholder="ulangi password baru" />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="btn-primary text-sm">Ganti Password</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function MasterData() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#034543', opacity: 0.6 }}>
          Konfigurasi
        </div>
        <h1 style={{ color: '#282828' }}>Master Data</h1>
      </div>

      <Section title="Mesin Bordir" icon={Cpu}>
        <TableMesin />
      </Section>

      <Section title="Operator" icon={Users}>
        <TableOperator />
      </Section>

      <Section title="Jenis Produk" icon={Package}>
        <TableProduk />
      </Section>

      <Section title="Benang" icon={Layers}>
        <TableBenang />
      </Section>

      <Section title="Pengaturan Global" icon={Settings2} defaultOpen={false}>
        <PengaturanGlobal />
      </Section>
    </div>
  )
}
