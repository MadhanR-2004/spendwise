import Category from "@/models/Category";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export async function getCategoryMap(userId: string) {
  const custom = await Category.find({ userId }).lean<{
    name: string;
    color: string;
    type: "income" | "expense";
  }[]>();

  const all = [...DEFAULT_CATEGORIES, ...custom];
  return new Map(all.map((item) => [item.name, { color: item.color, type: item.type }]));
}
