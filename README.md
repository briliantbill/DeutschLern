# DeutschLern

Website belajar Bahasa Jerman tingkat pemula (A1) untuk penutur Bahasa Indonesia, bertema jurnal perjalanan / scrapbook di atas meja kayu.

## Cara membuka

Klik ganda `index.html`. Tidak perlu server atau instalasi apa pun.

- Font (Fredoka, Nunito, Caveat) diambil dari Google Fonts, jadi butuh internet. Tanpa internet, font cadangan yang dipakai.
- Halaman dibuka lewat alamat hash: `#/beranda`, `#/materi`, `#/materi/k1`, `#/materi/p1`, `#/kuis`, `#/kamus`, `#/progres`.
- Style guide `#/komponen` (tidak ada di menu) menampilkan semua komponen dekoratif beserta cara memanggilnya.
- Saat pertama dibuka, muncul pilihan profil "Siapa yang belajar hari ini?". Profil aktif tampil di pojok navbar; klik untuk mengganti atau mengubah nama.
- Materi mengikuti buku Netzwerk neu A1 (Klett): `#/materi` berisi 4 perjalanan berupa halaman paspor, masing-masing 3 tiket Kapitel + 1 tiket Plattform (emas).
- Tiap Kapitel (`#/materi/k1` … `#/materi/k12`) adalah buku dengan tab washi Wortschatz · Grammatik · Dialog · Aussprache · Landeskunde. Halaman dibalik dengan tombol tiket, panah ← → di keyboard, atau geser di HP.
- Tiap Plattform (`#/materi/p1` … `#/materi/p4`) berisi kuis campuran yang dibuat otomatis dari 3 Kapitel-nya.
- Mode Guru (tombol di halaman Kapitel & Plattform, pakai PIN) menampilkan tips guru dan kunci jawaban. PIN diatur di baris atas `js/teacher.js`. Ini hanya tirai, bukan pengaman: kunci jawaban tetap bisa dibaca siapa pun yang membuka file situs.

## Audio pengucapan

Tombol stiker speaker dan mikrofon ada di setiap kosakata, contoh kalimat, dan baris dialog. Kata benda diucapkan bersama artikelnya. Selama Kapitel masih kosong, tombolnya bisa dicoba di `#/komponen`.

| Fitur | Teknologi | Yang dibutuhkan |
|---|---|---|
| Dengarkan (kecepatan Normal/Lambat, tersimpan per profil) | `speechSynthesis`, suara `de-*` terbaik yang tersedia | Suara Jerman di perangkat atau browser. Tanpa itu tombolnya disembunyikan dan muncul catatan, agar tidak terdengar pelafalan yang keliru. |
| Latih ucapan (nilai 0–100) | `SpeechRecognition` / `webkitSpeechRecognition`, `de-DE` | Browser yang mendukung (Chrome, Edge), izin mikrofon, dan biasanya internet: suara dikirim ke layanan pengenalan suara milik pembuat browser. Tanpa dukungan browser, tombolnya disembunyikan dan muncul catatan. Di HP, mikrofon butuh situs `https`. |

Cara menilai (`DL.practice.compare`): kata target dan kata yang tertangkap dipasangkan sesuai urutan. Kata sama = nilai penuh, kata mirip = setengah, lalu dibagi jumlah kata terbanyak dari keduanya. Huruf besar, tanda baca, ß/ss, dan angka ("25" / "fünfundzwanzig") disamakan; umlaut tidak, karena "schon" dan "schön" memang kata berbeda. Nilainya perkiraan dari tulisan hasil pengenalan, bukan penilaian logat.

## Struktur folder

