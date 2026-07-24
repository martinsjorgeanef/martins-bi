import { DisadvantageItem } from "@/components/Charts";
import { buildVendasGroups, MAX_ITEMS_PER_LINE, VendasMode } from "./vendasGrouping";

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

export function buildVendasMessage(items: DisadvantageItem[], industryName: string | null, mode: VendasMode) {
  var subject =
    mode === "completo" ? "Catalogo Completo - Martins" : "Oportunidades Comerciais - Vantagem Competitiva Martins";
  var groups = buildVendasGroups(items);
  var limit = mode === "completo" ? Infinity : MAX_ITEMS_PER_LINE;

  var lines: string[] = [];
  lines.push(mode === "completo" ? "📖 CATALOGO COMPLETO" : "🔥 OPORTUNIDADES DO DIA 🔥");
  if (industryName) {
    lines.push("🏭 " + industryName);
  }
  lines.push("");
  lines.push("✅ Nota RJ");
  lines.push("✅ Prazo 45D");
  lines.push("✅ Precos unitarios");
  lines.push("────────────────────");
  lines.push("");

  groups.categoryNames.forEach(function (category) {
    lines.push(emojiFor(category) + " " + category.toUpperCase());
    lines.push("");

    var brandMap = groups.byCategory.get(category) as Map<string, Map<string, { label: string; price: number | undefined }[]>>;

    Array.from(brandMap.keys()).sort().forEach(function (brand) {
      lines.push(brand.toUpperCase());
      lines.push("");

      var headerMap = brandMap.get(brand) as Map<string, { label: string; price: number | undefined }[]>;
      Array.from(headerMap.keys()).sort().forEach(function (header) {
        lines.push(header);

        var variants = headerMap.get(header) as { label: string; price: number | undefined }[];
        var shown = isFinite(limit) ? variants.slice(0, limit) : variants;
        var remaining = variants.length - shown.length;

        shown.forEach(function (v) {
          var priceText = v.price !== undefined ? "*" + money(v.price) + "*" : "-";
          lines.push("• " + v.label + " " + priceText);
        });
        if (remaining > 0) {
          lines.push("  (+" + remaining + " itens disponiveis)");
        }
        lines.push("");
      });
    });
  });

  lines.push(mode === "completo" ? "Catalogo completo disponivel para consulta." : "Bom trabalho e boas vendas!");

  return { subject: subject, body: lines.join("\n") };
}
