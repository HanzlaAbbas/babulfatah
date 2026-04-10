import { Badge } from '@/components/ui/badge';

interface ProductBadgesProps {
  createdAt: Date | string;
  orderItemCount?: number;
  stock: number;
}

export function ProductBadges({
  createdAt,
  orderItemCount = 0,
  stock,
}: ProductBadgesProps) {
  const now = new Date();
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const isNew = created >= thirtyDaysAgo;
  const isBestseller = orderItemCount >= 5;
  const isSoldOut = stock === 0;

  if (!isNew && !isBestseller && !isSoldOut) return null;

  return (
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
      {isNew && (
        <Badge className="bg-green-600 hover:bg-green-700 text-white text-[10px] px-1.5 py-0">
          NEW
        </Badge>
      )}
      {isBestseller && (
        <Badge className="bg-golden hover:bg-golden-dark text-golden-foreground text-[10px] px-1.5 py-0">
          BESTSELLER
        </Badge>
      )}
      {isSoldOut && (
        <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-1.5 py-0">
          SOLD OUT
        </Badge>
      )}
    </div>
  );
}
