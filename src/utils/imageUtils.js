import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, auth } from '../firebase'

function kompressiBlob(file, maxWidth = 900, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal membaca gambar')) }
    img.src = url
  })
}

export async function uploadFoto(file) {
  const blob = await kompressiBlob(file)
  const uid  = auth.currentUser?.uid ?? 'anon'
  const path = `bordir/photos/${uid}/${Date.now()}.jpg`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob)
  return getDownloadURL(storageRef)
}
