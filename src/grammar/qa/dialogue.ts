/**
 * 13.4 Rancangan Q&A: Semi-Dynamic Branching Dialogue Engine (Bukan Free Chat)
 *
 * Arsitektur:
 * 1. Pengguna menerima pertanyaan/skenario dari bank dialog lokal (`DIALOGUE_SCENARIOS`).
 * 2. Pengguna menjawab dalam bahasa Inggris.
 * 3. Rule-based engine (`verifyDialogueGrammar`) memeriksa syarat grammar yang dapat diverifikasi.
 * 4. MiniLM / Multi-example semantic matcher membandingkan jawaban dengan beberapa contoh kalimat
 *    per intent/topik (`branch.examples`), bukan satu kalimat referensi saja.
 * 5. Dialogue manager (`evaluateDialogueTurn`) memilih pertanyaan lanjutan dari bank dialog bercabang
 *    berdasarkan intent/topik yang terdeteksi dan state percakapan.
 * 6. Feedback menjelaskan struktur yang terdeteksi dan memberi opsi mengulang; jika confidence rendah,
 *    meminta klarifikasi (`status: "clarification_needed"`), TIDAK otomatis menilai salah.
 * 7. Guardrails menguji batas similarity semantik terhadap negasi, konflik waktu, dan kalimat
 *    bermakna mirip tetapi berbeda secara kritis.
 */

import { calibrateMiniLmCosine } from "../story/minilm-client";
import { VERBS } from "../data/verbs";

export type DialogueGrammarTarget =
  | "pastSimple"
  | "presentPerfect"
  | "futureSimple"
  | "modal";

export type Polarity = "affirmative" | "negative" | "any";
export type TimeFrame = "past" | "present_perfect" | "future" | "any";

export type CriticalTrapKind =
  | "negation_mismatch"
  | "time_conflict"
  | "critical_meaning_diff";

export interface DialogueIntentBranch {
  id: string;
  label: string;
  /** Multiple reference sentences for this intent (not just 1 reference sentence) */
  examples: readonly string[];
  /** Core semantic concept words / synonyms for fast local matching */
  conceptTerms: readonly string[];
  /** Expected polarity of the user's answer for this branch */
  expectedPolarity: Polarity;
  /** Patterns that look lexically similar but carry a critically different/opposite meaning */
  contradictionPatterns?: readonly RegExp[];
  /** ID of the next dialogue node when this branch is taken (null = end of conversation) */
  nextNodeId: string | null;
  /** NPC acknowledgment before asking the follow-up question (or closing remark) */
  npcReaction: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole: string;
  question: string;
  translation: string;
  grammarTarget: DialogueGrammarTarget;
  grammarLabel: string;
  grammarFormula: string;
  grammarHint: string;
  expectedTimeFrame: TimeFrame;
  branches: readonly DialogueIntentBranch[];
}

