import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

    const variantStyles = {
      primary:
        "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
      secondary:
        "bg-blue-900 text-white hover:bg-blue-950 focus:ring-blue-900",
      outline:
        "border-2 border-gray-300 text-gray-900 hover:bg-gray-50 focus:ring-gray-300",
      ghost: "text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
    };

    const sizeStyles = {
      sm: "px-3 py-2 text-sm gap-2",
      md: "px-4 py-2.5 text-base gap-2",
      lg: "px-6 py-3 text-lg gap-3",
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
