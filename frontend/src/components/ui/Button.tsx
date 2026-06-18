import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg";

  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 hover:opacity-90 hover:-translate-y-px focus:ring-green-500",
    secondary: "border-2 border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50 hover:-translate-y-px focus:ring-purple-500",
    outline: "border border-purple-200 bg-white text-purple-700 hover:bg-purple-50 focus:ring-purple-500",
    ghost: "text-purple-600 hover:bg-purple-100 focus:ring-purple-500 shadow-none hover:shadow-none",
    danger: "bg-red-600 text-white hover:bg-red-700 hover:opacity-90 hover:-translate-y-px focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
}
