import type { Verb } from "../types";

/**
 * 80 common verbs with explicit V1/V2/V3/-ing/3rd-singular forms.
 * Forms are stored explicitly (not auto-derived) so irregular verbs and
 * spelling changes (study -> studies, stop -> stopping) are always correct.
 *
 * Flags:
 * - stative: rejects continuous (-ing) tenses.
 * - transitive: eligible for passive voice.
 * - objectNumber: agreement for the object when it becomes a passive subject.
 * - oddPassive: transitive but sounds wrong in passive with this object
 *   (e.g. "the bus is taken"), so excluded from passive generation.
 */
export const VERBS: Verb[] = [
  v("work", "worked", "worked", "working", "works", { object: "hard" }),
  v("play", "played", "played", "playing", "plays", { t: 1, object: "football" }),
  v("study", "studied", "studied", "studying", "studies", { t: 1, object: "English" }),
  v("watch", "watched", "watched", "watching", "watches", { t: 1, object: "a movie" }),
  v("clean", "cleaned", "cleaned", "cleaning", "cleans", { t: 1, object: "the room" }),
  v("cook", "cooked", "cooked", "cooking", "cooks", { t: 1, object: "dinner" }),
  v("open", "opened", "opened", "opening", "opens", { t: 1, object: "the door" }),
  v("close", "closed", "closed", "closing", "closes", { t: 1, object: "the window" }),
  v("call", "called", "called", "calling", "calls", { t: 1, object: "a friend" }),
  v("help", "helped", "helped", "helping", "helps", { t: 1, object: "the children", on: "plural" }),
  v("finish", "finished", "finished", "finishing", "finishes", { t: 1, object: "the project" }),
  v("start", "started", "started", "starting", "starts", { t: 1, object: "the car" }),
  v("paint", "painted", "painted", "painting", "paints", { t: 1, object: "the house" }),
  v("repair", "repaired", "repaired", "repairing", "repairs", { t: 1, object: "the road" }),
  v("build", "built", "built", "building", "builds", { t: 1, object: "a bridge" }),
  v("write", "wrote", "written", "writing", "writes", { t: 1, object: "a letter" }),
  v("read", "read", "read", "reading", "reads", { t: 1, object: "a book" }),
  v("eat", "ate", "eaten", "eating", "eats", { t: 1, object: "breakfast" }),
  v("drink", "drank", "drunk", "drinking", "drinks", { t: 1, object: "coffee" }),
  v("make", "made", "made", "making", "makes", { t: 1, object: "a cake" }),
  v("take", "took", "taken", "taking", "takes", { t: 1, object: "the bus", odd: true }),
  v("give", "gave", "given", "giving", "gives", { t: 1, object: "a gift" }),
  v("buy", "bought", "bought", "buying", "buys", { t: 1, object: "a car" }),
  v("sell", "sold", "sold", "selling", "sells", { t: 1, object: "the books", on: "plural" }),
  v("send", "sent", "sent", "sending", "sends", { t: 1, object: "an email" }),
  v("bring", "brought", "brought", "bringing", "brings", { t: 1, object: "the documents", on: "plural" }),
  v("teach", "taught", "taught", "teaching", "teaches", { t: 1, object: "mathematics" }),
  v("catch", "caught", "caught", "catching", "catches", { t: 1, object: "the ball" }),
  v("throw", "threw", "thrown", "throwing", "throws", { t: 1, object: "the ball" }),
  v("kick", "kicked", "kicked", "kicking", "kicks", { t: 1, object: "the ball" }),
  v("drive", "drove", "driven", "driving", "drives", { t: 1, object: "a truck" }),
  v("ride", "rode", "ridden", "riding", "rides", { t: 1, object: "a bike", odd: true }),
  v("wash", "washed", "washed", "washing", "washes", { t: 1, object: "the dishes", on: "plural" }),
  v("fix", "fixed", "fixed", "fixing", "fixes", { t: 1, object: "the computer" }),
  v("wear", "wore", "worn", "wearing", "wears", { t: 1, object: "a jacket", odd: true }),
  v("draw", "drew", "drawn", "drawing", "draws", { t: 1, object: "a picture" }),
  v("win", "won", "won", "winning", "wins", { t: 1, object: "the game" }),
  v("lose", "lost", "lost", "losing", "loses", { t: 1, object: "the match" }),
  v("find", "found", "found", "finding", "finds", { t: 1, object: "the keys", on: "plural" }),
  v("meet", "met", "met", "meeting", "meets", { t: 1, object: "the manager", odd: true }),
  v("visit", "visited", "visited", "visiting", "visits", { t: 1, object: "the museum" }),
  v("invite", "invited", "invited", "inviting", "invites", { t: 1, object: "the guests", on: "plural" }),
  v("answer", "answered", "answered", "answering", "answers", { t: 1, object: "the question" }),
  v("ask", "asked", "asked", "asking", "asks", { t: 1, object: "a question" }),
  v("carry", "carried", "carried", "carrying", "carries", { t: 1, object: "the boxes", on: "plural" }),
  v("choose", "chose", "chosen", "choosing", "chooses", { t: 1, object: "a color" }),
  v("cut", "cut", "cut", "cutting", "cuts", { t: 1, object: "the paper" }),
  v("explain", "explained", "explained", "explaining", "explains", { t: 1, object: "the lesson" }),
  v("follow", "followed", "followed", "following", "follows", { t: 1, object: "the rules", on: "plural" }),
  v("grow", "grew", "grown", "growing", "grows", { t: 1, object: "vegetables", on: "plural" }),
  v("hold", "held", "held", "holding", "holds", { t: 1, object: "the bag" }),
  v("keep", "kept", "kept", "keeping", "keeps", { t: 1, object: "a diary" }),
  v("learn", "learned", "learned", "learning", "learns", { t: 1, object: "a language" }),
  v("leave", "left", "left", "leaving", "leaves", { t: 1, object: "the house", odd: true }),
  v("lead", "led", "led", "leading", "leads", { t: 1, object: "the team" }),
  v("move", "moved", "moved", "moving", "moves", { t: 1, object: "the furniture" }),
  v("pay", "paid", "paid", "paying", "pays", { t: 1, object: "the bill" }),
  v("plan", "planned", "planned", "planning", "plans", { t: 1, object: "the trip" }),
  v("prepare", "prepared", "prepared", "preparing", "prepares", { t: 1, object: "the meal" }),
  v("produce", "produced", "produced", "producing", "produces", { t: 1, object: "goods", on: "plural" }),
  v("protect", "protected", "protected", "protecting", "protects", { t: 1, object: "the environment" }),
  v("push", "pushed", "pushed", "pushing", "pushes", { t: 1, object: "the cart" }),
  v("pull", "pulled", "pulled", "pulling", "pulls", { t: 1, object: "the rope" }),
  v("raise", "raised", "raised", "raising", "raises", { t: 1, object: "money" }),
  v("return", "returned", "returned", "returning", "returns", { t: 1, object: "the books", on: "plural" }),
  v("save", "saved", "saved", "saving", "saves", { t: 1, object: "money" }),
  v("show", "showed", "shown", "showing", "shows", { t: 1, object: "the results", on: "plural" }),
  v("sign", "signed", "signed", "signing", "signs", { t: 1, object: "the contract" }),
  v("solve", "solved", "solved", "solving", "solves", { t: 1, object: "the problem" }),
  v("speak", "spoke", "spoken", "speaking", "speaks", { t: 1, object: "English" }),
  v("spend", "spent", "spent", "spending", "spends", { t: 1, object: "the money" }),
  v("develop", "developed", "developed", "developing", "develops", { t: 1, object: "the app" }),
  v("test", "tested", "tested", "testing", "tests", { t: 1, object: "the software" }),
  v("use", "used", "used", "using", "uses", { t: 1, object: "a computer" }),
  v("wait", "waited", "waited", "waiting", "waits", { object: "for the bus" }),
  v("sleep", "slept", "slept", "sleeping", "sleeps", {}),
  v("run", "ran", "run", "running", "runs", { object: "fast" }),
  v("swim", "swam", "swum", "swimming", "swims", { object: "well" }),
  // stative verbs (reject -ing) - used for the trap drill; also intransitive-ish here
  v("know", "knew", "known", "knowing", "knows", { t: 1, stative: true, object: "the answer", odd: true }),
  v("believe", "believed", "believed", "believing", "believes", { t: 1, stative: true, object: "the story", odd: true }),
];

interface Opt {
  /** transitive flag; 1 = true */
  t?: 1;
  stative?: boolean;
  object?: string;
  /** object number for passive agreement; defaults to singular */
  on?: "singular" | "plural";
  /** sounds odd in the passive with this object */
  odd?: boolean;
}

function v(
  base: string,
  past: string,
  participle: string,
  ing: string,
  thirdSingular: string,
  o: Opt,
): Verb {
  return {
    base,
    past,
    participle,
    ing,
    thirdSingular,
    transitive: o.t === 1,
    stative: Boolean(o.stative),
    object: o.object ?? "",
    objectNumber: o.on ?? "singular",
    oddPassive: Boolean(o.odd),
  };
}

/** Transitive verbs that read naturally in the passive. */
export const PASSIVE_VERBS = VERBS.filter((v) => v.transitive && !v.oddPassive && !v.stative);

/** Verbs usable in continuous tenses (non-stative). */
export const DYNAMIC_VERBS = VERBS.filter((v) => !v.stative);

/** Stative verbs for the "fallback" trap drill. */
export const STATIVE_VERBS = VERBS.filter((v) => v.stative);
