export default function AuthDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-purple-200" />
      <span className="text-sm text-stone-500">or</span>
      <div className="flex-1 h-px bg-purple-200" />
    </div>
  );
}
