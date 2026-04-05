import React from "react";
import { Check, AlertCircle, Shield } from "lucide-react";

export type ConfidenceLevel = "kesin" | "yuksek" | "yaklaşık" | "tahmini";

export interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  level,
  className = "",
}) => {
  const confidenceConfig = {
    kesin: {
      icon: Check,
      label: "Kesin",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      badgeBg: "bg-green-50",
      border: "border-green-200",
    },
    yuksek: {
      icon: Shield,
      label: "Yüksek Güven",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      badgeBg: "bg-blue-50",
      border: "border-blue-200",
    },
    yaklaşık: {
      icon: AlertCircle,
      label: "Yaklaşık",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      badgeBg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    tahmini: {
      icon: AlertCircle,
      label: "Tahmini",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      badgeBg: "bg-orange-50",
      border: "border-orange-200",
    },
  };

  const config = confidenceConfig[level];
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.badgeBg} ${config.border} ${className}`}
    >
      <IconComponent className={`w-4 h-4 ${config.textColor}`} />
      <span className={`text-xs font-semibold ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
};

export default ConfidenceBadge;
