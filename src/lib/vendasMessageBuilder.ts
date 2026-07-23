import { DisadvantageItem } from "@/components/Charts";

export function buildVendasMessage(items: DisadvantageItem[]) {
  const subject = "Oportunidades Comerciais - Vantagem Competitiva Martins";

  const byCategory = new Map<string, DisadvantageItem[]>();
  items.forEach(function (it) {
    const cat = it.category ? it.category : "Sem categoria";
    const list = byCategory.get(cat) || [];
    list.push(it);
    byCategory.set(cat, list);
  });

  const categoryNames = Array.from(byCategory.keys()).sort(function (a, b) {
    return (byCategory.get(b) || []).length - (byCategory.get(a) || []).length;
  });

  const topCategories = categoryNames.slice(0, 3);

  const lines: string[] = [];
  lines.push("Pessoal, boa tarde!");
  lines.push("");
  lines.push("Segue a relacao das principais oportunidades comerciais identificadas em nossa analise de competitividade.");
  lines.push("");
  lines.push("Nesta atualizacao, as categorias com maior vantagem frente aos concorrentes sao:");
  lines.push("");
  topCategories.forEach(function (cat) {
    lines.push("- " + cat);
  });
  lines.push("");
  lines.push("Priorizem essas categorias durante as visitas, pois apresentam excelente posicionamento de preco e aumentam nossas chances de conversao.");
  lines.push("");
  lines.push("Abaixo segue a relacao dos principais produtos e seus respectivos precos Martins para apoiar a negociacao:");
  lines.push("");

  categoryNames.forEach(function (cat) {
    const catItems = byCategory.get(cat) || [];
    lines.push(cat + ":");
    catItems.forEach(function (it) {
      const priceText = it.martinsPrice !== undefined
        ? it.martinsPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "-";
      lines.push("- " + it.description + " - " + priceText);
    });
    lines.push("");
  });

  lines.push("Bom trabalho e boas vendas!");

  return { subject: subject, body: lines.join("\n") };
}
