"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Calculator } from "lucide-react";
import Button from "@/components/ui/Button";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  const tools = [
    { label: "MTV Hesaplama", href: "/araclar/mtv-hesaplama" },
    { label: "Otoyol Hesaplama", href: "/araclar/otoyol-hesaplama" },
    { label: "Yakıt Hesaplama", href: "/araclar/yakit-hesaplama" },
    { label: "Muayene Ücreti", href: "/araclar/muayene-ucreti" },
    { label: "Rota Maliyet", href: "/araclar/rota-maliyet" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-blue-900 group-hover:bg-blue-950 transition-colors">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              Araç <span className="text-orange-500">Karar</span> Motoru
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Anasayfa
            </Link>

            {/* Tools Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-gray-700 hover:text-orange-500 font-medium transition-colors">
                Ücretsiz Araçlar
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 first:rounded-t-lg last:rounded-b-lg transition-colors"
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/rapor"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Karar Raporu
            </Link>

            <Link
              href="/metodoloji"
              className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
            >
              Metodoloji
            </Link>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <Link href="/rapor">
              <Button variant="primary" size="md">
                Rapor Al →
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-orange-500 font-medium py-2"
            >
              Anasayfa
            </Link>

            {/* Mobile Tools Dropdown */}
            <div>
              <button
                className="flex items-center justify-between w-full text-gray-700 hover:text-orange-500 font-medium py-2"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              >
                Ücretsiz Araçlar
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isToolsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isToolsDropdownOpen && (
                <div className="pl-4 space-y-2 mt-2">
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="block text-gray-600 hover:text-orange-600 py-1"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/rapor"
              className="block text-gray-700 hover:text-orange-500 font-medium py-2"
            >
              Karar Raporu
            </Link>

            <Link
              href="/metodoloji"
              className="block text-gray-700 hover:text-orange-500 font-medium py-2"
            >
              Metodoloji
            </Link>

            <Link href="/rapor">
              <Button variant="primary" size="md" className="w-full mt-4">
                Rapor Al →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
