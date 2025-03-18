// Dictionary of common English words for local testing

export const commonWords = {
  // Single letter completions
  A: ["a", "at", "an", "as", "and", "are"],
  B: ["be", "by", "but", "been", "back", "best"],
  C: ["can", "cat", "car", "come", "case", "call"],
  D: ["do", "day", "did", "done", "down", "data"],
  E: ["eat", "egg", "end", "even", "ever", "each"],
  F: ["for", "from", "find", "fact", "full", "few"],
  G: ["get", "good", "go", "give", "got", "goal"],
  H: ["he", "his", "had", "has", "have", "home"],
  I: ["in", "it", "is", "if", "into", "idea"],
  J: ["job", "join", "just", "jump", "jury", "joke"],
  K: ["key", "know", "keep", "kind", "kick", "king"],
  L: ["like", "last", "less", "life", "look", "long"],
  M: ["me", "my", "may", "make", "more", "most"],
  N: ["no", "not", "new", "now", "next", "need"],
  O: ["of", "on", "or", "one", "out", "over"],
  P: ["put", "part", "plan", "play", "people", "point"],
  Q: ["quick", "quiet", "quite", "query", "quest", "queen"],
  R: ["run", "rate", "real", "read", "right", "role"],
  S: ["so", "see", "say", "set", "same", "some"],
  T: ["to", "the", "this", "that", "they", "them"],
  U: ["up", "us", "use", "unit", "upon", "under"],
  V: ["very", "view", "value", "visit", "voice", "vote"],
  W: ["we", "who", "what", "when", "where", "which"],
  X: ["xray", "xenon", "xerox", "xml", "xmas"],
  Y: ["you", "yes", "yet", "your", "year", "yield"],
  Z: ["zoo", "zero", "zone", "zoom", "zest"],

  // Common two-letter patterns
  TH: [
    "the",
    "this",
    "that",
    "there",
    "their",
    "them",
    "these",
    "those",
    "then",
    "than",
    "thus",
    "think",
  ],
  WH: ["what", "when", "where", "which", "why", "while", "whose", "whom"],
  AN: ["and", "any", "another", "answer", "animal", "annual", "angle"],
  IN: [
    "in",
    "into",
    "inside",
    "indeed",
    "instead",
    "income",
    "include",
    "increase",
  ],
  TO: ["to", "top", "today", "together", "tomorrow", "total", "touch", "town"],
  BE: ["be", "been", "before", "being", "began", "begin", "best", "better"],
  HE: ["he", "her", "here", "help", "hello", "head", "health", "heart"],
  RE: [
    "red",
    "read",
    "real",
    "really",
    "reason",
    "receive",
    "recent",
    "release",
  ],
  NO: ["no", "not", "none", "north", "note", "nothing", "notice", "normal"],
  ON: ["on", "one", "only", "once", "online", "onto", "ongoing"],

  // Common word beginnings
  PRE: [
    "prepare",
    "present",
    "prevent",
    "premium",
    "prefer",
    "predict",
    "president",
  ],
  CON: [
    "contact",
    "control",
    "consider",
    "continue",
    "connect",
    "contain",
    "confirm",
    "concern",
  ],
  DIS: [
    "discover",
    "distance",
    "discuss",
    "disease",
    "display",
    "district",
    "discount",
  ],
  COM: [
    "come",
    "common",
    "company",
    "complete",
    "compare",
    "computer",
    "community",
  ],
  PRO: [
    "problem",
    "process",
    "product",
    "program",
    "project",
    "protect",
    "provide",
  ],
  EX: [
    "example",
    "expect",
    "explain",
    "exactly",
    "examine",
    "executive",
    "exercise",
    "exist",
  ],
  UN: [
    "under",
    "understand",
    "until",
    "university",
    "unit",
    "unless",
    "unusual",
  ],
  IM: [
    "important",
    "improve",
    "image",
    "immediate",
    "impact",
    "implement",
    "imagine",
  ],
  EN: [
    "enough",
    "enjoy",
    "enter",
    "energy",
    "engage",
    "ensure",
    "entire",
    "encourage",
  ],
  RE: [
    "return",
    "result",
    "remain",
    "research",
    "report",
    "require",
    "resource",
  ],

  // Common word sequences
  "I AM": ["i am", "i am not", "i am going", "i am here", "i am ready"],
  "I WILL": ["i will", "i will be", "i will go", "i will try", "i will do"],
  "CAN YOU": [
    "can you",
    "can you help",
    "can you please",
    "can you see",
    "can you do",
  ],
  "HOW TO": [
    "how to",
    "how to get",
    "how to make",
    "how to use",
    "how to find",
  ],
  "THANK YOU": [
    "thank you",
    "thank you for",
    "thank you so much",
    "thank you very much",
  ],
  "I NEED": ["i need", "i need to", "i need help", "i need some", "i need a"],
  "I WANT": ["i want", "i want to", "i want some", "i want a", "i want the"],
  "I DONT": [
    "i don't",
    "i don't know",
    "i don't think",
    "i don't want",
    "i don't like",
  ],
  "I HAVE": ["i have", "i have a", "i have to", "i have been", "i have some"],
  PLEASE: ["please", "please help", "please wait", "please do", "please stop"],

  // Common swipe patterns
  QWERTY: ["qwerty", "query", "quest", "question"],
  ASDFG: ["ask", "aside", "asdf", "aspire", "assist"],
  ZXCVB: ["zeal", "zealous", "zinc", "zip", "zoom"],
  YUIOP: ["you", "your", "young", "youth", "yourself"],
  GHJKL: ["ghost", "ghoul", "girl", "gift", "give"],
  BNMKJ: ["bank", "bang", "being", "bring", "built"],
  QWER: ["query", "quest", "queen", "quick", "question"],
  ASDF: ["asked", "aside", "asset", "assist", "assign"],
  ZXCV: ["zeal", "zealous", "zone", "zoom", "zero"],
  POIUY: ["point", "policy", "police", "position", "positive"],

  // Most frequent English words
  THE: ["the", "them", "they", "their", "there", "these", "then"],
  BE: ["be", "been", "being", "because", "before", "became"],
  AND: ["and", "andrew", "anderson", "android", "andy"],
  OF: ["of", "off", "often", "office", "offer", "official"],
  TO: ["to", "today", "together", "tomorrow", "top", "total"],
  IN: ["in", "into", "inside", "indeed", "instead", "include"],
  THAT: ["that", "that's", "than", "thank", "thanks", "therapy"],
  HAVE: ["have", "haven't", "having", "had", "has", "hadn't"],
  FOR: ["for", "form", "formal", "format", "forth", "forward"],
  NOT: ["not", "nothing", "note", "notice", "notify", "noted"],
  WITH: ["with", "without", "within", "withdraw", "withhold"],

  // Common short words
  IS: ["is", "isn't", "island", "issue", "isolate"],
  ON: ["on", "only", "one", "once", "online", "ongoing"],
  YOU: ["you", "your", "you're", "young", "youth", "yourself"],
  ARE: ["are", "aren't", "area", "around", "argue", "arrival"],
  WAS: ["was", "wasn't", "wash", "waste", "watch", "water"],
  WERE: ["were", "weren't", "west", "western", "wet"],
  AS: ["as", "ask", "asset", "assign", "assume", "assure"],
  BUT: ["but", "button", "butler", "butter", "butterfly"],
  THEY: ["they", "they're", "them", "their", "there", "themselves"],
  HIS: ["his", "history", "himself", "hispanic", "historic"],

  // Health-related terms (useful for MND users)
  HELP: ["help", "helper", "helpful", "helping", "helped"],
  NEED: ["need", "needed", "needs", "needing"],
  CARE: ["care", "careful", "caring", "caretaker", "caregiver"],
  PAIN: ["pain", "painful", "painkiller", "pains"],
  REST: ["rest", "resting", "restful", "rested", "restaurant"],
  MOVE: ["move", "movement", "moving", "moved", "mover"],
  FOOD: ["food", "foods", "foodie", "foodstuff"],
  WATER: ["water", "watery", "waters", "watered", "watering"],
  MEDICINE: ["medicine", "medical", "medication", "medicinal", "medicare"],
  DOCTOR: ["doctor", "doctors", "doctoral", "doctorate"],

  // Common daily activities
  EAT: ["eat", "eating", "eaten", "eater", "eatery"],
  DRINK: ["drink", "drinks", "drinking", "drinker", "drunk"],
  SLEEP: ["sleep", "sleeping", "sleepy", "sleeper", "slept"],
  WAKE: ["wake", "waking", "woken", "wakes", "wakeup"],
  WALK: ["walk", "walking", "walked", "walks", "walker"],
  SIT: ["sit", "sitting", "sits", "sitter"],
  TALK: ["talk", "talking", "talked", "talks", "talker"],
  READ: ["read", "reading", "reader", "reads", "readable"],
  WRITE: ["write", "writing", "writer", "writes", "written"],
  WATCH: ["watch", "watching", "watched", "watches", "watcher"],

  // Common keyboard paths by letter positioning
  QW: ["quickly", "quiet", "question", "queen", "quality"],
  WE: ["we", "were", "well", "went", "west", "weather"],
  ER: ["error", "early", "earth", "earn", "era", "erase"],
  RT: ["right", "rate", "return", "rather", "result", "retire"],
  TY: ["type", "try", "typical", "typo", "tyranny", "tycoon"],
  YU: ["young", "your", "youth", "yummy", "yurt"],
  UI: ["ui", "unique", "united", "uniform", "unit"],
  IO: ["ion", "io", "iowa", "iota", "iodine"],
  OP: ["open", "option", "operate", "opinion", "oppose"],
  AS: ["as", "ask", "asset", "assume", "assist"],
  SD: ["sd", "sdk", "sdfgh", "sdf", "sdcard"],
  DF: ["define", "default", "defense", "defer", "deficit"],
  FG: ["figure", "fight", "forget", "forge", "frog"],
  GH: ["ghost", "ghoul", "ghastly", "ghana", "ghetto"],
  HJ: ["hi", "hjk", "hjkl", "hjklm"],
  JK: ["joke", "jk", "jklm", "jacket", "jackpot"],
  KL: ["kl", "klo", "klm", "klaus", "klondike"],
  ZX: ["zx", "zxc", "zxcv", "zxcvb", "zxcvbn"],
  XC: ["xcel", "xcuse", "xcept", "xcode", "xc"],
  CV: ["cv", "cover", "cave", "cove", "cvs"],
};

