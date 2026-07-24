export interface CleanedProduct {
  brand: string;
  tipo: string | null;
  header: string;
  itemLabel: string;
}

var TYPE_DICTIONARY: [string, string][] = [
  ["CREME ASSADURA", "Creme para Assadura"],
  ["COLONIA", "Colonia"],
  ["LENCOS UMEDECIDOS", "Lencos Umedecidos"],
  ["LENCO UME", "Lencos Umedecidos"],
  ["TOALHAS UMEDECIDAS", "Toalhas Umedecidas"],
  ["TOALHA UME", "Toalhas Umedecidas"],
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
  ["FRD.", "Fralda"]
];

interface LineEntry {
  words: string[];
  label: string;
  onlyCategoryContains?: string;
}

var LINE_DICTIONARY_RAW: { pattern: string; label: string; onlyCategoryContains?: string }[] = [
  { pattern: "ROUPINHA PROTECAO ACOLCHOADA", label: "Roupinha Protecao Acolchoada" },
  { pattern: "TRIPLA PROTECAO MEGA", label: "Tripla Protecao Mega" },
  { pattern: "SUPREME CARE", label: "Supreme Care", onlyCategoryContains: "FRALD" },
  { pattern: "NATURAL CARE", label: "Natural Care", onlyCategoryContains: "FRALD" },
  { pattern: "ACTIVE MULHER", label: "Active Mulher" },
  { pattern: "PROTECT PLUS", label: "Protect Plus" },
  { pattern: "TRIPLA PROTECAO", label: "Tripla Protecao" },
  { pattern: "LUMINOUS WHITE", label: "Luminous White" },
  { pattern: "TOTAL PREV ATIV", label: "Total" },
  { pattern: "TOTAL PREVENCAO ATIVA", label: "Total" },
  { pattern: "MAXIMA PROTECAO", label: "Maxima Protecao" },
  { pattern: "MAX PROT", label: "Maxima Protecao" },
  { pattern: "TRIPLA ACAO", label: "Tripla Acao" },
  { pattern: "PERIOGARD", label: "Periogard" },
  { pattern: "PLAX", label: "Plax" },
  { pattern: "SENSITIVE", label: "Sensitive" },
  { pattern: "NATURALS", label: "Naturals" },
  { pattern: "GEL", label: "Gel", onlyCategoryContains: "ABSORV" }
];

var LINE_DICTIONARY: LineEntry[] = LINE_DICTIONARY_RAW.map(function (e) {
  return { words: e.pattern.split(" "), label: e.label, onlyCategoryContains: e.onlyCategoryContains };
}).sort(function (a, b) {
  return b.words.length - a.words.length;
});

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
  GERIATRICA: "Geriatrica",
  DIARIA: "Diaria"
};

var FILLER_WORDS = ["HIPER", "LV", "PG", "GTS", "CX", "UN", "UND"];

var SIZE_CODE_REGEX = /^[A-Z]{1,4}(\/[A-Z]{1,4})?$/;
var UNIT_TOKEN_REGEX = /^(\d+[.,]?\d*)(G|GR|ML|KG|L)$/i;
var NXN_TOKEN_REGEX = /^(\d+)X(\d+)$/i;

