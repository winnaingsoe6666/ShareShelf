import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Item } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const thumbnail = item.imageUrls?.[0];

  const statusVariant =
    item.status === "available" ? "success"
    : item.status === "borrowed" ? "warning"
    : "default";

  return (
    <Card>
      <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-stone-100">
        {thumbnail ? (
          <img src={thumbnail} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-900 truncate">{item.title}</h3>
          <Badge variant={statusVariant}>{item.status}</Badge>
        </div>
        {item.categoryName && (
          <p className="mt-1 text-xs text-stone-500">{item.categoryName}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700">{formatPrice(item.dailyPrice)}</span>
          <span className="text-xs text-stone-400">by {item.ownerName}</span>
        </div>
      </div>
    </Card>
  );
}
