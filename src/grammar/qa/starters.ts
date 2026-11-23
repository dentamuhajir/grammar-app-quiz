import { DIALOGUE_SCENARIOS } from "./dialogue";

export const SCENARIO_GROUPS = ["Keseharian", "Dunia kerja", "Perjalanan", "Studi & komunitas", "Layanan & transaksi", "Pendapat & diskusi"] as const;
export interface RoleplayStarter {
  id: string;
  title: string;
  group: typeof SCENARIO_GROUPS[number];
  speaker: string;
  role: string;
  context: string;
  goal: string;
  question: string;
  translation: string;
}

export const ROLEPLAY_STARTERS: readonly RoleplayStarter[] = [
  ...DIALOGUE_SCENARIOS.map((guided): RoleplayStarter => {
    const opening = guided.nodes[guided.initialNodeId];
    return {
      id: guided.id, title: guided.title.split(" (")[0], group: "Dunia kerja",
      speaker: opening.speaker, role: opening.speakerRole, context: guided.contextDescription,
      goal: opening.grammarLabel, question: opening.question, translation: opening.translation,
    };
  }),
  {
    id: "coffee", title: "Pesan kopi sebelum berangkat", group: "Keseharian",
    speaker: "Maya", role: "Barista",
    context: "Anda mampir ke kedai sebelum naik kereta. Pesan minuman yang bisa dibawa.",
    goal: "Pesanan sopan dengan I'd like atau could I",
    question: "Good morning! What can I get started for you?",
    translation: "Selamat pagi! Anda mau pesan apa?",
  },
  {
    id: "market", title: "Belanja di pasar pagi", group: "Layanan & transaksi",
    speaker: "Ben", role: "Fruit seller",
    context: "Anda menyiapkan salad buah untuk empat orang. Tanyakan harga dan pilih buah yang cukup matang.",
    goal: "Jumlah dan harga dengan how much atau how many",
    question: "These mangoes are ripe today. How many people are you shopping for?",
    translation: "Mangga ini sudah matang. Anda berbelanja untuk berapa orang?",
  },
  {
    id: "return-shoes", title: "Tukar ukuran sepatu", group: "Layanan & transaksi",
    speaker: "Nina", role: "Shop assistant",
    context: "Sepatu yang dibeli kemarin terasa sempit. Bawa struk dan bicarakan pilihan penukaran.",
    goal: "Past simple dan perbandingan ukuran",
    question: "Hi! What was the problem with the shoes you bought?",
    translation: "Halo! Apa masalah dengan sepatu yang Anda beli?",
  },
  {
    id: "flatmate", title: "Berbagi tugas di kos", group: "Keseharian",
    speaker: "Leo", role: "Flatmate",
    context: "Teman kos Anda ingin membagi tugas rumah agar dapur bersama tetap rapi.",
    goal: "Frekuensi dengan usually dan once a week",
    question: "Which kitchen chore would you like to take care of?",
    translation: "Tugas dapur mana yang ingin Anda kerjakan?",
  },
  {
    id: "birthday", title: "Merancang pesta kejutan", group: "Keseharian",
    speaker: "Aisha", role: "Friend",
    context: "Anda dan seorang teman merencanakan pesta kecil. Pilih tempat yang disukai orang yang berulang tahun.",
    goal: "Saran dengan let's dan we could",
    question: "Where should we hold the surprise party?",
    translation: "Di mana sebaiknya kita mengadakan pesta kejutan?",
  },
  {
    id: "parcel", title: "Paket salah alamat", group: "Layanan & transaksi",
    speaker: "Tom", role: "Delivery agent",
    context: "Paket Anda ditandai sudah diterima, tetapi barangnya belum sampai. Ceritakan petunjuk yang Anda punya.",
    goal: "Past simple untuk urutan kejadian",
    question: "What did you notice in the delivery photo?",
    translation: "Apa yang Anda lihat di foto pengiriman?",
  },
  {
    id: "hotel", title: "Check-in di hotel", group: "Perjalanan",
    speaker: "Inez", role: "Hotel receptionist",
    context: "Anda datang lebih awal setelah perjalanan panjang. Bicarakan reservasi dan kebutuhan selama menunggu kamar.",
    goal: "Permintaan sopan dengan could dan would",
    question: "Welcome! What would you like to arrange before your room is ready?",
    translation: "Selamat datang! Apa yang ingin Anda atur sambil menunggu kamar siap?",
  },
  {
    id: "platform", title: "Mencari peron kereta", group: "Perjalanan",
    speaker: "Ravi", role: "Station attendant",
    context: "Papan jadwal berubah beberapa menit sebelum keberangkatan. Pastikan kereta dan peron tujuan Anda.",
    goal: "Tujuan dan waktu keberangkatan",
    question: "Which train are you trying to catch?",
    translation: "Kereta mana yang ingin Anda naiki?",
  },
  {
    id: "luggage", title: "Koper tertinggal", group: "Perjalanan",
    speaker: "Grace", role: "Baggage agent",
    context: "Koper Anda tidak muncul di sabuk bagasi. Bantu petugas mengenalinya dari bentuk dan ciri khas.",
    goal: "Deskripsi benda dengan adjectives",
    question: "What does your missing suitcase look like?",
    translation: "Seperti apa koper Anda yang hilang?",
  },
  {
    id: "directions", title: "Jalan kaki ke museum", group: "Perjalanan",
    speaker: "Alex", role: "Local resident",
    context: "Anda mencari museum di kota yang baru dikunjungi. Jelaskan posisi Anda dan minta petunjuk jalan.",
    goal: "Petunjuk arah dan preposisi tempat",
    question: "Which landmark can you see from where you are standing?",
    translation: "Bangunan atau penanda apa yang terlihat dari tempat Anda berdiri?",
  },
  {
    id: "rain-plan", title: "Hujan saat liburan", group: "Perjalanan",
    speaker: "Jo", role: "Travel companion",
    context: "Hujan membatalkan rencana piknik. Ajak teman menentukan kegiatan pengganti dengan anggaran terbatas.",
    goal: "Saran dan pengandaian dengan could atau if",
    question: "It looks like rain all day. What could we do instead of the picnic?",
    translation: "Sepertinya akan hujan sepanjang hari. Apa yang bisa kita lakukan sebagai pengganti piknik?",
  },
  {
    id: "bike", title: "Menyewa sepeda", group: "Perjalanan",
    speaker: "Kai", role: "Bike rental clerk",
    context: "Anda ingin menyusuri jalur tepi sungai. Pilih sepeda dan tentukan berapa lama Anda akan menyewanya.",
    goal: "Durasi dengan for dan until",
    question: "How long are you planning to ride today?",
    translation: "Berapa lama Anda berencana bersepeda hari ini?",
  },
  {
    id: "study", title: "Membentuk kelompok belajar", group: "Studi & komunitas",
    speaker: "Sam", role: "Classmate",
    context: "Anda mencari teman belajar sebelum ujian. Sepakati materi prioritas dan waktu bertemu.",
    goal: "Prioritas dan rencana dengan need to dan will",
    question: "Which topic should we study together first?",
    translation: "Topik mana yang perlu kita pelajari bersama lebih dulu?",
  },
  {
    id: "library", title: "Mencari buku di perpustakaan", group: "Studi & komunitas",
    speaker: "June", role: "Librarian",
    context: "Anda perlu sumber untuk tugas kelas. Jelaskan topik dan jenis bacaan yang paling membantu.",
    goal: "Menjelaskan kebutuhan dengan I'm looking for",
    question: "What are you researching for your assignment?",
    translation: "Apa yang sedang Anda teliti untuk tugas Anda?",
  },
  {
    id: "club", title: "Bergabung dengan klub foto", group: "Studi & komunitas",
    speaker: "Omar", role: "Club organizer",
    context: "Anda menghadiri pertemuan pertama klub fotografi. Kenalkan minat Anda kepada pengurus.",
    goal: "Preferensi dengan enjoy dan prefer",
    question: "What do you most enjoy photographing?",
    translation: "Apa yang paling Anda sukai sebagai objek foto?",
  },
  {
    id: "festival", title: "Menjadi relawan festival", group: "Studi & komunitas",
    speaker: "Lina", role: "Volunteer coordinator",
    context: "Anda mendaftar sebagai relawan festival kampus. Pilih tugas yang sesuai kemampuan dan jadwal.",
    goal: "Kemampuan dan ketersediaan dengan can",
    question: "What would you like to help with at the festival?",
    translation: "Di bagian mana Anda ingin membantu saat festival?",
  },
  {
    id: "book-club", title: "Diskusi klub buku", group: "Pendapat & diskusi",
    speaker: "Noah", role: "Book club host",
    context: "Klub buku baru saja selesai membaca sebuah cerita. Bagikan reaksi Anda pada salah satu adegan.",
    goal: "Menyampaikan pendapat dan alasan dengan because",
    question: "Which moment in the story stayed with you?",
    translation: "Bagian mana dari cerita itu yang paling Anda ingat?",
  },
  {
    id: "exchange", title: "Menyambut siswa pertukaran", group: "Studi & komunitas",
    speaker: "Ella", role: "Exchange student",
    context: "Seorang siswa baru ingin mengenal lingkungan kampus. Sarankan tempat pertama yang layak dikunjungi.",
    goal: "Rekomendasi dengan should dan can",
    question: "I have one free hour on campus. Where should I go first?",
    translation: "Saya punya satu jam luang di kampus. Sebaiknya saya ke mana lebih dulu?",
  },
  {
    id: "deadline", title: "Negosiasi tenggat proyek", group: "Dunia kerja",
    speaker: "Robin", role: "Team lead",
    context: "Ada kendala yang memperlambat pekerjaan tim. Jelaskan dampaknya dan usulkan tenggat yang realistis.",
    goal: "Sebab-akibat dan rencana dengan will",
    question: "What is slowing down your part of the project?",
    translation: "Apa yang menghambat bagian proyek yang Anda kerjakan?",
  },
  {
    id: "handover", title: "Serah terima tugas", group: "Dunia kerja",
    speaker: "Erin", role: "Colleague",
    context: "Anda akan cuti dua hari. Beri rekan kerja informasi yang ia perlukan untuk mengambil alih tugas.",
    goal: "Status pekerjaan dengan present perfect",
    question: "What have you finished so far?",
    translation: "Apa saja yang sudah Anda selesaikan sejauh ini?",
  },
  {
    id: "pitch", title: "Mengusulkan ide ke tim", group: "Dunia kerja",
    speaker: "Ari", role: "Team coordinator",
    context: "Tim Anda ingin mempersingkat rapat mingguan. Ajukan satu perubahan yang mudah dicoba.",
    goal: "Usulan dan manfaat dengan could dan would",
    question: "What would you change about our weekly meeting?",
    translation: "Apa yang ingin Anda ubah dari rapat mingguan kita?",
  },
  {
    id: "support", title: "Membantu pelanggan", group: "Dunia kerja",
    speaker: "Jess", role: "Customer",
    context: "Seorang pelanggan kesulitan memakai fitur pencarian di toko online. Pandu ia langkah demi langkah.",
    goal: "Instruksi berurutan dengan first dan then",
    question: "I can't find my last order. Where should I look first?",
    translation: "Saya tidak bisa menemukan pesanan terakhir saya. Saya harus mencari di mana dulu?",
  },
  { id: "flight-delay", title: "Penerbangan terlambat", group: "Perjalanan", speaker: "Nora", role: "Airline agent", context: "Penerbangan Anda terlambat dan Anda khawatir tertinggal penerbangan lanjutan. Cari pilihan perjalanan Anda.", goal: "Menjelaskan masalah dan meminta pilihan perjalanan", question: "What connection are you worried about missing?", translation: "Penerbangan lanjutan mana yang Anda khawatirkan akan terlewat?" },
  { id: "restaurant-order", title: "Memesan makanan", group: "Layanan & transaksi", speaker: "Mia", role: "Server", context: "Anda makan di restoran dan ingin memilih hidangan yang sesuai kebutuhan Anda.", goal: "Memesan makanan dan menanyakan pilihan", question: "What kind of meal are you in the mood for today?", translation: "Hidangan seperti apa yang Anda inginkan hari ini?" },
  { id: "refund", title: "Meminta pengembalian dana", group: "Layanan & transaksi", speaker: "Daniel", role: "Customer service agent", context: "Barang yang Anda beli datang dalam keadaan rusak. Jelaskan masalahnya dan diskusikan pengembalian dana.", goal: "Menjelaskan masalah dan meminta penyelesaian", question: "What happened when you opened the package?", translation: "Apa yang terjadi saat Anda membuka paketnya?" },
  { id: "team-choice", title: "Memilih solusi tim", group: "Pendapat & diskusi", speaker: "Sofia", role: "Team member", context: "Tim Anda harus memilih cara mengurangi sampah plastik di kantor. Diskusikan pilihan yang realistis.", goal: "Mengusulkan solusi dan menjelaskan alasan", question: "Which change should our team try first?", translation: "Perubahan mana yang sebaiknya tim kita coba terlebih dahulu?" },
  { id: "remote-work", title: "Diskusi kerja jarak jauh", group: "Pendapat & diskusi", speaker: "Jamie", role: "Friend", context: "Anda dan teman membahas manfaat dan tantangan bekerja dari rumah.", goal: "Menyampaikan pendapat dan memberikan contoh", question: "What do you think is the biggest benefit of working from home?", translation: "Menurut Anda apa manfaat terbesar bekerja dari rumah?" },
  { id: "disagree-plan", title: "Berbeda pendapat tentang rencana", group: "Pendapat & diskusi", speaker: "Chris", role: "Project partner", context: "Rekan proyek ingin mempercepat peluncuran, tetapi Anda mempertimbangkan risikonya. Diskusikan pendapat Anda.", goal: "Menyatakan ketidaksetujuan dengan sopan", question: "Why do you think we should wait before launching?", translation: "Mengapa menurut Anda kita perlu menunggu sebelum meluncurkan proyek?" },
];
