import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function verifyAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), admin: null };
  }

  // ✅ Type-safe — `role` and `id` are now properly typed via module augmentation
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden — Admin access required" }, { status: 403 }), admin: null };
  }

  return { error: null, admin: session.user };
}
