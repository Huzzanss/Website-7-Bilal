/* =========================================================
   DEPRECATED — file ini TIDAK DIPAKAI LAGI oleh halaman manapun.

   Dulu file ini dipakai Firebase Client SDK buat akses database
   langsung dari browser. Sejak migrasi ke backend Express (lihat
   folder /server), SEMUA akses Firebase lewat Admin SDK di server —
   browser tidak pernah lagi memegang kredensial Firebase apa pun.

   File ini sengaja dibiarkan TIDAK melakukan apa-apa (tidak lagi
   memanggil firebase.initializeApp()) supaya kalau suatu saat ada
   halaman lama yang tidak sengaja include file ini lagi, tidak
   terjadi error ataupun koneksi langsung ke Firebase dari browser.

   Aman dihapus manual kapan saja.
   ========================================================= */
