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
  "HIGIENE INFANTIL": "👶"
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

  var byCategory = new Map<string, Map<string, Map<string, VariantLine[]>>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);

    if (!byCategory.has(category)) byCategory.set(category, new Map());
    var brandMap = byCategory.get(category) as Map<string, Map<string, VariantLine[]>>;

    if (!brandMap.has(cleaned.brand)) brandMap.set(cleaned.brand, new Map());
    var itemMap = brandMap.get(cleaned.brand) as Map<string, VariantLine[]>;

    if (!itemMap.has(cleaned.itemName)) itemMap.set(cleaned.itemName, []);
    var arr = itemMap.get(cleaned.itemName) as VariantLine[];
    arr.push({ weight: cleaned.weight, price: it.martinsPrice });
  });

  var categoryNames = Array.from(byCategory.keys()).sort();

  var lines: string[] = [];
  lines.push("🔥 OPORTUNIDADES DO DIA 🔥");
  lines.push("");
  lines.push("✅ Nota RJ");
  lines.push("✅ Prazo 45D");
  lines.push("");

  categoryNames.forEach(function (category) {
    var brandMap = byCategory.get(category) as Map<string, Map<string, VariantLine[]>>;
    lines.push(emojiFor(category) + " " + category.toUpperCase());
    lines.push("");

    var brandNames = Array.from(brandMap.keys()).sort();
    brandNames.forEach(function (brand) {
      var itemMap = brandMap.get(brand) as Map<string, VariantLine[]>;
      lines.push(brand.toUpperCase());

      var itemNames = Array.from(itemMap.keys()).sort();
      itemNames.forEach(function (itemName) {
        var variants = itemMap.get(itemName) as VariantLine[];
        variants.forEach(function (v) {
          var priceText = v.price !== undefined ? money(v.price) : "-";
          var label = v.weight ? itemName + " " + v.weight : itemName;
          lines.push("• " + label + " | " + priceText);
        });
      });
      lines.push("");
    });
  });

  lines.push("Bora pracima e boas vendas!");

  return { subject: subject, body: lines.join("\n") };
}
