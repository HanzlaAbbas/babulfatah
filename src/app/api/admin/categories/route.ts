import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin";
import { createCategorySchema } from "@/lib/validations/admin";

// GET /api/admin/categories — list categories with optional search
export async function GET(request: NextRequest) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where = search
      ? { name: { contains: search } }
      : {};

    const categories = await db.category.findMany({
      where,
      include: {
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories — create a new category
export async function POST(request: NextRequest) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const body = await request.json();

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, parentId } = parsed.data;

    // Check slug uniqueness
    const existing = await db.category.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 409 }
      );
    }

    // If parentId is provided, verify the parent category exists
    if (parentId) {
      const parent = await db.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 400 }
        );
      }
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        parentId: parentId ?? null,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
