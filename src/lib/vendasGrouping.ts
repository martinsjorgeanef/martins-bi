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
}

export var MAX_ITEMS_PER_LINE = 6;

export function buildVendasGroups(items: VendasItemInput[]): VendasGroups {
  var byCategory = new Map<string, Map<string, Map<string, VendasVariant[]>>>();

  items.forEach(function (it) {
    var category = it.category ? it.category : "Sem categoria";
    var cleaned = cleanProductName(it.description, category);

    if (!byCategory.has(category)) byCategory.set(category, new Map());
    var brandMap = byCategory.get(category) as Map<string, Map<string, VendasVariant[]>>;
    if (!brandMap.has(cleaned.brand)) brandMap.set(cleaned.brand, new Map());
    var headerMap = brandMap.get(cleaned.brand) as Map<string, VendasVariant[]>;
    if (!headerMap.has(cleaned.header)) headerMap.set(cleaned.header, []);
    (headerMap.get(cleaned.header) as VendasVariant[]).push({ label: cleaned.itemLabel, price: it.martinsPrice });
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

  return { categoryNames: categoryNames, byCategory: byCategory };
}
