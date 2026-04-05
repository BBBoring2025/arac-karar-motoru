'use client';

/**
 * SearchableCombobox — Yazdıkça filtreleyen arama kutusu
 * Harici paket kullanmaz. Türkçe karakter uyumlu.
 * Klavye navigasyonu + erişilebilirlik destekli.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

const MAX_VISIBLE_OPTIONS = 80;

function turkishNormalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i');
}

export default function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'Seçin...',
  label,
  disabled = false,
}: SearchableComboboxProps) {
  const reactId = useId();
  const inputId = `combobox-input-${reactId}`;
  const listboxId = `combobox-listbox-${reactId}`;
  const optionIdPrefix = `combobox-option-${reactId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Seçili değerin label'ını bul
  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  // Filtrelenmiş seçenekler
  const { filtered, overflowCount } = useMemo(() => {
    let all: ComboboxOption[];
    if (!query.trim()) {
      all = options;
    } else {
      const norm = turkishNormalize(query);
      all = options.filter((o) => {
        const labelNorm = turkishNormalize(o.label);
        const sublabelNorm = o.sublabel ? turkishNormalize(o.sublabel) : '';
        return labelNorm.includes(norm) || sublabelNorm.includes(norm);
      });
    }
    return {
      filtered: all.slice(0, MAX_VISIBLE_OPTIONS),
      overflowCount: Math.max(0, all.length - MAX_VISIBLE_OPTIONS),
    };
  }, [options, query]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Seçim yapılmadıysa input'u sıfırla
        if (!value) setQuery('');
        else if (selectedOption) setQuery(selectedOption.label);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [value, selectedOption]);

  // Aktif item'ı görünür yap
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSelect = useCallback(
    (opt: ComboboxOption) => {
      onChange(opt.value);
      setQuery(opt.label);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
    // Kullanıcı silerse seçimi kaldır
    if (!e.target.value) onChange('');
  }, [onChange]);

  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      // Açılışta input'u seç ki kullanıcı üstüne yazabilsin
      if (selectedOption) setQuery(selectedOption.label);
    }
  }, [disabled, selectedOption]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && filtered[activeIndex]) {
            handleSelect(filtered[activeIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setActiveIndex(-1);
          if (selectedOption) setQuery(selectedOption.label);
          break;
      }
    },
    [isOpen, filtered, activeIndex, handleSelect, selectedOption]
  );

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${optionIdPrefix}-${activeIndex}` : undefined}
          aria-label={!label ? placeholder : undefined}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'
          }`}
        />
        <ChevronDown
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label || placeholder}
          className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500 text-center">
              Sonuç bulunamadı
            </li>
          ) : (
            filtered.map((opt, idx) => (
              <li
                key={opt.value}
                id={`${optionIdPrefix}-${idx}`}
                role="option"
                aria-selected={idx === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between ${
                  idx === activeIndex
                    ? 'bg-orange-50 text-orange-700'
                    : opt.value === value
                    ? 'bg-gray-50 text-slate-900 font-medium'
                    : 'text-slate-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-xs text-slate-400 ml-2">
                    {opt.sublabel}
                  </span>
                )}
              </li>
            ))
          )}
          {overflowCount > 0 && (
            <li className="px-3 py-2 text-xs text-slate-400 italic text-center">
              Daha spesifik arayın — {overflowCount} sonuç daha var
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