```
index.html            kerangka: meja, jendela browser, navbar, <main id="app">, modal profil, PIN & Latih ucapan
css/
  base.css            design tokens, reset, latar meja kayu, hiasan meja, utilitas
  components.css      jendela browser, navbar + dropdown Kapitel, chip profil, washi, tab washi,
                      kertas, tiket, polaroid, stiker, artikel der/die/das, cap status,
                      referensi buku, Mode Guru, audio pengucapan, tombol, modal, buku spiral,
                      panggung buku (.book-stage), buku yang bisa dibalik (.flipbook)
  pages.css           area konten dan gaya khusus tiap halaman (Beranda, Materi, style guide)
  anim.css            gaya animasi grammar (js/anim.js)
js/
  router.js           router hash (#/materi/:id), bisa refresh() tanpa memindah fokus
  storage.js          satu-satunya akses localStorage: profil, profil aktif, progres, kecepatan suara
  data.js             membaca & memeriksa data/lessons.js, kata hari ini
  components.js       fungsi pembuat HTML komponen (paper, washi, washiTabs, ticket, ticketButton,
                      polaroid, sticker, speechBubble, notebook, germanTerm, richText,
                      bookRef, statusStamp, pluralForm, tilt, audioTools, speakButton,
                      practiceButton, speedControl, speechNote, audioBar)
  book.js             buku yang halamannya dibalik (animasi, keyboard, geser, 1/2 halaman)
  profile.js          modal pilih profil + chip profil di navbar
  teacher.js          Mode Guru: toggle, modal PIN, kelas is-teacher di <html>
  speech.js           memutar suara Jerman, pilihan kecepatan, cek dukungan browser
                      (kelas no-speech / no-listen di <html>)
  practice.js         Latih ucapan: modal, merekam, penilaian (DL.practice.compare)
  anim.js             animasi grammar (akhiran, sein, du/Sie, posisi 2, er/sie, aus, angka);
                      dipakai bila materi grammar di lessons.js punya "animasi"
  pages/*.js          satu file per halaman, mendaftarkan rutenya sendiri
  pages/materi.js     daftar perjalanan + rute #/materi/:id + bagian bersama (DL.materi)
  pages/kapitel.js    halaman Kapitel: tab, buku, saring kata penting, latihan
  pages/plattform.js  halaman Plattform: kuis campuran
  pages/komponen.js   style guide #/komponen
  app.js              menyalakan navbar (termasuk dropdown per perjalanan), profil, Mode Guru,
                      dan router (dimuat paling akhir)
data/
  lessons.js          12 Kapitel + 4 Plattform sesuai daftar isi buku. Masih kerangka: isi
                      diisi bertahap (format lengkap dijelaskan di atas file)
assets/
  decor/              hiasan meja (placeholder SVG)
  stickers/           19 stiker placeholder SVG (termasuk ikon Kapitel & tombol audio); daftar & teks
                      alternatifnya di components.js
  sounds/             efek suara (menyusul)
referensi/            gambar acuan desain, tidak dipakai situs
```

## Data yang disimpan (localStorage)

Semua kunci berawalan `deutschlern:v1:`.

| Kunci | Isi |
|---|---|
| `profiles` | `[{ id: "p1", name }, { id: "p2", name }]` — avatar & warna tiket tetap di `storage.js` |
| `activeProfile` | `"p1"` atau `"p2"` |
| `progress:p1`, `progress:p2` | `{ lastChapter, lastChapterAt, chapters: { "k1": { status, page, completedAt } } }` |
| `speechSpeed:p1`, `speechSpeed:p2` | `"normal"` atau `"lambat"` |

Status materi: `belum` (belum dibuka) → `sedang` (pernah dibuka) → `selesai`. Kapitel ditandai selesai lewat tombol "Tandai selesai"; Plattform selesai saat semua soal kuis dijawab benar. Materi yang belum ada isinya tampil sebagai "Belum diisi". `page` = halaman buku terakhir, supaya Kapitel yang belum selesai dilanjutkan dari situ.

Mode Guru disimpan di `sessionStorage`, jadi mati lagi saat tab ditutup.

Data hanya ada di browser yang dipakai. Untuk mengulang dari awal: buka Console (F12) lalu jalankan
`Object.keys(localStorage).filter(k => k.startsWith('deutschlern:')).forEach(k => localStorage.removeItem(k))`.

