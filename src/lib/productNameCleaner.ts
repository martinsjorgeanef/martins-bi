export interface CleanedProduct {
  itemName: string;
  weight: string | null;
}

var NOISE_PATTERNS = [
  /\b\d+X\d*\b/gi,
  /\bLV\s?\d+\b/gi,
  /\bPG\s?\d+\b/gi,
  /\(CP\)/gi,
  /\bCX\b/gi,
  /\bUN\b/gi,
  /\bUND\b/gi,
  /\bC\/\d+\b/gi
];

function stripNoise(text: string): string {
  var result = text;
  for (var i = 0; i < NOISE_PATTERNS.length; i++) {
    result = result.replace(NOISE_PATTERNS[i], " ");
  }
  return result.replace(/\s+/g, " ").trim();
}

function extractWeight(text: string): { weight: string | null; rest: string } {
  var match = text.match(/(\d+[.,]?\d*)\s?(G|GR|ML|KG|L)\b/i);
  if (!match) {
    return { weight: null, rest: text };
  }
  var value = match[1].replace(",", ".");
  var unit = match[2].toLowerCase();
  var weight = value + (unit === "gr" ? "g" : unit);
  var rest = text.replace(match[0], " ").replace(/\s+/g, " ").trim();
  return { weight: weight, rest: rest };
}

function titleCase(text: string): string {
  var cleaned = text.replace(/[.]/g, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) return "Item";

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
  var working = stripNoise(rawDescription);
  var weightResult = extractWeight(working);
  var itemName = titleCase(weightResult.rest);

  return {
    itemName: itemName,
    weight: weightResult.weight
  };
}
