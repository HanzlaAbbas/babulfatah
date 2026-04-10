import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin";
import { updateCategorySchema } from "@/lib/validations/admin";

// PUT /api/admin/categories/[id] — update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { id } = await params;

    // Find existing category
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, slug, parentId } = parsed.data;

    // If slug is being changed, check uniqueness (exclude current id)
    if (slug && slug !== existing.slug) {
      const slugConflict = await db.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A category with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // If parentId is provided and different from current, verify it exists
    if (parentId !== undefined && parentId !== existing.parentId) {
      if (parentId) {
        const parent = await db.category.findUnique({ where: { id: parentId } });
        if (!parent) {
          return NextResponse.json(
            { error: "Parent category not found" },
            { status: 400 }
          );
        }
        // Prevent self-referencing
        if (parentId === id) {
          return NextResponse.json(
            { error: "Category cannot be its own parent" },
            { status: 400 }
          );
        }
      }
    }

    const updated = await db.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(parentId !== undefined && { parentId: parentId ?? null }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] — delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { id } = await params;

    // Find existing category with relation counts
    const category = await db.category.findUnique({
      where: { id },
      include: {
        subcategories: { select: { id: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if category has subcategories
    if (category.subcategories.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories. Delete or reassign them first." },
        { status: 400 }
      );
    }

    // Prevent deletion if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with products. Reassign products first." },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
