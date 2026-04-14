import { connectToDatabase } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { getAuthedUser } from "@/lib/server";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  try {
    const { id } = await params;
    await connectToDatabase();

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const isDefault = DEFAULT_CATEGORIES.some((item) => item.name === category.name);
    if (isDefault) {
      return NextResponse.json({ error: "Default categories cannot be deleted" }, { status: 400 });
    }

    await Category.deleteOne({ _id: id, userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
