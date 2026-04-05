import React from "react";
import { LucideIcon } from "lucide-react";
import PriceTag from "./PriceTag";
import ConfidenceBadge from "./ConfidenceBadge";
import { DataConfidence } from "@/lib/types";

export interface ResultCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  period?: "yearly" | "monthly" | "none";
  confidence?: DataConfidence;
  description?: string;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  icon: Icon,
  label,
  value,
  period = "yearly",
  confidence = "kesin",
  description,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-3 p-6 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-orange-100">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <PriceTag amount={value} period={period} />
        <ConfidenceBadge level={confidence} />
      </div>
    </div>
  );
};

export default ResultCard;
