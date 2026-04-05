import React from "react";
import Link from "next/link";
import Button from "./Button";

export interface CTABannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
  onButtonClick?: () => void;
  showBlurPreview?: boolean;
  className?: string;
}

const CTABanner: React.FC<CTABannerProps> = ({
  title = "Detaylı Rapor İçin",
  description = "Araç satın alma kararınızı desteklemek için kapsamlı bir rapor oluşturun.",
  buttonText = "Rapor Al →",
  href = "/rapor",
  onButtonClick,
  showBlurPreview = true,
  className = "",
}) => {
  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
    >
      {/* Blurred background preview */}
      {showBlurPreview && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-orange-500/10 backdrop-blur-sm pointer-events-none" />
      )}

      <div className="relative z-10 bg-gradient-to-r from-blue-900 to-blue-950 text-white p-8 md:p-12 rounded-lg">
        <div className="max-w-3xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">{title}</h3>
          <p className="text-blue-100 mb-6 text-lg">{description}</p>
          <Link href={href}>
            <Button
              variant="primary"
              size="lg"
              onClick={onButtonClick}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTABanner;
