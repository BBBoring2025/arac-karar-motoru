import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlighted" | "premium";
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles = "rounded-lg p-6 transition-all";

    const variantStyles = {
      default: "bg-white border border-gray-200 hover:shadow-md",
      highlighted:
        "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 hover:shadow-lg",
      premium:
        "bg-gradient-to-br from-blue-900 to-blue-950 text-white border border-blue-800 hover:shadow-xl",
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

    return (
      <div ref={ref} className={combinedClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
