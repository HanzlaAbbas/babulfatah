import { db } from '@/lib/db';
import { ProductCard } from '@/components/storefront/product-card';

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  // Fetch 10 products from the same category, excluding the current one
  const related = await db.product.findMany({
    where: {
      categoryId,
      id: { not: currentProductId },
      stock: { gt: 0 },
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      author: true,
      images: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  if (related.length === 0) return null;

  return (
    <section className="bg-white border-t border-gray-200 py-8 md:py-12">
      <div className="main-container">
        {/* ── Section Heading ── */}
        <div className="flex items-center justify-between bg-[#1D333B] px-5 py-3 mb-6 md:mb-8">
          <h2 className="text-white text-[18px] md:text-[20px] font-semibold">
            Related Products
          </h2>
        </div>

        {/* ── Product Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-6 md:gap-y-8">
          {related.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
