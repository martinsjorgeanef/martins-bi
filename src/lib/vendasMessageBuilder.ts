import { DisadvantageItem } from "@/components/Charts";
import { cleanProductName } from "./productNameCleaner";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

var CATEGORY_EMOJI: Record<string, string> = {
  "HIGIENE BUCAL": "🦷",
  SABONETE: "🧼",
  SABONETES: "🧼",
  "CUIDADO COM O CABELO": "🧴",
  "HIGIENE INFANTIL": "👶",
  "CUIDADO COM O SOL": "☀️"
};

function emojiFor(category: string): string {
  var key = category.toUpperCase();
  return CATEGORY_EMOJI[key] || "🛍️";
}

interface VariantLine {
  weight: string | null;
  price: number | undefined;
}

export function buildVendasMessage(items: DisadvantageItem[]) {
  var subject = "Oportunidades Comerciais - Vantagem Competitiva Martins";

  var byCategory = new Map<string, Map<string, VariantLine[]>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);

    if (!byCategory.has(category)) byCategory.set(category, new Map());
    var itemMap = byCategory.get(category) as Map<string, VariantLine[]>;

    if (!itemMap.has(cleaned.itemName)) itemMap.set(cleaned.itemName, []);
    var arr = itemMap.get(cleaned.itemName) as VariantLine[];
    arr.push({ weight: cleaned.weight, price: it.martinsPrice });
  });

  var categoryNames = Array.from(byCategory.keys()).sort(function (a, b) {
    var mapA = byCategory.get(a) as Map<string, VariantLine[]>;
    var mapB = byCategory.get(b) as Map<string, VariantLine[]>;
    return mapB.size - mapA.size;
  });

  var lines: string[] = [];
  lines.push("🔥 OPORTUNIDADES DO DIA 🔥");
  lines.push("");
  lines.push("✅ Nota RJ");
  lines.push("✅ Prazo 45D");
  lines.push("");

  categoryNames.forEach(function (category) {
    var itemMap = byCategory.get(category) as Map<string, VariantLine[]>;
    lines.push(emojiFor(category) + " " + category.toUpperCase());
    lines.push("");

    var itemNames = Array.from(itemMap.keys()).sort();
    itemNames.forEach(function (itemName) {
      var variants = itemMap.get(itemName) as VariantLine[];
      lines.push(itemName);
      variants.forEach(function (v) {
        var priceText = v.price !== undefined ? money(v.price) : "-";
        if (v.weight) {
          lines.push("• " + v.weight + " | " + priceText);
        } else {
          lines.push("• " + priceText);
        }
      });
    });
    lines.push("");
  });

  lines.push("Bom trabalho e boas vendas!");

  return { subject: subject, body: lines.join("\n") };
}