function normalizeWord(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
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

function normalizeAbasPhrases(text: string): string {
  return text
    .replace(/\bCOM\s+ABAS\b/gi, "c/Abas")
    .replace(/\bSEM\s+ABAS\b/gi, "s/Abas")
    .replace(/\bC\/ABAS\b/gi, "c/Abas")
    .replace(/\bS\/ABAS\b/gi, "s/Abas");
}

function removeWordsFromTokens(tokens: string[], wordsToRemove: string[]): string[] {
  var normSet = wordsToRemove.map(normalizeWord);
  return tokens.filter(function (t) {
    return normSet.indexOf(normalizeWord(t)) === -1;
  });
}

function matchLineDictionary(tokens: string[], category: string | null): { entry: LineEntry; index: number } | null {
  var categoryNorm = category ? normalizeWord(category) : "";
  var normTokens = tokens.map(normalizeWord);

  for (var e = 0; e < LINE_DICTIONARY.length; e++) {
    var entry = LINE_DICTIONARY[e];
    if (entry.onlyCategoryContains && categoryNorm.indexOf(entry.onlyCategoryContains) === -1) continue;

    var patternLen = entry.words.length;
    for (var i = 0; i <= normTokens.length - patternLen; i++) {
      var matches = true;
      for (var j = 0; j < patternLen; j++) {
        if (normTokens[i + j] !== entry.words[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return { entry: entry, index: i };
    }
  }
  return null;
}

function classifyToken(token: string): string {
  var nxnMatch = token.match(NXN_TOKEN_REGEX);
  if (nxnMatch) {
    var first = nxnMatch[1];
    var second = nxnMatch[2];
    if (second === "1") return first + "un";
    return first + "x" + second;
  }

  var unitMatch = token.match(UNIT_TOKEN_REGEX);
  if (unitMatch) {
    var value = unitMatch[1].replace(",", ".");
    var unit = unitMatch[2].toLowerCase();
    return value + (unit === "gr" ? "g" : unit);
  }

  if (token.indexOf("/") !== -1 && SIZE_CODE_REGEX.test(token.toUpperCase())) {
    return token.toUpperCase();
  }

  if (SIZE_CODE_REGEX.test(token.toUpperCase()) && token.length <= 4) {
    return token.toUpperCase();
  }

  var norm = normalizeWord(token);
  if (WORD_FIXES[norm]) return WORD_FIXES[norm];

  if (token.length === 0) return token;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

function assembleTokens(tokens: string[]): string {
  return tokens
    .map(classifyToken)
    .filter(function (t) { return t.length > 0; })
    .join(" ");
}

export function cleanProductName(rawDescription: string, category?: string | null): CleanedProduct {
  var typeResult = stripTypePrefix(rawDescription);
  var working = normalizeAbasPhrases(typeResult.rest);

  var tokens = working.split(" ").filter(function (t) { return t.length > 0; });

  var brand = tokens.length > 0 ? classifyBrand(tokens[0]) : "Diversos";
  var rest = tokens.slice(1);

  var categoryWords = category ? category.split(" ").filter(function (w) { return normalizeWord(w).length >= 4; }) : [];
  rest = removeWordsFromTokens(rest, categoryWords);
  rest = removeWordsFromTokens(rest, FILLER_WORDS);

  var categoryNorm = category ? normalizeWord(category) : "";
  var tipoNorm = typeResult.tipo ? normalizeWord(typeResult.tipo).split(" ") : [];
  var tipoIsRedundant = typeResult.tipo !== null && tipoNorm.some(function (w) {
    return w.length >= 4 && categoryNorm.indexOf(w) !== -1;
  });

  var lineMatch = matchLineDictionary(rest, category || null);

  var header: string;
  var itemTokens: string[];

  if (lineMatch) {
    header = lineMatch.entry.label;
    itemTokens = rest.slice(0, lineMatch.index).concat(rest.slice(lineMatch.index + lineMatch.entry.words.length));
  } else if (typeResult.tipo && !tipoIsRedundant) {
    header = typeResult.tipo;
    itemTokens = rest;
  } else if (typeResult.tipo) {
    header = typeResult.tipo;
    itemTokens = rest;
  } else if (rest.length > 0) {
    header = assembleTokens(rest.slice(0, Math.min(3, rest.length)));
    itemTokens = rest.slice(Math.min(3, rest.length));
  } else {
    header = brand;
    itemTokens = [];
  }

  var itemLabel = assembleTokens(itemTokens);
  if (itemLabel.trim().length === 0) {
    itemLabel = header;
  }

  return { brand: brand, tipo: typeResult.tipo, header: header, itemLabel: itemLabel };
}

function classifyBrand(word: string): string {
  if (word.length === 0) return "Diversos";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
