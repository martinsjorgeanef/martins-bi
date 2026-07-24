export interface CleanedProduct {
  brand: string;
  tipo: string | null;
  linha: string | null;
  descriptor: string;
  weight: string | null;
}

var TYPE_DICTIONARY: [string, string][] = [
  ["ENXAGUANTE BUCAL", "Enxaguante Bucal"],
  ["ENXAG.BUCAL", "Enxaguante Bucal"],
  ["ENX.B.", "Enxaguante Bucal"],
  ["ENX B", "Enxaguante Bucal"],
  ["ESCOVA DENTAL", "Escova Dental"],
  ["ESC.DENT", "Escova Dental"],
  ["ESC.", "Escova Dental"],
  ["CREME DENTAL", "Creme Dental"],
  ["CR.DENT.", "Creme Dental"],
  ["CR DENT", "Creme Dental"],
  ["SABONETE LIQUIDO", "Sabonete Liquido"],
  ["SAB.LIQ", "Sabonete Liquido"],
  ["SABONETE", "Sabonete"],
  ["SAB.", "Sabonete"],
  ["SHAMPOO", "Shampoo"],
  ["SH.", "Shampoo"],
  ["CONDICIONADOR", "Condicionador"],
  ["CONDIC.", "Condicionador"],
  ["DESODORANTE", "Desodorante"],
  ["DEOD.", "Desodorante"],
  ["DES.", "Desodorante"],
  ["ABSORVENTE", "Absorvente"],
  ["ABS.", "Absorvente"],
  ["FRALDA GERIATRICA", "Fralda Geriatrica"],
  ["FRALDA", "Fralda"],
  ["FRD.", "Fralda"],
  ["TOALHA UMEDECIDA", "Toalha Umedecida"],
  ["TOALHA UME", "Toalha Umedecida"]
];

var LINE_DICTIONARY: [string, string][] = [
  ["LUMINOUS WHITE", "Luminous White"],
  ["TOTAL PREV ATIV", "Total"],
  ["TOTAL PREVENCAO ATIVA", "Total"],
  ["MAXIMA PROTECAO", "Maxima Protecao"],
  ["MAX PROT", "Maxima Protecao"],
  ["TRIPLA ACAO", "Tripla Acao"],
  ["TRIPLA PROTECAO", "Tripla Protecao"],
  ["SUPREME CARE", "Supreme Care"],
  ["PERIOGARD", "Periogard"],
  ["PLAX", "Plax"],
  ["SENSITIVE", "Sensitive"],
  ["NATURALS", "Naturals"]
];

var WORD_FIXES: Record<string, string> = {
  PROTECAO: "Protecao",
  ACAO: "Acao",
  ANTICARIES: "Anticaries",
  ATICARIES: "Anticaries",
  SAUDAVEL: "Saudavel",
  MAXIMA: "Maxima",
  CARVAO: "Carvao",
  ORIG: "Original",
  PREVENCAO: "Prevencao",
  GERIATRICA: "Geriatrica"
};

var NOISE_WORDS = ["GTS", "CX", "UN", "UND", "LV", "PG"];

function normalizeWord(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripTypePrefix(text: string): { tipo: string | null; rest: string } {
  var upper = text.toUpperCase();
  for (var i = 0; i < TYPE_DICTIONARY.length; i++) {
    var prefix = TYPE_DICTIONARY[i][0];
    if (upper.indexOf(prefix) === 0) {
      return { tipo: TYPE_DICTIONARY[i][1], rest: normalizeSpaces(text.slice(prefix.length)) };
    }
  }
  return { tipo: null, rest: text };
}

interface WeightMatch {
  multiplier: string | null;
  value: string;
  unit: string;
  raw: string;
}

function findWeights(text: string): { matches: WeightMatch[]; rest: string } {
  var regex = /(?:(\d+)\s?X)?\s?(\d+[.,]?\d*)\s?(G|GR|ML|KG|L)\b/gi;
  var matches: WeightMatch[] = [];
  var rest = text;
  var m;
  while ((m = regex.exec(text)) !== null) {
    var multiplier = m[1] ? m[1].toUpperCase().replace("X", "x") : "";
    var value = m[2].replace(",", ".");
    var unit = m[3].toLowerCase();
    var unitFinal = unit === "gr" ? "g" : unit;
    matches.push({ multiplier: multiplier, value: value, unit: unitFinal, raw: m[0] });
    rest = rest.replace(m[0], " ");
  }
  return { matches: matches, rest: normalizeSpaces(rest) };
}

function buildWeightLabel(matches: WeightMatch[]): string | null {
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0].value + matches[0].unit;
  var parts = matches.map(function (m) {
    if (m.multiplier) return m.multiplier + "x" + m.value + m.unit;
    return m.value + m.unit;
  });
  return "Kit " + parts.join(" + ");
}

function stripNoiseWords(text: string): string {
  var words = text.split(" ").filter(function (w) {
    if (w.length === 0) return false;
    var upper = w.toUpperCase().replace(/[.]/g, "");
    if (NOISE_WORDS.indexOf(upper) !== -1) return false;
    if (/^\d+$/.test(w)) return false;
    return true;
  });
  return words.join(" ");
}

function fixWord(word: string): string {
  var upper = normalizeWord(word);
  if (WORD_FIXES[upper]) return WORD_FIXES[upper];
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function titleCaseWithFixes(text: string): string {
  var cleaned = normalizeSpaces(text.replace(/[.]/g, " "));
  if (cleaned.length === 0) return "";
  return cleaned.split(" ").map(fixWord).join(" ");
}

function detectLine(text: string): { linha: string | null; rest: string } {
  var upper = text.toUpperCase();
  for (var i = 0; i < LINE_DICTIONARY.length; i++) {
    var pattern = LINE_DICTIONARY[i][0];
    var idx = upper.indexOf(pattern);
    if (idx !== -1) {
      var rest = text.slice(0, idx) + text.slice(idx + pattern.length);
      return { linha: LINE_DICTIONARY[i][1], rest: normalizeSpaces(rest) };
    }
  }
  return { linha: null, rest: text };
}

function stripRedundantWords(words: string[], brand: string, categoryWords: string[]): string[] {
  var brandNorm = normalizeWord(brand);
  var categoryNorms = categoryWords.map(normalizeWord).filter(function (w) { return w.length >= 4; });

  return words.filter(function (w) {
    var norm = normalizeWord(w);
    if (norm === brandNorm) return false;
    if (categoryNorms.indexOf(norm) !== -1) return false;
    return true;
  });
}

export function cleanProductName(rawDescription: string, category?: string | null): CleanedProduct {
  var typeResult = stripTypePrefix(rawDescription);
  var working = stripNoiseWords(typeResult.rest);

  var weightResult = findWeights(working);
  working = stripNoiseWords(weightResult.rest);

  var words = working.split(" ").filter(function (w) { return w.length > 0; });
  var brand = words.length > 0 ? fixWord(words[0]) : "Diversos";
  var afterBrandWords = words.slice(1);

  var categoryWords = category ? category.split(" ") : [];
  afterBrandWords = stripRedundantWords(afterBrandWords, brand, categoryWords);

  var afterBrand = afterBrandWords.join(" ");
  var lineResult = detectLine(afterBrand);

  var descriptor = titleCaseWithFixes(lineResult.rest);

  return {
    brand: brand,
    tipo: typeResult.tipo,
    linha: lineResult.linha,
    descriptor: descriptor,
    weight: buildWeightLabel(weightResult.matches)
  };
}