// More sophisticated similarity function to better match the swipe patterns
export function calculateSimilarity(swipePattern, dictionaryPattern) {
  // Normalize strings for comparison
  const s1 = swipePattern.toUpperCase();
  const s2 = dictionaryPattern.toUpperCase();

  // Special case for single letter input
  if (s1.length === 1) {
    return s1 === s2[0] ? 0.9 : 0;
  }

  // First and last letter match weights more
  let firstLetterMatch = s1[0] === s2[0] ? 0.2 : 0;
  let lastLetterMatch = s1[s1.length - 1] === s2[s2.length - 1] ? 0.2 : 0;

  // Count matching characters in order
  let orderMatches = 0;
  let lastMatchIndex = -1;

  for (let i = 0; i < s1.length; i++) {
    // Find next occurrence of character after last match
    const nextIndex = s2.indexOf(s1[i], lastMatchIndex + 1);
    if (nextIndex > -1) {
      orderMatches++;
      lastMatchIndex = nextIndex;
    }
  }

  // Calculate order similarity
  const orderSimilarity = orderMatches / Math.max(s1.length, 1);

  // Count character occurrences regardless of order
  let sharedChars = 0;
  const s2Chars = [...s2];

  for (const char of s1) {
    const indexInS2 = s2Chars.indexOf(char);
    if (indexInS2 > -1) {
      sharedChars++;
      s2Chars.splice(indexInS2, 1); // Remove the matched character
    }
  }

  // Calculate character similarity
  const charSimilarity = sharedChars / Math.max(s1.length, 1);

  // Length similarity factor - penalty for big length differences
  const lengthDiff = Math.abs(s1.length - s2.length);
  const lengthFactor = 1 - lengthDiff / Math.max(s1.length, s2.length, 1);

  // Combine all factors with weights
  return (
    (firstLetterMatch + lastLetterMatch) * 0.4 + // 40% weight for first/last match
    orderSimilarity * 0.3 + // 30% weight for order matching
    charSimilarity * 0.2 + // 20% weight for character matching
    lengthFactor * 0.1 // 10% weight for length similarity
  );
}

