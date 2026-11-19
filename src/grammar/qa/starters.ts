import { DIALOGUE_SCENARIOS, type DialogueScenario } from "./dialogue";

export const SCENARIO_GROUPS = ["Dunia kerja", "Keseharian", "Perjalanan", "Studi & komunitas"] as const;
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
  localFollowUp?: string;
  guided?: DialogueScenario;
}

export const ROLEPLAY_STARTERS: readonly RoleplayStarter[] = [
  ...DIALOGUE_SCENARIOS.map((guided): RoleplayStarter => {
    const opening = guided.nodes[guided.initialNodeId];
    return {
      id: guided.id, title: guided.title.split(" (")[0], group: "Dunia kerja",
      speaker: opening.speaker, role: opening.speakerRole, context: guided.contextDescription,
      goal: opening.grammarLabel, question: opening.question, translation: opening.translation, guided,
    };
  }),
  {
    id: "coffee", title: "Pesan kopi sebelum berangkat", group: "Keseharian",
    speaker: "Maya", role: "Barista",
    context: "Anda mampir ke kedai sebelum naik kereta. Pesan minuman yang bisa dibawa.",
    goal: "Pesanan sopan dengan I'd like atau could I",
    question: "Good morning! What can I get started for you?",
    translation: "Selamat pagi! Anda mau pesan apa?",
    localFollowUp: "How would you like to pay for your order?",
  },
  {
    id: "market", title: "Belanja di pasar pagi", group: "Keseharian",
    speaker: "Ben", role: "Fruit seller",
    context: "Anda menyiapkan salad buah untuk empat orang. Tanyakan harga dan pilih buah yang cukup matang.",
    goal: "Jumlah dan harga dengan how much atau how many",
    question: "These mangoes are ripe today. How many people are you shopping for?",
    translation: "Mangga ini sudah matang. Anda berbelanja untuk berapa orang?",
    localFollowUp: "Which other fruit would you like to add to your salad?",
  },
  {
    id: "return-shoes", title: "Tukar ukuran sepatu", group: "Keseharian",
    speaker: "Nina", role: "Shop assistant",
    context: "Sepatu yang dibeli kemarin terasa sempit. Bawa struk dan bicarakan pilihan penukaran.",
    goal: "Past simple dan perbandingan ukuran",
    question: "Hi! What was the problem with the shoes you bought?",
    translation: "Halo! Apa masalah dengan sepatu yang Anda beli?",
    localFollowUp: "What size would you like to try instead?",
  },
  {
    id: "flatmate", title: "Berbagi tugas di kos", group: "Keseharian",
    speaker: "Leo", role: "Flatmate",
    context: "Teman kos Anda ingin membagi tugas rumah agar dapur bersama tetap rapi.",
    goal: "Frekuensi dengan usually dan once a week",
    question: "Which kitchen chore would you like to take care of?",
    translation: "Tugas dapur mana yang ingin Anda kerjakan?",
    localFollowUp: "How often can you fit that chore into your week?",
  },
  {
    id: "birthday", title: "Merancang pesta kejutan", group: "Keseharian",
    speaker: "Aisha", role: "Friend",
    context: "Anda dan seorang teman merencanakan pesta kecil. Pilih tempat yang disukai orang yang berulang tahun.",
    goal: "Saran dengan let's dan we could",
    question: "Where should we hold the surprise party?",
    translation: "Di mana sebaiknya kita mengadakan pesta kejutan?",
    localFollowUp: "How can we get everyone there without spoiling the surprise?",
  },
  {
    id: "parcel", title: "Paket salah alamat", group: "Keseharian",
    speaker: "Tom", role: "Delivery agent",
    context: "Paket Anda ditandai sudah diterima, tetapi barangnya belum sampai. Ceritakan petunjuk yang Anda punya.",
    goal: "Past simple untuk urutan kejadian",
    question: "What did you notice in the delivery photo?",
    translation: "Apa yang Anda lihat di foto pengiriman?",
    localFollowUp: "What would be a good next step for finding the parcel?",
  },
  {
    id: "hotel", title: "Check-in di hotel", group: "Perjalanan",
    speaker: "Inez", role: "Hotel receptionist",
    context: "Anda datang lebih awal setelah perjalanan panjang. Bicarakan reservasi dan kebutuhan selama menunggu kamar.",
    goal: "Permintaan sopan dengan could dan would",
    question: "Welcome! What would you like to arrange before your room is ready?",
    translation: "Selamat datang! Apa yang ingin Anda atur sambil menunggu kamar siap?",
    localFollowUp: "What time would you like to collect your room key?",
  },
  {
    id: "platform", title: "Mencari peron kereta", group: "Perjalanan",
    speaker: "Ravi", role: "Station attendant",
    context: "Papan jadwal berubah beberapa menit sebelum keberangkatan. Pastikan kereta dan peron tujuan Anda.",
    goal: "Tujuan dan waktu keberangkatan",
    question: "Which train are you trying to catch?",
    translation: "Kereta mana yang ingin Anda naiki?",
    localFollowUp: "How much time do you have before it leaves?",
  },
  {
    id: "luggage", title: "Koper tertinggal", group: "Perjalanan",
    speaker: "Grace", role: "Baggage agent",
    context: "Koper Anda tidak muncul di sabuk bagasi. Bantu petugas mengenalinya dari bentuk dan ciri khas.",
    goal: "Deskripsi benda dengan adjectives",
    question: "What does your missing suitcase look like?",
    translation: "Seperti apa koper Anda yang hilang?",
    localFollowUp: "What detail would help me tell your bag apart from a similar one?",
  },
  {
    id: "directions", title: "Jalan kaki ke museum", group: "Perjalanan",
    speaker: "Alex", role: "Local resident",
    context: "Anda mencari museum di kota yang baru dikunjungi. Jelaskan posisi Anda dan minta petunjuk jalan.",
    goal: "Petunjuk arah dan preposisi tempat",
    question: "Which landmark can you see from where you are standing?",
    translation: "Bangunan atau penanda apa yang terlihat dari tempat Anda berdiri?",
    localFollowUp: "Would you prefer the shortest route or the quieter streets?",
  },
  {
    id: "rain-plan", title: "Hujan saat liburan", group: "Perjalanan",
    speaker: "Jo", role: "Travel companion",
    context: "Hujan membatalkan rencana piknik. Ajak teman menentukan kegiatan pengganti dengan anggaran terbatas.",
    goal: "Saran dan pengandaian dengan could atau if",
    question: "It looks like rain all day. What could we do instead of the picnic?",
    translation: "Sepertinya akan hujan sepanjang hari. Apa yang bisa kita lakukan sebagai pengganti piknik?",
    localFollowUp: "How much would your alternative cost for both of us?",
  },
  {
    id: "bike", title: "Menyewa sepeda", group: "Perjalanan",
    speaker: "Kai", role: "Bike rental clerk",
    context: "Anda ingin menyusuri jalur tepi sungai. Pilih sepeda dan tentukan berapa lama Anda akan menyewanya.",
    goal: "Durasi dengan for dan until",
    question: "How long are you planning to ride today?",
    translation: "Berapa lama Anda berencana bersepeda hari ini?",
    localFollowUp: "What equipment would you like to take along?",
  },
  {
    id: "study", title: "Membentuk kelompok belajar", group: "Studi & komunitas",
    speaker: "Sam", role: "Classmate",
    context: "Anda mencari teman belajar sebelum ujian. Sepakati materi prioritas dan waktu bertemu.",
    goal: "Prioritas dan rencana dengan need to dan will",
    question: "Which topic should we study together first?",
    translation: "Topik mana yang perlu kita pelajari bersama lebih dulu?",
    localFollowUp: "When can we meet for our first study session?",
  },
  {
    id: "library", title: "Mencari buku di perpustakaan", group: "Studi & komunitas",
    speaker: "June", role: "Librarian",
    context: "Anda perlu sumber untuk tugas kelas. Jelaskan topik dan jenis bacaan yang paling membantu.",
    goal: "Menjelaskan kebutuhan dengan I'm looking for",
    question: "What are you researching for your assignment?",
    translation: "Apa yang sedang Anda teliti untuk tugas Anda?",
    localFollowUp: "Which kind of source would be easiest for you to use?",
  },
  {
    id: "club", title: "Bergabung dengan klub foto", group: "Studi & komunitas",
    speaker: "Omar", role: "Club organizer",
    context: "Anda menghadiri pertemuan pertama klub fotografi. Kenalkan minat Anda kepada pengurus.",
    goal: "Preferensi dengan enjoy dan prefer",
    question: "What do you most enjoy photographing?",
    translation: "Apa yang paling Anda sukai sebagai objek foto?",
    localFollowUp: "Where would you like to go on our next photo walk?",
  },
  {
    id: "festival", title: "Menjadi relawan festival", group: "Studi & komunitas",
    speaker: "Lina", role: "Volunteer coordinator",
    context: "Anda mendaftar sebagai relawan festival kampus. Pilih tugas yang sesuai kemampuan dan jadwal.",
    goal: "Kemampuan dan ketersediaan dengan can",
    question: "What would you like to help with at the festival?",
    translation: "Di bagian mana Anda ingin membantu saat festival?",
    localFollowUp: "Which shift would fit your class schedule?",
  },
  {
    id: "book-club", title: "Diskusi klub buku", group: "Studi & komunitas",
    speaker: "Noah", role: "Book club host",
    context: "Klub buku baru saja selesai membaca sebuah cerita. Bagikan reaksi Anda pada salah satu adegan.",
    goal: "Menyampaikan pendapat dan alasan dengan because",
    question: "Which moment in the story stayed with you?",
    translation: "Bagian mana dari cerita itu yang paling Anda ingat?",
    localFollowUp: "Would you recommend this story to a friend?",
  },
  {
    id: "exchange", title: "Menyambut siswa pertukaran", group: "Studi & komunitas",
    speaker: "Ella", role: "Exchange student",
    context: "Seorang siswa baru ingin mengenal lingkungan kampus. Sarankan tempat pertama yang layak dikunjungi.",
    goal: "Rekomendasi dengan should dan can",
    question: "I have one free hour on campus. Where should I go first?",
    translation: "Saya punya satu jam luang di kampus. Sebaiknya saya ke mana lebih dulu?",
    localFollowUp: "What should I bring with me?",
  },
  {
    id: "deadline", title: "Negosiasi tenggat proyek", group: "Dunia kerja",
    speaker: "Robin", role: "Team lead",
    context: "Ada kendala yang memperlambat pekerjaan tim. Jelaskan dampaknya dan usulkan tenggat yang realistis.",
    goal: "Sebab-akibat dan rencana dengan will",
    question: "What is slowing down your part of the project?",
    translation: "Apa yang menghambat bagian proyek yang Anda kerjakan?",
    localFollowUp: "When could you deliver the first part?",
  },
  {
    id: "handover", title: "Serah terima tugas", group: "Dunia kerja",
    speaker: "Erin", role: "Colleague",
    context: "Anda akan cuti dua hari. Beri rekan kerja informasi yang ia perlukan untuk mengambil alih tugas.",
    goal: "Status pekerjaan dengan present perfect",
    question: "What have you finished so far?",
    translation: "Apa saja yang sudah Anda selesaikan sejauh ini?",
    localFollowUp: "Which task should I handle first while you are away?",
  },
  {
    id: "pitch", title: "Mengusulkan ide ke tim", group: "Dunia kerja",
    speaker: "Ari", role: "Team coordinator",
    context: "Tim Anda ingin mempersingkat rapat mingguan. Ajukan satu perubahan yang mudah dicoba.",
    goal: "Usulan dan manfaat dengan could dan would",
    question: "What would you change about our weekly meeting?",
    translation: "Apa yang ingin Anda ubah dari rapat mingguan kita?",
    localFollowUp: "How could we tell whether your idea is working?",
  },
  {
    id: "support", title: "Membantu pelanggan", group: "Dunia kerja",
    speaker: "Jess", role: "Customer",
    context: "Seorang pelanggan kesulitan memakai fitur pencarian di toko online. Pandu ia langkah demi langkah.",
    goal: "Instruksi berurutan dengan first dan then",
    question: "I can't find my last order. Where should I look first?",
    translation: "Saya tidak bisa menemukan pesanan terakhir saya. Saya harus mencari di mana dulu?",
    localFollowUp: "What can I try if my order still doesn't appear?",
  },
];
