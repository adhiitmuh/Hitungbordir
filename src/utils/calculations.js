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

/**
 * Hitung harga benang per 1.000 stitch dari harga gulungan (kelos) benang.
 *
 * Pemakaian benang di lapangan (atas + bawah) ≈ 10–14 meter per 1.000 stitch.
 * Default 12m adalah nilai umum untuk bordir rata-rata.
 *
 * @param {number} hargaPerGulungan   - harga beli satu gulungan benang (Rp)
 * @param {number} meterPerGulungan   - panjang benang dalam satu gulungan (meter)
 * @param {number} meterPer1000Stitch - estimasi pemakaian benang per 1.000 stitch (meter)
 * @returns {{ hargaPer1000Stitch: number, hargaPerMeter: number }}
 */
export function hitungHargaBenangDariGulungan(hargaPerGulungan, meterPerGulungan, meterPer1000Stitch = 12) {
  if (!hargaPerGulungan || !meterPerGulungan) return null
  const hargaPerMeter = hargaPerGulungan / meterPerGulungan
  const hargaPer1000Stitch = hargaPerMeter * meterPer1000Stitch
  return { hargaPer1000Stitch, hargaPerMeter }
}

// Alias lama agar tidak breaking jika ada referensi lain
export const hitungHargaBenangDariCone = hitungHargaBenangDariGulungan

/**
 * Hitung harga per 1.000 stitch dari objek benang (master data).
 * @param {{ hargaPerGulungan, meterPerGulungan, meterPer1000Stitch }} benang
 */
export function hargaBenangPer1000(benang) {
  if (!benang?.hargaPerGulungan || !benang?.meterPerGulungan) return 0
  return (benang.hargaPerGulungan / benang.meterPerGulungan) * (benang.meterPer1000Stitch || 12)
}

// ── Fungsi waktu & utilisasi ───────────────────────────────────

/**
 * Hitung selisih dua waktu dalam menit (format "HH:MM").
 * Mendukung lintas tengah malam (mis. 22:00 → 06:00).
 */
export function hitungSelisihMenit(jamMulai, jamSelesai) {
  if (!jamMulai || !jamSelesai) return 0
  const [h1, m1] = jamMulai.split(':').map(Number)
  const [h2, m2] = jamSelesai.split(':').map(Number)
  let total = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (total <= 0) total += 24 * 60 // lintas tengah malam
  return total
}

/** Waktu aktif mesin = total durasi − menit berhenti (downtime). */
export function hitungWaktuAktif(jamMulai, jamSelesai, menitBerhenti = 0) {
  const total = hitungSelisihMenit(jamMulai, jamSelesai)
  return Math.max(0, total - (menitBerhenti || 0))
}

/** Utilisasi waktu = (waktu aktif / total durasi) × 100%. */
export function hitungUtilisasi(waktuAktifMenit, totalDurasiMenit) {
  if (!totalDurasiMenit) return 0
  return Math.min((waktuAktifMenit / totalDurasiMenit) * 100, 100)
}

/**
 * RPM efektif = stitch total dihasilkan / menit aktif.
 * Mencerminkan kecepatan rata-rata mesin selama waktu produksi nyata.
 */
export function hitungRpmEfektif(aktual, stitchCount, waktuAktifMenit) {
  if (!waktuAktifMenit || !stitchCount) return 0
  return (aktual * stitchCount) / waktuAktifMenit
}

/**
 * Evaluasi kinerja operator secara menyeluruh.
 * Mengembalikan verdict + daftar rekomendasi berdasarkan semua variabel.
 *
 * Verdict:
 *   'optimal'           – semua indikator baik
 *   'bisa_ditingkatkan' – utilisasi atau efisiensi rendah
 *   'cek_mesin'         – RPM efektif jauh di bawah kapasitas mesin
 *   'cek_kualitas'      – reject rate tinggi
 *   'perlu_perhatian'   – kombinasi masalah
 */
export function evaluasiKinerja({ utilisasi, efisiensi, rpmEfektif, rpmMaks, rejectRate, menitBerhenti, totalDurasi }) {
  const masalah = []
  const rekomendasi = []

  // Reject rate
  if (rejectRate > 10) {
    masalah.push('reject_kritis')
    rekomendasi.push(`Reject sangat tinggi (${formatAngka(rejectRate)}%). Segera cek: kondisi jarum, benang putus, tegangan mesin, atau kualitas bahan.`)
  } else if (rejectRate > 5) {
    masalah.push('reject_tinggi')
    rekomendasi.push(`Reject cukup tinggi (${formatAngka(rejectRate)}%). Pantau kualitas jahitan dan kondisi mesin.`)
  }

  // Utilisasi
  if (utilisasi < 60) {
    masalah.push('utilisasi_rendah')
    rekomendasi.push(`Utilisasi waktu rendah (${formatAngka(utilisasi)}%). Lebih dari sepertiga waktu kerja tidak produktif. Identifikasi penyebab berhenti.`)
  } else if (utilisasi < 75) {
    masalah.push('utilisasi_sedang')
    rekomendasi.push(`Utilisasi ${formatAngka(utilisasi)}% — masih ada ruang untuk mengurangi downtime.`)
  }

  // RPM efektif vs maks
  if (rpmMaks && rpmEfektif > 0) {
    const rasioRpm = (rpmEfektif / rpmMaks) * 100
    if (rasioRpm < 50) {
      masalah.push('rpm_rendah')
      rekomendasi.push(`RPM efektif (${Math.round(rpmEfektif)}) hanya ${formatAngka(rasioRpm)}% dari kapasitas mesin (${rpmMaks} RPM). Kemungkinan: speed mesin diturunkan terlalu banyak, atau mesin sering berhenti tiba-tiba.`)
    } else if (rasioRpm < 70) {
      masalah.push('rpm_sedang')
      rekomendasi.push(`RPM efektif ${Math.round(rpmEfektif)} dari maks ${rpmMaks}. Pertimbangkan untuk menaikkan speed jika kualitas tetap terjaga.`)
    }
  }

  // Efisiensi output
  if (efisiensi < 60) {
    masalah.push('efisiensi_rendah')
    rekomendasi.push(`Efisiensi output rendah (${formatAngka(efisiensi)}%). Hasil aktual jauh di bawah kapasitas teoritis.`)
  }

  // Tentukan verdict utama
  let verdict
  if (masalah.includes('reject_kritis') || (masalah.includes('reject_tinggi') && masalah.length >= 2)) {
    verdict = 'cek_kualitas'
  } else if (masalah.includes('rpm_rendah') && !masalah.includes('utilisasi_rendah')) {
    verdict = 'cek_mesin'
  } else if (masalah.length === 0) {
    verdict = 'optimal'
  } else if (masalah.length >= 3) {
    verdict = 'perlu_perhatian'
  } else {
    verdict = 'bisa_ditingkatkan'
  }

  if (rekomendasi.length === 0) {
    rekomendasi.push('Kinerja operator sudah baik. Pertahankan konsistensi.')
  }

  return { verdict, masalah, rekomendasi }
}

/** Ambil jam kerja dari catatan: pakai jamMulai/jamSelesai jika ada, fallback ke jamKerja lama. */
export function resolveJamKerja(catatan) {
  if (catatan.jamMulai && catatan.jamSelesai) {
    return hitungSelisihMenit(catatan.jamMulai, catatan.jamSelesai) / 60
  }
  return catatan.jamKerja ?? 8
}

export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka)
}

export function formatAngka(angka, desimal = 1) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: desimal }).format(angka)
}
