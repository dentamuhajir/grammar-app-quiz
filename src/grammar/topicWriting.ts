import { BASICS_LABELS } from "./labels";
import { expandVariants, normalize } from "./check/normalize";
import type { WritingResult } from "./writingPacks";
import { PATTERN_LESSONS } from "./patternLessons";

type NewWritingTopic = Exclude<keyof typeof BASICS_LABELS, "articles" | "prepositions" | "habits">;

export interface TopicWritingLesson {
  id: string;
  topic: NewWritingTopic;
  prompt: string;
  cue?: string;
  context?: string;
  hint?: string;
  answer: string;
  acceptedAnswers?: string[];
  situation: string;
  cues: string;
  variants: string[];
  writingExplanation: string;
  explanation: string;
}

const QUESTION_SITUATIONS = [
  [
    "Tanyakan di mana Olivia bekerja. Gunakan work.",
    "Where does Olivia work?"
  ],
  [
    "Tanyakan ke mana Emma pergi kemarin. Gunakan go.",
    "Where did Emma go yesterday?"
  ],
  [
    "Tanyakan apakah Daniel siap.",
    "Is Daniel ready?"
  ],
  [
    "Tanyakan apa yang sedang Olivia lakukan.",
    "What is Olivia doing?"
  ],
  [
    "Tanyakan siapa yang Emma telepon kemarin. Gunakan call.",
    "Who did Emma call yesterday?"
  ],
  [
    "Tanyakan siapa yang menelepon Emma kemarin. Gunakan call.",
    "Who called Emma yesterday?"
  ],
  [
    "Tanyakan siapa yang sedang Olivia tunggu. Gunakan wait for.",
    "Who is Olivia waiting for?"
  ],
  [
    "Tanyakan apa yang sedang Daniel dengarkan. Gunakan listen to.",
    "What is Daniel listening to?"
  ],
  [
    "Tanyakan apa yang Emma dan Daniel bicarakan kemarin. Gunakan talk about.",
    "What did Emma and Daniel talk about yesterday?"
  ],
  [
    "Tanyakan berapa banyak buku yang Emma butuhkan. Gunakan need.",
    "How many books does Emma need?"
  ],
  [
    "Tanyakan berapa banyak air yang Daniel butuhkan. Gunakan need.",
    "How much water does Daniel need?"
  ],
  [
    "Tanyakan dengan sopan di mana Olivia bekerja. Gunakan Could you tell me dan work.",
    "Could you tell me where Olivia works?"
  ]
];

const QUESTION_LESSONS: TopicWritingLesson[] = [
    ["Where ___ she work?", "does", "Does digunakan dengan she, lalu kata kerja berbentuk dasar."] ,
    ["Where did they ___ yesterday?", "go", "Setelah did, gunakan bentuk dasar go."] ,
    ["___ you ready?", "are", "Pada pertanyaan dengan be, are berada sebelum you."] ,
    ["What ___ he doing?", "is", "Present continuous memakai is sebelum subjek he dan doing setelahnya."] ,
    ["Who ___ you call yesterday?", "did", "Who adalah objek. Gunakan did sebelum you dan call."] ,
    ["Who ___ you yesterday? (call)", "called", "Who adalah subjek, sehingga gunakan called tanpa did."] ,
    ["Who are you waiting ___?", "for", "Wait for berarti menunggu. For dapat berada di akhir pertanyaan."] ,
    ["What are you listening ___?", "to", "Listen to berarti mendengarkan. To dapat berada di akhir pertanyaan."] ,
    ["What did they talk ___?", "about", "Talk about digunakan untuk membicarakan suatu topik."] ,
    ["How ___ books do you need?", "many", "Gunakan how many untuk benda yang dapat dihitung dalam bentuk jamak."] ,
    ["How ___ water do you need?", "much", "Gunakan how much untuk kata benda yang tidak dapat dihitung seperti water."] ,
    ["Could you tell me where she ___? (work)", "works", "Dalam indirect question, gunakan urutan subjek lalu kata kerja: where she works."] ,

].map(([prompt, answer, explanation], index) => ({
  id: `question-formation-${index}`, topic: "questions", prompt, answer, explanation,
  situation: QUESTION_SITUATIONS[index][0], cues: "",
  variants: [QUESTION_SITUATIONS[index][1]], writingExplanation: explanation,
}));