// Function to find the most probable words based on a swipe pattern
export function findBestMatches(swipePattern, maxResults = 3) {
  // Direct match case
  if (commonWords[swipePattern]) {
    return commonWords[swipePattern].slice(0, maxResults);
  }

  // Find closest matches
  const matches = [];

  // Check all patterns in dictionary
  for (const pattern in commonWords) {
    const similarity = calculateSimilarity(swipePattern, pattern);

    if (similarity > 0.4) {
      // Minimum threshold
      // For each matching pattern, add its words with their scores
      commonWords[pattern].forEach((word) => {
        matches.push({
          word: word,
          score: similarity,
        });
      });
    }
  }

  // Sort by similarity score (highest first)
  matches.sort((a, b) => b.score - a.score);

  // Return unique words with highest scores
  const uniqueWords = [];
  const seenWords = new Set();

  for (const match of matches) {
    if (!seenWords.has(match.word)) {
      uniqueWords.push(match.word);
      seenWords.add(match.word);

      if (uniqueWords.length >= maxResults) break;
    }
  }

  // If we still don't have enough matches, add some common words
  if (uniqueWords.length < maxResults) {
    const firstLetter = swipePattern[0]?.toUpperCase();
    if (firstLetter && commonWords[firstLetter]) {
      for (const word of commonWords[firstLetter]) {
        if (!seenWords.has(word)) {
          uniqueWords.push(word);
          seenWords.add(word);

          if (uniqueWords.length >= maxResults) break;
        }
      }
    }
  }

  // If still not enough, add most common words
  if (uniqueWords.length < maxResults) {
    const commonEnglishWords = [
      "the",
      "be",
      "to",
      "of",
      "and",
      "in",
      "that",
      "have",
    ];
    for (const word of commonEnglishWords) {
      if (!seenWords.has(word)) {
        uniqueWords.push(word);
        if (uniqueWords.length >= maxResults) break;
      }
    }
  }

  return uniqueWords;
}
