import { Image, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
    <Link href={`/items/${item.id}`} className="block focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl">
      <Card>
        <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-purple-100">
          {thumbnail ? (
            <img src={thumbnail} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-purple-300">
              <Image className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-purple-900 truncate">{item.title}</h3>
            <Badge variant={statusVariant}>{item.status}</Badge>
          </div>
          {item.categoryName && (
            <p className="mt-1 text-xs text-stone-500">{item.categoryName}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-purple-700">{formatPrice(item.dailyPrice)}</span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-400">
              <User className="h-3 w-3" />
              {item.ownerName}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
