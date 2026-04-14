import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAuthedUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { userId: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId: session.user.id, response: null };
}
