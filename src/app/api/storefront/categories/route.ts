import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── GET /api/storefront/categories ───────────────────────────────────────
// Returns the full category tree (up to 3 levels deep) for the Mega Menu.
// Response is cached by Next.js ISR with revalidation every 5 minutes.
// ──────────────────────────────────────────────────────────────────────

export const revalidate = 300;

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryNode[];
}

async function buildCategoryTree(
  parentId: string | null,
  depth: number = 0
): Promise<CategoryNode[]> {
  const maxDepth = 3;

  const categories = await db.category.findMany({
    where: { parentId },
    include: {
      subcategories: depth < maxDepth - 1,
    },
    orderBy: { name: "asc" },
  });

  if (depth >= maxDepth - 1) {
    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      children: [],
    }));
  }

  const nodes: CategoryNode[] = [];
  for (const cat of categories) {
    // Map Prisma's "subcategories" to the frontend "children" field
    const rawSubs = (cat as unknown as { subcategories: { id: string; name: string; slug: string; parentId: string | null }[] }).subcategories || [];
    const childNodes: CategoryNode[] = [];
    for (const sub of rawSubs) {
      const subChildren = await buildCategoryTree(sub.id, depth + 1);
      childNodes.push({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        parentId: sub.parentId,
        children: subChildren,
      });
    }
    nodes.push({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      children: childNodes,
    });
  }

  return nodes;
}

export async function GET() {
  try {
    const tree = await buildCategoryTree(null, 0);
    const totalCategories = await db.category.count();

    return NextResponse.json({ tree, totalCategories });
  } catch (error) {
    console.error("Failed to fetch category tree:", error);
    return NextResponse.json({ tree: [], totalCategories: 0 }, { status: 500 });
  }
}
