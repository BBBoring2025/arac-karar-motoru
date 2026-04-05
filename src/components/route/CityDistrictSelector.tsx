'use client';

/**
 * CityDistrictSelector — İl + İlçe seçici
 * İki SearchableCombobox yan yana: il seçilince ilçe listesi dolar
 */

import React, { useState, useMemo, useCallback } from 'react';
import SearchableCombobox, { ComboboxOption } from './SearchableCombobox';
import { cities } from '@/data/locations/cities';
import { getDistrictsByCity } from '@/data/locations/districts';

interface CityDistrictSelectorProps {
  label: string;
  selectedDistrictId: string;
  onDistrictChange: (districtId: string) => void;
}

export default function CityDistrictSelector({
  label,
  selectedDistrictId,
  onDistrictChange,
}: CityDistrictSelectorProps) {
  const [selectedPlaka, setSelectedPlaka] = useState('');

  const cityOptions: ComboboxOption[] = useMemo(
    () =>
      cities
        .sort((a, b) => a.il.localeCompare(b.il, 'tr'))
        .map((c) => ({
          value: String(c.plaka),
          label: c.il,
          sublabel: c.bolge,
        })),
    []
  );

  const districtOptions: ComboboxOption[] = useMemo(() => {
    if (!selectedPlaka) return [];
    const plaka = Number(selectedPlaka);
    return getDistrictsByCity(plaka).map((d) => ({
      value: d.id,
      label: d.ilce,
      sublabel: d.il,
    }));
  }, [selectedPlaka]);

  const handleCityChange = useCallback(
    (plaka: string) => {
      setSelectedPlaka(plaka);
      onDistrictChange('');
    },
    [onDistrictChange]
  );

  const handleDistrictChange = useCallback(
    (districtId: string) => {
      onDistrictChange(districtId);
    },
    [onDistrictChange]
  );

  // Seçili ilçeden plaka'yı senkronla (dışarıdan set edildiğinde)
  React.useEffect(() => {
    if (selectedDistrictId && !selectedPlaka) {
      const parts = selectedDistrictId.split('-');
      if (parts.length >= 2) {
        setSelectedPlaka(parts[0]);
      }
    }
  }, [selectedDistrictId, selectedPlaka]);

  return (
    <div>
      <p className="text-sm font-semibold text-slate-800 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <SearchableCombobox
          options={cityOptions}
          value={selectedPlaka}
          onChange={handleCityChange}
          placeholder="İl seçin"
          label="İl"
        />
        <SearchableCombobox
          options={districtOptions}
          value={selectedDistrictId}
          onChange={handleDistrictChange}
          placeholder="İlçe seçin"
          label="İlçe"
          disabled={!selectedPlaka}
        />
      </div>
    </div>
  );
}
