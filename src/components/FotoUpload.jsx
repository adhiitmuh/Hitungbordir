import { useRef, useState } from 'react'
import { Camera, X, ZoomIn } from 'lucide-react'
import { kompresiFoto } from '../utils/imageUtils'

/**
 * Upload satu foto dengan preview.
 * value  = base64 string atau null
 * onChange(base64 | null)
 */
export default function FotoUpload({ label, value, onChange, disabled }) {
  const inputRef = useRef()
  const [lightbox, setLightbox] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const b64 = await kompresiFoto(file)
      onChange(b64)
    } catch {
      alert('Gagal memproses foto.')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className="h-24 w-24 object-cover rounded-xl border border-gray-200 cursor-pointer"
            onClick={() => setLightbox(true)}
          />
          {/* Tombol hapus */}
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow"
            >
              <X size={12} />
            </button>
          )}
          {/* Tombol zoom */}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute bottom-1 right-1 bg-black/40 text-white rounded p-0.5"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
          className="h-24 w-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors disabled:opacity-50"
        >
          <Camera size={20} />
          <span className="text-xs">{loading ? 'Proses...' : 'Ambil foto'}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img src={value} alt={label} className="max-h-[90vh] max-w-full rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1.5">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
