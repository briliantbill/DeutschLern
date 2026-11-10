/* =========================================================
   DeutschLern — data/lessons.js
   Materi mengikuti buku Netzwerk neu A1 (Klett). Isinya JSON murni
   (kunci & teks memakai tanda kutip ganda), dibungkus
   "window.DL_DATA = …;" karena browser menolak membaca file .json
   lewat file://. Kalau nanti situs memakai server, bagian di antara
   "window.DL_DATA =" dan ";" bisa disalin apa adanya ke lessons.json.

   KERANGKA: judul dan halaman sudah sesuai daftar isi buku. Kapitel 1
   sudah diisi (Kursbuch hlm. 8–17, audio 1.1–1.13, ditambah materi
   modul Hello Class World yang sudah dikoreksi). Kapitel lain masih
   kosong dan diisi bertahap. Jangan menebak isi buku.

   Struktur satu Kapitel:
   {
     "id": "k1",                       jangan diubah: dipakai alamat #/materi/k1 & progres
     "nomor": 1,
     "judul_de": "Guten Tag!",
     "judul_id": "Selamat siang!",
     "halaman_buku": "8–17",           halaman Kursbuch
     "perjalanan": 1,                  1–4
     "stiker": "bear",                 ikon tiket (kunci STICKERS di js/components.js)
     "lernziele": [{ "de": "grüßen und verabschieden", "id": "menyapa dan berpamitan" }],
     "ringkasan": {                    kotak di daftar isi buku; teks atau daftar teks
       "wortschatz": "", "grammatik": "", "aussprache": "",
       "strategie": "", "landeskunde": "", "netzwerk_wg": ""
     },
     "kosakata": [{
       "de": "Name",                   kata benda TANPA artikel, huruf besar
       "artikel": "der",               "der" | "die" | "das", atau null bila bukan kata benda
       "jamak": "Namen",               "Namen", "die Namen", atau "-n"; null bila tidak ada
       "id": "nama",
       "aufgabe": "1/2a",              Kapitel 1, Aufgabe 2a
       "halaman": 10,                  (boleh dihapus) halaman Kursbuch
       "wichtig": true,                true = kata tebal di Wortliste buku
       "contoh_de": "Mein Name ist Budi.",   (boleh null)
       "contoh_id": "Namaku Budi."           (boleh null)
     }],
     "dialog": [{
       "track": "1.1", "judul": "…", "halaman": 8, "aufgabe": "2a",
       "baris": [{ "pembicara": "Lena", "de": "…", "id": "…" }]
     }],
     "grammatik": [{
       "judul": "…",
       "halaman": 12,
       "ringkasan": "…",
       "tabel": {                      (boleh null)
         "kolom": ["…"],               kolom bernama "der"/"die"/"das" diberi warna artikel
         "bahasa": ["de", "id"],       bahasa isi tiap kolom (boleh dihapus = semua "de")
         "baris": [["…", "…"]]         jumlah sel tiap baris = jumlah kolom
       },
       "contoh": ["…"],                teks, atau { "de": "…", "id": "…" }
       "perbandingan_indonesia": "…",
       "kesalahan_umum": ["…"],        teks, atau { "salah": "…", "benar": "…" }
       "latihan": [{ "soal": "Ich ___ Anna.", "jawaban": "heiße" }],
       "animasi": "akhiran"            (boleh dihapus) animasi di halaman kanan, lihat
                                       daftar jenisnya di atas js/anim.js
                                       "___" = bagian yang diisi; "jawaban" boleh berupa
                                       daftar bila ada beberapa jawaban yang benar
     }],
     "tips_guru": ["…"]                hanya tampil di Mode Guru
   }

   Struktur satu Plattform (tanpa kosakata baru; isinya kuis campuran
   yang dibuat otomatis dari 3 Kapitel di "kapitel"):
   {
     "id": "p1", "nomor": 1, "judul": "Plattform 1", "halaman_buku": "38–43",
     "perjalanan": 1, "kapitel": [1, 2, 3], "stiker": "stamp", "landeskunde": "…"
   }

   Di teks penjelasan, kata Jerman boleh diapit bintang: *Ich heiße*.
   Teks itu ditebalkan dan dibaca pembaca layar sebagai Bahasa Jerman.

   Kalau ada yang salah format, Beranda dan halaman Materi menampilkan
   peringatan dan detailnya muncul di Console browser (tekan F12).
   ========================================================= */
