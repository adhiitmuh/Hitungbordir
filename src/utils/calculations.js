/**
 * Hitung kapasitas teoritis mesin per shift.
 * @param {number} jamKerja - jam kerja per shift
 * @param {number} rpm - kecepatan mesin (stitch per menit)
 * @param {number} stitchCount - jumlah stitch per item
 * @returns {number} jumlah item teoritis
 */
export function hitungKapasitasTeoritis(jamKerja, rpm, stitchCount) {
  if (!rpm || !stitchCount) return 0
  const menitKerja = jamKerja * 60
  return Math.floor((menitKerja * rpm) / stitchCount)
}

/**
 * Hitung waktu per item dalam menit.
 */
export function hitungWaktuPerItem(rpm, stitchCount) {
  if (!rpm || !stitchCount) return 0
  return stitchCount / rpm
}

/**
 * Hitung efisiensi operator (%).
 * Bandingkan aktual vs kapasitas teoritis.
 */
export function hitungEfisiensi(aktual, kapasitasTeoritis) {
  if (!kapasitasTeoritis) return 0
  return Math.min(((aktual / kapasitasTeoritis) * 100), 150)
}

/**
 * Hitung biaya benang per item.
 * @param {number} stitchCount - stitch per item
 * @param {number} hargaBenangPer1000 - harga benang per 1000 stitch (Rp)
 */
export function hitungBiayaBenang(stitchCount, hargaBenangPer1000) {
  return (stitchCount / 1000) * hargaBenangPer1000
}

/**
 * Hitung biaya listrik per item.
 * @param {number} dayaWatt - daya mesin dalam watt
 * @param {number} waktuMenit - waktu per item dalam menit
 * @param {number} tarifKwhRp - tarif listrik per kWh (Rp)
 */
export function hitungBiayaListrik(dayaWatt, waktuMenit, tarifKwhRp) {
  const kwh = (dayaWatt * (waktuMenit / 60)) / 1000
  return kwh * tarifKwhRp
}

/**
 * Hitung gaji operator per item.
 * @param {number} gajiHarian - gaji harian operator (Rp)
 * @param {number} totalProduksi - total item diproduksi
 */
export function hitungGajiPerItem(gajiHarian, totalProduksi) {
  if (!totalProduksi) return 0
  return gajiHarian / totalProduksi
}

/**
 * Hitung total modal per item.
 */
export function hitungModalPerItem(params) {
  const { stitchCount, rpm, dayaWatt, tarifKwh, hargaBenangPer1000, gajiHarian, totalProduksi, overheadPerItem = 0 } = params
  const waktuMenit = hitungWaktuPerItem(rpm, stitchCount)
  const biayaBenang = hitungBiayaBenang(stitchCount, hargaBenangPer1000)
  const biayaListrik = hitungBiayaListrik(dayaWatt, waktuMenit, tarifKwh)
  const gajiPerItem = hitungGajiPerItem(gajiHarian, totalProduksi)
  return {
    biayaBenang,
    biayaListrik,
    gajiPerItem,
    overheadPerItem,
    total: biayaBenang + biayaListrik + gajiPerItem + overheadPerItem,
  }
}

/**
 * Tentukan status performa operator berdasarkan efisiensi.
 * Threshold disesuaikan untuk industri bordir.
 */
export function statusPerforma(efisiensiPersen) {
  if (efisiensiPersen >= 80) return 'baik'
  if (efisiensiPersen >= 60) return 'cukup'
  return 'rendah'
}

/**
 * Analisis normalitas operator dibanding rekan-rekannya pada jenis produk yang sama.
 * Gunakan rata-rata dan simpangan baku.
 */
export function analisisNormalitas(efisiensiOperator, semuaEfisiensi) {
  if (semuaEfisiensi.length < 2) return null
  const rata = semuaEfisiensi.reduce((a, b) => a + b, 0) / semuaEfisiensi.length
  const variance = semuaEfisiensi.reduce((sum, x) => sum + (x - rata) ** 2, 0) / semuaEfisiensi.length
  const std = Math.sqrt(variance)
  if (std === 0) return { zscore: 0, normal: true, rata, std }
  const zscore = (efisiensiOperator - rata) / std
  return { zscore, normal: zscore >= -1.5, rata, std }
}

export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

export function formatAngka(angka, desimal = 1) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: desimal }).format(angka)
}
