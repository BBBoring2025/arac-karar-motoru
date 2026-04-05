import React from "react";

export interface PriceTagProps {
  amount: number;
  period?: "yearly" | "monthly" | "none";
  className?: string;
  showCurrency?: boolean;
}

const PriceTag: React.FC<PriceTagProps> = ({
  amount,
  period = "none",
  className = "",
  showCurrency = true,
}) => {
  const formattedAmount = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const periodLabels = {
    yearly: "/yıl",
    monthly: "/ay",
    none: "",
  };

  const periodLabel = periodLabels[period];

  return (
    <div className={`inline-flex items-baseline gap-1 ${className}`}>
      {showCurrency && <span className="text-xl font-semibold">₺</span>}
      <span className="text-2xl font-bold text-gray-900">{formattedAmount}</span>
      {periodLabel && <span className="text-sm text-gray-600">{periodLabel}</span>}
    </div>
  );
};

export default PriceTag;
