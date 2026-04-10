import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin";
import { updateProductSchema } from "@/lib/validations/admin";

// PUT /api/admin/products/[id] — update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { id } = await params;

    // Find existing product
    const existing = await db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      description,
      price,
      stock,
      sku,
      authorId,
      language,
      categoryId,
      imageUrl,
    } = parsed.data;

    // If slug is being changed, check uniqueness (exclude current id)
    if (slug && slug !== existing.slug) {
      const slugConflict = await db.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "A product with this slug already exists" },
          { status: 409 }
        );
      }
    }

    // If categoryId is being changed, verify the new category exists
    if (categoryId && categoryId !== existing.categoryId) {
      const category = await db.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
    }

    // If authorId is being changed (and not null), verify the author exists
    if (authorId !== undefined && authorId !== existing.authorId) {
      if (authorId) {
        const author = await db.author.findUnique({ where: { id: authorId } });
        if (!author) {
          return NextResponse.json(
            { error: "Author not found" },
            { status: 400 }
          );
        }
      }
    }

    // If SKU is being changed, check uniqueness
    if (sku !== undefined && sku !== existing.sku) {
      if (sku) {
        const existingSku = await db.product.findFirst({
          where: { sku, id: { not: id } },
        });
        if (existingSku) {
          return NextResponse.json(
            { error: "A product with this SKU already exists" },
            { status: 409 }
          );
        }
      }
    }

    // ── Handle image update ──
    if (imageUrl != null) {
      const existingCoverImage = existing.images.find((img) => img.order === 0);

      if (imageUrl.trim() === '') {
        // Remove cover image if URL is emptied
        if (existingCoverImage) {
          await db.image.delete({ where: { id: existingCoverImage.id } });
        }
      } else if (existingCoverImage) {
        // Update existing cover image URL
        await db.image.update({
          where: { id: existingCoverImage.id },
          data: { url: imageUrl.trim() },
        });
      } else {
        // No cover image exists — create one
        await db.image.create({
          data: {
            url: imageUrl.trim(),
            productId: id,
            order: 0,
          },
        });
      }
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(stock !== undefined && { stock }),
        ...(sku !== undefined && { sku }),
        ...(authorId !== undefined && { authorId }),
        ...(language !== undefined && { language }),
        ...(categoryId !== undefined && { categoryId }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] — delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { id } = await params;

    // Find existing product
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Delete product (cascade handles images and orderItems)
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
