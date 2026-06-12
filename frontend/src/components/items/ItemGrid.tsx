import Link from "next/link";
import ItemCard from "./ItemCard";
import type { Item } from "@/types";

interface ItemGridProps {
  items: Item[];
}

export default function ItemGrid({ items }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-stone-500">
        No items to display.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.id} href={`/items/${item.id}`}>
          <ItemCard item={item} />
        </Link>
      ))}
    </div>
  );
}
