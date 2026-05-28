import { useState } from 'react'
import { Cpu, Users, Package, Settings2, Trash2, Pencil, Plus, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import useAppStore, { KATEGORI_PRODUK, TIPE_BORDIR } from '../store/appStore'
import { formatRupiah } from '../utils/calculations'

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <Icon size={16} className="text-blue-500" />
          {title}
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
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
    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 mt-3">
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
                <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-700 text-sm">{m.nama}</div>
                    <div className="text-xs text-gray-400">Maks {m.rpm} RPM · {m.dayaWatt}W {m.keterangan && `· ${m.keterangan}`}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-blue-500" onClick={() => setEditId(m.id)}><Pencil size={15} /></button>
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
    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 mt-3">
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
                <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-700 text-sm">{o.nama}</div>
                    <div className="text-xs text-gray-400">
                      {getMesin(o.mesinId)?.nama ?? 'Mesin belum dipilih'} · {formatRupiah(o.gajiHarian)}/hari
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-blue-500" onClick={() => setEditId(o.id)}><Pencil size={15} /></button>
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
    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 mt-3">
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
                <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-700 text-sm">
                      {p.nama}
                      <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{p.tipeBordir}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {labelKategori[p.kategori]} · {p.stitchCount.toLocaleString('id-ID')} stitch
                      {p.hargaJual ? ` · Jual: ${formatRupiah(p.hargaJual)}` : ''}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-blue-500" onClick={() => setEditId(p.id)}><Pencil size={15} /></button>
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

// ── Pengaturan Global ─────────────────────────────────────────
function PengaturanGlobal() {
  const { settings, updateSettings } = useAppStore()
  const [f, setF] = useState(settings)
  const [saved, setSaved] = useState(false)

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
        <input className="input" type="number" value={f.hargaBenangPer1000Stitch} onChange={(e) => setF({ ...f, hargaBenangPer1000Stitch: e.target.value })} />
      </div>
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
    </div>
  )
}

export default function MasterData() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Master Data</h1>

      <Section title="Mesin Bordir" icon={Cpu}>
        <TableMesin />
      </Section>

      <Section title="Operator" icon={Users}>
        <TableOperator />
      </Section>

      <Section title="Jenis Produk" icon={Package}>
        <TableProduk />
      </Section>

      <Section title="Pengaturan Global" icon={Settings2} defaultOpen={false}>
        <PengaturanGlobal />
      </Section>
    </div>
  )
}
