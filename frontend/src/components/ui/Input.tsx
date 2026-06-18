import { forwardRef, useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const generatedId = useId();
    const id = props.id || generatedId;
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-purple-800">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 ${
            error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-purple-200"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
