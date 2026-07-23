export interface CleanedProduct {
  brand: string;
  itemName: string;
  weight: string | null;
}

var TYPE_PREFIXES = [
  "CR.DENT.",
  "CR DENT",
  "ENXAG.BUCAL",
  "ENX.B.",
  "ENX B",
  "SH.",
  "CONDIC.",
  "SAB.",
  "ESC.",
  "DEOD.",
  "DES.",
  "ABS.",
  "FRD.",
  "TOALHA UME"
];

var NOISE_PATTERNS = [
  /\bLV\s?\d+\b/gi,
  /\bPG\s?\d+\b/gi,
  /\(CP\)/gi,
  /\bCX\b/gi,
  /\bUN\b/gi,
  /\bUND\b/gi,
  /\bGTS\b/gi,
  /\bC\/\d+\b/gi
];

function stripTypePrefix(text: string): string {
  var upper = text.toUpperCase();
  for (var i = 0; i < TYPE_PREFIXES.length; i++) {
    var prefix = TYPE_PREFIXES[i];
    if (upper.indexOf(prefix) === 0) {
      return text.slice(prefix.length).trim();
    }
  }
  return text;
}

function stripNoise(text: string): string {
  var result = text;
  for (var i = 0; i < NOISE_PATTERNS.length; i++) {
    result = result.replace(NOISE_PATTERNS[i], " ");
  }
  return result.replace(/\s+/g, " ").trim();
}

function extractWeights(text: string): { weight: string | null; rest: string } {
  var regex = /(\d+X)?\s?(\d+[.,]?\d*)\s?(G|GR|ML|KG|L)\b/gi;
  var matches: string[] = [];
  var rest = text;
  var m;
  while ((m = regex.exec(text)) !== null) {
    var multiplier = m[1] ? m[1].toUpperCase().replace("X", "x") : "";
    var value = m[2].replace(",", ".");
    var unit = m[3].toLowerCase();
    var unitFinal = unit === "gr" ? "g" : unit;
    matches.push(multiplier + value + unitFinal);
    rest = rest.replace(m[0], " ");
  }
  rest = rest.replace(/\s+/g, " ").trim();

  if (matches.length === 0) return { weight: null, rest: rest };
  if (matches.length === 1) return { weight: matches[0], rest: rest };
  return { weight: "Kit " + matches.join(" + "), rest: rest };
}

function titleCase(text: string): string {
  var cleaned = text.replace(/[.]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) return "";
  return cleaned
    .toLowerCase()
    .split(" ")
    .map(function (w) {
      if (w.length === 0) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export function cleanProductName(rawDescription: string): CleanedProduct {
  var working = stripTypePrefix(rawDescription);
  working = stripNoise(working);

  var weightResult = extractWeights(working);
  working = weightResult.rest;

  var words = working.split(" ").filter(function (w) {
    return w.length > 0;
  });

  var brand = words.length > 0 ? titleCase(words[0]) : "Diversos";
  var itemWords = words.slice(1);
  var itemName = itemWords.length > 0 ? titleCase(itemWords.join(" ")) : titleCase(working);

  if (itemName.length === 0) itemName = brand;

  return {
    brand: brand,
    itemName: itemName,
    weight: weightResult.weight
  };
}