export interface DialogueScenario {
  id: string;
  title: string;
  subtitle: string;
  levelBadge: string;
  contextDescription: string;
  initialNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export interface GrammarVerificationResult {
  passed: boolean;
  detectedStructure: string;
  feedback: string;
  isNearMiss: boolean;
}

export interface IntentScoreDetail {
  branchId: string;
  branchLabel: string;
  score: number; // 0..1
  percentage: number;
  bestExample: string;
  trapTriggered?: CriticalTrapKind;
  trapNote?: string;
}

export type DialogueEvaluationStatus =
  | "empty"
  | "advance" // Grammar passed + High confidence intent -> ready to advance to next branch node
  | "clarification_needed" // Grammar passed (or acceptable), but low/ambiguous intent confidence -> ask clarification, do NOT mark wrong
  | "grammar_retry"; // Verifiable grammar rule failed -> explain detected structure & let user retry

export interface DialogueTurnEvaluation {
  status: DialogueEvaluationStatus;
  grammar: GrammarVerificationResult;
  confidenceBand: "high" | "ambiguous" | "low";
  matchedBranch: DialogueIntentBranch | null;
  topScore: number;
  topPercentage: number;
  intentRankings: IntentScoreDetail[];
  source: "minilm-hybrid" | "local-multi-example";
  latencyMs?: number;
  criticalTrap?: CriticalTrapKind;
  criticalTrapExplanation?: string;
  clarificationPrompt?: string;
  limitationsNote: string;
}

export interface DialogueHistoryItem {
  nodeId: string;
  speaker: string;
  question: string;
  userAnswer: string;
  detectedStructure: string;
  matchedIntentId: string;
  matchedIntentLabel: string;
  npcReaction: string;
}

export const QA_SEMANTIC_LIMITATIONS_NOTE =
  "Batas evaluasi: Kemiripan semantik (MiniLM) hanya memperkirakan kecocokan topik/intent, bukan bukti grammar benar, fakta benar, atau jawaban setara. Pemeriksaan negasi, waktu, dan struktur tetap dikawal oleh aturan lokal.";

// ============================================================================
// Bank Dialog Lokal Bercabang (Branching Dialogue Scenarios)
// ============================================================================

export const DIALOGUE_SCENARIOS: readonly DialogueScenario[] = [
  {
    id: "late-meeting",
    title: "Terlambat ke Rapat Pagi (Late for the Morning Meeting)",
    subtitle: "Simulasi menjelaskan alasan keterlambatan & solusi kepada manajer",
    levelBadge: "🔥 Populer · Past & Future",
    contextDescription:
      "Anda tiba 20 menit terlambat di ruang rapat kantor. Manajer Anda (Sarah) menanyakan apa yang terjadi. Alur pertanyaan berikutnya akan menyesuaikan alasan yang Anda berikan.",
    initialNodeId: "turn1_reason",
    nodes: {
      turn1_reason: {
        id: "turn1_reason",
        speaker: "Sarah",
        speakerRole: "Project Manager",
        question:
          "Good morning! You arrived twenty minutes after the meeting started. What happened on your way here?",
        translation:
          "Selamat pagi! Anda tiba dua puluh menit setelah rapat dimulai. Apa yang terjadi di perjalanan Anda ke sini?",
        grammarTarget: "pastSimple",
        grammarLabel: "Past Simple (V2 / was / were)",
        grammarFormula: "Subject + V2 / was / were (+ keterangan/alasan)",
        grammarHint:
          "Gunakan kata kerja lampau (V2 atau was/were) untuk menceritakan kejadian pagi tadi (contoh: I missed..., The traffic was..., I woke up..., I forgot...).",
        expectedTimeFrame: "past",
        branches: [
          {
            id: "traffic_transport",
            label: "Kendala Transportasi / Macet",
            examples: [
              "The traffic was terrible on the main road this morning.",
              "I missed the morning bus at the station.",
              "My car broke down on the highway.",
              "The commuter train was delayed for thirty minutes.",
              "I got stuck in a heavy traffic jam near the bridge.",
              "The bus came very late because of the rain.",
            ],
            conceptTerms: [
              "traffic", "jam", "road", "street", "highway", "bridge", "bus",
              "train", "car", "taxi", "motorbike", " motorcycle", " subway",
              "station", "delay", "delayed", "stuck", "broke", "broken",
              "missed", "accident", "rain", "tire", "flat",
            ],
            expectedPolarity: "any",
            contradictionPatterns: [
              /\b(?:did not|didn't|never)\s+(?:miss|take|get stuck|have (?:any )?(?:traffic|transport))\b/i,
              /\b(?:car|bus|train)\s+(?:did not|didn't)\s+(?:break|arrive late)\b/i,
              /\b(?:traffic was (?:smooth|clear|empty|fast|good)|no traffic|arrived early|on time)\b/i,
            ],
            nextNodeId: "turn2_traffic",
            npcReaction:
              "Oh, morning traffic and public transport delays can be really frustrating.",
          },
          {
            id: "overslept_alarm",
            label: "Bangun Kesiangan / Alarm Tidak Berbunyi",
            examples: [
              "I woke up late because my alarm did not ring.",
              "I overslept this morning after working late last night.",
              "My phone battery died so the morning alarm failed.",
              "I slept through my alarm clock at six.",
              "I did not hear my alarm this morning.",
              "I went to sleep very late last night and woke up late.",
            ],
            conceptTerms: [
              "woke", "wake", "overslept", "sleep", "slept", "sleeping",
              "alarm", "clock", "ring", "rang", "phone", "battery", "died",
              "tired", "exhausted", "bed", "hear", "heard",
            ],
            expectedPolarity: "any",
            contradictionPatterns: [
              /\b(?:did not|didn't|never)\s+(?:oversleep|wake up late|sleep through)\b/i,
              /\b(?:woke up early|did not oversleep| didn't oversleep|alarm rang on time)\b/i,
            ],
            nextNodeId: "turn2_overslept",
            npcReaction:
              "I see! Working late at night makes it really hard to wake up early.",
          },
          {
            id: "forgot_item_home",
            label: "Barang / Dokumen Rapat Tertinggal di Rumah",
            examples: [
              "I forgot my laptop at home and had to go back.",
              "I left my presentation folder on my desk at home.",
              "My office badge was left on the kitchen table.",
              "I had to return home because I forgot the meeting files.",
              "I lost my house keys before leaving this morning.",
              "I left my bag and documents in my room.",
            ],
            conceptTerms: [
              "forgot", "forgotten", "left", "laptop", "folder", "file",
              "files", "document", "documents", "notes", "badge", "card",
              "ticket", "key", "keys", "wallet", "desk", "table", "home",
              "house", "return", "returned", "back",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:did not forget|didn't forget|never forgot|did not leave|didn't leave|brought everything)\b/i,
            ],
            nextNodeId: "turn2_forgot",
            npcReaction:
              "Going all the way back home for your things definitely takes extra time!",
          },
        ],
      },
      turn2_traffic: {
        id: "turn2_traffic",
        speaker: "Sarah",
        speakerRole: "Project Manager",
        question:
          "Since the road or transport had a problem, how did you finally get to the office?",
        translation:
          "Karena jalanan atau transportasinya bermasalah, bagaimana Anda akhirnya bisa sampai ke kantor?",
        grammarTarget: "pastSimple",
        grammarLabel: "Past Simple (V2 — Cara / Transportasi)",
        grammarFormula: "I + V2 (took / rode / walked / ran / ordered) + ...",
        grammarHint:
          "Ceritakan cara Anda menuju kantor memakai V2 (contoh: I took a taxi, I rode a motorbike taxi, I walked from the station).",
        expectedTimeFrame: "past",
        branches: [
          {
            id: "took_ride",
            label: "Beralih Naik Taksi / Ojek / Kereta Lain",
            examples: [
              "I took a motorcycle taxi to the office.",
              "I ordered a taxi on my phone and came straight here.",
              "I rode the subway from the nearest station.",
              "I caught another bus on a different route.",
              "My friend drove me to the office in his car.",
            ],
            conceptTerms: [
              "took", "rode", "ordered", "booked", "caught", "drove", "taxi",
              "cab", "motorcycle", "motorbike", "scooter", "subway", "mrt",
              "train", "bus", "car", "driver", "friend", "ride",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:did not take|didn't take|could not find a taxi|no taxi)\b/i,
            ],
            nextNodeId: "turn3_closing",
            npcReaction:
              "Smart move switching transport quickly so you could still join us.",
          },
          {
            id: "walked_ran",
            label: "Berjalan Kaki / Berlari dari Lokasi Macet",
            examples: [
              "I walked fast from the main intersection to the office.",
              "I ran for ten minutes from the bus stop.",
              "I came on foot for the last two kilometers.",
              "I got off the bus and hurried on foot.",
              "I jogged all the way from the station.",
            ],
            conceptTerms: [
              "walked", "ran", "jogged", "hurried", "rushed", "foot",
              "intersection", "stop", "kilometer", "kilometers", "blocks",
              "minutes", "fast",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:did not walk|didn't walk|did not run|didn't run)\b/i,
            ],
            nextNodeId: "turn3_closing",
            npcReaction:
              "Running all the way here must have been tiring! Please catch your breath.",
          },
        ],
      },
      turn2_overslept: {
        id: "turn2_overslept",
        speaker: "Sarah",
        speakerRole: "Project Manager",
        question:
          "Since you worked late last night, did you finish the client presentation slides?",
        translation:
          "Karena Anda bekerja larut tadi malam, apakah Anda sudah menyelesaikan salindia presentasi klien?",
        grammarTarget: "pastSimple",
        grammarLabel: "Past Simple (Positif V2 atau Negatif did not + V1)",
        grammarFormula:
          "Yes, I finished... / No, I did not finish...",
        grammarHint:
          "Jawab apakah slide sudah selesai tadi malam (contoh positif: Yes, I finished all the slides; contoh negatif: No, I did not finish the last slide).",
        expectedTimeFrame: "past",
        branches: [
          {
            id: "slides_finished",
            label: "Sudah Selesai (Positif)",
            examples: [
              "Yes, I did. I finished all the presentation slides last night.",
              "Yes, I completed the slides before I went to sleep.",
              "I finished the report and uploaded the slides to our folder.",
              "Yes, I prepared every slide on my laptop last night.",
              "I completed the whole presentation at midnight.",
            ],
            conceptTerms: [
              "yes", "finished", "completed", "prepared", "uploaded", "sent",
              "done", "ready", "all", "slide", "slides", "presentation",
              "report", "midnight",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:manager|colleague|she|he|they)\s+(?:finished|completed|prepared)\b/i,
              /\b(?:no\b|not\b|didn't|did not|never|unfinished|incomplete|haven't|failed to)\b/i,
            ],
            nextNodeId: "turn3_closing",
            npcReaction:
              "Great job! Knowing the slides are ready is a huge relief for the team.",
          },
          {
            id: "slides_unfinished",
            label: "Belum Selesai Sepenuhnya (Negatif)",
            examples: [
              "No, I did not finish the final chart last night.",
              "No, I didn't. I could not complete the last two slides.",
              "I did not finish the summary slide because I fell asleep.",
              "No, I only finished half of the presentation slides.",
              "I didn't complete the slides last night.",
            ],
            conceptTerms: [
              "no", "not", "didn't", "unfinished", "half", "only", "still",
              "need", "chart", "last", "summary", "asleep", "tired", "slide",
              "slides",
            ],
            expectedPolarity: "negative",
            contradictionPatterns: [/\b(?:manager|colleague|she|he|they)\s+(?:did not|didn't)\s+(?:finish|complete|prepare)\b/i],
            nextNodeId: "turn3_closing",
            npcReaction:
              "Thank you for being honest. We can review the draft together right after this.",
          },
        ],
      },
      turn2_forgot: {
        id: "turn2_forgot",
        speaker: "Sarah",
        speakerRole: "Project Manager",
        question:
          "After going back home, did you bring the project files with you now?",
        translation:
          "Setelah kembali ke rumah, apakah Anda sudah membawa berkas proyeknya bersama Anda sekarang?",
        grammarTarget: "pastSimple",
        grammarLabel: "Past Simple (V2 — brought / took / saved)",
        grammarFormula: "Yes, I brought... / I saved a backup...",
        grammarHint:
          "Jelaskan apakah file/laptop sudah dibawa sekarang atau diakses lewat cadangan cloud.",
        expectedTimeFrame: "past",
        branches: [
          {
            id: "brought_files_now",
            label: "Sudah Membawa Laptop / Berkasnya Sekarang",
            examples: [
              "Yes, I brought my laptop and all the project files.",
              "Yes, I did. I took the folder from my desk and brought it here.",
              "I grabbed all the documents from home this morning.",
              "Yes, I brought the presentation files in my bag.",
            ],
            conceptTerms: [
              "yes", "brought", "took", "grabbed", "carried", "got", "laptop",
              "folder", "files", "documents", "bag", "here",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:no\b|not\b|didn't|did not|forgot again|still at home|without)\b/i,
            ],
            nextNodeId: "turn3_closing",
            npcReaction:
              "Wonderful, we can plug in your laptop and start right away.",
          },
          {
            id: "used_cloud_backup",
            label: "Berkas Fisik Tertinggal, Tapi Pakai Backup Cloud/Email",
            examples: [
              "No, I did not bring the folder, but I saved a backup on the cloud.",
              "I didn't bring the flash drive, so I downloaded the file from my email.",
              "My teammate sent the backup copy to our office server.",
              "I uploaded the files to Google Drive last night.",
            ],
            conceptTerms: [
              "backup", "cloud", "server", "drive", "email", "downloaded",
              "uploaded", "sent", "copy", "online", "teammate",
            ],
            expectedPolarity: "any",
            nextNodeId: "turn3_closing",
            npcReaction:
              "Having a cloud backup saved the day! That's very practical.",
          },
        ],
      },
      turn3_closing: {
        id: "turn3_closing",
        speaker: "Sarah",
        speakerRole: "Project Manager",
        question:
          "One last thing: what will you do before tomorrow's meeting so everything goes smoothly?",
        translation:
          "Satu hal terakhir: apa yang akan Anda lakukan sebelum rapat besok agar semuanya berjalan lancar?",
        grammarTarget: "futureSimple",
        grammarLabel: "Future Plan (will + V1 / am going to + V1)",
        grammarFormula: "I will + V1 ... / I am going to + V1 ...",
        grammarHint:
          "Gunakan 'I will + V1' atau 'I am going to + V1' untuk menjanjikan langkah antisipasi besok.",
        expectedTimeFrame: "future",
        branches: [
          {
            id: "plan_early_departure",
            label: "Berangkat Lebih Pagi & Pasang Alarm Ganda",
            examples: [
              "I will leave home thirty minutes earlier tomorrow morning.",
              "I will set two alarms on my phone tonight.",
              "I am going to take the first train at six o'clock.",
              "I will wake up earlier and check the traffic report.",
              "I will go to sleep early tonight so I can wake up on time.",
            ],
            conceptTerms: [
              "leave", "wake", "sleep", "set", "alarm", "alarms", "early",
              "earlier", "train", "bus", "traffic", "time", "morning",
              "tomorrow", "tonight", "thirty", "six",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:will not|won't|am not going to|never)\b/i,
            ],
            nextNodeId: null,
            npcReaction:
              "That sounds like a solid schedule! Let's begin today's meeting.",
          },
          {
            id: "plan_prepare_materials",
            label: "Menyiapkan Tas & Backup File Malam Sebelumnya",
            examples: [
              "I will prepare my bag and laptop the night before.",
              "I will upload all presentation files to the cloud tonight.",
              "I am going to put my office badge and keys in my bag tonight.",
              "I will check all my documents before going to bed.",
              "I will finish the slides earlier this evening.",
            ],
            conceptTerms: [
              "prepare", "pack", "upload", "save", "put", "check", "finish",
              "bag", "laptop", "files", "documents", "badge", "keys", "cloud",
              "backup", "slides", "tonight", "evening", "night",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:will not|won't|am not going to|forget)\b/i,
            ],
            nextNodeId: null,
            npcReaction:
              "Preparing the night before is the best habit. Thank you, and welcome to the meeting!",
          },
        ],
      },
    },
  },
  {
    id: "job-interview",
    title: "Wawancara Kerja: Pengalaman & Keahlian (Job Interview)",
    subtitle: "Simulasi tanya-jawab HRD dengan percabangan pengalaman kerja",
    levelBadge: "🚀 Intermediate · Present Perfect & Modal",
    contextDescription:
      "Anda sedang diwawancarai oleh HRD (David). Pertanyaan lanjutan akan menyesuaikan apakah Anda menjawab dari sisi pengalaman kerja/proyek atau latar belakang belajar/pendidikan.",
    initialNodeId: "turn1_background",
    nodes: {
      turn1_background: {
        id: "turn1_background",
        speaker: "David",
        speakerRole: "Hiring Manager",
        question:
          "Welcome to the interview! How long have you worked or studied in this field?",
        translation:
          "Selamat datang di sesi wawancara! Sudah berapa lama Anda bekerja atau belajar di bidang ini?",
        grammarTarget: "presentPerfect",
        grammarLabel: "Present Perfect (have/has + V3 + for/since)",
        grammarFormula: "I have + V3 (worked / studied / learned) + for/since ...",
        grammarHint:
          "Gunakan Present Perfect (I have worked / I have studied / I have learned) diikuti durasi 'for ...' atau titik waktu 'since ...'.",
        expectedTimeFrame: "present_perfect",
        branches: [
          {
            id: "work_industry",
            label: "Fokus Pengalaman Kerja / Industri",
            examples: [
              "I have worked in this industry for three years.",
              "I have worked at a technology company since 2022.",
              "I have managed customer service teams for two years.",
              "I have worked as a freelance designer for four years.",
              "I have built web applications for several clients since last year.",
            ],
            conceptTerms: [
              "worked", "managed", "built", "developed", "designed", "taught",
              "industry", "company", "office", "agency", "team", "client",
              "clients", "freelance", "job", "business", "years", "months",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [
              /\b(?:have not worked|haven't worked|never worked)\b/i,
            ],
            nextNodeId: "turn2_work_achievement",
            npcReaction:
              "Having hands-on industry experience is very valuable for our team.",
          },
          {
            id: "study_education",
            label: "Fokus Pendidikan / Belajar Mandiri & Kursus",
            examples: [
              "I have studied computer science for four years at university.",
              "I have learned English and digital marketing since 2021.",
              "I have practiced programming for six months through online courses.",
              "I have studied accounting at college for three years.",
              "I have trained in graphic design since high school.",
            ],
            conceptTerms: [
              "studied", "learned", "practiced", "trained", "graduated",
              "university", "college", "school", "course", "courses", "class",
              "degree", "science", "programming", "english", "design",
              "marketing", "accounting",
            ],
            expectedPolarity: "affirmative",
            nextNodeId: "turn2_study_project",
            npcReaction:
              "A strong educational foundation and continuous learning are great assets!",
          },
        ],
      },
      turn2_work_achievement: {
        id: "turn2_work_achievement",
        speaker: "David",
        speakerRole: "Hiring Manager",
        question:
          "In your previous job, how did you handle a difficult problem or tight deadline?",
        translation:
          "Di pekerjaan Anda sebelumnya, bagaimana Anda menangani masalah sulit atau tenggat waktu yang ketat?",
        grammarTarget: "pastSimple",
        grammarLabel: "Past Simple (V2 — Pengalaman Masa Lalu)",
        grammarFormula: "I + V2 (discussed / organized / solved / helped) + ...",
        grammarHint:
          "Gunakan Past Simple (V2) untuk menceritakan tindakan nyata yang Anda lakukan di masa lalu.",
        expectedTimeFrame: "past",
        branches: [
          {
            id: "team_collaboration",
            label: "Berdiskusi & Membagi Tugas dengan Tim",
            examples: [
              "I discussed the problem with my team and divided the tasks.",
              "I asked my manager for feedback and helped my colleagues.",
              "We worked together and shared the workload evenly.",
              "I communicated clearly with the client and our team.",
            ],
            conceptTerms: [
              "discussed", "talked", "communicated", "shared", "divided",
              "helped", "asked", "worked", "team", "colleagues", "manager",
              "together", "client",
            ],
            expectedPolarity: "affirmative",
            nextNodeId: "turn3_contribution",
            npcReaction:
              "Team communication is indeed the best way to solve tough problems.",
          },
          {
            id: "priority_schedule",
            label: "Menyusun Prioritas & Fokus Menyelesaikan Inti Tugas",
            examples: [
              "I made a priority list and finished the most urgent tasks first.",
              "I organized my schedule carefully and solved the bug step by step.",
              "I focused on the main goal and worked extra hours.",
              "I created a clear timeline to meet the deadline.",
            ],
            conceptTerms: [
              "made", "organized", "created", "focused", "solved", "finished",
              "planned", "priority", "list", "schedule", "timeline", "urgent",
              "deadline", "step", "bug", "goal",
            ],
            expectedPolarity: "affirmative",
            nextNodeId: "turn3_contribution",
            npcReaction:
              "Setting clear priorities under pressure shows strong time management.",
          },
        ],
      },
      turn2_study_project: {
        id: "turn2_study_project",
        speaker: "David",
        speakerRole: "Hiring Manager",
        question:
          "During your studies, what kind of project or assignment did you build?",
        translation:
          "Selama masa belajar Anda, proyek atau tugas seperti apa yang pernah Anda buat?",
        grammarTarget: "pastSimple",
        grammarLabel: "Past Simple (V2 — Proyek yang Pernah Dibuat)",
        grammarFormula: "I + V2 (built / created / wrote / designed) + ...",
        grammarHint:
          "Gunakan Past Simple (V2) seperti I built..., I created..., I designed..., atau I wrote...",
        expectedTimeFrame: "past",
        branches: [
          {
            id: "built_app_website",
            label: "Membuat Aplikasi / Website / Desain Produk",
            examples: [
              "I built a mobile application for local small businesses.",
              "I created a responsive website with my classmates.",
              "I designed a brand identity and user interface for a campus event.",
              "I developed a simple database system for our library.",
            ],
            conceptTerms: [
              "built", "created", "designed", "developed", "made", "coded",
              "app", "application", "website", "web", "system", "database",
              "interface", "poster", "product", "program",
            ],
            expectedPolarity: "affirmative",
            nextNodeId: "turn3_contribution",
            npcReaction:
              "Building practical projects is a great way to apply what you studied.",
          },
          {
            id: "research_presentation",
            label: "Menulis Riset / Analisis Data / Presentasi Kelompok",
            examples: [
              "I wrote a research paper about consumer behavior.",
              "I analyzed market survey data and presented the results.",
              "I led a student group presentation in English.",
              "I organized a campus seminar with my friends.",
            ],
            conceptTerms: [
              "wrote", "analyzed", "presented", "led", "organized", "researched",
              "paper", "research", "data", "survey", "report", "presentation",
              "seminar", "group", "results",
            ],
            expectedPolarity: "affirmative",
            nextNodeId: "turn3_contribution",
            npcReaction:
              "Analytical and presentation skills are very useful in our daily work.",
          },
        ],
      },
      turn3_contribution: {
        id: "turn3_contribution",
        speaker: "David",
        speakerRole: "Hiring Manager",
        question:
          "Finally, what key skill can you bring to our team if you join us?",
        translation:
          "Terakhir, keahlian utama apa yang bisa Anda berikan kepada tim kami jika Anda bergabung?",
        grammarTarget: "modal",
        grammarLabel: "Modal Ability (can + V1)",
        grammarFormula: "I can + V1 (help / build / communicate / analyze) + ...",
        grammarHint:
          "Gunakan 'I can + V1 (kata kerja dasar)' untuk menjelaskan kontribusi Anda.",
        expectedTimeFrame: "any",
        branches: [
          {
            id: "technical_execution",
            label: "Kemampuan Teknis & Penyelesaian Masalah",
            examples: [
              "I can build clean web features and fix bugs quickly.",
              "I can analyze data accurately and create clear reports.",
              "I can design modern interfaces and improve user experience.",
              "I can learn new software tools very fast.",
            ],
            conceptTerms: [
              "build", "fix", "analyze", "create", "design", "write", "code",
              "solve", "learn", "improve", "data", "features", "reports",
              "software", "tools", "fast", "quickly",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [/\b(?:cannot|can't|can not)\b/i],
            nextNodeId: null,
            npcReaction:
              "Thank you! Your technical strengths match what we are looking for.",
          },
          {
            id: "communication_teamwork",
            label: "Komunikasi, Bahasa Inggris, & Kerja Sama Tim",
            examples: [
              "I can communicate fluently with international clients in English.",
              "I can collaborate well with different teams and support my colleagues.",
              "I can manage project schedules and present ideas clearly.",
              "I can help the team stay organized under pressure.",
            ],
            conceptTerms: [
              "communicate", "speak", "collaborate", "support", "help",
              "manage", "present", "organize", "english", "clients", "team",
              "teams", "colleagues", "ideas", "fluently", "clearly",
            ],
            expectedPolarity: "affirmative",
            contradictionPatterns: [/\b(?:cannot|can't|can not)\b/i],
            nextNodeId: null,
            npcReaction:
              "Strong communication makes every project smoother. Thank you for a great interview!",
          },
        ],
      },
    },
  },
];

// ============================================================================
// Lexical, Polarity, & Time-Signal Analyzers (13.4 Guardrails)
// ============================================================================

const QA_STOPWORDS = new Set([
  "i", "you", "he", "she", "it", "we", "they", "me", "my", "our", "your", "his", "her",
  "a", "an", "the", "to", "of", "in", "on", "at", "by", "for", "with", "from", "and",
  "but", "or", "so", "because", "as", "that", "this", "was", "were", "is", "are", "am",
  "be", "been", "had", "have", "has", "did", "do", "does", "will", "would", "can", "could",
  "should", "very", "really", "just", "also",
]);

const IRREGULAR_PAST_V2 = new Set([
  "woke", "overslept", "slept", "missed", "took", "rode", "drove", "ran", "walked",
  "came", "went", "left", "forgot", "lost", "found", "brought", "bought", "caught",
  "got", "had", "made", "did", "said", "told", "spoke", "wrote", "read", "built",
  "created", "designed", "developed", "analyzed", "presented", "led", "organized",
  "discussed", "shared", "divided", "helped", "asked", "worked", "solved", "finished",
  "completed", "prepared", "uploaded", "downloaded", "sent", "saved", "ordered",
  "booked", "hurried", "rushed", "jogged", "grabbed", "carried", "died", "broke",
  "fell", "started", "began", "arrived", "happened", "returned",
]);

const VALID_V3_PARTICIPLES = new Set([
  "worked", "studied", "learned", "learnt", "practiced", "practised", "trained",
  "graduated", "managed", "built", "developed", "designed", "taught", "lived",
  "been", "had", "done", "made", "written", "created", "finished", "completed",
]);

const COMMON_V1_BASES = new Set([
  ...VERBS.map(verb => verb.base),
  "ring", "hear", "oversleep", "forget", "find", "catch", "download", "grab", "carry", "stay", "be",
  "leave", "wake", "sleep", "set", "take", "check", "go", "prepare", "pack",
  "upload", "save", "put", "finish", "complete", "bring", "arrive", "build",
  "fix", "analyze", "create", "design", "write", "code", "solve", "learn",
  "improve", "communicate", "speak", "collaborate", "support", "help", "manage",
  "present", "organize", "work", "study", "get", "walk", "run", "order", "use",
]);

export function detectSentencePolarity(raw: string): "affirmative" | "negative" {
  const lower = raw.toLowerCase().replace(/[’‘]/g, "'");
  if (
    /\b(?:no|not|never|neither|none|nobody|nothing|nowhere|without|hardly|barely|scarcely|didn't|don't|doesn't|wasn't|weren't|haven't|hasn't|hadn't|won't|can't|cannot|couldn't|shouldn't|failed to|unable to)\b/.test(
      lower,
    )
  ) {
    return "negative";
  }
  return "affirmative";
}

export function detectTimeSignal(
  raw: string,
): "past" | "future" | "present_habit" | "neutral" {
  const lower = raw.toLowerCase();
  const hasFutureMarker =
    /\b(?:tomorrow|next (?:week|month|year|monday|morning)|in the future|soon)\b/.test(
      lower,
    ) || /\b(?:i will|i'll|we will|we'll|i am going to|i'm going to)\b/.test(lower);

  const hasPastMarker =
    /\b(?:yesterday|last (?:night|week|month|year)|this morning|[0-9]+ minutes ago|an hour ago|before i)\b/.test(
      lower,
    );

  if (hasFutureMarker && !hasPastMarker) return "future";
  if (hasPastMarker && !hasFutureMarker) return "past";
  if (/\b(?:every day|every morning|usually|always|often)\b/.test(lower)) {
    return "present_habit";
  }
  return "neutral";
}

function tokenizeSemanticWords(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !QA_STOPWORDS.has(w));

  const expanded: string[] = [];
  for (const w of raw) {
    expanded.push(w);
    if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) {
      expanded.push(w.slice(0, -1));
    }
    if (w.length > 5 && w.endsWith("ed")) {
      expanded.push(w.slice(0, -2));
      expanded.push(w.slice(0, -1));
    }
    if (w.length > 5 && w.endsWith("ing")) {
      expanded.push(w.slice(0, -3));
    }
  }
  return expanded;
}

function bowCosineSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const mapA = new Map<string, number>();
  const mapB = new Map<string, number>();
  for (const t of tokensA) mapA.set(t, (mapA.get(t) ?? 0) + 1);
  for (const t of tokensB) mapB.set(t, (mapB.get(t) ?? 0) + 1);

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [k, va] of mapA) {
    normA += va * va;
    const vb = mapB.get(k);
    if (vb) dot += va * vb;
  }
  for (const [, vb] of mapB) {
    normB += vb * vb;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

// ============================================================================
// Rule-Based Grammar Verifier (13.4 Verifiable Grammar Conditions)
// ============================================================================

export function verifyDialogueGrammar(
  node: DialogueNode,
  rawAnswer: string,
): GrammarVerificationResult {
  const trimmed = rawAnswer.trim();
  const lower = trimmed.toLowerCase().replace(/[’‘]/g, "'");
  const target = node.grammarTarget;

  // Detect only bounded patterns; never infer a verb from arbitrary -ed endings.
  if (!/\b(?:i|you|he|she|it|we|they|my|our|the)\b/.test(lower)) {
    return { passed: false, detectedStructure: "Subjek belum terdeteksi", feedback: `Tuliskan kalimat lengkap dengan subjek. ${node.grammarHint}`, isNearMiss: false };
  }
  if (/\b(?:i|he|she|it)\s+were\b|\b(?:you|we|they)\s+was\b|\bi\s+has\b|\b(?:he|she|it)\s+have\b/.test(lower)) {
    return { passed: false, detectedStructure: "Subject–verb agreement perlu diperiksa", feedback: "Sesuaikan subjek dengan kata bantu: I was / you were / I have / she has.", isNearMiss: true };
  }

  if (target === "pastSimple") {
    const bareAfterBe = /\b(?:was|were)\s+([a-z]+)\b/.exec(lower);
    if (bareAfterBe && COMMON_V1_BASES.has(bareAfterBe[1]) && !["read", "put", "set"].includes(bareAfterBe[1])) {
      return { passed: false, detectedStructure: "was/were + V1 belum sesuai", feedback: "Gunakan V2 untuk tindakan lampau, atau was/were dengan pelengkap yang sesuai. Contoh: I cooked / I was late.", isNearMiss: true };
    }
    // Check common near-miss errors first:
    // 1. "did + V2" e.g. "I did went", "I didn't finished", "did not rang"
    const didPastMatch =
      /\b(?:did|didn't|did\s+not)\s+(went|woke|slept|overslept|took|rode|drove|ran|came|left|forgot|lost|brought|bought|caught|got|made|broke|finished|completed|prepared|walked|missed|started|happened|rang)\b/i.exec(
        lower,
      );
    if (didPastMatch) {
      return {
        passed: false,
        detectedStructure: `Near-miss Past Simple ("${didPastMatch[0]}")`,
        feedback: `Setelah kata bantu "did / did not", gunakan kata kerja dasar (V1), bukan bentuk lampau "${didPastMatch[1]}". Untuk kalimat positif, langsung gunakan V2 tanpa "did".`,
        isNearMiss: true,
      };
    }

    // 2. Present Simple / V1 used instead of Past Simple V2 (e.g., "I wake up late", "I miss the bus", "I forget my laptop", "I take a taxi")
    const presentInsteadOfPast =
      /\b(?:i|we|he|she|my\s+[a-z]+)\s+(wake|oversleep|miss|forget|take|ride|walk|run|bring|finish|complete|work|discuss|build|create|design|write)\b/i.exec(
        lower,
      );
    // Make sure it's not preceded by "did not / didn't / could not / to"
    if (
      presentInsteadOfPast &&
      !/\b(?:did\s+not|didn't|could\s+not|couldn't|to|can|will)\s+[a-z]+$/i.test(
        lower.slice(0, presentInsteadOfPast.index + presentInsteadOfPast[0].length),
      )
    ) {
      return {
        passed: false,
        detectedStructure: `Present Verb V1 ("${presentInsteadOfPast[0]}") pada konteks lampau`,
        feedback: `Pertanyaan ini menanyakan kejadian masa lampau (${node.grammarLabel}), tetapi Anda memakai V1 "${presentInsteadOfPast[1]}". Ubah menjadi kata kerja bentuk kedua (V2).`,
        isNearMiss: true,
      };
    }

    // 3. Future "will" used when asked about past event
    if (/\b(?:i\s+will|i'll|we\s+will)\b/i.test(lower)) {
      return {
        passed: false,
        detectedStructure: "Future Simple (will + V1) pada pertanyaan masa lampau",
        feedback: `Pertanyaan ini menanyakan apa yang sudah terjadi (${node.grammarLabel}), bukan rencana masa depan dengan "will". Gunakan kata kerja lampau (V2 / was / were).`,
        isNearMiss: true,
      };
    }

    // Check valid Past Simple structures:
    // - "was / were + adj/V3/V-ing"
    // - "did not / didn't / could not / couldn't + V1"
    // - "had to + V1"
    // - Known irregular V2 or regular -ed V2
    const hasWasWere = /\b(was|were|wasn't|weren't)\b/i.test(lower);
    const hasPastNeg =
      /\b(did\s+not|didn't|could\s+not|couldn't)\s+([a-z]{2,})\b/i.exec(lower);
    const words = lower.replace(/[^a-z\s']/g, " ").split(/\s+/).filter(Boolean);
    const matchedV2 = words.find(
      (w) =>
        IRREGULAR_PAST_V2.has(w) ||
        VERBS.some(verb => verb.past === w) ||
        ["communicated", "focused", "practiced", "trained", "studied", "learned", "rang"].includes(w),
    );

    if (hasPastNeg && COMMON_V1_BASES.has(hasPastNeg[2])) {
      return {
        passed: true,
        detectedStructure: `Past Simple Negatif (${hasPastNeg[1]} + V1 "${hasPastNeg[2]}")`,
        feedback: `Struktur Past Simple negatif terverifikasi dengan tepat (${hasPastNeg[0]}).`,
        isNearMiss: false,
      };
    }
    if (/\b(?:have|has|had)\s+(?:already\s+)?(?:worked|finished|completed|prepared|left|gone|been|built)\b/.test(lower)) {
      return { passed: false, detectedStructure: "Perfect terdeteksi pada target Past Simple", feedback: node.grammarHint, isNearMiss: true };
    }
    if (hasPastNeg && !COMMON_V1_BASES.has(hasPastNeg[2])) {
      return { passed: false, detectedStructure: "Bentuk setelah did not belum terverifikasi", feedback: `Gunakan did not + V1 yang dikenali. ${node.grammarHint}`, isNearMiss: true };
    }
    if (matchedV2 && hasWasWere) {
      return {
        passed: true,
        detectedStructure: `Past Simple majemuk (V2 "${matchedV2}" + was/were)`,
        feedback: `Struktur Past Simple terverifikasi (menggunakan kata kerja lampau "${matchedV2}" dan to be lampau).`,
        isNearMiss: false,
      };
    }
    if (matchedV2) {
      return {
        passed: true,
        detectedStructure: `Past Simple Aktif (V2 "${matchedV2}")`,
        feedback: `Struktur Past Simple terverifikasi dengan kata kerja bentuk kedua "${matchedV2}".`,
        isNearMiss: false,
      };
    }
    if (hasWasWere) {
      return {
        passed: true,
        detectedStructure: "Past Simple Nominal / Pasif (was / were)",
        feedback: "Struktur Past Simple dengan to be lampau (was/were) terverifikasi.",
        isNearMiss: false,
      };
    }

    return {
      passed: false,
      detectedStructure: "Belum terdeteksi kata kerja Past Simple (V2 / was / were)",
      feedback: `Belum ditemukan kata kerja bentuk lampau (${node.grammarLabel}). ${node.grammarHint}`,
      isNearMiss: false,
    };
  }

  if (target === "presentPerfect") {
    // Near-miss 1: "for" vs "since" mix-up
    if (/\bfor\s+(?:20[0-9]{2}|19[0-9]{2}|last\s+year|high\s+school|college|monday)\b/i.test(lower)) {
      return {
        passed: false,
        detectedStructure: "Present Perfect dengan preposisi waktu 'for' yang kurang tepat",
        feedback:
          "Gunakan 'since' untuk titik awal waktu (misal: since 2021 / since last year / since high school), dan gunakan 'for' untuk durasi (misal: for three years).",
        isNearMiss: true,
      };
    }
    if (/\bsince\s+(?:[0-9]+|one|two|three|four|five|six|several|many)\s+(?:years|months|weeks)\b/i.test(lower)) {
      return {
        passed: false,
        detectedStructure: "Present Perfect dengan preposisi waktu 'since' pada durasi",
        feedback:
          "Gunakan 'for' untuk durasi waktu (misal: for three years / for six months), sedangkan 'since' dipakai untuk titik awal waktu.",
        isNearMiss: true,
      };
    }

    // Near-miss 2: "have/has + V1" e.g. "I have work", "I have study"
    const haveV1Match =
      /\b(have|has|i've)\s+(work|study|learn|practice|train|graduate|manage|build|develop|design|teach|live)\b/i.exec(
        lower,
      );
    if (haveV1Match) {
      return {
        passed: false,
        detectedStructure: `Near-miss Present Perfect ("${haveV1Match[0]}")`,
        feedback: `Setelah "${haveV1Match[1]}", wajib gunakan kata kerja bentuk ketiga (V3 / Past Participle), bukan bentuk dasar "${haveV1Match[2]}".`,
        isNearMiss: true,
      };
    }

    const ppMatch =
      /\b(have|has|i've|we've)(?:\s+just|\s+already)?\s+([a-z]+)\b/i.exec(lower);
    if (
      ppMatch &&
      (VALID_V3_PARTICIPLES.has(ppMatch[2]) || ppMatch[2].endsWith("ed"))
    ) {
      const hasDuration = /\b(for|since)\s+[a-z0-9]+/i.test(lower);
      if (!hasDuration || /\b(?:yesterday|last night|last week)\b/.test(lower) && !/\bsince\b/.test(lower)) {
        return { passed: false, detectedStructure: "Present Perfect: keterangan waktu perlu diperiksa", feedback: "Sebutkan durasi dengan for atau titik awal dengan since; hindari waktu lampau selesai seperti yesterday.", isNearMiss: true };
      }
      return {
        passed: true,
        detectedStructure: `Present Perfect (${ppMatch[1]} + V3 "${ppMatch[2]}"${hasDuration ? " + keterangan durasi for/since" : ""})`,
        feedback: `Struktur Present Perfect (${ppMatch[1]} ${ppMatch[2]}) terverifikasi dengan tepat.`,
        isNearMiss: false,
      };
    }

    return {
      passed: false,
      detectedStructure: "Belum terdeteksi pola Present Perfect (have/has + V3)",
      feedback: `Pertanyaan ini membutuhkan Present Perfect (${node.grammarFormula}). ${node.grammarHint}`,
      isNearMiss: false,
    };
  }

  if (target === "futureSimple") {
    // Near-miss: "will + to + V1" or "will + V2/V-ing"
    const willWrong =
      /\b(?:will|won't)\s+(to\s+[a-z]+|went|left|woke|prepared|uploaded|checked|finished|leaving|preparing|setting)\b/i.exec(
        lower,
      );
    if (willWrong) {
      return {
        passed: false,
        detectedStructure: `Near-miss Future ("will ${willWrong[1]}")`,
        feedback: `Setelah "will", gunakan kata kerja dasar (V1) secara langsung tanpa "to", "-ed", atau "-ing" (contoh: "I will prepare", "I will leave").`,
        isNearMiss: true,
      };
    }

    const willMatch = /\b(will|i'll|we'll)\s+([a-z]+)\b/i.exec(lower);
    const goingToMatch =
      /\b(am|is|are|i'm|we're)\s+going\s+to\s+([a-z]+)\b/i.exec(lower);

    if (willMatch && COMMON_V1_BASES.has(willMatch[2])) {
      return {
        passed: true,
        detectedStructure: `Future Simple (will + V1 "${willMatch[2]}")`,
        feedback: `Struktur rencana masa depan (will + V1 "${willMatch[2]}") terverifikasi.`,
        isNearMiss: false,
      };
    }
    if (goingToMatch && COMMON_V1_BASES.has(goingToMatch[2])) {
      return {
        passed: true,
        detectedStructure: `Future Plan (be going to + V1 "${goingToMatch[2]}")`,
        feedback: `Struktur rencana masa depan (going to + V1 "${goingToMatch[2]}") terverifikasi.`,
        isNearMiss: false,
      };
    }

    return {
      passed: false,
      detectedStructure: "Belum terdeteksi penanda Future (will + V1 / going to + V1)",
      feedback: `Gunakan pola Future (${node.grammarFormula}). ${node.grammarHint}`,
      isNearMiss: false,
    };
  }

  // target === "modal"
  const modalWrong =
    /\b(can|could|should)\s+(to\s+[a-z]+|[a-z]+ed|[a-z]+ing|builds|helps|speaks|communicates|manages)\b/i.exec(
      lower,
    );
  if (modalWrong) {
    return {
      passed: false,
      detectedStructure: `Near-miss Modal ("${modalWrong[0]}")`,
      feedback: `Setelah modal "${modalWrong[1]}", wajib gunakan bentuk dasar V1 tanpa "to", "-s", "-ed", atau "-ing".`,
      isNearMiss: true,
    };
  }

  const modalMatch = /\b(can|could|should)\s+([a-z]+)\b/i.exec(lower);
  if (modalMatch && COMMON_V1_BASES.has(modalMatch[2])) {
    return {
      passed: true,
      detectedStructure: `Modal + V1 ("${modalMatch[1]} ${modalMatch[2]}")`,
      feedback: `Struktur Modal (${modalMatch[1]} + V1 "${modalMatch[2]}") terverifikasi.`,
      isNearMiss: false,
    };
  }

  return {
    passed: false,
    detectedStructure: "Belum terdeteksi Modal (can + V1)",
    feedback: `Gunakan pola ${node.grammarFormula}. ${node.grammarHint}`,
    isNearMiss: false,
  };
}

// ============================================================================
// Dialogue Manager & Multi-Example Semantic Intent Evaluator (13.4)
// ============================================================================

export interface EvaluateDialogueOptions {
  /** Optional raw cosine similarities per branch ID from MiniLM Web Worker */
  miniLmBranchCosines?: Record<string, number>;
  latencyMs?: number;
}

export function evaluateDialogueTurn(
  node: DialogueNode,
  rawAnswer: string,
  options?: EvaluateDialogueOptions,
): DialogueTurnEvaluation {
  const trimmed = rawAnswer.trim();
  if (!trimmed) {
    return {
      status: "empty",
      grammar: {
        passed: false,
        detectedStructure: "Kosong",
        feedback: "Ketik jawaban bahasa Inggris Anda terlebih dahulu.",
        isNearMiss: false,
      },
      confidenceBand: "low",
      matchedBranch: null,
      topScore: 0,
      topPercentage: 0,
      intentRankings: [],
      source: "local-multi-example",
      limitationsNote: QA_SEMANTIC_LIMITATIONS_NOTE,
    };
  }

  const grammar = verifyDialogueGrammar(node, trimmed);
  const userTokens = tokenizeSemanticWords(trimmed);
  const userTokenSet = new Set(userTokens);
  const userPolarity = detectSentencePolarity(trimmed);
  const userTimeSignal = detectTimeSignal(trimmed);

  // Check if time signal critically conflicts with the node's expected time frame
  const hasTimeConflict =
    (node.expectedTimeFrame === "past" && userTimeSignal === "future") ||
    (node.expectedTimeFrame === "future" && userTimeSignal === "past");

  const hasMiniLm =
    options?.miniLmBranchCosines !== undefined &&
    Object.keys(options.miniLmBranchCosines).length > 0;

  let detectedTrap: CriticalTrapKind | undefined;
  let detectedTrapExplanation: string | undefined;

  const rankings: IntentScoreDetail[] = node.branches.map((branch) => {
    // 1. Compare against MULTIPLE example sentences (not just 1 reference)
    let bestExSim = 0;
    let secondBestExSim = 0;
    let bestExample = branch.examples[0] ?? "";

    for (const ex of branch.examples) {
      const sim = bowCosineSimilarity(userTokens, tokenizeSemanticWords(ex));
      if (sim > bestExSim) {
        secondBestExSim = bestExSim;
        bestExSim = sim;
        bestExample = ex;
      } else if (sim > secondBestExSim) {
        secondBestExSim = sim;
      }
    }

    const multiExampleSim = Math.min(
      1,
      (bestExSim * 0.75 + secondBestExSim * 0.25) / 0.42,
    );

    // 2. Concept terms hit score
    const conceptHits = branch.conceptTerms.filter((term) =>
      userTokenSet.has(term.trim().toLowerCase()),
    ).length;
    const conceptScore = Math.min(1, conceptHits / 2.2);

    const localScore = Math.min(
      1,
      conceptScore * 0.58 + multiExampleSim * 0.42,
    );

    // 3. Blend with MiniLM multi-example cosine similarity if available
    const rawMiniLm = options?.miniLmBranchCosines?.[branch.id];
    const calibratedMiniLm =
      rawMiniLm !== undefined ? calibrateMiniLmCosine(rawMiniLm) : undefined;

    let combinedScore =
      calibratedMiniLm !== undefined
        ? calibratedMiniLm * 0.65 + localScore * 0.35
        : localScore;

    let trapTriggered: CriticalTrapKind | undefined;
    let trapNote: string | undefined;

    // 4. Guardrail A: Critical contradiction patterns (similar words, opposite meaning)
    const hitContradiction = (branch.contradictionPatterns ?? []).some((re) =>
      re.test(trimmed),
    );
    if (hitContradiction && combinedScore >= 0.30) {
      trapTriggered = "critical_meaning_diff";
      trapNote = `Kalimat Anda memiliki kosakata yang mirip dengan intent "${branch.label}", tetapi mengandung makna kritis yang berlawanan.`;
      combinedScore *= 0.25;
    }

    // 5. Guardrail B: Negation / Polarity mismatch
    if (
      !trapTriggered &&
      branch.expectedPolarity !== "any" &&
      branch.expectedPolarity !== userPolarity &&
      combinedScore >= 0.35
    ) {
      trapTriggered = "negation_mismatch";
      trapNote =
        userPolarity === "negative"
          ? `Terdeteksi negasi (kalimat negatif) yang membalikkan makna dari intent positif "${branch.label}".`
          : `Terdeteksi kalimat positif, sedangkan intent "${branch.label}" mengharuskan pernyataan negatif.`;
      combinedScore *= 0.28;
    }

    // 6. Guardrail C: Critical Time Conflict
    if (!trapTriggered && hasTimeConflict && combinedScore >= 0.35) {
      trapTriggered = "time_conflict";
      trapNote =
        node.expectedTimeFrame === "past"
          ? "Terdeteksi keterangan waktu masa depan (future) pada pertanyaan yang menanyakan kejadian masa lampau."
          : "Terdeteksi keterangan waktu masa lampau (past) pada pertanyaan yang menanyakan rencana masa depan.";
      combinedScore *= 0.35;
    }

    if (trapTriggered && !detectedTrap) {
      detectedTrap = trapTriggered;
      detectedTrapExplanation = trapNote;
    }

    const finalBranchScore = Number(
      Math.max(0, Math.min(1, combinedScore)).toFixed(2),
    );

    return {
      branchId: branch.id,
      branchLabel: branch.label,
      score: finalBranchScore,
      percentage: Math.round(finalBranchScore * 100),
      bestExample,
      trapTriggered,
      trapNote,
    };
  });

  rankings.sort((a, b) => b.score - a.score);

  const top = rankings[0];
  const runnerUp = rankings[1];
  const topScore = top?.score ?? 0;
  const topPercentage = top?.percentage ?? 0;
  const margin = runnerUp ? topScore - runnerUp.score : topScore;

  // Provisional routing thresholds, covered by fixtures; not calibrated human probabilities.
  let confidenceBand: "high" | "ambiguous" | "low";
  if (topScore >= 0.52 && margin >= 0.10 && !top?.trapTriggered && !hasTimeConflict) {
    confidenceBand = "high";
  } else if (topScore >= 0.25 || Boolean(detectedTrap)) {
    confidenceBand = "ambiguous";
  } else {
    confidenceBand = "low";
  }

  const matchedBranch =
    top && confidenceBand === "high"
      ? (node.branches.find((b) => b.id === top.branchId) ?? null)
      : null;

  // Determine overall turn status:
  // Rule 13.4:
  // - If grammar fails -> "grammar_retry" (explain detected structure & give option to retry)
  // - If grammar passes and confidence is high -> "advance" (proceed to matched branch's follow-up)
  // - If grammar passes (or acceptable) and confidence is low/ambiguous -> "clarification_needed"
  //   (ask for clarification politely, DO NOT automatically mark wrong!)
  let status: DialogueEvaluationStatus;
  if (!grammar.passed) {
    status = "grammar_retry";
  } else if (confidenceBand === "high" && matchedBranch) {
    status = "advance";
  } else {
    status = "clarification_needed";
  }

  const branchOptionsText = node.branches.map((b) => `«${b.label}»`).join(", ");
  // A rejected competing branch is not a contradiction in the winning branch.
  if (confidenceBand === "high") { detectedTrap = undefined; detectedTrapExplanation = undefined; }
  const clarificationPrompt = detectedTrapExplanation
    ? `${detectedTrapExplanation} Struktur target (${grammar.detectedStructure}) terdeteksi. Mohon klarifikasi maksud Anda: apakah berkaitan dengan ${branchOptionsText}?`
    : `Struktur target (${grammar.detectedStructure}) terdeteksi. Arah topik belum cukup jelas untuk memilih cabang. Apakah maksud Anda mengarah ke ${branchOptionsText}? Perjelas kalimat atau pilih arah topik di bawah; jawaban Anda tidak otomatis dinilai salah.`;

  return {
    status,
    grammar,
    confidenceBand,
    matchedBranch,
    topScore,
    topPercentage,
    intentRankings: rankings,
    source: hasMiniLm ? "minilm-hybrid" : "local-multi-example",
    latencyMs: options?.latencyMs,
    criticalTrap: detectedTrap,
    criticalTrapExplanation: detectedTrapExplanation,
    clarificationPrompt:
      status === "clarification_needed" ? clarificationPrompt : undefined,
    limitationsNote: QA_SEMANTIC_LIMITATIONS_NOTE,
  };
}