// Each situation has an explicit meaning and word guide, so local checking can
// accept curated alternatives without accepting unrelated grammatical sentences.
export const TOPIC_WRITING_LESSONS: TopicWritingLesson[] = [
  {
    id: "write-plurals-books", topic: "plurals", prompt: "I have two ___.", answer: "books",
    situation: "Emma memiliki tiga buku. Nyatakan dengan Emma dan have.",
    cues: "Emma · have · three · book",
    variants: ["Emma has three books", "Emma has got three books"],
    writingExplanation: "Three membutuhkan books. Emma adalah subjek tunggal sehingga have menjadi has.",
    explanation: "Two menunjukkan lebih dari satu. Book mendapat akhiran -s menjadi books.",
  },
  {
    id: "write-plurals-children", topic: "plurals", prompt: "Three ___ are playing.", answer: "children",
    situation: "Dua anak sedang membaca. Gunakan read dalam bentuk sedang berlangsung.",
    cues: "two · child · read",
    variants: ["Two children are reading", "There are two children reading"],
    writingExplanation: "Child berbentuk jamak children. Dua anak memakai are reading.",
    explanation: "Bentuk jamak child adalah children. Subjek jamak memakai are playing.",
  },
  {
    id: "write-plurals-boxes", topic: "plurals", prompt: "There are five ___ here.", answer: "boxes",
    situation: "Ada empat kotak di dekat pintu. Gunakan There are.",
    cues: "there are · four · box · near the door",
    variants: ["There are four boxes near the door", "Near the door there are four boxes"],
    writingExplanation: "Box menjadi boxes. Empat kotak memakai there are.",
    explanation: "Box berakhiran -x, sehingga bentuk jamaknya memakai -es menjadi boxes.",
  },
  {
    id: "write-pronouns-her", topic: "pronouns", prompt: "This is ___ bag. It belongs to Maya.", answer: "her",
    situation: "Sepeda ini milik Olivia. Tunjukkan dengan This is dan kata kepunyaan untuk she.",
    cues: "this · be · her · bicycle",
    variants: ["This is her bicycle", "This is her bike"],
    writingExplanation: "Her menunjukkan pemilik dan diikuti kata benda bicycle atau bike.",
    explanation: "Her diletakkan sebelum kata benda bag untuk menunjukkan pemiliknya.",
  },
  {
    id: "write-pronouns-mine", topic: "pronouns", prompt: "This book belongs to me. It is ___.", answer: "mine",
    situation: "Payung ini milik Anda. Gunakan This umbrella dan mine.",
    cues: "this umbrella · be · mine",
    variants: ["This umbrella is mine"],
    writingExplanation: "Mine menggantikan my umbrella dan dapat berdiri sendiri.",
    explanation: "Mine menggantikan my book, sehingga tidak diikuti kata benda lagi.",
  },
  {
    id: "write-pronouns-them", topic: "pronouns", prompt: "I see my friends. I wave to ___.", answer: "them",
    situation: "Anda mendengarkan teman-teman. Ganti teman-teman dengan kata ganti objek.",
    cues: "I · listen · to · them",
    variants: ["I listen to them", "I am listening to them"],
    writingExplanation: "Setelah listen to gunakan objek them untuk menggantikan teman-teman.",
    explanation: "Setelah to gunakan bentuk objek them untuk menggantikan they.",
  },
  {
    id: "write-quantifiers-much", topic: "quantifiers", prompt: "I do not have ___ time.", answer: "much",
    situation: "Uang Anda tidak banyak. Gunakan I, have, dan much dalam kalimat negatif.",
    cues: "I · not have · much · money",
    variants: ["I do not have much money", "I have not got much money"],
    writingExplanation: "Money tidak dapat dihitung dalam makna ini. Gunakan much money pada kalimat negatif.",
    explanation: "Time tidak dapat dihitung dalam makna ini. Gunakan much dalam kalimat negatif.",
  },
  {
    id: "write-quantifiers-many", topic: "quantifiers", prompt: "How ___ apples do you need?", answer: "many",
    situation: "Tanyakan berapa banyak buku catatan yang dibutuhkan teman.",
    cues: "how many · notebook · you · need",
    variants: ["How many notebooks do you need"],
    writingExplanation: "Notebook dapat dihitung. Gunakan how many notebooks dengan do you need.",
    explanation: "Apel dapat dihitung. Gunakan how many dengan bentuk jamak apples dan do you need.",
  },
  {
    id: "write-quantifiers-some", topic: "quantifiers", prompt: "There is ___ water in the bottle.", answer: "some",
    situation: "Ada sedikit susu di dalam kulkas. Gunakan There is dan some.",
    cues: "there is · some · milk · in the fridge",
    variants: ["There is some milk in the fridge", "In the fridge there is some milk", "There is some milk in the refrigerator"],
    writingExplanation: "Milk tidak dapat dihitung dalam makna ini. Gunakan there is some milk.",
    explanation: "Water memakai there is. Some menyatakan jumlah yang tidak ditentukan.",
  },
  {
    id: "write-comparatives-taller", topic: "comparatives", prompt: "Maya is ___ than Rina. (tall)", answer: "taller",
    situation: "James lebih tinggi daripada Daniel. Bandingkan dengan tall.",
    cues: "James · be · tall · than · Daniel",
    variants: ["James is taller than Daniel"],
    writingExplanation: "Untuk membandingkan tinggi dua orang, gunakan taller than.",
    explanation: "Tall menjadi taller untuk membandingkan dua orang, diikuti than.",
  },
  {
    id: "write-comparatives-interesting", topic: "comparatives", prompt: "This book is ___ interesting than that one.", answer: "more",
    situation: "Film ini lebih menarik daripada film itu. Gunakan interesting dan that film atau that one.",
    cues: "this film · be · interesting · than · that one",
    variants: ["This film is more interesting than that one", "This film is more interesting than that film", "This movie is more interesting than that one", "This movie is more interesting than that movie"],
    writingExplanation: "Interesting memakai more untuk perbandingan. Tambahkan than sebelum pembandingnya.",
    explanation: "Interesting memakai more untuk bentuk perbandingan.",
  },
  {
    id: "write-comparatives-best", topic: "comparatives", prompt: "This is the ___ cafe in town. (good)", answer: "best",
    situation: "Ini restoran terbaik di kota. Gunakan This is dan bentuk superlatif good.",
    cues: "this · be · good · restaurant · in town",
    variants: ["This is the best restaurant in town"],
    writingExplanation: "Superlatif good adalah the best. Gunakan the best restaurant.",
    explanation: "Bentuk superlatif good adalah the best.",
  },
  {
    id: "write-adjectives-carefully", topic: "adjectives", prompt: "She drives ___. (careful)", answer: "carefully",
    situation: "Dia laki-laki berjalan dengan hati-hati sebagai kebiasaan.",
    cues: "he · walk · carefully",
    variants: ["He walks carefully"],
    writingExplanation: "Carefully menjelaskan cara berjalan. He memakai walks dalam present simple.",
    explanation: "Carefully menjelaskan cara melakukan drive. She memakai drives dalam present simple.",
  },
  {
    id: "write-adjectives-tired", topic: "adjectives", prompt: "I feel ___. (tired · tiring)", answer: "tired",
    situation: "Kita merasa lelah sekarang. Nyatakan dengan We feel.",
    cues: "we · feel · tired",
    variants: ["We feel tired", "We are feeling tired"],
    writingExplanation: "Tired adalah kata sifat yang menggambarkan perasaan. Gunakan feel tired.",
    explanation: "Tired menggambarkan perasaan orang. Setelah feel gunakan kata sifat.",
  },
  {
    id: "write-adjectives-delicious", topic: "adjectives", prompt: "The soup tastes ___. (delicious · deliciously)", answer: "delicious",
    situation: "Kue itu terasa lezat. Gunakan The cake dan taste.",
    cues: "the cake · taste · delicious",
    variants: ["The cake tastes delicious"],
    writingExplanation: "Taste menghubungkan cake dengan kata sifat delicious. Cake tunggal memakai tastes.",
    explanation: "Taste sebagai linking verb diikuti kata sifat delicious untuk menjelaskan sup.",
  },
  {
    id: "write-relatives-who", topic: "relatives", prompt: "The woman ___ lives next door is a doctor.", answer: "who",
    situation: "Laki-laki yang bekerja di perpustakaan adalah guru. Gabungkan informasinya dengan who.",
    cues: "the man · who · work at the library · be a teacher",
    variants: ["The man who works at the library is a teacher", "The man who works in the library is a teacher"],
    writingExplanation: "Who menjelaskan the man. Subjek tunggal memakai works dan is.",
    explanation: "Who menjelaskan orang. The woman tunggal memakai lives dan is.",
  },
  {
    id: "write-relatives-that", topic: "relatives", prompt: "This is the book ___ I bought yesterday.", answer: "that",
    situation: "Ini ponsel yang dia perempuan beli minggu lalu. Gunakan that.",
    cues: "this is the phone · that · she · buy · last week",
    variants: ["This is the phone that she bought last week", "This is the phone that she purchased last week"],
    writingExplanation: "That menghubungkan phone dengan she bought last week. Buy menjadi bought pada masa lampau.",
    explanation: "That menghubungkan book dengan I bought yesterday. Kemarin memakai bentuk lampau bought.",
  },
  {
    id: "write-relatives-where", topic: "relatives", prompt: "This is the cafe ___ we met.", answer: "where",
    situation: "Ini sekolah tempat kita dahulu belajar. Gunakan where dan studied.",
    cues: "this is the school · where · we · study",
    variants: ["This is the school where we studied"],
    writingExplanation: "Where menghubungkan school dengan kegiatan di tempat tersebut. Belajar dahulu memakai studied.",
    explanation: "Where menghubungkan tempat dengan kejadian di tempat itu.",
  },
  {
    id: "write-modals-rest", topic: "modals", prompt: "You ___ get some rest. (advice)", answer: "should",
    situation: "Teman laki-laki Anda lelah. Sarankan agar ia beristirahat. Bicarakan dia dengan He dan should.",
    cues: "he · should · rest",
    variants: ["He should rest", "He should get some rest", "He should take a rest", "He should have a rest"],
    writingExplanation: "Should diikuti kata kerja dasar. He tetap memakai should rest tanpa akhiran -s.",
    explanation: "Should untuk saran diikuti kata kerja dasar, seperti rest atau get.",
  },
  {
    id: "write-modals-swim", topic: "modals", prompt: "I ___ swim. (ability)", answer: "can",
    situation: "Dia perempuan bisa berenang dengan baik. Gunakan can.",
    cues: "she · can · swim · well",
    variants: ["She can swim well"],
    writingExplanation: "Setelah can gunakan kata kerja dasar swim. Well menjelaskan kemampuan berenangnya.",
    explanation: "Can menunjukkan kemampuan dan diikuti kata kerja dasar swim.",
  },
  {
    id: "write-modals-seatbelt", topic: "modals", prompt: "You ___ wear a seat belt. (strong obligation)", answer: "must",
    situation: "Kita wajib memakai helm. Gunakan We dan must.",
    cues: "we · must · wear · helmets",
    variants: ["We must wear helmets", "We must wear our helmets"],
    writingExplanation: "Must diikuti wear. Helmets berbentuk jamak untuk orang-orang yang memakai helm.",
    explanation: "Must menyatakan kewajiban kuat dan diikuti wear tanpa to.",
  },
  {
    id: "write-conjunctions-because", topic: "conjunctions", prompt: "I stayed home ___ I was sick.", answer: "because",
    situation: "Dia perempuan tinggal di rumah karena lelah. Gunakan because dan bentuk lampau.",
    cues: "she · stay home · because · she · be tired",
    variants: ["She stayed home because she was tired", "She stayed at home because she was tired", "Because she was tired she stayed home", "Because she was tired she stayed at home"],
    writingExplanation: "Because menghubungkan kejadian dengan alasannya. Gunakan stayed dan was untuk masa lampau.",
    explanation: "Because menghubungkan kejadian dengan alasannya. Stay dan be berubah menjadi stayed dan was.",
  },
  {
    id: "write-conjunctions-but", topic: "conjunctions", prompt: "I was tired, ___ I finished my homework.", answer: "but",
    situation: "Kita lapar tetapi tetap melanjutkan bekerja. Gunakan but dan bentuk lampau.",
    cues: "we · be hungry · but · continue working",
    variants: ["We were hungry but we continued working", "We were hungry but continued working"],
    writingExplanation: "But menghubungkan dua keadaan yang berlawanan harapan. We memakai were dan continue menjadi continued.",
    explanation: "But menghubungkan dua hal yang berlawanan harapan.",
  },
  {
    id: "write-conjunctions-so", topic: "conjunctions", prompt: "It was raining, ___ we stayed home.", answer: "so",
    situation: "Saat itu dingin, jadi Anda menutup jendela. Gunakan so dan bentuk lampau.",
    cues: "it · be cold · so · I · close the window",
    variants: ["It was cold so I closed the window"],
    writingExplanation: "So memperkenalkan akibat. Gunakan was cold dan closed the window untuk masa lampau.",
    explanation: "So memperkenalkan akibat. We stayed home adalah akibat dari hujan.",
  },
  {
    id: "write-conditionals-rain", topic: "conditionals", prompt: "If it rains, I ___ stay home.", answer: "will",
    situation: "Jika hujan, Emma akan naik bus. Gunakan if dan will.",
    cues: "if · it rain · Emma will · take the bus",
    variants: ["If it rains Emma will take the bus", "Emma will take the bus if it rains"],
    writingExplanation: "Setelah if gunakan present simple rains. Bagian hasil memakai will take.",
    explanation: "First conditional memakai if + present simple, lalu will + kata kerja dasar.",
  },
  {
    id: "write-conditionals-rich", topic: "conditionals", prompt: "If I were rich, I ___ travel the world.", answer: "would",
    situation: "Bayangkan dia laki-laki kaya. Ia akan membeli rumah. Gunakan if he were dan would.",
    cues: "if he were rich · he would · buy a house",
    variants: ["If he were rich he would buy a house", "He would buy a house if he were rich"],
    writingExplanation: "Second conditional memakai if + were dan would + kata kerja dasar buy untuk pengandaian.",
    explanation: "Second conditional memakai if + bentuk lampau dan would + kata kerja dasar untuk pengandaian.",
  },
  {
    id: "write-conditionals-ice", topic: "conditionals", prompt: "If you heat ice, it ___. (melt)", answer: "melts",
    situation: "Mentega mencair jika dipanaskan. Nyatakan fakta umum dengan if dan you heat butter.",
    cues: "if · you heat butter · it melt",
    variants: ["If you heat butter it melts", "It melts if you heat butter"],
    writingExplanation: "Zero conditional memakai present simple di kedua bagian. It memakai melts.",
    explanation: "Zero conditional memakai present simple di kedua bagian. It memakai melts.",
  },
  {
    id: "write-collocations-decision", topic: "collocations", prompt: "We need to ___ a decision.", answer: "make",
    situation: "Olivia sedang memilih antara dua tawaran pekerjaan. Jelaskan bahwa ia perlu mengambil keputusan sebelum Jumat. Gunakan need to dan decision.",
    cues: "Olivia · need to · decision · before Friday",
    variants: ["Olivia needs to make a decision before Friday", "Before Friday Olivia needs to make a decision"],
    writingExplanation: "Pasangan katanya make a decision. Olivia adalah subjek tunggal sehingga need menjadi needs. Setelah to gunakan make.",
    explanation: "Pasangan kata yang digunakan adalah make a decision.",
  },
  {
    id: "write-collocations-homework", topic: "collocations", prompt: "I ___ my homework every evening.", answer: "do",
    situation: "Mereka mengerjakan PR setelah pulang sekolah. Ceritakan kebiasaan dengan They.",
    cues: "they · do · their homework · after school",
    variants: ["They do their homework after school", "After school they do their homework"],
    writingExplanation: "Gunakan do their homework. They memakai do dan kata kepunyaan their.",
    explanation: "Gunakan do my homework untuk mengerjakan PR.",
  },
  {
    id: "write-collocations-break", topic: "collocations", prompt: "Let us ___ a break.", answer: "take",
    situation: "Ajak teman beristirahat setelah rapat. Gunakan Let's dan take.",
    cues: "let us · take · a break · after the meeting",
    variants: ["Let us take a break after the meeting", "Let's take a break after the meeting", "After the meeting let us take a break", "After the meeting let's take a break"],
    writingExplanation: "Take a break berarti beristirahat. Tambahkan after the meeting sesuai situasi.",
    explanation: "Take a break berarti beristirahat sebentar. Setelah let's gunakan kata kerja dasar.",
  },
  {
    id: "write-gerunds-enjoy", topic: "gerunds", prompt: "She enjoys ___ books. (read)", answer: "reading",
    situation: "Mereka suka memasak makan malam. Gunakan enjoy dalam present simple.",
    cues: "they · enjoy · cook · dinner",
    variants: ["They enjoy cooking dinner"],
    writingExplanation: "Enjoy diikuti V-ing, sehingga cook menjadi cooking. They memakai enjoy.",
    explanation: "Enjoy diikuti V-ing, sehingga read menjadi reading. Subjek she memakai enjoys. Hindari enjoys to read.",
  },
  {
    id: "write-gerunds-want", topic: "gerunds", prompt: "I want ___ English. (learn)", answer: "to learn",
    situation: "Dia perempuan ingin mengunjungi London. Gunakan want dan visit.",
    cues: "she · want · visit · London",
    variants: ["She wants to visit London"],
    writingExplanation: "Want diikuti to + V1. She memakai wants, sehingga kalimatnya memakai wants to visit.",
    explanation: "Want diikuti to + kata kerja dasar. Gunakan want to learn, bukan want learning.",
  },
  {
    id: "write-gerunds-avoid", topic: "gerunds", prompt: "We avoid ___ during meetings. (talk)", answer: "talking",
    situation: "Anda menghindari mengemudi pada malam hari. Gunakan I dan avoid.",
    cues: "I · avoid · drive · at night",
    variants: ["I avoid driving at night", "At night I avoid driving"],
    writingExplanation: "Avoid diikuti V-ing. Drive berubah menjadi driving dengan menghapus -e.",
    explanation: "Avoid diikuti V-ing. Gunakan avoid talking, bukan avoid to talk.",
  },
  {
    id: "write-gerunds-decide", topic: "gerunds", prompt: "They decided ___ early. (leave)", answer: "to leave",
    situation: "Kita memutuskan tinggal di rumah. Ceritakan keputusan lampau dengan decide.",
    cues: "we · decide · stay home",
    variants: ["We decided to stay home", "We decided to stay at home"],
    writingExplanation: "Decide diikuti to + V1. Keputusan lampau memakai decided to stay.",
    explanation: "Decide diikuti to + kata kerja dasar. Untuk keputusan lampau gunakan decided to leave.",
  },
  {
    id: "write-gerunds-finish", topic: "gerunds", prompt: "I finished ___ the report yesterday. (write)", answer: "writing",
    situation: "Dia perempuan selesai membersihkan dapur kemarin. Gunakan finish dan clean.",
    cues: "she · finish · clean · the kitchen · yesterday",
    variants: ["She finished cleaning the kitchen yesterday", "Yesterday she finished cleaning the kitchen"],
    writingExplanation: "Finish diikuti V-ing. Masa lampau memakai finished cleaning.",
    explanation: "Finish diikuti V-ing. Write berubah menjadi writing dengan menghapus -e. Yesterday memakai finished.",
  },
  {
    id: "write-gerunds-hope", topic: "gerunds", prompt: "We hope ___ you soon. (see)", answer: "to see",
    situation: "Anda berharap bisa segera mengunjungi teman yang diajak bicara. Gunakan I, hope, dan visit.",
    cues: "I · hope · visit · you · soon",
    variants: ["I hope to visit you soon"],
    writingExplanation: "Hope diikuti to + kata kerja dasar. Gunakan hope to visit.",
    explanation: "Hope diikuti to + kata kerja dasar. Gunakan hope to see, bukan hope seeing.",
  },
  {
    id: "write-quantifiers-a-few", topic: "quantifiers", prompt: "I have ___ friends here, so I have someone to talk to. (a few · few)", answer: "a few",
    situation: "Kita punya beberapa pertanyaan untuk diajukan. Gunakan We dan a few. Tulis bagian tentang pertanyaan saja.",
    cues: "we · have · a few · questions",
    variants: ["We have a few questions", "We have got a few questions"],
    writingExplanation: "A few diikuti kata benda jamak yang dapat dihitung. A few questions berarti ada beberapa pertanyaan.",
    explanation: "A few dipakai dengan kata benda jamak yang dapat dihitung. Maknanya ada beberapa. Few menekankan hampir tidak ada.",
  },
  {
    id: "write-quantifiers-few", topic: "quantifiers", prompt: "I have ___ friends here, so I often feel lonely. (a few · few)", answer: "few",
    situation: "Hanya sedikit siswa memahami pelajaran itu. Gunakan Few di awal kalimat dan bentuk lampau.",
    cues: "few · students · understand · the lesson",
    variants: ["Few students understood the lesson", "Very few students understood the lesson"],
    writingExplanation: "Few menekankan jumlah yang sangat sedikit. Understand menjadi understood dalam bentuk lampau.",
    explanation: "Few tanpa a menekankan jumlah yang sangat sedikit pada kata benda jamak. A few memberi makna masih ada beberapa.",
  },
  {
    id: "write-quantifiers-a-little", topic: "quantifiers", prompt: "We have ___ time left, enough for a quick chat. (a little · little)", answer: "a little",
    situation: "Dia perempuan masih punya sedikit uang tersisa. Gunakan She dan a little.",
    cues: "she · have · a little · money · left",
    variants: ["She has a little money left", "She still has a little money left"],
    writingExplanation: "Money tidak dapat dihitung. A little berarti masih ada sedikit. She memakai has.",
    explanation: "Time tidak dapat dihitung dalam makna ini. A little menyatakan masih ada sedikit, sedangkan little menekankan hampir tidak ada.",
  },
  {
    id: "write-quantifiers-little", topic: "quantifiers", prompt: "We have ___ time left, so we must hurry. (a little · little)", answer: "little",
    situation: "Air yang tersisa hampir habis. Gunakan There is dan little.",
    cues: "there is · little · water · left",
    variants: ["There is little water left", "There is very little water left"],
    writingExplanation: "Little tanpa a menekankan bahwa air hampir tidak ada. Water memakai there is.",
    explanation: "Little tanpa a menekankan bahwa waktu hampir tidak ada. Gunakan little dengan time yang tidak dapat dihitung.",
  },
  {
    id: "write-pronouns-his", topic: "pronouns", prompt: "This is ___ jacket. It belongs to Budi. (his · him)", answer: "his",
    situation: "Buku catatan ini milik James. Gunakan This is dan kata kepunyaan untuk he.",
    cues: "this · be · his · notebook",
    variants: ["This is his notebook"],
    writingExplanation: "His menunjukkan kepunyaan dan diikuti notebook.",
    explanation: "His dapat mendahului kata benda untuk menunjukkan milik laki-laki. Him adalah kata ganti objek, sehingga tidak dipakai sebelum jacket.",
  },
  {
    id: "write-pronouns-hers", topic: "pronouns", prompt: "This jacket belongs to Maya. It is ___. (her · hers)", answer: "hers",
    situation: "Sepeda ini milik Emma. Gunakan This bicycle dan hers.",
    cues: "this bicycle · be · hers",
    variants: ["This bicycle is hers", "This bike is hers"],
    writingExplanation: "Hers menggantikan her bicycle dan berdiri sendiri setelah is.",
    explanation: "Hers menggantikan her jacket dan berdiri sendiri. Jangan menambahkan kata benda setelah hers.",
  },
  {
    id: "write-pronouns-ours", topic: "pronouns", prompt: "This house belongs to us. It is ___. (our · ours)", answer: "ours",
    situation: "Kursi-kursi ini milik kita. Gunakan These seats dan ours.",
    cues: "these seats · be · ours",
    variants: ["These seats are ours"],
    writingExplanation: "These seats adalah subjek jamak sehingga memakai are. Ours menggantikan our seats.",
    explanation: "Ours dapat berdiri sendiri untuk menggantikan our house. Our perlu diikuti kata benda.",
  },
  {
    id: "write-pronouns-him", topic: "pronouns", prompt: "Budi needs help. I will help ___. (he · him)", answer: "him",
    situation: "Kita mengundang James kemarin. Ganti James dengan kata ganti objek dan gunakan We.",
    cues: "we · invite · him · yesterday",
    variants: ["We invited him yesterday", "Yesterday we invited him"],
    writingExplanation: "Objek laki-laki memakai him. Invite menjadi invited untuk kejadian kemarin.",
    explanation: "Setelah kata kerja help gunakan objek him. He digunakan sebagai subjek.",
  },
  {
    id: "write-modals-could", topic: "modals", prompt: "She could ___ when she was five. (swim)", answer: "swim",
    situation: "Anda sudah bisa bersepeda saat berusia tujuh tahun. Gunakan I dan could.",
    cues: "I · could · ride a bike · when I was seven",
    variants: ["I could ride a bike when I was seven", "When I was seven I could ride a bike", "I could ride a bicycle when I was seven", "I could ride a bike when I was seven years old"],
    writingExplanation: "Could menyatakan kemampuan umum di masa lampau dan diikuti ride dalam bentuk dasar.",
    explanation: "Could menyatakan kemampuan umum di masa lampau dan diikuti kata kerja dasar swim, tanpa to atau -ed.",
  },
  {
    id: "write-modals-may", topic: "modals", prompt: "He may ___ tomorrow. (come)", answer: "come",
    situation: "Mereka mungkin tiba terlambat. Gunakan They dan may.",
    cues: "they · may · arrive · late",
    variants: ["They may arrive late"],
    writingExplanation: "May menyatakan kemungkinan dan diikuti kata kerja dasar arrive.",
    explanation: "May menyatakan kemungkinan dan diikuti kata kerja dasar come. Jangan gunakan comes atau to come setelah may.",
  },
  {
    id: "write-modals-must-not", topic: "modals", prompt: "You must ___ touch this wire. (larangan)", answer: "not",
    situation: "Tempat ini melarang parkir. Sampaikan kepada teman dengan You must not.",
    cues: "you · must not · park · here",
    variants: ["You must not park here"],
    writingExplanation: "Must not park menyatakan larangan parkir. Setelah modal gunakan park dalam bentuk dasar.",
    explanation: "Must not + kata kerja dasar menyatakan larangan. Do not have to berarti tidak wajib, sehingga maknanya berbeda.",
  },
  {
    id: "write-modals-cannot", topic: "modals", prompt: "I ___ open this jar. It is too tight. (cannot · must not)", answer: "cannot",
    situation: "Dia perempuan tidak bisa menjangkau rak itu. Gunakan She dan cannot.",
    cues: "she · cannot · reach · the shelf",
    variants: ["She cannot reach the shelf", "She can not reach the shelf"],
    writingExplanation: "Cannot menyatakan ketidakmampuan dan diikuti reach dalam bentuk dasar.",
    explanation: "Cannot menyatakan ketidakmampuan. Setelah cannot gunakan kata kerja dasar open. Must not menyatakan larangan.",
  },
  {
    id: "write-conditionals-third", topic: "conditionals", prompt: "If I ___ studied harder, I would have passed the exam. (had · have)", answer: "had",
    situation: "Dia perempuan dahulu ketinggalan bus. Bayangkan jika ia berangkat lebih awal, ia akan sempat naik bus. Gunakan third conditional.",
    cues: "if she had · leave earlier · she would have · catch the bus",
    variants: ["If she had left earlier she would have caught the bus", "She would have caught the bus if she had left earlier"],
    writingExplanation: "Kondisi masa lalu memakai had left. Hasil pengandaian memakai would have caught. Left dan caught adalah V3.",
    explanation: "Third conditional membayangkan masa lalu yang berbeda. Gunakan if + had + V3, lalu would have + V3. Study menjadi studied dan pass menjadi passed.",
  },
  {
    id: "write-conditionals-third-negative", topic: "conditionals", prompt: "If we had left earlier, we would not have ___ the train. (miss)", answer: "missed",
    situation: "Anda dahulu terlambat karena tidak memasang alarm. Bayangkan jika memasang alarm, Anda tidak akan terlambat. Gunakan third conditional.",
    cues: "if I had · set the alarm · I would not have · be late",
    variants: ["If I had set the alarm I would not have been late", "I would not have been late if I had set the alarm"],
    writingExplanation: "Gunakan had set untuk kondisi lampau. Hasil negatif memakai would not have been late.",
    explanation: "Kondisi masa lalu memakai had left. Hasil negatifnya memakai would not have missed. Setelah have gunakan V3, bukan miss.",
  },
  {
    id: "write-conditionals-first-negative", topic: "conditionals", prompt: "If it does not rain, we ___ go outside. (will · would)", answer: "will",
    situation: "Jika kita tidak bergegas, kita akan ketinggalan bus. Gunakan if dan will.",
    cues: "if we · not hurry · we will · miss the bus",
    variants: ["If we do not hurry we will miss the bus", "We will miss the bus if we do not hurry"],
    writingExplanation: "Negatif present simple untuk we adalah do not hurry. Bagian hasil memakai will miss.",
    explanation: "First conditional memakai present simple setelah if. Negatifnya does not rain, lalu hasil masa depan memakai will go.",
  },
  {
    id: "write-conditionals-second-negative", topic: "conditionals", prompt: "If I were you, I ___ not buy that car. (would · will)", answer: "would",
    situation: "Sarankan agar teman tidak memakan makanan itu. Gunakan If I were you dan would not.",
    cues: "if I were you · I would not · eat that food",
    variants: ["If I were you I would not eat that food", "I would not eat that food if I were you"],
    writingExplanation: "If I were you dipakai untuk memberi saran. Would not diikuti kata kerja dasar eat.",
    explanation: "If I were you adalah pengandaian untuk memberi saran. Hasil negatifnya memakai would not + kata kerja dasar buy.",
  },
  {
    id: "write-comparatives-as", topic: "comparatives", prompt: "Rina is as tall ___ Maya. (as · than)", answer: "as",
    situation: "Ruangan ini sama besarnya dengan ruangan itu. Gunakan large dan pola as ... as.",
    cues: "this room · be · as large as · that one",
    variants: ["This room is as large as that one", "This room is as large as that room"],
    writingExplanation: "Perbandingan setara memakai as + kata sifat dasar + as. Gunakan as large as.",
    explanation: "Perbandingan setara memakai as + kata sifat dasar + as. Gunakan as tall as, tanpa taller atau than.",
  },
  {
    id: "write-comparatives-less", topic: "comparatives", prompt: "This bag is ___ expensive than that one. (lebih murah, gunakan less · least)", answer: "less",
    situation: "Mantel ini lebih murah daripada jaket itu. Gunakan expensive dengan less.",
    cues: "this coat · be · less expensive · than · that jacket",
    variants: ["This coat is less expensive than that jacket"],
    writingExplanation: "Less expensive than menyatakan harga yang lebih rendah dalam perbandingan dua benda.",
    explanation: "Less + kata sifat + than menyatakan tingkat yang lebih rendah. Least digunakan untuk bentuk superlatif.",
  },
  {
    id: "write-relatives-whose", topic: "relatives", prompt: "The boy ___ bike is red is my brother. (whose · who)", answer: "whose",
    situation: "Perempuan yang anjingnya cokelat adalah tetangga Anda. Hubungkan informasinya dengan whose.",
    cues: "the woman · whose dog is brown · be · my neighbor",
    variants: ["The woman whose dog is brown is my neighbor", "The woman whose dog is brown is my neighbour"],
    writingExplanation: "Whose dog menunjukkan anjing milik perempuan itu. Klausa utama the woman memakai is.",
    explanation: "Whose menunjukkan kepemilikan dan diikuti kata benda bike. Who menggantikan orang sebagai subjek atau objek.",
  },
  {
    id: "write-relatives-which", topic: "relatives", prompt: "The bus ___ stops here goes to the station. (which · who)", answer: "which",
    situation: "Kereta yang berangkat pukul sembilan menuju London. Gunakan which.",
    cues: "the train · which leaves at nine · go · to London",
    variants: ["The train which leaves at nine goes to London"],
    writingExplanation: "Which menjelaskan train. Subjek tunggal memakai leaves dan goes.",
    explanation: "Which menjelaskan benda seperti bus. Bus tunggal memakai stops dan goes.",
  },
  {
    id: "write-conjunctions-although", topic: "conjunctions", prompt: "___ it was raining, we went outside. (although · because)", answer: "although",
    situation: "Meskipun dia perempuan gugup, ia memberikan presentasi itu. Gunakan although dan bentuk lampau.",
    cues: "although · she was nervous · she · give the presentation",
    variants: ["Although she was nervous she gave the presentation", "She gave the presentation although she was nervous"],
    writingExplanation: "Although menghubungkan keadaan dengan hasil yang berlawanan harapan. Give menjadi gave dalam bentuk lampau.",
    explanation: "Although memperkenalkan keadaan yang berlawanan dengan hasilnya. Tidak perlu menambahkan but dalam kalimat yang sama.",
  },
  {
    id: "write-conjunctions-unless", topic: "conjunctions", prompt: "You will miss the bus ___ you hurry. (unless · because)", answer: "unless",
    situation: "Anda akan tinggal di rumah kecuali cuaca membaik. Gunakan I, will, dan unless.",
    cues: "I will · stay home · unless · the weather improves",
    variants: ["I will stay home unless the weather improves", "Unless the weather improves I will stay home", "I will stay at home unless the weather improves"],
    writingExplanation: "Unless berarti if not. Setelah unless gunakan present simple improves.",
    explanation: "Unless berarti if not. Gunakan present simple setelah unless, sehingga cukup you hurry tanpa will atau tambahan not.",
  },
  {
    id: "write-plurals-uncountable", topic: "plurals", prompt: "This information ___ useful. (is · are)", answer: "is",
    situation: "Nasihat ini berguna. Gunakan This advice dan useful.",
    cues: "this advice · be · useful",
    variants: ["This advice is useful"],
    writingExplanation: "Advice tidak dapat dihitung dalam makna ini. Bentuknya tetap advice dan memakai is.",
    explanation: "Information tidak dapat dihitung dalam penggunaan ini. Bentuknya tetap information dan memakai is, tanpa akhiran -s.",
  },
  {
    id: "write-collocations-attention", topic: "collocations", prompt: "Please ___ attention to the instructions. (pay · make)", answer: "pay",
    situation: "Mintalah teman memperhatikan guru dengan sopan. Gunakan Please dan pay attention.",
    cues: "please · pay attention · to the teacher",
    variants: ["Please pay attention to the teacher", "Pay attention to the teacher please"],
    writingExplanation: "Gunakan pasangan pay attention to, diikuti the teacher sebagai yang diperhatikan.",
    explanation: "Pasangan kata yang alami adalah pay attention to. Jangan gunakan make attention atau menghilangkan to sebelum objek.",
  },
  ...PATTERN_LESSONS,
  ...QUESTION_LESSONS,
];

export function checkTopicWriting(lesson: TopicWritingLesson, input: string): WritingResult {
  if (!input.trim()) return { status: "empty", message: "Tulis kalimat Anda terlebih dahulu." };
  const accepted = new Set(lesson.variants.map(normalize));
  // In third conditionals, 'd can mean had and would in the same sentence.
  // Resolve 'd have first so the remaining contraction can expand to had.
  const contextualInput = input.replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/(\w)'d(?=\s+have\b)/gi, "$1 would");
  if (expandVariants(contextualInput).some(value => accepted.has(value))) {
    return { status: "correct", message: lesson.writingExplanation };
  }
  return {
    status: "retry",
    message: `Kalimat ini belum cocok dengan pola dan kata panduan latihan. ${lesson.writingExplanation} Periksa juga subjek dan informasi situasinya.`,
  };
}
