export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500">
        <p className="font-medium text-stone-700">ShareShelf</p>
        <p className="mt-1">Community-powered tool sharing. Save money, reduce waste, build community.</p>
        <p className="mt-2">&copy; {new Date().getFullYear()} ShareShelf. All rights reserved.</p>
      </div>
    </footer>
  );
}
