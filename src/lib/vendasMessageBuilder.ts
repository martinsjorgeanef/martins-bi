import { DisadvantageItem } from "@/components/Charts";
import { cleanProductName } from "./productNameCleaner";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) + " Un.";
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

interface FlatItem {
  label: string;
  price: number | undefined;
}

export function buildVendasMessage(items: DisadvantageItem[], industryName: string | null) {
  var subject = "Oportunidades Comerciais - Vantagem Competitiva Martins";

  var byCategory = new Map<string, Map<string, Map<string, FlatItem[]>>>();
  var byCategoryFlat = new Map<string, Map<string, FlatItem[]>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description);
    var line = cleaned.weight ? cleaned.descriptor + " " + cleaned.weight : cleaned.descriptor;
    var label = line.trim().length > 0 ? line.trim() : cleaned.weight || "";

    if (cleaned.linha) {
      if (!byCategory.has(category)) byCategory.set(category, new Map());
      var brandMapBuild = byCategory.get(category) as Map<string, Map<string, FlatItem[]>>;
      if (!brandMapBuild.has(cleaned.brand)) brandMapBuild.set(cleaned.brand, new Map());
      var lineMapBuild = brandMapBuild.get(cleaned.brand) as Map<string, FlatItem[]>;
      if (!lineMapBuild.has(cleaned.linha)) lineMapBuild.set(cleaned.linha, []);
      (lineMapBuild.get(cleaned.linha) as FlatItem[]).push({ label: label, price: it.martinsPrice });
    } else {
      if (!byCategoryFlat.has(category)) byCategoryFlat.set(category, new Map());
      var flatBrandMapBuild = byCategoryFlat.get(category) as Map<string, FlatItem[]>;
      if (!flatBrandMapBuild.has(cleaned.brand)) flatBrandMapBuild.set(cleaned.brand, []);
      var flatLabel = cleaned.tipo ? cleaned.tipo + " " + label : label;
      (flatBrandMapBuild.get(cleaned.brand) as FlatItem[]).push({ label: flatLabel, price: it.martinsPrice });
    }
  });

  var allCategoryNames = new Set<string>();
  Array.from(byCategory.keys()).forEach(function (c) { allCategoryNames.add(c); });
  Array.from(byCategoryFlat.keys()).forEach(function (c) { allCategoryNames.add(c); });
  var categoryNames = Array.from(allCategoryNames).sort();

  var lines: string[] = [];
  lines.push("🔥 OPORTUNIDADES DO DIA 🔥");
  if (industryName) {
    lines.push("🏭 INDUSTRIA: " + industryName.toUpperCase());
  }
  lines.push("");
  lines.push("✅ Nota RJ");
  lines.push("✅ Prazo 45D");
  lines.push("");

  categoryNames.forEach(function (category) {
    lines.push(emojiFor(category) + " " + category.toUpperCase());
    lines.push("");

    var brandMap = byCategory.get(category);
    if (brandMap) {
      var safeBrandMap = brandMap as Map<string, Map<string, FlatItem[]>>;
      var brandNames = Array.from(safeBrandMap.keys()).sort();
      brandNames.forEach(function (brand) {
        var lineMap = safeBrandMap.get(brand) as Map<string, FlatItem[]>;
        lines.push(brand.toUpperCase());
        var lineNames = Array.from(lineMap.keys()).sort();
        lineNames.forEach(function (lineName) {
          lines.push(lineName.toUpperCase());
          var arr = lineMap.get(lineName) as FlatItem[];
          arr.forEach(function (it) {
            var priceText = it.price !== undefined ? money(it.price) : "-";
            lines.push("• " + it.label + " " + priceText);
          });
        });
        lines.push("");
      });
    }

    var flatBrandMap = byCategoryFlat.get(category);
    if (flatBrandMap) {
      var safeFlatBrandMap = flatBrandMap as Map<string, FlatItem[]>;
      var flatBrandNames = Array.from(safeFlatBrandMap.keys()).sort();
      flatBrandNames.forEach(function (brand) {
        lines.push(brand.toUpperCase());
        var arr = safeFlatBrandMap.get(brand) as FlatItem[];
        arr.forEach(function (it) {
          var priceText = it.price !== undefined ? money(it.price) : "-";
          lines.push("• " + it.label + " " + priceText);
        });
        lines.push("");
      });
    }
  });

  lines.push("Bom trabalho e boas vendas!");

  return { subject: subject, body: lines.join("\n") };
}
