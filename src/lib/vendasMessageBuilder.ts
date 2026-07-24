import { DisadvantageItem } from "@/components/Charts";
import { buildVendasGroups, MAX_ITEMS_PER_LINE } from "./vendasGrouping";

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

export function buildVendasMessage(items: DisadvantageItem[], industryName: string | null) {
  var subject = "Oportunidades Comerciais - Vantagem Competitiva Martins";
  var groups = buildVendasGroups(items);

  var lines: string[] = [];
  lines.push("🔥 OPORTUNIDADES DO DIA 🔥");
  if (industryName) {
    lines.push("🏭 INDUSTRIA: " + industryName.toUpperCase());
  }
  lines.push("");
  lines.push("✅ Nota RJ");
  lines.push("✅ Prazo 45D");
  lines.push("✅ Todos os precos sao unitarios");
  lines.push("");

  groups.categoryNames.forEach(function (category) {
    lines.push(emojiFor(category) + " " + category.toUpperCase());
    lines.push("");

    var brandMap = groups.byCategory.get(category) as Map<string, Map<string, { label: string; price: number | undefined }[]>>;
    var tipoMap = groups.tipoByCategoryBrand.get(category);

    Array.from(brandMap.keys()).sort().forEach(function (brand) {
      lines.push(brand.toUpperCase());

      var uniformTipo = tipoMap ? tipoMap.get(brand) : null;
      if (uniformTipo) {
        lines.push(uniformTipo);
      }

      var lineMap = brandMap.get(brand) as Map<string, { label: string; price: number | undefined }[]>;
      Array.from(lineMap.keys()).sort().forEach(function (lineKey) {
        var variants = lineMap.get(lineKey) as { label: string; price: number | undefined }[];
        var shown = variants.slice(0, MAX_ITEMS_PER_LINE);
        var remaining = variants.length - shown.length;

        shown.forEach(function (v) {
          var priceText = v.price !== undefined ? "*" + money(v.price) + "*" : "-";
          lines.push("• " + v.label + " " + priceText);
        });
        if (remaining > 0) {
          lines.push("  (+" + remaining + " itens disponiveis)");
        }
      });
      lines.push("");
    });
  });

  lines.push("Bom trabalho e boas vendas!");

  return { subject: subject, body: lines.join("\n") };
}
