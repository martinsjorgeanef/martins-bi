export interface CleanedProduct {
  brand: string;
  tipo: string | null;
  linha: string | null;
  descriptor: string;
  weight: string | null;
}

// Prefixo tecnico do cadastro -> tipo comercial do produto.
// Adicione mais linhas aqui conforme aparecerem novos prefixos.
var TYPE_DICTIONARY: [string, string][] = [
  ["CR.DENT.", "Creme Dental"],
  ["CR DENT", "Creme Dental"],
  ["ENXAG.BUCAL", "Enxaguante Bucal"],
  ["ENX.B.", "Enxaguante Bucal"],
  ["ENX B", "Enxaguante Bucal"],
  ["ESC.DENT", "Escova Dental"],
  ["ESC.", "Escova Dental"],
  ["SH.", "Shampoo"],
  ["CONDIC.", "Condicionador"],
  ["SAB.LIQ", "Sabonete Liquido"],
  ["SAB.", "Sabonete"],
  ["DEOD.", "Desodorante"],
  ["DES.", "Desodorante"],
  ["ABS.", "Absorvente"],
  ["FRD.", "Fralda"],
  ["TOALHA UME", "Toalha Umedecida"]
];

// Palavra-chave de linha reconhecida no restante do texto -> nome comercial padronizado.
// Ordem importa: termos mais especificos primeiro. Adicione novas linhas aqui.
var LINE_DICTIONARY: [string, string][] = [
  ["LUMINOUS WHITE", "Luminous White"],
  ["TOTAL PREV ATIV", "Total"],
  ["TOTAL PREVENCAO ATIVA", "Total"],
  ["MAXIMA PROTECAO", "Máxima Proteção"],
  ["MAX PROT", "Máxima Proteção"],
  ["TRIPLA ACAO", "Tripla Ação"],
  ["PERIOGARD", "Periogard"],
  ["PLAX", "Plax"],
  ["SENSITIVE", "Sensitive"],
  ["NATURALS", "Naturals"]
];

// Correcao de acentuacao para palavras soltas do restante da descricao.
// Adicione novas palavras aqui conforme forem aparecendo sem acento.
var WORD_FIXES: Record<string, string> = {
  PROTECAO: "Proteção",
  ACAO: "Ação",
  ANTICARIES: "Anticáries",
  ATICARIES: "Anticáries",
  SAUDAVEL: "Saudável",
  MAXIMA: "Máxima",
  CARVAO: "Carvão",
  ORIG: "Original",
  PREVENCAO: "Prevenção"
};

var NOISE_WORDS = ["GTS", "CX", "UN", "UND", "LV", "PG"];

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
    var unit = m[3].toLowerCase();
    matches.push({
      multiplier: m[1] || null,
      value: m[2].replace(",", "."),
      unit: unit === "gr" ? "g" : unit,
      raw: m[0]
    });
    rest = rest.replace(m[0], " ");
  }
  return { matches: matches, rest: normalizeSpaces(rest) };
}

function buildWeightLabel(matches: WeightMatch[]): string | null {
  if (matches.length === 0) return null;
  if (matches.length === 1) {
    return matches[0].value + matches[0].unit;
  }
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
  var upper = word.toUpperCase();
  if (WORD_FIXES[upper]) return WORD_FIXES[upper];
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function titleCaseWithFixes(text: string): string {
  var cleaned = normalizeSpaces(text.replace(/[.]/g, " "));
  if (cleaned.length === 0) return "";
  return cleaned
    .split(" ")
    .map(fixWord)
    .join(" ");
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

export function cleanProductName(rawDescription: string): CleanedProduct {
  var typeResult = stripTypePrefix(rawDescription);
  var working = stripNoiseWords(typeResult.rest);

  var weightResult = findWeights(working);
  working = stripNoiseWords(weightResult.rest);

  var words = working.split(" ").filter(function (w) {
    return w.length > 0;
  });
  var brand = words.length > 0 ? fixWord(words[0]) : "Diversos";
  var afterBrand = words.slice(1).join(" ");

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
