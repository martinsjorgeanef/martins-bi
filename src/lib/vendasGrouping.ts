import { cleanProductName } from "./productNameCleaner";

export interface VendasVariant {
  label: string;
  price: number | undefined;
}

export interface VendasItemInput {
  ean: string;
  description: string;
  category: string | null;
  martinsPrice?: number;
}

export type VendasMode = "resumida" | "completo";

export interface VendasGroups {
  categoryNames: string[];
  byCategory: Map<string, Map<string, Map<string, VendasVariant[]>>>;
  tipoByCategoryBrand: Map<string, Map<string, string | null>>;
}

export var MAX_ITEMS_PER_LINE = 6;

export function buildVendasGroups(items: VendasItemInput[], mode?: VendasMode): VendasGroups {
  var limit = mode === "completo" ? Infinity : MAX_ITEMS_PER_LINE;
  var byCategory = new Map<string, Map<string, Map<string, VendasVariant[]>>>();
  var tipoTracker = new Map<string, Map<string, Set<string>>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description, category);
    var brand = cleaned.brand;
    var lineKey = cleaned.linha ? cleaned.linha : (cleaned.descriptor || "Linha Padrao");

    var label = "";
    if (cleaned.linha && cleaned.descriptor) {
      label = cleaned.descriptor;
    }
    if (cleaned.weight) {
      label = label ? label + " " + cleaned.weight : cleaned.weight;
    }
    if (!label) {
      label = it.description.length > 45 ? it.description.slice(0, 45) + "..." : it.description;
    }

    if (!byCategory.has(category)) byCategory.set(category, new Map());
    var brandMap = byCategory.get(category) as Map<string, Map<string, VendasVariant[]>>;
    if (!brandMap.has(brand)) brandMap.set(brand, new Map());
    var lineMap = brandMap.get(brand) as Map<string, VendasVariant[]>;
    if (!lineMap.has(lineKey)) lineMap.set(lineKey, []);
    var arr = lineMap.get(lineKey) as VendasVariant[];
    if (arr.length < limit) {
      arr.push({ label: label, price: it.martinsPrice });
    } else {
      arr.push({ label: label, price: it.martinsPrice });
    }

    if (cleaned.tipo) {
      if (!tipoTracker.has(category)) tipoTracker.set(category, new Map());
      var catMap = tipoTracker.get(category) as Map<string, Set<string>>;
      if (!catMap.has(brand)) catMap.set(brand, new Set<string>());
      (catMap.get(brand) as Set<string>).add(cleaned.tipo);
    }
  });

  var tipoByCategoryBrand = new Map<string, Map<string, string | null>>();
  tipoTracker.forEach(function (brandMap, category) {
    var outMap = new Map<string, string | null>();
    brandMap.forEach(function (tipoSet, brand) {
      outMap.set(brand, tipoSet.size === 1 ? Array.from(tipoSet)[0] : null);
    });
    tipoByCategoryBrand.set(category, outMap);
  });

  var categoryNames = Array.from(byCategory.keys()).sort(function (a, b) {
    var brandMapA = byCategory.get(a) as Map<string, Map<string, VendasVariant[]>>;
    var brandMapB = byCategory.get(b) as Map<string, Map<string, VendasVariant[]>>;
    var countA = 0;
    brandMapA.forEach(function (m) { m.forEach(function (arr) { countA += arr.length; }); });
    var countB = 0;
    brandMapB.forEach(function (m) { m.forEach(function (arr) { countB += arr.length; }); });
    return countB - countA;
  });

  return { categoryNames: categoryNames, byCategory: byCategory, tipoByCategoryBrand: tipoByCategoryBrand };
}