## Aturan kode

- Semua JavaScript berupa skrip biasa (bukan ES module) supaya jalan dari `file://`. Setiap file menempel ke satu objek global `window.DL`.
- Urutan `<script>` di `index.html` penting: `data/lessons.js` → `router.js` → `storage.js` → `data.js` → `components.js` → `book.js` → `profile.js` → `teacher.js` → `speech.js` → `practice.js` → `anim.js` → `pages/*.js` → `app.js`.
- Menambah halaman: buat `js/pages/nama.js` yang memanggil `DL.router.add('/nama', { title, nav, render, mount })`, lalu tambahkan `<script>` sebelum `app.js`.
- Isi Kapitel mengikuti buku. Jangan menebak isi buku: bagian yang belum ada datanya dibiarkan kosong dan tampil sebagai "Belum diisi".
- Mengubah data: edit `data/lessons.js` (format dijelaskan di atas file). Isinya JSON murni yang dibungkus `window.DL_DATA = …;` karena `file://` tidak bisa membaca file `.json`. Kalau ada yang salah, Beranda dan halaman Materi menampilkan peringatan dan detailnya ada di Console.
- Kata benda selalu ditampilkan lewat `DL.components.germanTerm()` agar artikel & warnanya konsisten: der = biru, die = merah, das = hijau.
- Progres yang sering berubah (halaman buku, status bab) memakai event `dl:progress-change`, yang tidak menggambar ulang halaman. Event `dl:profile-change` (profil/nama berubah) menggambar ulang halaman.
- Referensi ke buku selalu lewat `DL.components.bookRef()`, mis. "Kursbuch hlm. 12 · 4a · Track 1.1".
- Isi khusus guru diberi kelas `.teacher-only`: tersembunyi kecuali `<html>` punya kelas `is-teacher`.
- Teks Jerman yang bisa didengar diberi tombol lewat `DL.components.audioTools({ text, meaning })`. Halaman tidak perlu memasang listener: kliknya ditangani `speech.js` dan `practice.js` di tingkat `document`.
- Teks Jerman selalu diberi `lang="de"` agar dibaca benar oleh pembaca layar.
- Kemiringan kertas dan stiker diatur lewat variabel CSS `--tilt` (−2deg s/d 2deg). `DL.components.tilt(seed)` memberi sudut "acak" yang tetap untuk seed yang sama.
- Warna komponen selalu lewat token di `css/base.css` (termasuk palet turunan `--tint-*` dan `--article-*`). Pengecualian: warna di dalam data URI SVG ditulis langsung.
- Masker CSS (kertas sobek, coretan, spiral) ditulis sebagai data URI, karena `file://` memblokir `mask-image` dari file lokal.
- Gambar di `assets/` boleh diganti versi asli selama nama filenya sama. Kalau formatnya berubah (mis. `.svg` → `.png`), ubah nama file di daftar `STICKERS` di `js/components.js`.

## Progres

- [x] Step 1 — Kerangka proyek & layout dasar
- [x] Step 2 — Komponen UI reusable + style guide `#/komponen`
- [x] Step 3 — Beranda (buku terbuka), profil & modal "Siapa yang belajar hari ini?"
- [x] Step 4 — Materi: daftar bab bertiket + status, buku bab yang bisa dibalik, dropdown bab
- [x] Step 4b — Materi mengikuti Netzwerk neu A1: kerangka 12 Kapitel + 4 Plattform, halaman paspor, tab washi, referensi buku, filter kata penting, Mode Guru, dropdown per perjalanan
- [x] Step 5 — Audio pengucapan: tombol speaker & kecepatan, Latih ucapan dengan nilai, catatan bila browser tidak mendukung
- [x] Isi data Kapitel 1 (Kursbuch hlm. 8–17, audio 1.1–1.12, modul yang sudah dikoreksi) + animasi grammar
- [ ] Isi data: Kapitel 2–12 dan Plattform 1–4
