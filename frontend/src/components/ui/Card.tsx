interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-purple-200 bg-purple-50 shadow-md transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