window.DL_DATA = {
  "kapitel": [
    {
      "id": "k1",
      "nomor": 1,
      "judul_de": "Guten Tag!",
      "judul_id": "Selamat siang!",
      "halaman_buku": "8–17",
      "perjalanan": 1,
      "stiker": "bear",
      "lernziele": [
        {
          "de": "grüßen und verabschieden",
          "id": "menyapa dan berpamitan"
        },
        {
          "de": "sich und andere vorstellen",
          "id": "memperkenalkan diri dan orang lain"
        },
        {
          "de": "nach dem Befinden fragen und darauf reagieren",
          "id": "menanyakan kabar dan menjawabnya"
        },
        {
          "de": "über sich und andere sprechen",
          "id": "berbicara tentang diri sendiri dan orang lain"
        },
        {
          "de": "Zahlen bis 20 nennen",
          "id": "menyebut angka sampai 20"
        },
        {
          "de": "Telefonnummer und E-Mail-Adresse nennen",
          "id": "menyebut nomor telepon dan alamat e-mail"
        },
        {
          "de": "buchstabieren",
          "id": "mengeja"
        },
        {
          "de": "über Länder und Sprachen sprechen",
          "id": "berbicara tentang negara dan bahasa"
        }
      ],
      "ringkasan": {
        "wortschatz": [
          "Kata Jerman yang dikenal di banyak bahasa (*Deutsch international*, 1a)",
          "Salam dan pamit: *Hallo, Guten Tag, Tschüs, Auf Wiedersehen*",
          "Angka 0–20, nomor telepon, alamat e-mail",
          "Negara dan bahasa"
        ],
        "grammatik": [
          "Kata kerja dan kata ganti orang: *ich, du, er/sie, Sie*",
          "Kata kerja *sein*",
          "Kalimat tanya W dan kalimat pernyataan: kata kerja di posisi 2",
          "Kata ganti orang dalam teks: *er/sie*"
        ],
        "aussprache": [
          "Alfabet: dengarkan dulu, lalu baca bersama dengan keras (7a, Track 1.11).",
          "Nama huruf yang berbeda dari alfabet Indonesia: C = *tse*, J = *jot*, Q = *ku*, V = *fau*, W = *we*, X = *iks*, Y = *üpsilon*, Z = *tset*, ß = *estset*.",
          "Ungkapan saat tidak paham (Gut gesagt, Track 1.13): *Wie bitte? – Entschuldigung, noch einmal bitte. – Das verstehe ich nicht. – Bitte ein bisschen langsamer.*",
          "Tambahan untuk murid Indonesia: *ei* dibaca „ai“ (*heißen, drei*), *ie* dibaca „i“ panjang (*Sie, vier*), *eu* dibaca „oi“ (*Deutsch, neun*), *w* dibaca „v“ (*Wie, Wo*), *v* dibaca „f“ (*vier*), *z* dibaca „ts“ (*zehn*), *s* di awal sebelum vokal dibaca „z“ (*Sie, sieben*), *sp/st* di awal dibaca „syp/syt“ (*sprechen*).",
          "Tiga kesalahan lafal yang paling sering: *Name* dibaca „naa-me“ (bukan „neim“), *Sie* dibaca „zii“, *Wie* dibaca „vii“."
        ],
        "strategie": [],
        "landeskunde": [
          "Banyak kata Jerman dipakai di bahasa lain, juga di bahasa Indonesia: *Handtuch* → handuk, *Koffer* → koper.",
          "Di Jerman, orang yang belum akrab dipanggil *Herr/Frau* + nama belakang dan disapa dengan *Sie*. Teman dan anak muda langsung memakai *du* dan nama depan.",
          "Salam menurut waktu: *Guten Morgen* (pagi), *Guten Tag* (siang, ± jam 11–18), *Guten Abend* (malam), *Gute Nacht* (sebelum tidur).",
          "Bahasa Jerman dipakai di Jerman, Austria, dan Swiss. Di Swiss juga dipakai bahasa Prancis, Italia, dan Retoroman.",
          "Dari modul: *Mahlzeit!* adalah salam siang hari di kantor, terutama di Jerman selatan dan Austria."
        ],
        "netzwerk_wg": [
          "Video Szene 1–3: Anna baru pindah ke sebuah WG (rumah yang disewa bersama) di München. Yang tinggal di sana: Luca, Anna, Bea, dan Max.",
          "Max, Bea, dan Luca tinggal di München. Anna berasal dari Hannover, Bea dari Berlin, Luca dari München. Max sedang di kampus.",
          "Kalimat dari video: *Bea, das ist Anna. – Woher kommst du denn? – Ah, du bist neu hier. Ich bin Luca. – Und wie ist deine Nummer?*"
        ]
      },
      "kosakata": [
        {
          "de": "Handtuch",
          "artikel": "das",
          "jamak": "Handtücher",
          "id": "handuk",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": "„Handtuch“ heißt auf Indonesisch „handuk“.",
          "contoh_id": "„Handtuch“ dalam bahasa Indonesia „handuk“."
        },
        {
          "de": "Flasche",
          "artikel": "die",
          "jamak": "-n",
          "id": "botol",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Koffer",
          "artikel": "der",
          "jamak": "-",
          "id": "koper",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Würstchen",
          "artikel": "das",
          "jamak": "-",
          "id": "sosis (kecil)",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Kindergarten",
          "artikel": "der",
          "jamak": "Kindergärten",
          "id": "taman kanak-kanak (TK)",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Butterbrot",
          "artikel": "das",
          "jamak": "-e",
          "id": "roti mentega",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Kranke",
          "artikel": "der",
          "jamak": "die Kranken",
          "id": "orang sakit (laki-laki)",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Autobahn",
          "artikel": "die",
          "jamak": "-en",
          "id": "jalan tol",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "die Nudeln",
          "artikel": null,
          "jamak": null,
          "id": "mi, pasta (selalu bentuk jamak)",
          "aufgabe": "1/1a",
          "halaman": 9,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Hallo!",
          "artikel": null,
          "jamak": null,
          "id": "Halo! (informal)",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Hallo Nina!",
          "contoh_id": "Halo Nina!"
        },
        {
          "de": "Wie geht's?",
          "artikel": null,
          "jamak": null,
          "id": "Apa kabar? (informal)",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Hallo Niklas! Wie geht's?",
          "contoh_id": "Halo Niklas! Apa kabar?"
        },
        {
          "de": "Wie geht's dir?",
          "artikel": null,
          "jamak": null,
          "id": "Apa kabarmu?",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": "Hallo Julia! Wie geht's dir?",
          "contoh_id": "Halo Julia! Apa kabarmu?"
        },
        {
          "de": "Danke, sehr gut!",
          "artikel": null,
          "jamak": null,
          "id": "Baik sekali, terima kasih!",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": "Danke, sehr gut! Und dir?",
          "contoh_id": "Baik sekali, terima kasih! Kamu?"
        },
        {
          "de": "Ganz gut.",
          "artikel": null,
          "jamak": null,
          "id": "Lumayan baik.",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": "Ganz gut, danke.",
          "contoh_id": "Lumayan baik, terima kasih."
        },
        {
          "de": "Auch gut, danke.",
          "artikel": null,
          "jamak": null,
          "id": "Baik juga, terima kasih.",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Und dir?",
          "artikel": null,
          "jamak": null,
          "id": "Kamu? / Kalau kamu?",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Wer bist du?",
          "artikel": null,
          "jamak": null,
          "id": "Kamu siapa?",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Hallo, ich bin Julia. Und du? Wer bist du?",
          "contoh_id": "Halo, aku Julia. Kamu? Kamu siapa?"
        },
        {
          "de": "Wie heißt du?",
          "artikel": null,
          "jamak": null,
          "id": "Siapa namamu?",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Entschuldigung, wie heißt du?",
          "contoh_id": "Maaf, siapa namamu?"
        },
        {
          "de": "heißen",
          "artikel": null,
          "jamak": null,
          "id": "bernama",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Ich heiße Niklas.",
          "contoh_id": "Namaku Niklas."
        },
        {
          "de": "sein",
          "artikel": null,
          "jamak": null,
          "id": "adalah, ada",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Ich bin Julia.",
          "contoh_id": "Aku Julia."
        },
        {
          "de": "Entschuldigung!",
          "artikel": null,
          "jamak": null,
          "id": "Maaf! / Permisi!",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": "Entschuldigung, wie heißt du?",
          "contoh_id": "Maaf, siapa namamu?"
        },
        {
          "de": "Tschüs!",
          "artikel": null,
          "jamak": null,
          "id": "Dah! (informal)",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": true,
          "contoh_de": "Tschüs Julia! Bis bald!",
          "contoh_id": "Dah, Julia! Sampai nanti!"
        },
        {
          "de": "Ciao!",
          "artikel": null,
          "jamak": null,
          "id": "Dah! (informal)",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Bis bald!",
          "artikel": null,
          "jamak": null,
          "id": "Sampai nanti! / Sampai jumpa lagi!",
          "aufgabe": "1/2a",
          "halaman": 10,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Guten Morgen!",
          "artikel": null,
          "jamak": null,
          "id": "Selamat pagi!",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "Guten Morgen, Frau Weber!",
          "contoh_id": "Selamat pagi, Bu Weber!"
        },
        {
          "de": "Guten Tag!",
          "artikel": null,
          "jamak": null,
          "id": "Selamat siang! (± jam 11–18)",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": true,
          "contoh_de": "Guten Tag, Frau Kowalski.",
          "contoh_id": "Selamat siang, Bu Kowalski."
        },
        {
          "de": "Guten Abend!",
          "artikel": null,
          "jamak": null,
          "id": "Selamat malam! (saat bertemu)",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Gute Nacht!",
          "artikel": null,
          "jamak": null,
          "id": "Selamat tidur! (hanya sebelum tidur)",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Auf Wiedersehen!",
          "artikel": null,
          "jamak": null,
          "id": "Sampai jumpa! (formal)",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": true,
          "contoh_de": "Auf Wiedersehen, Herr Hansen.",
          "contoh_id": "Sampai jumpa, Pak Hansen."
        },
        {
          "de": "Name",
          "artikel": "der",
          "jamak": "-n",
          "id": "nama",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": true,
          "contoh_de": "Mein Name ist Nina Weber.",
          "contoh_id": "Nama saya Nina Weber."
        },
        {
          "de": "Vorname",
          "artikel": "der",
          "jamak": "-n",
          "id": "nama depan",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "informell: du + Vorname",
          "contoh_id": "informal: du + nama depan"
        },
        {
          "de": "Nachname",
          "artikel": "der",
          "jamak": "-n",
          "id": "nama belakang",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "formell: Sie + Vorname + Nachname",
          "contoh_id": "formal: Sie + nama depan + nama belakang"
        },
        {
          "de": "Frau",
          "artikel": "die",
          "jamak": "-en",
          "id": "Ibu, Bu (+ nama belakang); perempuan",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "Guten Tag, Frau Kowalski.",
          "contoh_id": "Selamat siang, Bu Kowalski."
        },
        {
          "de": "Herr",
          "artikel": "der",
          "jamak": "-en",
          "id": "Bapak, Pak (+ nama belakang)",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "Hallo, Herr Hansen.",
          "contoh_id": "Halo, Pak Hansen."
        },
        {
          "de": "Wie heißen Sie?",
          "artikel": null,
          "jamak": null,
          "id": "Siapa nama Anda?",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": true,
          "contoh_de": "Guten Tag! Entschuldigung, wie heißen Sie?",
          "contoh_id": "Selamat siang! Maaf, siapa nama Anda?"
        },
        {
          "de": "Wie ist Ihr Name?",
          "artikel": null,
          "jamak": null,
          "id": "Siapa nama Anda?",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Wie geht es Ihnen?",
          "artikel": null,
          "jamak": null,
          "id": "Apa kabar Anda?",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "Guten Tag, Frau Weber. Wie geht es Ihnen?",
          "contoh_id": "Selamat siang, Bu Weber. Apa kabar Anda?"
        },
        {
          "de": "Und Ihnen?",
          "artikel": null,
          "jamak": null,
          "id": "Anda sendiri?",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "Danke, gut. Und Ihnen?",
          "contoh_id": "Baik, terima kasih. Anda sendiri?"
        },
        {
          "de": "Das ist …",
          "artikel": null,
          "jamak": null,
          "id": "Ini … (memperkenalkan orang)",
          "aufgabe": "1/3a",
          "halaman": 11,
          "wichtig": false,
          "contoh_de": "Das ist Frau Kowalski.",
          "contoh_id": "Ini Bu Kowalski."
        },
        {
          "de": "kommen (aus)",
          "artikel": null,
          "jamak": null,
          "id": "berasal (dari), datang",
          "aufgabe": "1/4a",
          "halaman": 12,
          "wichtig": true,
          "contoh_de": "Ich komme aus Deutschland.",
          "contoh_id": "Saya berasal dari Jerman."
        },
        {
          "de": "wohnen (in)",
          "artikel": null,
          "jamak": null,
          "id": "tinggal (di)",
          "aufgabe": "1/4a",
          "halaman": 12,
          "wichtig": true,
          "contoh_de": "Ich wohne in Frankfurt.",
          "contoh_id": "Saya tinggal di Frankfurt."
        },
        {
          "de": "sprechen",
          "artikel": null,
          "jamak": null,
          "id": "berbicara",
          "aufgabe": "1/4a",
          "halaman": 12,
          "wichtig": true,
          "contoh_de": "Ich spreche Spanisch, Englisch und Deutsch.",
          "contoh_id": "Saya berbicara bahasa Spanyol, Inggris, dan Jerman."
        },
        {
          "de": "Sprache",
          "artikel": "die",
          "jamak": "-n",
          "id": "bahasa",
          "aufgabe": "1/4a",
          "halaman": 12,
          "wichtig": true,
          "contoh_de": "Welche Sprachen sprechen Sie?",
          "contoh_id": "Bahasa apa saja yang Anda kuasai?"
        },
        {
          "de": "Woher?",
          "artikel": null,
          "jamak": null,
          "id": "Dari mana?",
          "aufgabe": "1/4a",
          "halaman": 12,
          "wichtig": true,
          "contoh_de": "Woher kommen Sie, Frau Lang?",
          "contoh_id": "Dari mana asal Anda, Bu Lang?"
        },
        {
          "de": "Wo?",
          "artikel": null,
          "jamak": null,
          "id": "Di mana?",
          "aufgabe": "1/4a",
          "halaman": 12,
          "wichtig": true,
          "contoh_de": "Wo wohnen Sie?",
          "contoh_id": "Di mana Anda tinggal?"
        },
        {
          "de": "Wer?",
          "artikel": null,
          "jamak": null,
          "id": "Siapa?",
          "aufgabe": "1/5b",
          "halaman": 12,
          "wichtig": false,
          "contoh_de": "Wer ist das?",
          "contoh_id": "Siapa itu?"
        },
        {
          "de": "Wie?",
          "artikel": null,
          "jamak": null,
          "id": "Bagaimana?",
          "aufgabe": "1/4b",
          "halaman": 12,
          "wichtig": false,
          "contoh_de": "Wie heißt du?",
          "contoh_id": "Siapa namamu? (harfiah: bagaimana kamu dinamai?)"
        },
        {
          "de": "Und wo wohnst du?",
          "artikel": null,
          "jamak": null,
          "id": "Dan di mana kamu tinggal?",
          "aufgabe": "1/4b",
          "halaman": 12,
          "wichtig": false,
          "contoh_de": "Und wo wohnst du? – In Zürich.",
          "contoh_id": "Dan di mana kamu tinggal? – Di Zürich."
        },
        {
          "de": "Zahl",
          "artikel": "die",
          "jamak": "-en",
          "id": "angka",
          "aufgabe": "1/6a",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": "Die Zahlen von null bis zwanzig.",
          "contoh_id": "Angka dari nol sampai dua puluh."
        },
        {
          "de": "Telefonnummer",
          "artikel": "die",
          "jamak": "-n",
          "id": "nomor telepon",
          "aufgabe": "1/6b",
          "halaman": 13,
          "wichtig": true,
          "contoh_de": "Wie ist Ihre Telefonnummer, bitte?",
          "contoh_id": "Berapa nomor telepon Anda?"
        },
        {
          "de": "Handynummer",
          "artikel": "die",
          "jamak": "-n",
          "id": "nomor HP",
          "aufgabe": "1/6c",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": "Wie ist deine Handynummer?",
          "contoh_id": "Berapa nomor HP-mu?"
        },
        {
          "de": "E-Mail-Adresse",
          "artikel": "die",
          "jamak": "-n",
          "id": "alamat e-mail",
          "aufgabe": "1/7b",
          "halaman": 13,
          "wichtig": true,
          "contoh_de": "Wie ist deine E-Mail-Adresse?",
          "contoh_id": "Apa alamat e-mailmu?"
        },
        {
          "de": "Alphabet",
          "artikel": "das",
          "jamak": null,
          "id": "alfabet",
          "aufgabe": "1/7a",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "buchstabieren",
          "artikel": null,
          "jamak": null,
          "id": "mengeja",
          "aufgabe": "1/7c",
          "halaman": 13,
          "wichtig": true,
          "contoh_de": "Kannst du das buchstabieren?",
          "contoh_id": "Bisa kamu eja?"
        },
        {
          "de": "Wie bitte?",
          "artikel": null,
          "jamak": null,
          "id": "Maaf? (minta diulang)",
          "aufgabe": "1/7c",
          "halaman": 13,
          "wichtig": true,
          "contoh_de": "Wie bitte? Kannst du das buchstabieren?",
          "contoh_id": "Maaf? Bisa kamu eja?"
        },
        {
          "de": "Entschuldigung, noch einmal bitte.",
          "artikel": null,
          "jamak": null,
          "id": "Maaf, tolong sekali lagi.",
          "aufgabe": "Gut gesagt",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Das verstehe ich nicht.",
          "artikel": null,
          "jamak": null,
          "id": "Saya tidak mengerti.",
          "aufgabe": "Gut gesagt",
          "halaman": 13,
          "wichtig": true,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Bitte ein bisschen langsamer.",
          "artikel": null,
          "jamak": null,
          "id": "Tolong sedikit lebih pelan.",
          "aufgabe": "Gut gesagt",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "ät (@)",
          "artikel": null,
          "jamak": null,
          "id": "tanda @ (at)",
          "aufgabe": "1/7b",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": "maria_1811 ät inet Punkt com",
          "contoh_id": "maria_1811@inet.com"
        },
        {
          "de": "Punkt",
          "artikel": "der",
          "jamak": null,
          "id": "titik (.)",
          "aufgabe": "1/7b",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Unterstrich",
          "artikel": "der",
          "jamak": null,
          "id": "garis bawah (_)",
          "aufgabe": "1/7b",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "minus",
          "artikel": null,
          "jamak": null,
          "id": "strip (-)",
          "aufgabe": "1/7b",
          "halaman": 13,
          "wichtig": false,
          "contoh_de": "Ruben minus Gonzalez",
          "contoh_id": "Ruben-Gonzalez"
        },
        {
          "de": "Land",
          "artikel": "das",
          "jamak": "Länder",
          "id": "negara",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": true,
          "contoh_de": "Mein Land: Indonesien.",
          "contoh_id": "Negaraku: Indonesia."
        },
        {
          "de": "Stadt",
          "artikel": "die",
          "jamak": "Städte",
          "id": "kota",
          "aufgabe": "1/8e",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Name, Land, Stadt, Sprachen",
          "contoh_id": "nama, negara, kota, bahasa"
        },
        {
          "de": "lernen",
          "artikel": null,
          "jamak": null,
          "id": "belajar",
          "aufgabe": "1/8a",
          "halaman": 14,
          "wichtig": true,
          "contoh_de": "Sie lernt Spanisch.",
          "contoh_id": "Ia (perempuan) belajar bahasa Spanyol."
        },
        {
          "de": "Deutschland",
          "artikel": null,
          "jamak": null,
          "id": "Jerman (negara)",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Ich komme aus Deutschland.",
          "contoh_id": "Saya berasal dari Jerman."
        },
        {
          "de": "Deutsch",
          "artikel": null,
          "jamak": null,
          "id": "bahasa Jerman",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": true,
          "contoh_de": "Ich lerne Deutsch.",
          "contoh_id": "Saya belajar bahasa Jerman."
        },
        {
          "de": "Österreich",
          "artikel": null,
          "jamak": null,
          "id": "Austria",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Boris Walder kommt aus Österreich.",
          "contoh_id": "Boris Walder berasal dari Austria."
        },
        {
          "de": "die Schweiz",
          "artikel": null,
          "jamak": null,
          "id": "Swiss (negara dengan artikel)",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Alessia Conti kommt aus der Schweiz.",
          "contoh_id": "Alessia Conti berasal dari Swiss."
        },
        {
          "de": "die Türkei",
          "artikel": null,
          "jamak": null,
          "id": "Turki (negara dengan artikel)",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Ich komme aus der Türkei.",
          "contoh_id": "Saya berasal dari Turki."
        },
        {
          "de": "die USA",
          "artikel": null,
          "jamak": null,
          "id": "Amerika Serikat (jamak, dengan artikel)",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Olivia Miller kommt aus den USA.",
          "contoh_id": "Olivia Miller berasal dari Amerika Serikat."
        },
        {
          "de": "Indonesien",
          "artikel": null,
          "jamak": null,
          "id": "Indonesia",
          "aufgabe": "1/8e",
          "halaman": 15,
          "wichtig": true,
          "contoh_de": "Ich komme aus Indonesien.",
          "contoh_id": "Saya berasal dari Indonesia."
        },
        {
          "de": "Indonesisch",
          "artikel": null,
          "jamak": null,
          "id": "bahasa Indonesia",
          "aufgabe": "1/8e",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": "Ich spreche Indonesisch und Englisch.",
          "contoh_id": "Saya bisa bahasa Indonesia dan Inggris."
        },
        {
          "de": "Englisch",
          "artikel": null,
          "jamak": null,
          "id": "bahasa Inggris",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Japan – Japanisch",
          "artikel": null,
          "jamak": null,
          "id": "Jepang – bahasa Jepang",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Frankreich – Französisch",
          "artikel": null,
          "jamak": null,
          "id": "Prancis – bahasa Prancis",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Spanien – Spanisch",
          "artikel": null,
          "jamak": null,
          "id": "Spanyol – bahasa Spanyol",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "Brasilien – Portugiesisch",
          "artikel": null,
          "jamak": null,
          "id": "Brasil – bahasa Portugis",
          "aufgabe": "1/8b",
          "halaman": 15,
          "wichtig": false,
          "contoh_de": null,
          "contoh_id": null
        },
        {
          "de": "WG",
          "artikel": "die",
          "jamak": "-s",
          "id": "rumah/apartemen yang disewa bersama (Wohngemeinschaft)",
          "aufgabe": "1/9",
          "halaman": 16,
          "wichtig": false,
          "contoh_de": "Wer wohnt in der Netzwerk-WG?",
          "contoh_id": "Siapa yang tinggal di WG Netzwerk?"
        },
        {
          "de": "neu",
          "artikel": null,
          "jamak": null,
          "id": "baru",
          "aufgabe": "1/10",
          "halaman": 16,
          "wichtig": false,
          "contoh_de": "Ah, du bist neu hier. Ich bin Luca.",
          "contoh_id": "Oh, kamu baru di sini. Aku Luca."
        },
        {
          "de": "Uni",
          "artikel": "die",
          "jamak": "-s",
          "id": "universitas, kampus",
          "aufgabe": "1/10",
          "halaman": 16,
          "wichtig": false,
          "contoh_de": "Max ist nicht da, er ist an der Uni.",
          "contoh_id": "Max tidak ada, ia di kampus."
        }
      ],
      "dialog": [
        {
          "track": "1.1",
          "judul": "Hallo! Tschüs! – Situasi A (du)",
          "halaman": 10,
          "aufgabe": "2a",
          "baris": [
            {
              "pembicara": "Niklas",
              "de": "Hallo Nina!",
              "id": "Halo Nina!"
            },
            {
              "pembicara": "Nina",
              "de": "Hallo Niklas! Wie geht's?",
              "id": "Halo Niklas! Apa kabar?"
            },
            {
              "pembicara": "Niklas",
              "de": "Danke, sehr gut! Und dir?",
              "id": "Baik sekali, terima kasih! Kamu?"
            },
            {
              "pembicara": "Nina",
              "de": "Ganz gut, danke.",
              "id": "Lumayan baik, terima kasih."
            }
          ]
        },
        {
          "track": "1.2",
          "judul": "Hallo! Tschüs! – Situasi B (du)",
          "halaman": 10,
          "aufgabe": "2a",
          "baris": [
            {
              "pembicara": "Julia",
              "de": "Hallo Nina!",
              "id": "Halo Nina!"
            },
            {
              "pembicara": "Nina",
              "de": "Hallo Julia! Wie geht's dir?",
              "id": "Halo Julia! Apa kabarmu?"
            },
            {
              "pembicara": "Julia",
              "de": "Danke, gut. Und dir?",
              "id": "Baik, terima kasih. Kamu?"
            },
            {
              "pembicara": "Nina",
              "de": "Auch gut, danke.",
              "id": "Baik juga, terima kasih."
            },
            {
              "pembicara": "Julia",
              "de": "Hallo, ich bin Julia. Und du? Wer bist du?",
              "id": "Halo, aku Julia. Kamu? Kamu siapa?"
            },
            {
              "pembicara": "Niklas",
              "de": "Ich heiße Niklas.",
              "id": "Namaku Niklas."
            },
            {
              "pembicara": "Julia",
              "de": "Entschuldigung, wie heißt du?",
              "id": "Maaf, siapa namamu?"
            },
            {
              "pembicara": "Niklas",
              "de": "Niklas.",
              "id": "Niklas."
            }
          ]
        },
        {
          "track": "1.3",
          "judul": "Hallo! Tschüs! – Situasi C (berpamitan)",
          "halaman": 10,
          "aufgabe": "2a",
          "baris": [
            {
              "pembicara": "Julia",
              "de": "Tschüs!",
              "id": "Dah!"
            },
            {
              "pembicara": "Nina",
              "de": "Tschüs Julia! Bis bald!",
              "id": "Dah, Julia! Sampai nanti!"
            },
            {
              "pembicara": "Niklas",
              "de": "Ciao!",
              "id": "Daah!"
            }
          ]
        },
        {
          "track": "1.4",
          "judul": "Guten Tag! Auf Wiedersehen! – Situasi A (Sie)",
          "halaman": 11,
          "aufgabe": "3a",
          "baris": [
            {
              "pembicara": "Nina Weber",
              "de": "Guten Morgen. Mein Name ist Nina Weber.",
              "id": "Selamat pagi. Nama saya Nina Weber."
            },
            {
              "pembicara": "Oliver Hansen",
              "de": "Guten Morgen, Frau Weber! Ich heiße Oliver Hansen.",
              "id": "Selamat pagi, Bu Weber! Nama saya Oliver Hansen."
            }
          ]
        },
        {
          "track": "1.5",
          "judul": "Guten Tag! Auf Wiedersehen! – Situasi B (Sie)",
          "halaman": 11,
          "aufgabe": "3a",
          "baris": [
            {
              "pembicara": "Nina Weber",
              "de": "Guten Tag, Frau Kowalski.",
              "id": "Selamat siang, Bu Kowalski."
            },
            {
              "pembicara": "Frau Kowalski",
              "de": "Guten Tag, Frau Weber. Wie geht es Ihnen?",
              "id": "Selamat siang, Bu Weber. Apa kabar Anda?"
            },
            {
              "pembicara": "Nina Weber",
              "de": "Danke, gut. Und Ihnen?",
              "id": "Baik, terima kasih. Anda sendiri?"
            },
            {
              "pembicara": "Frau Kowalski",
              "de": "Auch gut, danke.",
              "id": "Baik juga, terima kasih."
            },
            {
              "pembicara": "Oliver Hansen",
              "de": "Hallo, Frau Weber.",
              "id": "Halo, Bu Weber."
            },
            {
              "pembicara": "Nina Weber",
              "de": "Hallo, Herr Hansen. Das ist Frau Kowalski.",
              "id": "Halo, Pak Hansen. Ini Bu Kowalski."
            },
            {
              "pembicara": "Oliver Hansen",
              "de": "Guten Tag, Frau Kowalski. Mein Name ist Oliver Hansen.",
              "id": "Selamat siang, Bu Kowalski. Nama saya Oliver Hansen."
            },
            {
              "pembicara": "Frau Kowalski",
              "de": "Guten Tag! Entschuldigung, wie heißen Sie?",
              "id": "Selamat siang! Maaf, siapa nama Anda?"
            },
            {
              "pembicara": "Oliver Hansen",
              "de": "Oliver Hansen.",
              "id": "Oliver Hansen."
            }
          ]
        },
        {
          "track": "1.6",
          "judul": "Guten Tag! Auf Wiedersehen! – Situasi C (berpamitan)",
          "halaman": 11,
          "aufgabe": "3a",
          "baris": [
            {
              "pembicara": "Frau Kowalski",
              "de": "Auf Wiedersehen, Herr Hansen. Tschüs, Frau Weber.",
              "id": "Sampai jumpa, Pak Hansen. Dah, Bu Weber. (Tschüs karena mereka sudah akrab)"
            },
            {
              "pembicara": "Oliver Hansen",
              "de": "Auf Wiedersehen, Frau Kowalski.",
              "id": "Sampai jumpa, Bu Kowalski."
            },
            {
              "pembicara": "Nina Weber",
              "de": "Auf Wiedersehen!",
              "id": "Sampai jumpa!"
            }
          ]
        },
        {
          "track": "1.7",
          "judul": "Woher kommen Sie?",
          "halaman": 12,
          "aufgabe": "4a",
          "baris": [
            {
              "pembicara": "Pewawancara",
              "de": "Woher kommen Sie, Frau Lang?",
              "id": "Dari mana asal Anda, Bu Lang?"
            },
            {
              "pembicara": "Selina Lang",
              "de": "Ich komme aus Deutschland.",
              "id": "Saya berasal dari Jerman."
            },
            {
              "pembicara": "Pewawancara",
              "de": "Welche Sprachen sprechen Sie?",
              "id": "Bahasa apa saja yang Anda kuasai?"
            },
            {
              "pembicara": "Selina Lang",
              "de": "Ich spreche Spanisch, Englisch und Deutsch.",
              "id": "Saya berbicara bahasa Spanyol, Inggris, dan Jerman."
            },
            {
              "pembicara": "Pewawancara",
              "de": "Wo wohnen Sie?",
              "id": "Di mana Anda tinggal?"
            },
            {
              "pembicara": "Selina Lang",
              "de": "Ich wohne in Frankfurt.",
              "id": "Saya tinggal di Frankfurt."
            }
          ]
        },
        {
          "track": "1.9",
          "judul": "Telefonnummern – Percakapan 1",
          "halaman": 13,
          "aufgabe": "6b",
          "baris": [
            {
              "pembicara": "Resepsionis",
              "de": "Guten Tag, Hotel Zentral.",
              "id": "Selamat siang, Hotel Zentral."
            },
            {
              "pembicara": "Philipp Klein",
              "de": "Guten Tag, Philipp Klein. Ich möchte Frau Berg sprechen.",
              "id": "Selamat siang, (saya) Philipp Klein. Saya ingin bicara dengan Bu Berg."
            },
            {
              "pembicara": "Resepsionis",
              "de": "Frau Berg ist nicht da. Kann sie zurückrufen?",
              "id": "Bu Berg tidak ada. Boleh beliau menelepon balik?"
            },
            {
              "pembicara": "Philipp Klein",
              "de": "Ja, bitte.",
              "id": "Ya, silakan."
            },
            {
              "pembicara": "Resepsionis",
              "de": "Wie ist Ihre Nummer, bitte?",
              "id": "Berapa nomor Anda?"
            },
            {
              "pembicara": "Philipp Klein",
              "de": "Null eins fünf neun, acht zwei drei vier sechs null sieben.",
              "id": "0159 / 8234607"
            },
            {
              "pembicara": "Resepsionis",
              "de": "Also: null eins fünf neun, acht zwei drei vier sechs null sieben.",
              "id": "Jadi: 0159 / 8234607."
            },
            {
              "pembicara": "Philipp Klein",
              "de": "Ja. Vielen Dank.",
              "id": "Ya. Terima kasih banyak."
            }
          ]
        },
        {
          "track": "1.10",
          "judul": "Telefonnummern – Percakapan 2",
          "halaman": 13,
          "aufgabe": "6b",
          "baris": [
            {
              "pembicara": "Resepsionis",
              "de": "Guten Tag, Hotel Zentral.",
              "id": "Selamat siang, Hotel Zentral."
            },
            {
              "pembicara": "Petra Groß",
              "de": "Guten Tag, Petra Groß. Ich möchte Frau Müller sprechen.",
              "id": "Selamat siang, (saya) Petra Groß. Saya ingin bicara dengan Bu Müller."
            },
            {
              "pembicara": "Resepsionis",
              "de": "Frau Müller ist nicht da. Kann sie zurückrufen?",
              "id": "Bu Müller tidak ada. Boleh beliau menelepon balik?"
            },
            {
              "pembicara": "Petra Groß",
              "de": "Ja, bitte.",
              "id": "Ya, silakan."
            },
            {
              "pembicara": "Resepsionis",
              "de": "Wie ist Ihre Telefonnummer, bitte?",
              "id": "Berapa nomor telepon Anda?"
            },
            {
              "pembicara": "Petra Groß",
              "de": "Null eins fünf sieben, acht drei eins sechs neun zwei vier.",
              "id": "0157 / 8316924"
            },
            {
              "pembicara": "Resepsionis",
              "de": "Null eins fünf sieben, acht drei eins sechs neun zwei vier.",
              "id": "0157 / 8316924."
            },
            {
              "pembicara": "Petra Groß",
              "de": "Ja, das ist richtig. Vielen Dank.",
              "id": "Ya, betul. Terima kasih banyak."
            }
          ]
        },
        {
          "track": "1.12",
          "judul": "E-Mail-Adressen",
          "halaman": 13,
          "aufgabe": "7b",
          "baris": [
            {
              "pembicara": "Maria",
              "de": "Wie ist deine E-Mail-Adresse?",
              "id": "Apa alamat e-mailmu?"
            },
            {
              "pembicara": "Ruben",
              "de": "Ruben minus Gonzalez ät esweb Punkt net.",
              "id": "ruben-gonzalez@esweb.net"
            },
            {
              "pembicara": "Maria",
              "de": "Wie bitte? Noch einmal, bitte.",
              "id": "Maaf? Sekali lagi, tolong."
            },
            {
              "pembicara": "Ruben",
              "de": "Ruben, minus, Gonzalez: G, O, N, Z, A, L, E, Z, ät, E, S, W, E, B, Punkt, net.",
              "id": "Ruben – strip – Gonzalez: G-O-N-Z-A-L-E-Z – at – E-S-W-E-B – titik – net."
            },
            {
              "pembicara": "Maria",
              "de": "Ist das richtig so? Ruben minus Gonzalez mit Z ät esweb Punkt net?",
              "id": "Apakah begini benar? ruben-gonzalez pakai Z, at esweb.net?"
            },
            {
              "pembicara": "Ruben",
              "de": "Ja, das stimmt. Und wie ist deine E-Mail-Adresse?",
              "id": "Ya, betul. Dan apa alamat e-mailmu?"
            },
            {
              "pembicara": "Maria",
              "de": "Maria Unterstrich achtzehn elf ät inet Punkt com.",
              "id": "maria_1811@inet.com"
            },
            {
              "pembicara": "Ruben",
              "de": "Bitte noch einmal. Kannst du das buchstabieren?",
              "id": "Tolong sekali lagi. Bisa kamu eja?"
            },
            {
              "pembicara": "Maria",
              "de": "M, A, R, I, A, Unterstrich, achtzehn elf, ät, I, N, E, T, Punkt, com.",
              "id": "M-A-R-I-A – garis bawah – 18 11 – at – I-N-E-T – titik – com."
            },
            {
              "pembicara": "Ruben",
              "de": "Danke!",
              "id": "Terima kasih!"
            }
          ]
        }
      ],
      "grammatik": [
        {
          "judul": "Kata kerja dan kata ganti orang: akhiran *-e, -st, -t, -en*",
          "halaman": "11, 12, 17",
          "ringkasan": "Bentuk dasar kata kerja (infinitif) berakhiran *-en*: *wohnen, kommen, heißen*. Caranya: buang -en, sisanya akar kata (*wohn-*), lalu tempel akhiran sesuai pelakunya. Pola untuk Kapitel 1: ich -e · du -st · er/sie -t · Sie -en.",
          "tabel": {
            "kolom": [
              "Kata ganti",
              "heißen",
              "kommen",
              "wohnen"
            ],
            "bahasa": [
              "de",
              "de",
              "de",
              "de"
            ],
            "baris": [
              [
                "ich",
                "heiße",
                "komme",
                "wohne"
              ],
              [
                "du",
                "heißt",
                "kommst",
                "wohnst"
              ],
              [
                "er / sie",
                "heißt",
                "kommt",
                "wohnt"
              ],
              [
                "Sie",
                "heißen",
                "kommen",
                "wohnen"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Ich wohne in Frankfurt.",
              "id": "Saya tinggal di Frankfurt."
            },
            {
              "de": "Wo wohnst du?",
              "id": "Kamu tinggal di mana?"
            },
            {
              "de": "Er kommt aus Brasilien.",
              "id": "Dia (laki-laki) berasal dari Brasil."
            },
            {
              "de": "Woher kommen Sie?",
              "id": "Anda berasal dari mana?"
            },
            {
              "de": "Ich spreche Deutsch. – Du sprichst Englisch. – Sie spricht Japanisch.",
              "id": "Saya berbicara bahasa Jerman. – Kamu bahasa Inggris. – Dia (pr.) bahasa Jepang. (sprechen sedikit berubah: e → i)"
            }
          ],
          "perbandingan_indonesia": "Dalam bahasa Indonesia kata kerjanya tidak berubah: saya tinggal, kamu tinggal, dia tinggal. Dalam bahasa Jerman ujungnya berubah: *ich wohne, du wohnst, er wohnt*. Bahasa Indonesia juga hanya punya satu kata „dia“. Bahasa Jerman membedakan *er* (dia laki-laki) dan *sie* (dia perempuan).",
          "kesalahan_umum": [
            {
              "salah": "du heißst",
              "benar": "du heißt"
            },
            {
              "salah": "ich wohnen in Jakarta",
              "benar": "ich wohne in Jakarta"
            },
            {
              "salah": "er wohnst",
              "benar": "er wohnt"
            },
            "*heißen*: akarnya sudah berakhir dengan ß, jadi untuk du cukup tambah -t. Hasilnya sama dengan *er heißt*."
          ],
          "latihan": [
            {
              "soal": "Ich ___ Dewi. (heißen)",
              "jawaban": "heiße"
            },
            {
              "soal": "Wo ___ du? (wohnen)",
              "jawaban": "wohnst"
            },
            {
              "soal": "Wie ___ du? (heißen)",
              "jawaban": "heißt"
            },
            {
              "soal": "Sie ___ aus Deutschland. (kommen, dia perempuan)",
              "jawaban": "kommt"
            },
            {
              "soal": "Woher ___ Sie, Herr Hansen? (kommen)",
              "jawaban": "kommen"
            },
            {
              "soal": "Ich ___ Deutsch. (lernen)",
              "jawaban": "lerne"
            }
          ],
          "animasi": "akhiran"
        },
        {
          "judul": "Kata kerja *sein* (adalah)",
          "halaman": "11, 17",
          "ringkasan": "*sein* tidak mengikuti pola -e, -st, -t, -en. Bentuknya harus dihafal: *ich bin, du bist, er/sie ist, Sie sind*.",
          "tabel": {
            "kolom": [
              "Kata ganti",
              "sein",
              "Contoh",
              "Artinya"
            ],
            "bahasa": [
              "de",
              "de",
              "de",
              "id"
            ],
            "baris": [
              [
                "ich",
                "bin",
                "Ich bin Julia.",
                "Aku Julia."
              ],
              [
                "du",
                "bist",
                "Wer bist du?",
                "Kamu siapa?"
              ],
              [
                "er / sie",
                "ist",
                "Das ist Jan.",
                "Ini Jan."
              ],
              [
                "Sie",
                "sind",
                "Sind Sie Frau Weber?",
                "Apakah Anda Bu Weber?"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Ich bin Julia.",
              "id": "Aku Julia. (santai)"
            },
            {
              "de": "Ich heiße Niklas.",
              "id": "Namaku Niklas. (netral)"
            },
            {
              "de": "Mein Name ist Nina Weber.",
              "id": "Nama saya Nina Weber. (resmi)"
            },
            {
              "de": "Ah, du bist neu hier.",
              "id": "Oh, kamu baru di sini."
            }
          ],
          "perbandingan_indonesia": "Bahasa Indonesia boleh tanpa kata kerja: „Saya Julia.“ „Ini Jan.“ Bahasa Jerman tidak boleh. Harus ada *bin, bist, ist* atau *sind*.",
          "kesalahan_umum": [
            {
              "salah": "Ich Julia.",
              "benar": "Ich bin Julia."
            },
            {
              "salah": "Das Jan.",
              "benar": "Das ist Jan."
            }
          ],
          "latihan": [
            {
              "soal": "Ich ___ Budi.",
              "jawaban": "bin"
            },
            {
              "soal": "Wer ___ du?",
              "jawaban": "bist"
            },
            {
              "soal": "Das ___ Frau Kowalski.",
              "jawaban": "ist"
            },
            {
              "soal": "Wer ___ Sie?",
              "jawaban": "sind"
            }
          ],
          "animasi": "sein"
        },
        {
          "judul": "*du* atau *Sie*?",
          "halaman": 11,
          "ringkasan": "*du* (kamu) untuk teman, keluarga, anak-anak, dan sesama murid, dengan nama depan. *Sie* (Anda) untuk orang dewasa yang belum akrab, di kantor, toko, atau hotel, dengan *Herr/Frau* + nama belakang. *Sie* selalu ditulis dengan huruf besar.",
          "tabel": {
            "kolom": [
              "",
              "informal: du",
              "formal: Sie"
            ],
            "bahasa": [
              "id",
              "de",
              "de"
            ],
            "baris": [
              [
                "Nama",
                "Wie heißt du?",
                "Wie heißen Sie? / Wie ist Ihr Name?"
              ],
              [
                "Kabar",
                "Wie geht's dir?",
                "Wie geht es Ihnen?"
              ],
              [
                "Balik bertanya",
                "Und dir?",
                "Und Ihnen?"
              ],
              [
                "Menyapa",
                "Hallo Nina!",
                "Guten Tag, Frau Weber!"
              ],
              [
                "Berpamitan",
                "Tschüs! / Ciao!",
                "Auf Wiedersehen!"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Hallo Nina! Wie geht's?",
              "id": "Halo Nina! Apa kabar?"
            },
            {
              "de": "Guten Tag, Frau Weber. Wie geht es Ihnen?",
              "id": "Selamat siang, Bu Weber. Apa kabar Anda?"
            }
          ],
          "perbandingan_indonesia": "Sama seperti „kamu“ dan „Anda“, atau „Budi“ dan „Pak Santoso“. Bedanya: di Jerman yang dipakai *Herr/Frau* + nama belakang, bukan nama depan. Kalau ragu, pakai *Sie*. Biasanya orang Jerman sendiri yang menawarkan: *Wir können du sagen.*",
          "kesalahan_umum": [
            {
              "salah": "Frau Nina",
              "benar": "Frau Weber"
            },
            {
              "salah": "Wie heißt Sie?",
              "benar": "Wie heißen Sie?"
            },
            "*Gute Nacht* hanya untuk pamit sebelum tidur. Saat bertemu malam hari pakai *Guten Abend*."
          ],
          "latihan": [
            {
              "soal": "(ke teman) Wie ___ du?",
              "jawaban": "heißt"
            },
            {
              "soal": "(ke Bu Weber) Wie geht es ___?",
              "jawaban": "Ihnen"
            },
            {
              "soal": "(ke teman) Danke, gut. Und ___?",
              "jawaban": "dir"
            },
            {
              "soal": "(formal) ___ Wiedersehen!",
              "jawaban": "Auf"
            }
          ],
          "animasi": "dusie"
        },
        {
          "judul": "Kalimat tanya W dan kalimat pernyataan: kata kerja di posisi 2",
          "halaman": "12, 17",
          "ringkasan": "Aturan emas: kata kerja selalu di posisi 2. Di kalimat tanya W (*W-Frage*), posisi 1 diisi kata tanya. Di kalimat pernyataan (*Aussagesatz*), posisi 1 biasanya diisi pelaku (subjek). Kata tanya dari dua kata, misalnya *Welche Sprachen*, tetap dihitung satu posisi.",
          "tabel": {
            "kolom": [
              "Posisi 1",
              "Posisi 2 (Verb)",
              "Sisanya"
            ],
            "bahasa": [
              "de",
              "de",
              "de"
            ],
            "baris": [
              [
                "Wer",
                "bist",
                "du?"
              ],
              [
                "Wie",
                "heißt",
                "du?"
              ],
              [
                "Woher",
                "kommt",
                "Frau Tanaka?"
              ],
              [
                "Wo",
                "wohnen",
                "Sie?"
              ],
              [
                "Welche Sprachen",
                "sprechen",
                "Sie?"
              ],
              [
                "Ich",
                "bin",
                "Julia."
              ],
              [
                "Sie",
                "kommt",
                "aus Japan."
              ],
              [
                "Ich",
                "wohne",
                "in Zürich."
              ]
            ]
          },
          "contoh": [
            {
              "de": "Woher kommst du? – Ich komme aus Indonesien.",
              "id": "Kamu berasal dari mana? – Saya berasal dari Indonesia."
            },
            {
              "de": "Wo wohnst du? – Ich wohne in Jakarta.",
              "id": "Kamu tinggal di mana? – Saya tinggal di Jakarta."
            },
            {
              "de": "Welche Sprachen sprichst du? – Ich spreche Indonesisch und Englisch.",
              "id": "Kamu bisa bahasa apa? – Saya bisa bahasa Indonesia dan Inggris."
            }
          ],
          "perbandingan_indonesia": "Bahasa Indonesia bebas: „Kamu dari mana?“ atau „Dari mana kamu?“. Bahasa Jerman tidak bebas. Kata kerja harus di posisi 2, dan pelakunya pindah ke belakang kata kerja: *Woher kommst du?* Hati-hati juga: nama ditanya dengan *wie* (bagaimana), bukan *was* (apa).",
          "kesalahan_umum": [
            {
              "salah": "Woher du kommst?",
              "benar": "Woher kommst du?"
            },
            {
              "salah": "Was ist dein Name?",
              "benar": "Wie heißt du? / Wie ist dein Name?"
            },
            "*Wo* (di mana) ≠ *Woher* (dari mana) ≠ *Wer* (siapa)."
          ],
          "latihan": [
            {
              "soal": "___ kommst du? – Aus Bandung.",
              "jawaban": "Woher"
            },
            {
              "soal": "___ wohnen Sie? – In Surabaya.",
              "jawaban": "Wo"
            },
            {
              "soal": "___ ist das? – Das ist Budi.",
              "jawaban": "Wer"
            },
            {
              "soal": "___ heißt du? – Ich heiße Rina.",
              "jawaban": "Wie"
            },
            {
              "soal": "Susun: kommst / woher / du → ___?",
              "jawaban": [
                "Woher kommst du",
                "Woher kommst du?"
              ]
            }
          ],
          "animasi": "posisi2"
        },
        {
          "judul": "Kata ganti orang dalam teks: *er* dan *sie*",
          "halaman": "12, 17",
          "ringkasan": "Supaya nama tidak diulang-ulang, nama laki-laki diganti *er* dan nama perempuan diganti *sie*. Kata kerjanya memakai akhiran *-t*.",
          "tabel": null,
          "contoh": [
            {
              "de": "Das ist Frau Lang. Sie kommt aus Deutschland. Sie wohnt in Frankfurt.",
              "id": "Ini Bu Lang. Ia berasal dari Jerman. Ia tinggal di Frankfurt."
            },
            {
              "de": "Das ist Jan. Er kommt aus Frankfurt. Er wohnt in Zürich.",
              "id": "Ini Jan. Ia berasal dari Frankfurt. Ia tinggal di Zürich."
            },
            {
              "de": "Das ist Budi. Er kommt aus Indonesien. Er wohnt in Jakarta.",
              "id": "Ini Budi. Ia berasal dari Indonesia. Ia tinggal di Jakarta."
            }
          ],
          "perbandingan_indonesia": "Bahasa Indonesia memakai „dia/ia“ untuk laki-laki dan perempuan. Bahasa Jerman harus memilih: *er* atau *sie*. Di awal kalimat *sie* (dia perempuan) juga ditulis *Sie*. Bedakan dari *Sie* (Anda) lewat akhiran kata kerjanya: *Sie wohnt* (dia) – *Sie wohnen* (Anda).",
          "kesalahan_umum": [
            {
              "salah": "Das ist Jan. Sie kommt aus Frankfurt.",
              "benar": "Das ist Jan. Er kommt aus Frankfurt."
            }
          ],
          "latihan": [
            {
              "soal": "Das ist Frau Lang. ___ kommt aus Deutschland.",
              "jawaban": "Sie"
            },
            {
              "soal": "Das ist Jan. ___ wohnt in Zürich.",
              "jawaban": "Er"
            },
            {
              "soal": "Jan ___ aus Frankfurt. (kommen)",
              "jawaban": "kommt"
            }
          ],
          "animasi": "ersie"
        },
        {
          "judul": "*aus* + negara",
          "halaman": 15,
          "ringkasan": "*aus* = dari (asal), *in* = di (tempat tinggal). Kebanyakan negara tanpa artikel: *aus Spanien, aus Indonesien*. Beberapa negara memakai artikel: *aus der Schweiz, aus der Türkei, aus der Ukraine, aus den USA*.",
          "tabel": {
            "kolom": [
              "Negara",
              "Dari …",
              "Bahasa"
            ],
            "bahasa": [
              "de",
              "de",
              "de"
            ],
            "baris": [
              [
                "Indonesien",
                "aus Indonesien",
                "Indonesisch"
              ],
              [
                "Deutschland",
                "aus Deutschland",
                "Deutsch"
              ],
              [
                "Österreich",
                "aus Österreich",
                "Deutsch"
              ],
              [
                "die Schweiz",
                "aus der Schweiz",
                "Deutsch, Französisch, Italienisch, Rätoromanisch"
              ],
              [
                "die Türkei",
                "aus der Türkei",
                "Türkisch"
              ],
              [
                "die USA",
                "aus den USA",
                "Englisch"
              ],
              [
                "Japan",
                "aus Japan",
                "Japanisch"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Ich komme aus Indonesien, aus Medan. Ich wohne in Jakarta.",
              "id": "Saya berasal dari Indonesia, dari Medan. Saya tinggal di Jakarta."
            },
            {
              "de": "Alessia Conti kommt aus der Schweiz und wohnt in Lugano.",
              "id": "Alessia Conti berasal dari Swiss dan tinggal di Lugano."
            }
          ],
          "perbandingan_indonesia": "Nama bahasa di bahasa Jerman sering berakhiran *-isch*: *Indonesisch, Japanisch, Spanisch*. Negaranya berbeda: *Indonesien, Japan, Spanien*.",
          "kesalahan_umum": [
            {
              "salah": "aus Schweiz",
              "benar": "aus der Schweiz"
            },
            {
              "salah": "Ich spreche Indonesien.",
              "benar": "Ich spreche Indonesisch."
            }
          ],
          "latihan": [
            {
              "soal": "Ich komme ___ Indonesien.",
              "jawaban": "aus"
            },
            {
              "soal": "Ich wohne ___ Jakarta.",
              "jawaban": "in"
            },
            {
              "soal": "Sie kommt aus ___ Schweiz.",
              "jawaban": "der"
            },
            {
              "soal": "Ich spreche ___ . (bahasa Indonesia)",
              "jawaban": "Indonesisch"
            }
          ],
          "animasi": "aus"
        },
        {
          "judul": "Angka 0–20, nomor telepon, dan mengeja",
          "halaman": 13,
          "ringkasan": "Angka 13–19 dibentuk seperti „belas“: *drei + zehn = dreizehn*. Nomor telepon dibaca satu per satu: *null – eins – fünf – neun*. Untuk e-mail: @ = *ät*, . = *Punkt*, - = *minus*, _ = *Unterstrich*.",
          "tabel": {
            "kolom": [
              "Angka",
              "Jerman",
              "Kira-kira dibaca"
            ],
            "bahasa": [
              "id",
              "de",
              "id"
            ],
            "baris": [
              [
                "0",
                "null",
                "nul"
              ],
              [
                "1",
                "eins",
                "ains"
              ],
              [
                "2",
                "zwei",
                "tsvai"
              ],
              [
                "3",
                "drei",
                "drai"
              ],
              [
                "6",
                "sechs",
                "zeks"
              ],
              [
                "7",
                "sieben",
                "zii-ben"
              ],
              [
                "12",
                "zwölf",
                "tsvölf"
              ],
              [
                "16",
                "sechzehn",
                "zèhy-tseen"
              ],
              [
                "17",
                "siebzehn",
                "ziip-tseen"
              ],
              [
                "20",
                "zwanzig",
                "tsvan-tsihy"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Wie ist deine Handynummer? – Null acht eins zwei …",
              "id": "Berapa nomor HP-mu? – Nol delapan satu dua …"
            },
            {
              "de": "Wie bitte? Kannst du das buchstabieren?",
              "id": "Maaf? Bisa kamu eja?"
            }
          ],
          "perbandingan_indonesia": "Nama beberapa huruf berbeda dari alfabet Indonesia: J = *jot*, V = *fau*, W = *we* (dibaca „ve“), Z = *tset*, Y = *üpsilon*, C = *tse*. Huruf khusus: ä, ö, ü dan ß (*estset*).",
          "kesalahan_umum": [
            {
              "salah": "sechszehn",
              "benar": "sechzehn"
            },
            {
              "salah": "siebenzehn",
              "benar": "siebzehn"
            },
            "Akhiran *-ig* (zwanzig) dibaca „ihy“, bukan „ig“.",
            "Di telepon orang sering bilang *zwo* untuk 2, supaya tidak tertukar dengan drei."
          ],
          "latihan": [
            {
              "soal": "13 = ___",
              "jawaban": "dreizehn"
            },
            {
              "soal": "16 = ___",
              "jawaban": "sechzehn"
            },
            {
              "soal": "17 = ___",
              "jawaban": "siebzehn"
            },
            {
              "soal": "20 = ___",
              "jawaban": "zwanzig"
            },
            {
              "soal": "@ dibaca ___",
              "jawaban": [
                "ät",
                "at"
              ]
            }
          ],
          "animasi": "angka"
        },
        {
          "judul": "Tambahan dari modul: wir, ihr, sie (mereka) dan *haben*",
          "halaman": null,
          "ringkasan": "Dari modul Hello Class World (sudah diperiksa). Di Netzwerk neu bentuk jamak dan *haben* dilatih di Kapitel 2, jadi di sini cukup sebagai gambaran utuh. *wir*, *sie* (mereka) dan *Sie* (Anda) selalu sama dengan bentuk dasarnya (-en). *ihr* berakhiran -t, sama seperti er/sie. *haben* hampir beraturan, hanya *du hast* dan *er hat*.",
          "tabel": {
            "kolom": [
              "Kata ganti",
              "sein",
              "wohnen",
              "haben"
            ],
            "bahasa": [
              "de",
              "de",
              "de",
              "de"
            ],
            "baris": [
              [
                "ich",
                "bin",
                "wohne",
                "habe"
              ],
              [
                "du",
                "bist",
                "wohnst",
                "hast"
              ],
              [
                "er / sie / es",
                "ist",
                "wohnt",
                "hat"
              ],
              [
                "wir",
                "sind",
                "wohnen",
                "haben"
              ],
              [
                "ihr",
                "seid",
                "wohnt",
                "habt"
              ],
              [
                "sie (mereka)",
                "sind",
                "wohnen",
                "haben"
              ],
              [
                "Sie (Anda)",
                "sind",
                "wohnen",
                "haben"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Wir wohnen in Jakarta.",
              "id": "Kami tinggal di Jakarta."
            },
            {
              "de": "Ihr kommt aus Bali.",
              "id": "Kalian berasal dari Bali."
            },
            {
              "de": "Hast du Zeit?",
              "id": "Kamu punya waktu?"
            },
            {
              "de": "Ich bin 25 Jahre alt.",
              "id": "Umur saya 25 tahun."
            }
          ],
          "perbandingan_indonesia": "*es* = dia/itu untuk kata benda berartikel *das*, misalnya *das Kind* (anak) → *es*. Umur memakai *sein*, bukan *haben*: *Ich bin 25 Jahre alt.*",
          "kesalahan_umum": [
            {
              "salah": "Ich habe 25 Jahre.",
              "benar": "Ich bin 25 Jahre alt."
            },
            {
              "salah": "ihr seit",
              "benar": "ihr seid"
            }
          ],
          "latihan": [
            {
              "soal": "Wir ___ in Jakarta. (wohnen)",
              "jawaban": "wohnen"
            },
            {
              "soal": "Ihr ___ aus Bali. (kommen)",
              "jawaban": "kommt"
            },
            {
              "soal": "Ich ___ 24 Jahre alt.",
              "jawaban": "bin"
            },
            {
              "soal": "Du ___ eine Frage. (haben)",
              "jawaban": "hast"
            }
          ],
          "animasi": "akhiran-jamak"
        },
        {
          "judul": "Tambahan dari modul: memperkenalkan diri lengkap dan kata tanya lain",
          "halaman": null,
          "ringkasan": "Dari modul Hello Class World (sudah diperiksa). Delapan pertanyaan yang paling sering muncul saat berkenalan: nama, umur, asal, tempat tinggal, hobi, bahasa, nomor HP, e-mail. Bentuk *Ihre/deine/meine* dengan -e dipakai untuk kata benda berartikel *die* (*die Nummer → meine Nummer*).",
          "tabel": {
            "kolom": [
              "Tema",
              "Sie (formal)",
              "du (informal)"
            ],
            "bahasa": [
              "id",
              "de",
              "de"
            ],
            "baris": [
              [
                "nama",
                "Wie heißen Sie?",
                "Wie heißt du?"
              ],
              [
                "umur",
                "Wie alt sind Sie?",
                "Wie alt bist du?"
              ],
              [
                "asal",
                "Woher kommen Sie?",
                "Woher kommst du?"
              ],
              [
                "tempat tinggal",
                "Wo wohnen Sie?",
                "Wo wohnst du?"
              ],
              [
                "hobi",
                "Was ist Ihr Hobby?",
                "Was ist dein Hobby?"
              ],
              [
                "bahasa",
                "Welche Sprachen sprechen Sie?",
                "Welche Sprachen sprichst du?"
              ],
              [
                "nomor HP",
                "Wie ist Ihre Handynummer?",
                "Wie ist deine Handynummer?"
              ],
              [
                "e-mail",
                "Wie ist Ihre E-Mail-Adresse?",
                "Wie ist deine E-Mail-Adresse?"
              ]
            ]
          },
          "contoh": [
            {
              "de": "Hallo! Ich heiße Dewi und ich bin 24 Jahre alt.",
              "id": "Halo! Nama saya Dewi dan umur saya 24 tahun."
            },
            {
              "de": "Ich komme aus Indonesien, aus Medan. Ich wohne in Jakarta.",
              "id": "Saya berasal dari Indonesia, dari Medan. Saya tinggal di Jakarta."
            },
            {
              "de": "Mein Hobby ist Kochen. Meine Hobbys sind Lesen und Joggen.",
              "id": "Hobi saya memasak. Hobi saya membaca dan jogging."
            },
            {
              "de": "Wann hast du Zeit? – Warum lernst du Deutsch? – Wohin gehst du?",
              "id": "Kapan kamu punya waktu? – Kenapa kamu belajar bahasa Jerman? – Kamu pergi ke mana?"
            }
          ],
          "perbandingan_indonesia": "Hobi sebagai kata benda ditulis dengan huruf besar: *Lesen, Kochen, Schwimmen*. Jamaknya *die Hobbys* (bukan „Hobbies“). Tiga kata tempat: *Wo?* (di mana) – *Woher?* (dari mana) – *Wohin?* (ke mana).",
          "kesalahan_umum": [
            {
              "salah": "Meine Hobbies sind …",
              "benar": "Meine Hobbys sind …"
            },
            {
              "salah": "Wie alt hast du?",
              "benar": "Wie alt bist du?"
            }
          ],
          "latihan": [
            {
              "soal": "Wie ___ bist du?",
              "jawaban": "alt"
            },
            {
              "soal": "Was ist ___ Hobby? (du)",
              "jawaban": "dein"
            },
            {
              "soal": "Wie ist ___ Handynummer? (Sie)",
              "jawaban": "Ihre"
            },
            {
              "soal": "___ gehst du? – Nach Hause. (ke mana)",
              "jawaban": "Wohin"
            }
          ]
        }
      ],
      "tips_guru": [
        "Urutan mengajar: salam dan du/Sie lewat dialog dulu (hlm. 10–11), lalu *ich/du/Sie + heißen, sein*, lalu *er/sie + wohnen, kommen*, terakhir W-Frage dan posisi 2.",
        "Ajarkan kalimat kelas sejak pertemuan pertama: *Wie bitte? – Das verstehe ich nicht. – Wie schreibt man das?* Murid cepat terbiasa setelah 2–3 pertemuan.",
        "Aktivitas online du/Sie: tampilkan satu situasi di layar (teman, bos baru, resepsionis hotel). Semua murid mengetik di chat: du atau Sie?",
        "Akhiran kata kerja: panggil nama murid + soal, misalnya „Rina – du – wohnen!“. Rina menjawab *du wohnst* lalu memanggil teman lain.",
        "Posisi 2: tulis kata acak di chat (*kommst / woher / du*). Murid mengetik kalimat yang benar. Guru langsung melihat siapa yang sudah paham.",
        "Wawancara 5a di breakout room berdua (Name? Woher? Wo?), lalu di ruang utama setiap murid memperkenalkan pasangannya dengan *er/sie*.",
        "Angka: bingo 0–20. Murid memilih 5 angka, guru menyebut angka acak, yang lengkap menulis „Bingo!“ di chat.",
        "Mengeja: murid mengeja nama depannya, teman-teman mengetik nama itu di chat. Cocok?",
        "Kesalahan yang paling sering: „Ich Julia“ tanpa *bin*, „Was ist dein Name?“, *du heißst*, dan *Gute Nacht* dipakai untuk menyapa.",
        "Materi tambahan modul (wir/ihr/sie, haben, umur, hobi) sudah diperiksa dan dikoreksi. Cukup sebagai gambaran di Kapitel 1. Latihan intensifnya di Kapitel 2."
      ]
    },
    {
      "id": "k2", "nomor": 2, "judul_de": "Freunde, Kollegen und ich", "judul_id": "Teman, rekan kerja, dan aku",
      "halaman_buku": "18–27", "perjalanan": 1, "stiker": "flag",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k3", "nomor": 3, "judul_de": "In Hamburg", "judul_id": "Di Hamburg",
      "halaman_buku": "28–37", "perjalanan": 1, "stiker": "compass",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k4", "nomor": 4, "judul_de": "Guten Appetit!", "judul_id": "Selamat makan!",
      "halaman_buku": "44–53", "perjalanan": 2, "stiker": "pretzel",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k5", "nomor": 5, "judul_de": "Alltag und Familie", "judul_id": "Keseharian dan keluarga",
      "halaman_buku": "54–63", "perjalanan": 2, "stiker": "heart",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k6", "nomor": 6, "judul_de": "Zeit mit Freunden", "judul_id": "Waktu bersama teman",
      "halaman_buku": "64–73", "perjalanan": 2, "stiker": "clock",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k7", "nomor": 7, "judul_de": "Arbeitsalltag", "judul_id": "Keseharian di tempat kerja",
      "halaman_buku": "80–89", "perjalanan": 3, "stiker": "coffee",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k8", "nomor": 8, "judul_de": "Fit und gesund", "judul_id": "Bugar dan sehat",
      "halaman_buku": "90–99", "perjalanan": 3, "stiker": "apple",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k9", "nomor": 9, "judul_de": "Meine Wohnung", "judul_id": "Tempat tinggalku",
      "halaman_buku": "100–109", "perjalanan": 3, "stiker": "house",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k10", "nomor": 10, "judul_de": "Studium und Beruf", "judul_id": "Kuliah dan pekerjaan",
      "halaman_buku": "116–125", "perjalanan": 4, "stiker": "paperclip",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k11", "nomor": 11, "judul_de": "Die Jacke gefällt mir!", "judul_id": "Aku suka jaket ini!",
      "halaman_buku": "126–135", "perjalanan": 4, "stiker": "bag",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    },
    {
      "id": "k12", "nomor": 12, "judul_de": "Ab in den Urlaub!", "judul_id": "Ayo berlibur!",
      "halaman_buku": "136–145", "perjalanan": 4, "stiker": "train",
      "lernziele": [],
      "ringkasan": { "wortschatz": "", "grammatik": "", "aussprache": "", "strategie": "", "landeskunde": "", "netzwerk_wg": "" },
      "kosakata": [], "dialog": [], "grammatik": [], "tips_guru": []
    }
  ],

  "plattform": [
    { "id": "p1", "nomor": 1, "judul": "Plattform 1", "halaman_buku": "38–43", "perjalanan": 1, "kapitel": [1, 2, 3], "stiker": "stamp", "landeskunde": "" },
    { "id": "p2", "nomor": 2, "judul": "Plattform 2", "halaman_buku": "74–79", "perjalanan": 2, "kapitel": [4, 5, 6], "stiker": "stamp", "landeskunde": "" },
    { "id": "p3", "nomor": 3, "judul": "Plattform 3", "halaman_buku": "110–115", "perjalanan": 3, "kapitel": [7, 8, 9], "stiker": "stamp", "landeskunde": "" },
    { "id": "p4", "nomor": 4, "judul": "Plattform 4", "halaman_buku": "146", "perjalanan": 4, "kapitel": [10, 11, 12], "stiker": "stamp", "landeskunde": "" }
  ]
};
