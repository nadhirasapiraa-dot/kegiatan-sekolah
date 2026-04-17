
function aktifinAudio() {
  audioAktif = !audioAktif;

  const btn = document.getElementById("btnAudio");

  if (audioAktif) {
    btn.classList.add("active");
    btn.classList.remove("off");
    btn.innerText = "Suara Aktif";

    // trigger izin audio
    speechSynthesis.cancel();
    const dummy = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(dummy);

    window.lastSoundTime = 0;

  } else {
    btn.classList.remove("active");
    btn.classList.add("off");
    btn.innerText = " Suara Mati";

    speechSynthesis.cancel();
  }
}

function showNotif(text) {
  const notif = document.getElementById("notif");
  notif.innerHTML = text;
  notif.classList.add("show");
}

let sudahNotif = false;
let lastIndex = -1; 
let audioAktif = false;


const namaHari = ["minggu","senin","selasa","rabu","kamis","jumat","sabtu"];
const hariSekarang = namaHari[new Date().getDay()];
const namaKelas = document.title;

document.getElementById("judul").innerText =
  "Jadwal " + namaKelas + " - Hari " +
  hariSekarang.charAt(0).toUpperCase() + hariSekarang.slice(1);

const jadwal = semuaJadwal[hariSekarang] || [];

const tabel = document.getElementById("tabel");

jadwal.forEach((j, i) => {
  const row = document.createElement("tr");
  row.id = "row-" + i;

  if (j.istirahat) row.classList.add("istirahat");

  row.innerHTML = `
    <td>${j.jam}</td>
    <td>${j.nama}</td>
    <td>${j.guru}</td>
  `;

  tabel.appendChild(row);
});

function parseJam(jam) {
  const [h, m] = jam.split(":");
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
}

function update() {
  let aktif = false;

const now = new Date();

const namaHari = ["minggu","senin","selasa","rabu","kamis","jumat","sabtu"];
const hariSekarang = namaHari[now.getDay()];


document.querySelectorAll("tr").forEach(r => {
  r.classList.remove("active");
  r.classList.remove("next"); 
});

  jadwal.forEach((j, i) => {
    const mulai = parseJam(j.mulai);
    const selesai = parseJam(j.selesai);
    const row = document.getElementById("row-" + i);

    
if (now >= mulai && now <= selesai) {

    if (lastIndex !== i) {
    sudahNotif = false;
    lastIndex = i;
  }

row.classList.add("active");

let nextIndex = i + 1;

while (jadwal[nextIndex] && jadwal[nextIndex].istirahat) {
  nextIndex++;
}

const nextRow = document.getElementById("row-" + nextIndex);
if (nextRow) {
  nextRow.classList.add("next");
}

const sisa = Math.floor((selesai - now) / 1000);

const jam = Math.floor(sisa / 3600);
const menit = Math.floor((sisa % 3600) / 60);
const detik = sisa % 60;

let waktu = "";

if (jam > 0) waktu += jam + "j ";
if (menit > 0) waktu += menit + "m ";
waktu += detik + "d";

document.getElementById("status").innerHTML =
  `Sekarang: <b>${j.nama}</b><br>Sisa: ${waktu}`;
  
  const total = selesai - mulai;
  const jalan = now - mulai;
  const persen = (jalan / total) * 100;
  document.getElementById("progress").style.width = persen + "%";

  const next = jadwal[i + 1];
  if (next) {
    const sisaMenit = (selesai - now) / 60000;
    const notif = document.getElementById("notif");

console.log("Sisa menit:", sisaMenit, "Audio aktif:", audioAktif);

const sisaDetik = (selesai - now) / 1000;

// bunyi tiap 5 detik dalam 30 detik terakhir
if (sisaDetik <= 30 && sisaDetik > 0 && audioAktif) {
  const sekarang = Date.now();

  if (!window.lastSoundTime) {
    window.lastSoundTime = 0;
  }

  if (sekarang - window.lastSoundTime > 5000) {

    speechSynthesis.cancel(); 
   const suara = new SpeechSynthesisUtterance("Sebentar lagi pergantian pelajaran");
   suara.lang = "id-ID";
    speechSynthesis.speak(suara);

    window.lastSoundTime = sekarang;
  }
}
if (sisaDetik > 30) {
  sudahBunyi = false;
}

  if (sisaMenit <= 5 && sisaMenit > 0 && !notif.classList.contains("show")) {
    notif.classList.add("show");
  }

  if (sisaMenit > 5 && notif.classList.contains("show")) {
    notif.classList.remove("show");
  }

if (sisaMenit <= 5 && sisaMenit > 0 && !sudahNotif) {
  showNotif("Sebentar lagi " + next.nama);

  sudahNotif = true;
}
  }

  aktif = true;
}
    if (now < mulai) {
  sudahNotif = false;
}
  });

  if (!aktif) {
    document.getElementById("status").innerHTML = "Belum mulai / sudah selesai";
    document.getElementById("progress").style.width = "0%";
  }
}

  update(); 
setInterval(update, 1000);