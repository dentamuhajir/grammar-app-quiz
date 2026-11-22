import { BASICS_LABELS } from "./labels";
import { expandVariants, normalize } from "./check/normalize";
import type { WritingResult } from "./writingPacks";

type NewWritingTopic = Exclude<keyof typeof BASICS_LABELS, "articles" | "prepositions">;

interface TopicWritingLesson {
  id: string;
  topic: NewWritingTopic;
  prompt: string;
  answer: string;
  situation: string;
  cues: string;
  variants: string[];
  explanation: string;
}

// Each situation has an explicit meaning and word guide, so local checking can
// accept curated alternatives without accepting unrelated grammatical sentences.
export const TOPIC_WRITING_LESSONS: TopicWritingLesson[] = [
  {
    id: "write-plurals-books", topic: "plurals", prompt: "I have two ___.", answer: "books",
    situation: "Anda memiliki dua buku. Nyatakan dengan subjek I dan kata have.",
    cues: "I · have · two · book",
    variants: ["I have two books", "I have got two books"],
    explanation: "Two menunjukkan lebih dari satu. Book mendapat akhiran -s menjadi books.",
  },
  {
    id: "write-plurals-children", topic: "plurals", prompt: "Three ___ are playing.", answer: "children",
    situation: "Tiga anak sedang bermain. Mulai dengan Three dan gunakan play dalam bentuk sedang berlangsung.",
    cues: "three · child · play",
    variants: ["Three children are playing", "There are three children playing"],
    explanation: "Bentuk jamak child adalah children. Subjek jamak memakai are playing.",
  },
  {
    id: "write-plurals-boxes", topic: "plurals", prompt: "There are five ___ here.", answer: "boxes",
    situation: "Ada lima kotak di sini. Gunakan There are.",
    cues: "there are · five · box · here",
    variants: ["There are five boxes here", "Here there are five boxes"],
    explanation: "Box berakhiran -x, sehingga bentuk jamaknya memakai -es menjadi boxes.",
  },
  {
    id: "write-pronouns-her", topic: "pronouns", prompt: "This is ___ bag. It belongs to Maya.", answer: "her",
    situation: "Tas ini milik Maya. Tunjukkan tas itu dengan This is dan kata kepunyaan untuk she.",
    cues: "this · be · her · bag",
    variants: ["This is her bag"],
    explanation: "Her diletakkan sebelum kata benda bag untuk menunjukkan pemiliknya.",
  },
  {
    id: "write-pronouns-mine", topic: "pronouns", prompt: "This book belongs to me. It is ___.", answer: "mine",
    situation: "Buku ini milik Anda. Nyatakan dengan This book dan kata mine.",
    cues: "this book · be · mine",
    variants: ["This book is mine"],
    explanation: "Mine menggantikan my book, sehingga tidak diikuti kata benda lagi.",
  },
  {
    id: "write-pronouns-them", topic: "pronouns", prompt: "I see my friends. I wave to ___.", answer: "them",
    situation: "Anda melambaikan tangan kepada teman-teman. Ganti teman-teman dengan kata ganti objek.",
    cues: "I · wave · to · them",
    variants: ["I wave to them", "I am waving to them"],
    explanation: "Setelah to gunakan bentuk objek them untuk menggantikan they.",
  },
  {
    id: "write-quantifiers-much", topic: "quantifiers", prompt: "I do not have ___ time.", answer: "much",
    situation: "Waktu Anda tidak banyak. Gunakan I, have, dan much dalam kalimat negatif.",
    cues: "I · not have · much · time",
    variants: ["I do not have much time", "I have not got much time"],
    explanation: "Time tidak dapat dihitung dalam makna ini. Gunakan much dalam kalimat negatif.",
  },
  {
    id: "write-quantifiers-many", topic: "quantifiers", prompt: "How ___ apples do you need?", answer: "many",
    situation: "Tanyakan berapa banyak apel yang dibutuhkan teman Anda.",
    cues: "how many · apple · you · need",
    variants: ["How many apples do you need"],
    explanation: "Apel dapat dihitung. Gunakan how many dengan bentuk jamak apples dan do you need.",
  },
  {
    id: "write-quantifiers-some", topic: "quantifiers", prompt: "There is ___ water in the bottle.", answer: "some",
    situation: "Ada sedikit air di dalam botol. Gunakan There is dan some.",
    cues: "there is · some · water · in the bottle",
    variants: ["There is some water in the bottle", "In the bottle there is some water"],
    explanation: "Water memakai there is. Some menyatakan jumlah yang tidak ditentukan.",
  },
  {
    id: "write-comparatives-taller", topic: "comparatives", prompt: "Maya is ___ than Rina. (tall)", answer: "taller",
    situation: "Maya lebih tinggi daripada Rina. Bandingkan keduanya dengan tall.",
    cues: "Maya · be · tall · than · Rina",
    variants: ["Maya is taller than Rina"],
    explanation: "Tall menjadi taller untuk membandingkan dua orang, diikuti than.",
  },
  {
    id: "write-comparatives-interesting", topic: "comparatives", prompt: "This book is ___ interesting than that one.", answer: "more",
    situation: "Buku ini lebih menarik daripada buku itu. Gunakan interesting dan that book atau that one.",
    cues: "this book · be · interesting · than · that book",
    variants: ["This book is more interesting than that book", "This book is more interesting than that one"],
    explanation: "Interesting memakai more untuk bentuk perbandingan.",
  },
  {
    id: "write-comparatives-best", topic: "comparatives", prompt: "This is the ___ cafe in town. (good)", answer: "best",
    situation: "Ini kafe terbaik di kota. Gunakan This is dan bentuk superlatif good.",
    cues: "this · be · good · cafe · in town",
    variants: ["This is the best cafe in town", "This is the best café in town"],
    explanation: "Bentuk superlatif good adalah the best.",
  },
  {
    id: "write-adjectives-carefully", topic: "adjectives", prompt: "She drives ___. (careful)", answer: "carefully",
    situation: "Dia perempuan mengemudi dengan hati-hati sebagai kebiasaan.",
    cues: "she · drive · carefully",
    variants: ["She drives carefully"],
    explanation: "Carefully menjelaskan cara melakukan drive. She memakai drives dalam present simple.",
  },
  {
    id: "write-adjectives-tired", topic: "adjectives", prompt: "I feel ___. (tired / tiring)", answer: "tired",
    situation: "Anda merasa lelah sekarang. Nyatakan dengan I feel.",
    cues: "I · feel · tired",
    variants: ["I feel tired", "I am feeling tired"],
    explanation: "Tired menggambarkan perasaan orang. Setelah feel gunakan kata sifat.",
  },
  {
    id: "write-adjectives-delicious", topic: "adjectives", prompt: "The soup tastes ___. (delicious / deliciously)", answer: "delicious",
    situation: "Sup itu terasa lezat. Gunakan The soup dan taste.",
    cues: "the soup · taste · delicious",
    variants: ["The soup tastes delicious"],
    explanation: "Taste sebagai linking verb diikuti kata sifat delicious untuk menjelaskan sup.",
  },
  {
    id: "write-relatives-who", topic: "relatives", prompt: "The woman ___ lives next door is a doctor.", answer: "who",
    situation: "Perempuan yang tinggal di sebelah adalah dokter. Gabungkan informasi dengan who.",
    cues: "the woman · who · live next door · be a doctor",
    variants: ["The woman who lives next door is a doctor"],
    explanation: "Who menjelaskan orang. The woman tunggal memakai lives dan is.",
  },
  {
    id: "write-relatives-that", topic: "relatives", prompt: "This is the book ___ I bought yesterday.", answer: "that",
    situation: "Ini buku yang Anda beli kemarin. Gunakan that untuk menghubungkan informasinya.",
    cues: "this is the book · that · I · buy · yesterday",
    variants: ["This is the book that I bought yesterday", "This is the book that I purchased yesterday"],
    explanation: "That menghubungkan book dengan I bought yesterday. Kemarin memakai bentuk lampau bought.",
  },
  {
    id: "write-relatives-where", topic: "relatives", prompt: "This is the cafe ___ we met.", answer: "where",
    situation: "Ini kafe tempat kita bertemu dahulu. Gunakan where dan met.",
    cues: "this is the cafe · where · we · met",
    variants: ["This is the cafe where we met", "This is the café where we met"],
    explanation: "Where menghubungkan tempat dengan kejadian di tempat itu.",
  },
  {
    id: "write-modals-rest", topic: "modals", prompt: "You ___ get some rest. (advice)", answer: "should",
    situation: "Teman Anda lelah. Sarankan agar ia beristirahat dengan should.",
    cues: "you · should · rest",
    variants: ["You should rest", "You should get some rest", "You should take a rest", "You should have a rest"],
    explanation: "Should untuk saran diikuti kata kerja dasar, seperti rest atau get.",
  },
  {
    id: "write-modals-swim", topic: "modals", prompt: "I ___ swim. (ability)", answer: "can",
    situation: "Anda bisa berenang. Nyatakan kemampuan dengan can.",
    cues: "I · can · swim",
    variants: ["I can swim"],
    explanation: "Can menunjukkan kemampuan dan diikuti kata kerja dasar swim.",
  },
  {
    id: "write-modals-seatbelt", topic: "modals", prompt: "You ___ wear a seat belt. (strong obligation)", answer: "must",
    situation: "Ingatkan teman bahwa ia wajib memakai sabuk pengaman. Gunakan must.",
    cues: "you · must · wear · a seat belt",
    variants: ["You must wear a seat belt", "You must wear a seatbelt", "You must wear your seat belt", "You must wear your seatbelt"],
    explanation: "Must menyatakan kewajiban kuat dan diikuti wear tanpa to.",
  },
  {
    id: "write-conjunctions-because", topic: "conjunctions", prompt: "I stayed home ___ I was sick.", answer: "because",
    situation: "Anda tinggal di rumah karena sakit. Hubungkan alasan dengan because dalam bentuk lampau.",
    cues: "I · stay home · because · I · be sick",
    variants: ["I stayed home because I was sick", "I stayed at home because I was sick", "Because I was sick I stayed home", "Because I was sick I stayed at home"],
    explanation: "Because menghubungkan kejadian dengan alasannya. Stay dan be berubah menjadi stayed dan was.",
  },
  {
    id: "write-conjunctions-but", topic: "conjunctions", prompt: "I was tired, ___ I finished my homework.", answer: "but",
    situation: "Anda lelah tetapi menyelesaikan PR. Hubungkan kedua hal dengan but dalam bentuk lampau.",
    cues: "I · be tired · but · finish my homework",
    variants: ["I was tired but I finished my homework", "I was tired but finished my homework"],
    explanation: "But menghubungkan dua hal yang berlawanan harapan.",
  },
  {
    id: "write-conjunctions-so", topic: "conjunctions", prompt: "It was raining, ___ we stayed home.", answer: "so",
    situation: "Saat itu hujan, jadi kita tinggal di rumah. Nyatakan akibatnya dengan so.",
    cues: "it was raining · so · we · stay home",
    variants: ["It was raining so we stayed home", "It was raining so we stayed at home"],
    explanation: "So memperkenalkan akibat. We stayed home adalah akibat dari hujan.",
  },
  {
    id: "write-conditionals-rain", topic: "conditionals", prompt: "If it rains, I ___ stay home.", answer: "will",
    situation: "Jika hujan, Anda akan tinggal di rumah. Nyatakan kemungkinan masa depan dengan if dan will.",
    cues: "if · it rain · I will stay home",
    variants: ["If it rains I will stay home", "I will stay home if it rains", "If it rains I will stay at home", "I will stay at home if it rains"],
    explanation: "First conditional memakai if + present simple, lalu will + kata kerja dasar.",
  },
  {
    id: "write-conditionals-rich", topic: "conditionals", prompt: "If I were rich, I ___ travel the world.", answer: "would",
    situation: "Bayangkan Anda kaya. Anda akan berkeliling dunia. Gunakan if I were dan would.",
    cues: "if I were rich · I would · travel the world",
    variants: ["If I were rich I would travel the world", "I would travel the world if I were rich"],
    explanation: "Second conditional memakai if + bentuk lampau dan would + kata kerja dasar untuk pengandaian.",
  },
  {
    id: "write-conditionals-ice", topic: "conditionals", prompt: "If you heat ice, it ___. (melt)", answer: "melts",
    situation: "Es mencair jika dipanaskan. Nyatakan fakta umum dengan if, you heat ice, dan it.",
    cues: "if · you heat ice · it melt",
    variants: ["If you heat ice it melts", "It melts if you heat ice"],
    explanation: "Zero conditional memakai present simple di kedua bagian. It memakai melts.",
  },
  {
    id: "write-collocations-decision", topic: "collocations", prompt: "We need to ___ a decision.", answer: "make",
    situation: "Kita perlu mengambil keputusan. Gunakan We need to dan decision.",
    cues: "we · need to · make · a decision",
    variants: ["We need to make a decision"],
    explanation: "Pasangan kata yang digunakan adalah make a decision.",
  },
  {
    id: "write-collocations-homework", topic: "collocations", prompt: "I ___ my homework every evening.", answer: "do",
    situation: "Anda mengerjakan PR setiap malam. Ceritakan kebiasaan dengan I dan homework.",
    cues: "I · do · my homework · every evening",
    variants: ["I do my homework every evening", "Every evening I do my homework", "I do my homework every night", "Every night I do my homework"],
    explanation: "Gunakan do my homework untuk mengerjakan PR.",
  },
  {
    id: "write-collocations-break", topic: "collocations", prompt: "Let us ___ a break.", answer: "take",
    situation: "Ajak teman beristirahat sebentar. Gunakan Let's dan take.",
    cues: "let us · take · a break",
    variants: ["Let us take a break", "Let's take a break"],
    explanation: "Take a break berarti beristirahat sebentar. Setelah let's gunakan kata kerja dasar.",
  },
  {
    id: "write-gerunds-enjoy", topic: "gerunds", prompt: "She enjoys ___ books. (read)", answer: "reading",
    situation: "Dia perempuan suka membaca buku. Gunakan enjoy dalam present simple.",
    cues: "she · enjoy · read · books",
    variants: ["She enjoys reading books"],
    explanation: "Enjoy diikuti V-ing, sehingga read menjadi reading. Subjek she memakai enjoys. Hindari enjoys to read.",
  },
  {
    id: "write-gerunds-want", topic: "gerunds", prompt: "I want ___ English. (learn)", answer: "to learn",
    situation: "Anda ingin belajar bahasa Inggris. Gunakan want dan learn.",
    cues: "I · want · learn · English",
    variants: ["I want to learn English"],
    explanation: "Want diikuti to + kata kerja dasar. Gunakan want to learn, bukan want learning.",
  },
  {
    id: "write-gerunds-avoid", topic: "gerunds", prompt: "We avoid ___ during meetings. (talk)", answer: "talking",
    situation: "Kita menghindari berbicara selama rapat. Gunakan avoid dalam present simple.",
    cues: "we · avoid · talk · during meetings",
    variants: ["We avoid talking during meetings", "During meetings we avoid talking"],
    explanation: "Avoid diikuti V-ing. Gunakan avoid talking, bukan avoid to talk.",
  },
  {
    id: "write-gerunds-decide", topic: "gerunds", prompt: "They decided ___ early. (leave)", answer: "to leave",
    situation: "Mereka memutuskan untuk berangkat lebih awal. Ceritakan keputusan lampau dengan decide.",
    cues: "they · decide · leave · early",
    variants: ["They decided to leave early"],
    explanation: "Decide diikuti to + kata kerja dasar. Untuk keputusan lampau gunakan decided to leave.",
  },
  {
    id: "write-gerunds-finish", topic: "gerunds", prompt: "I finished ___ the report yesterday. (write)", answer: "writing",
    situation: "Anda selesai menulis laporan itu kemarin. Gunakan finish dan write.",
    cues: "I · finish · write · the report · yesterday",
    variants: ["I finished writing the report yesterday", "Yesterday I finished writing the report"],
    explanation: "Finish diikuti V-ing. Write berubah menjadi writing dengan menghapus -e. Yesterday memakai finished.",
  },
  {
    id: "write-gerunds-hope", topic: "gerunds", prompt: "We hope ___ you soon. (see)", answer: "to see",
    situation: "Kita berharap bisa segera bertemu dengan teman yang diajak bicara. Gunakan hope dan see.",
    cues: "we · hope · see · you · soon",
    variants: ["We hope to see you soon"],
    explanation: "Hope diikuti to + kata kerja dasar. Gunakan hope to see, bukan hope seeing.",
  },
  {
    id: "write-quantifiers-a-few", topic: "quantifiers", prompt: "I have ___ friends here, so I have someone to talk to. (a few / few)", answer: "a few",
    situation: "Anda punya beberapa teman di sini. Sampaikan dengan a few bahwa masih ada teman untuk diajak bicara. Tulis bagian tentang teman saja.",
    cues: "I · have · a few · friends · here",
    variants: ["I have a few friends here", "Here I have a few friends"],
    explanation: "A few dipakai dengan kata benda jamak yang dapat dihitung. Maknanya ada beberapa. Few menekankan hampir tidak ada.",
  },
  {
    id: "write-quantifiers-few", topic: "quantifiers", prompt: "I have ___ friends here, so I often feel lonely. (a few / few)", answer: "few",
    situation: "Anda hampir tidak punya teman di sini. Sampaikan dengan few. Tulis bagian tentang teman saja.",
    cues: "I · have · few · friends · here",
    variants: ["I have few friends here", "Here I have few friends", "I have very few friends here"],
    explanation: "Few tanpa a menekankan jumlah yang sangat sedikit pada kata benda jamak. A few memberi makna masih ada beberapa.",
  },
  {
    id: "write-quantifiers-a-little", topic: "quantifiers", prompt: "We have ___ time left, enough for a quick chat. (a little / little)", answer: "a little",
    situation: "Kita masih punya sedikit waktu tersisa untuk mengobrol. Gunakan a little. Tulis bagian tentang waktu saja.",
    cues: "we · have · a little · time · left",
    variants: ["We have a little time left", "We still have a little time left"],
    explanation: "Time tidak dapat dihitung dalam makna ini. A little menyatakan masih ada sedikit, sedangkan little menekankan hampir tidak ada.",
  },
  {
    id: "write-quantifiers-little", topic: "quantifiers", prompt: "We have ___ time left, so we must hurry. (a little / little)", answer: "little",
    situation: "Waktu kita hampir habis. Gunakan little untuk menyatakan sedikit sekali waktu tersisa. Tulis bagian tentang waktu saja.",
    cues: "we · have · little · time · left",
    variants: ["We have little time left", "We have very little time left"],
    explanation: "Little tanpa a menekankan bahwa waktu hampir tidak ada. Gunakan little dengan time yang tidak dapat dihitung.",
  },
  {
    id: "write-pronouns-his", topic: "pronouns", prompt: "This is ___ jacket. It belongs to Budi. (his / him)", answer: "his",
    situation: "Jaket ini milik Budi. Nyatakan dengan This is dan kata kepunyaan untuk he.",
    cues: "this · be · his · jacket",
    variants: ["This is his jacket"],
    explanation: "His dapat mendahului kata benda untuk menunjukkan milik laki-laki. Him adalah kata ganti objek, sehingga tidak dipakai sebelum jacket.",
  },
  {
    id: "write-pronouns-hers", topic: "pronouns", prompt: "This jacket belongs to Maya. It is ___. (her / hers)", answer: "hers",
    situation: "Jaket ini milik Maya. Gunakan This jacket dan hers.",
    cues: "this jacket · be · hers",
    variants: ["This jacket is hers"],
    explanation: "Hers menggantikan her jacket dan berdiri sendiri. Jangan menambahkan kata benda setelah hers.",
  },
  {
    id: "write-pronouns-ours", topic: "pronouns", prompt: "This house belongs to us. It is ___. (our / ours)", answer: "ours",
    situation: "Rumah ini milik kita. Nyatakan dengan This house dan ours.",
    cues: "this house · be · ours",
    variants: ["This house is ours"],
    explanation: "Ours dapat berdiri sendiri untuk menggantikan our house. Our perlu diikuti kata benda.",
  },
  {
    id: "write-pronouns-him", topic: "pronouns", prompt: "Budi needs help. I will help ___. (he / him)", answer: "him",
    situation: "Anda akan membantu Budi. Gunakan kata ganti objek untuk Budi dengan I will help.",
    cues: "I · will · help · him",
    variants: ["I will help him"],
    explanation: "Setelah kata kerja help gunakan objek him. He digunakan sebagai subjek.",
  },
  {
    id: "write-modals-could", topic: "modals", prompt: "She could ___ when she was five. (swim)", answer: "swim",
    situation: "Dia perempuan sudah bisa berenang saat berusia lima tahun. Gunakan could.",
    cues: "she · could · swim · when she was five",
    variants: ["She could swim when she was five", "When she was five she could swim", "She could swim when she was five years old", "When she was five years old she could swim"],
    explanation: "Could menyatakan kemampuan umum di masa lampau dan diikuti kata kerja dasar swim, tanpa to atau -ed.",
  },
  {
    id: "write-modals-may", topic: "modals", prompt: "He may ___ tomorrow. (come)", answer: "come",
    situation: "Dia laki-laki mungkin datang besok. Gunakan may untuk menyatakan kemungkinan.",
    cues: "he · may · come · tomorrow",
    variants: ["He may come tomorrow", "Tomorrow he may come"],
    explanation: "May menyatakan kemungkinan dan diikuti kata kerja dasar come. Jangan gunakan comes atau to come setelah may.",
  },
  {
    id: "write-modals-must-not", topic: "modals", prompt: "You must ___ touch this wire. (larangan)", answer: "not",
    situation: "Kabel ini berbahaya dan tidak boleh disentuh. Sampaikan larangan dengan must not.",
    cues: "you · must not · touch · this wire",
    variants: ["You must not touch this wire"],
    explanation: "Must not + kata kerja dasar menyatakan larangan. Do not have to berarti tidak wajib, sehingga maknanya berbeda.",
  },
  {
    id: "write-modals-cannot", topic: "modals", prompt: "I ___ open this jar. It is too tight. (cannot / must not)", answer: "cannot",
    situation: "Anda tidak bisa membuka stoples ini karena tutupnya terlalu rapat. Gunakan cannot. Tulis bagian ketidakmampuannya saja.",
    cues: "I · cannot · open · this jar",
    variants: ["I cannot open this jar", "I can not open this jar"],
    explanation: "Cannot menyatakan ketidakmampuan. Setelah cannot gunakan kata kerja dasar open. Must not menyatakan larangan.",
  },
  {
    id: "write-conditionals-third", topic: "conditionals", prompt: "If I ___ studied harder, I would have passed the exam. (had / have)", answer: "had",
    situation: "Anda dahulu tidak belajar lebih giat dan tidak lulus ujian. Bayangkan hasil yang berbeda dengan if I had dan would have.",
    cues: "if I had · study harder · I would have · pass the exam",
    variants: ["If I had studied harder I would have passed the exam", "I would have passed the exam if I had studied harder"],
    explanation: "Third conditional membayangkan masa lalu yang berbeda. Gunakan if + had + V3, lalu would have + V3. Study menjadi studied dan pass menjadi passed.",
  },
  {
    id: "write-conditionals-third-negative", topic: "conditionals", prompt: "If we had left earlier, we would not have ___ the train. (miss)", answer: "missed",
    situation: "Kita ketinggalan kereta karena berangkat terlambat. Bayangkan jika berangkat lebih awal, kita tidak akan ketinggalan kereta. Gunakan third conditional.",
    cues: "if we had · leave earlier · we would not have · miss the train",
    variants: ["If we had left earlier we would not have missed the train", "We would not have missed the train if we had left earlier"],
    explanation: "Kondisi masa lalu memakai had left. Hasil negatifnya memakai would not have missed. Setelah have gunakan V3, bukan miss.",
  },
  {
    id: "write-conditionals-first-negative", topic: "conditionals", prompt: "If it does not rain, we ___ go outside. (will / would)", answer: "will",
    situation: "Jika nanti tidak hujan, kita akan pergi ke luar. Gunakan first conditional dengan will.",
    cues: "if it · not rain · we will · go outside",
    variants: ["If it does not rain we will go outside", "We will go outside if it does not rain"],
    explanation: "First conditional memakai present simple setelah if. Negatifnya does not rain, lalu hasil masa depan memakai will go.",
  },
  {
    id: "write-conditionals-second-negative", topic: "conditionals", prompt: "If I were you, I ___ not buy that car. (would / will)", answer: "would",
    situation: "Anda menyarankan agar teman tidak membeli mobil itu. Gunakan If I were you dan would not.",
    cues: "if I were you · I would not · buy that car",
    variants: ["If I were you I would not buy that car", "I would not buy that car if I were you"],
    explanation: "If I were you adalah pengandaian untuk memberi saran. Hasil negatifnya memakai would not + kata kerja dasar buy.",
  },
  {
    id: "write-comparatives-as", topic: "comparatives", prompt: "Rina is as tall ___ Maya. (as / than)", answer: "as",
    situation: "Rina sama tingginya dengan Maya. Gunakan pola as ... as dengan tall.",
    cues: "Rina · be · as tall as · Maya",
    variants: ["Rina is as tall as Maya"],
    explanation: "Perbandingan setara memakai as + kata sifat dasar + as. Gunakan as tall as, tanpa taller atau than.",
  },
  {
    id: "write-comparatives-less", topic: "comparatives", prompt: "This bag is ___ expensive than that one. (lebih murah, gunakan less / least)", answer: "less",
    situation: "Tas ini lebih murah daripada tas itu. Gunakan expensive dengan less.",
    cues: "this bag · be · less expensive · than · that one",
    variants: ["This bag is less expensive than that one", "This bag is less expensive than that bag"],
    explanation: "Less + kata sifat + than menyatakan tingkat yang lebih rendah. Least digunakan untuk bentuk superlatif.",
  },
  {
    id: "write-relatives-whose", topic: "relatives", prompt: "The boy ___ bike is red is my brother. (whose / who)", answer: "whose",
    situation: "Anak laki-laki yang sepedanya merah adalah saudara laki-laki Anda. Gabungkan informasinya dengan whose.",
    cues: "the boy · whose bike is red · be · my brother",
    variants: ["The boy whose bike is red is my brother"],
    explanation: "Whose menunjukkan kepemilikan dan diikuti kata benda bike. Who menggantikan orang sebagai subjek atau objek.",
  },
  {
    id: "write-relatives-which", topic: "relatives", prompt: "The bus ___ stops here goes to the station. (which / who)", answer: "which",
    situation: "Bus yang berhenti di sini menuju stasiun. Hubungkan informasi tentang bus dengan which.",
    cues: "the bus · which stops here · go · to the station",
    variants: ["The bus which stops here goes to the station"],
    explanation: "Which menjelaskan benda seperti bus. Bus tunggal memakai stops dan goes.",
  },
  {
    id: "write-conjunctions-although", topic: "conjunctions", prompt: "___ it was raining, we went outside. (although / because)", answer: "although",
    situation: "Meskipun saat itu hujan, kita pergi ke luar. Gunakan although dan bentuk lampau.",
    cues: "although · it was raining · we · go outside",
    variants: ["Although it was raining we went outside", "We went outside although it was raining"],
    explanation: "Although memperkenalkan keadaan yang berlawanan dengan hasilnya. Tidak perlu menambahkan but dalam kalimat yang sama.",
  },
  {
    id: "write-conjunctions-unless", topic: "conjunctions", prompt: "You will miss the bus ___ you hurry. (unless / because)", answer: "unless",
    situation: "Teman akan ketinggalan bus kecuali ia bergegas. Gunakan unless dan will.",
    cues: "you will · miss the bus · unless · you hurry",
    variants: ["You will miss the bus unless you hurry", "Unless you hurry you will miss the bus"],
    explanation: "Unless berarti if not. Gunakan present simple setelah unless, sehingga cukup you hurry tanpa will atau tambahan not.",
  },
  {
    id: "write-plurals-uncountable", topic: "plurals", prompt: "This information ___ useful. (is / are)", answer: "is",
    situation: "Informasi ini berguna. Nyatakan dengan This information dan useful.",
    cues: "this information · be · useful",
    variants: ["This information is useful"],
    explanation: "Information tidak dapat dihitung dalam penggunaan ini. Bentuknya tetap information dan memakai is, tanpa akhiran -s.",
  },
  {
    id: "write-collocations-attention", topic: "collocations", prompt: "Please ___ attention to the instructions. (pay / make)", answer: "pay",
    situation: "Mintalah teman memperhatikan instruksi dengan sopan. Gunakan Please dan pay attention.",
    cues: "please · pay attention · to the instructions",
    variants: ["Please pay attention to the instructions", "Pay attention to the instructions please"],
    explanation: "Pasangan kata yang alami adalah pay attention to. Jangan gunakan make attention atau menghilangkan to sebelum objek.",
  },
];

export function checkTopicWriting(lesson: TopicWritingLesson, input: string): WritingResult {
  if (!input.trim()) return { status: "empty", message: "Tulis kalimat Anda terlebih dahulu." };
  const accepted = new Set(lesson.variants.map(normalize));
  // In third conditionals, 'd can mean had and would in the same sentence.
  // Resolve 'd have first so the remaining contraction can expand to had.
  const contextualInput = input.replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/(\w)'d(?=\s+have\b)/gi, "$1 would");
  if (expandVariants(contextualInput).some(value => accepted.has(value))) {
    return { status: "correct", message: lesson.explanation };
  }
  return {
    status: "retry",
    message: `Kalimat ini belum cocok dengan pola dan kata panduan latihan. ${lesson.explanation} Periksa juga subjek dan informasi situasinya.`,
  };
}
