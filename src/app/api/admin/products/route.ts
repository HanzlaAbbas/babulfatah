import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin";
import { createProductSchema } from "@/lib/validations/admin";

// GET /api/admin/products — list products with search, filter, and pagination
export async function GET(request: NextRequest) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    // Build where clause
    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Fetch products with pagination
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: true,
          author: true,
          images: { take: 1, orderBy: { order: 'asc' } },
          _count: { select: { orderItems: true } },
        },
        orderBy: [
          { stock: "desc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/products — create a new product
export async function POST(request: NextRequest) {
  try {
    const { error } = await verifyAdmin();
    if (error) return error;

    const body = await request.json();

    const parsed = createProductSchema.safeParse(body);
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

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 409 }
      );
    }

    // Verify categoryId exists
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    // Verify authorId exists if provided
    if (authorId) {
      const author = await db.author.findUnique({ where: { id: authorId } });
      if (!author) {
        return NextResponse.json(
          { error: "Author not found" },
          { status: 400 }
        );
      }
    }

    // Check SKU uniqueness if provided
    if (sku) {
      const existingSku = await db.product.findUnique({ where: { sku } });
      if (existingSku) {
        return NextResponse.json(
          { error: "A product with this SKU already exists" },
          { status: 409 }
        );
      }
    }

    const product = await db.product.create({
      data: {
        title,
        slug,
        description,
        price,
        stock,
        sku,
        authorId,
        language,
        categoryId,
        ...(imageUrl && {
          images: {
            create: { url: imageUrl },
          },
        }),
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
