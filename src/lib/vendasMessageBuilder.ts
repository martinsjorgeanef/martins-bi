import { DisadvantageItem } from "@/components/Charts";

export function buildVendasMessage(items: DisadvantageItem[]) {
  const subject = "Oportunidades Comerciais - Vantagem Competitiva Martins";

  const lines: string[] = [];
  lines.push("Oportunidades Comerciais");
  lines.push("");
  lines.push("Pessoal,");
  lines.push("");
  lines.push(
    "Segue a relacao dos produtos em que a Martins apresenta vantagem competitiva em relacao aos principais distribuidores."
  );
  lines.push(
    "Esses itens representam excelentes oportunidades para reforcar as negociacoes junto aos clientes."
  );
  lines.push(
    "Priorizem a oferta desses produtos durante as visitas, destacando nosso posicionamento competitivo."
  );
  lines.push("");
  lines.push("Na sequencia segue a relacao completa dos itens com vantagem:");
  lines.push("");

  items.slice(0, 10).forEach(function (it, idx) {
    lines.push(
      (idx + 1) +
        ". " +
        it.description +
        " (EAN " +
        it.ean +
        ") - " +
        (it.category ? it.category : "Sem categoria") +
        " - Vantagem: +" +
        it.diffPct +
        "%"
    );
  });

  lines.push("");
  lines.push("Bons negocios!");

  return { subject: subject, body: lines.join("\n") };
}
