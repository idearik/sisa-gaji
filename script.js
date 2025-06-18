/**
 * Hitung gaji bersih karyawan Indonesia.
 *
 * Perhitungan PPh 21 mengikuti tarif progresif yang berlaku:
 *  - PTKP dasar Rp54.000.000 per tahun ditambah Rp4.500.000 untuk istri
 *    dan setiap anak (maksimal 3 anak).
 *  - Tarif 5% untuk penghasilan kena pajak hingga Rp60.000.000 per tahun.
 *  - Tarif 15% untuk Rp60.000.001 - Rp250.000.000.
 *  - Tarif 25% untuk Rp250.000.001 - Rp500.000.000.
 *  - Tarif 30% untuk sisanya di atas Rp500.000.000.
 *  - Jika tidak memiliki NPWP, PPh 21 dikenakan tambahan 20%.
 */
function hitungGajiBersih() {
  const gaji = parseFloat(document.getElementById("gaji").value) || 0;
  const tunjangan = parseFloat(document.getElementById("tunjangan").value) || 0;
  const bonus = parseFloat(document.getElementById("bonus").value) || 0;
  const status = document.getElementById("status").value;
  const anak = Math.min(parseInt(document.getElementById("anak").value) || 0, 3);
  const punyaNpwp = document.getElementById("npwp").value === "ya";
  const cekPajak = document.getElementById("cekPajak").checked;

  const penghasilanTetap = gaji + tunjangan;
  const penghasilanKenaPajak = penghasilanTetap + bonus;

  // Potongan BPJS berdasarkan regulasi umum
  let bpjsKesehatan = Math.min(0.01 * penghasilanTetap, 120000);
  let bpjsJHT = 0.02 * gaji;
  let bpjsJP = Math.min(0.01 * gaji, 99400);
  let totalBpjs = bpjsKesehatan + bpjsJHT + bpjsJP;

  let pphBulanan = 0;
  if (cekPajak) {
    // Penghitungan PTKP (Penghasilan Tidak Kena Pajak)
    let ptkp = 54000000;
    if (status === "K") ptkp += 4500000; // tambahan untuk menikah
    ptkp += anak * 4500000; // tambahan untuk anak (maks 3)

    const penghasilanNettoSetahun = (penghasilanKenaPajak - totalBpjs) * 12;
    const pkp = Math.max(penghasilanNettoSetahun - ptkp, 0);

    // Tarif progresif PPh 21
    let pph21 = 0;
    if (pkp <= 60000000) {
      pph21 = pkp * 0.05;
    } else if (pkp <= 250000000) {
      pph21 = 60000000 * 0.05 + (pkp - 60000000) * 0.15;
    } else if (pkp <= 500000000) {
      pph21 = 60000000 * 0.05 + 190000000 * 0.15 + (pkp - 250000000) * 0.25;
    } else {
      pph21 = 60000000 * 0.05 + 190000000 * 0.15 + 250000000 * 0.25 + (pkp - 500000000) * 0.3;
    }

    if (!punyaNpwp) pph21 *= 1.2; // penalti 20% jika tidak punya NPWP
    pphBulanan = pph21 / 12;
  }

  const gajiBersih = penghasilanKenaPajak - totalBpjs - pphBulanan;

  document.getElementById("hasil").innerHTML = `
    <p><strong>Rincian Potongan per Bulan:</strong></p>
    <ul class="list-disc pl-5">
      <li>BPJS Kesehatan: Rp ${bpjsKesehatan.toLocaleString()}</li>
      <li>BPJS JHT: Rp ${bpjsJHT.toLocaleString()}</li>
      <li>BPJS JP: Rp ${bpjsJP.toLocaleString()}</li>
      ${cekPajak ? `<li>PPh 21: Rp ${pphBulanan.toLocaleString()}</li>` : ''}
    </ul>
    <p class="mt-4"><strong>Gaji Bersih per Bulan: Rp ${gajiBersih.toLocaleString()}</strong></p>
  `;

  // Tampilkan pie chart komposisi potongan
  const chartData = {
    labels: [
      'BPJS Kesehatan',
      'BPJS JHT',
      'BPJS JP',
      ...(cekPajak ? ['PPh 21'] : []),
      'Gaji Bersih'
    ],
    datasets: [{
      label: 'Komposisi Potongan',
      data: [
        bpjsKesehatan,
        bpjsJHT,
        bpjsJP,
        ...(cekPajak ? [pphBulanan] : []),
        gajiBersih
      ],
      backgroundColor: [
        '#60a5fa', '#34d399', '#facc15', '#f87171', '#a78bfa'
      ]
    }]
  };

  const ctx = document.getElementById('pieChart').getContext('2d');
  document.getElementById('pieChart').classList.remove('hidden');
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}
