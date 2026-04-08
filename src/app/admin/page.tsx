'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  BarChart3,
  Car,
  RefreshCw,
  AlertTriangle,
  FileText,
  ExternalLink,
  Database,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { vehicleDatabase } from '@/data/araclar';
import {
  getAllManifestEntries,
  type DataManifestEntry,
} from '@/lib/data-manifest';

// Sprint C P6: Tarife edit tabs (mtv | muayene | otoyol) removed per
// ADR-001 — admin Supabase writes had zero user-visible effect because
// the calculators read from src/data/*.ts. The misalignment is now closed
// by binding src/data as the source of truth and hiding these tabs.
// See docs/adr/0001-src-data-as-source-of-truth.md.
type Tab = 'dashboard' | 'data-manifest' | 'araclar';

interface DashboardStats {
  toplam_kullanici: number;
  toplam_rapor: number;
  aylik_rapor: number;
  toplam_gelir: number;
  aylik_gelir: number;
  aktif_b2b: number;
  aylik_pv: number;
}

const CONFIDENCE_BADGE: Record<string, string> = {
  kesin: 'bg-green-500/20 text-green-400 border-green-500/30',
  yüksek: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  yaklaşık: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  tahmini: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Sprint C P6: Sprint B's mtv/muayene/otoyol state, handlers, and JSX
  // blocks have been intentionally removed. The /api/admin/tarifeleri
  // endpoint is still functional (for Sprint B's regression script
  // sprint-b-crud-prod-sync.mjs) but the admin UI no longer surfaces it.

  // Auth state check
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Admin rol kontrolü
        const { data: kullanici } = await supabase
          .from('kullanicilar')
          .select('rol')
          .eq('auth_id', user.id)
          .single();

        if (kullanici?.rol === 'admin') {
          setIsAuthenticated(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: kullanici } = await supabase
          .from('kullanicilar')
          .select('rol')
          .eq('auth_id', session.user.id)
          .single();

        setIsAuthenticated(kullanici?.rol === 'admin');
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Dashboard stats fetch
  const fetchDashboard = useCallback(async () => {
    const res = await fetch('/api/admin/dashboard');
    const json = await res.json();
    setStats(json.data);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated, fetchDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError('Giriş başarısız: ' + error.message);
      return;
    }

    // Auth state change listener will handle the rest
    setEmail('');
    setPassword('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722] flex items-center justify-center">
        <div className="bg-[#1B2A4A] border border-orange-500/20 rounded-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Lock className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Yönetim Paneli
          </h1>
          <p className="text-gray-400 text-center mb-6">
            Admin hesabınızla giriş yapın
          </p>

          {authError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
              placeholder="E-posta adresi"
              autoFocus
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
              placeholder="Şifre"
              required
            />
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722]">
      {/* Header */}
      <div className="bg-[#1B2A4A] border-b border-orange-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Yönetim Paneli</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation — Sprint C P6: 3 tabs (was 5) */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700 pb-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'data-manifest', label: 'Veri Manifestosu', icon: Database },
            { id: 'araclar', label: 'Araç Veritabanı', icon: Car },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Sprint C P6: ADR-001 info card */}
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300" />
                <div className="text-sm leading-relaxed">
                  <p className="font-semibold text-amber-100">
                    Tarife düzenleme dosya bazında yapılır (Sprint C / ADR-001)
                  </p>
                  <p className="mt-1 text-amber-200/90">
                    MTV / muayene / otoyol / yakıt tarife sekmeleri kasıtlı
                    olarak gizlendi. Sprint B&apos;de bu sekmelerden yapılan
                    Supabase yazımları kullanıcı hesaplayıcılarını
                    etkilemiyordu (calculators <code>src/data/*.ts</code>
                    dosyalarından okuyor). Sprint C ADR-001 ile{' '}
                    <code>src/data</code> tek doğruluk kaynağı olarak
                    bağlandı. Tarife güncellemeleri için runbook&apos;u
                    okuyun:
                  </p>
                  <div className="mt-3 flex flex-col gap-1 text-xs">
                    <a
                      href="https://github.com/BBBoring2025/arac-karar-motoru/blob/main/docs/data-update-runbook.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-200 hover:text-amber-100 underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      docs/data-update-runbook.md
                    </a>
                    <a
                      href="https://github.com/BBBoring2025/arac-karar-motoru/blob/main/docs/adr/0001-src-data-as-source-of-truth.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-200 hover:text-amber-100 underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      docs/adr/0001-src-data-as-source-of-truth.md
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm font-medium">
                    Toplam Rapor
                  </p>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-4xl font-bold text-white">
                  {stats?.toplam_rapor?.toLocaleString('tr-TR') || '—'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Bu ay: {stats?.aylik_rapor?.toLocaleString('tr-TR') || '0'}
                </p>
              </div>

              <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm font-medium">
                    Toplam Kullanıcı
                  </p>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-4xl font-bold text-white">
                  {stats?.toplam_kullanici?.toLocaleString('tr-TR') || '—'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  B2B: {stats?.aktif_b2b || '0'}
                </p>
              </div>

              <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm font-medium">
                    Aylık Gelir
                  </p>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-4xl font-bold text-white">
                  {stats?.aylik_gelir
                    ? `₺${Number(stats.aylik_gelir).toLocaleString('tr-TR')}`
                    : '—'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Toplam:{' '}
                  {stats?.toplam_gelir
                    ? `₺${Number(stats.toplam_gelir).toLocaleString('tr-TR')}`
                    : '₺0'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sprint C P6: Data Manifest Tab — read-only view of src/data manifest */}
        {activeTab === 'data-manifest' && (
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Veri Manifestosu
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Calculators&apos;ın okuduğu <code>src/data/*.ts</code>
              dosyalarının tek normalize listesi. Düzenleme için runbook&apos;a
              bakın.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-3 text-white font-semibold">
                      Veri Tipi
                    </th>
                    <th className="text-left py-3 px-3 text-white font-semibold">
                      Kaynak
                    </th>
                    <th className="text-center py-3 px-3 text-white font-semibold">
                      Yürürlük
                    </th>
                    <th className="text-center py-3 px-3 text-white font-semibold">
                      Son Güncelleme
                    </th>
                    <th className="text-center py-3 px-3 text-white font-semibold">
                      Güven
                    </th>
                    <th className="text-right py-3 px-3 text-white font-semibold">
                      Adet
                    </th>
                    <th className="text-left py-3 px-3 text-white font-semibold">
                      Dosya
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getAllManifestEntries().map((entry: DataManifestEntry) => (
                    <tr
                      key={entry.key}
                      className="border-b border-gray-800 hover:bg-gray-800/30"
                    >
                      <td className="py-3 px-3 text-white font-medium">
                        {entry.label}
                      </td>
                      <td className="py-3 px-3 text-gray-300">
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 underline"
                        >
                          {entry.sourceLabel}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-3 text-center text-gray-300">
                        {entry.effectiveDate}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-300">
                        {entry.lastUpdated}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs border ${
                            CONFIDENCE_BADGE[entry.confidence] ||
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}
                        >
                          {entry.confidence}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-white font-medium">
                        {entry.itemCount}
                      </td>
                      <td className="py-3 px-3">
                        <code className="text-xs text-gray-400">
                          {entry.filePath}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-xs text-gray-500 leading-relaxed">
              <p>
                Bu liste{' '}
                <code className="text-gray-400">src/lib/data-manifest.ts</code>
                &apos;ten okunur. Sprint C P5 ile eklendi. Düzenleme:{' '}
                <a
                  href="https://github.com/BBBoring2025/arac-karar-motoru/blob/main/docs/data-update-runbook.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 underline inline-flex items-center gap-1"
                >
                  docs/data-update-runbook.md
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Araç Veritabanı Tab — already aligned with src/data, kept */}
        {activeTab === 'araclar' && (
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Araç Veritabanı ({vehicleDatabase.vehicles.length} araç)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-white font-semibold">
                      Marka
                    </th>
                    <th className="text-left py-4 px-4 text-white font-semibold">
                      Model
                    </th>
                    <th className="text-center py-4 px-4 text-white font-semibold">
                      Motor (cc)
                    </th>
                    <th className="text-center py-4 px-4 text-white font-semibold">
                      Yakıt
                    </th>
                    <th className="text-center py-4 px-4 text-white font-semibold">
                      Tüketim
                    </th>
                    <th className="text-right py-4 px-4 text-white font-semibold">
                      Fiyat (₺)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleDatabase.vehicles.map((vehicle, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-800 hover:bg-gray-800/30"
                    >
                      <td className="py-4 px-4 text-gray-300">
                        {vehicle.brand}
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {vehicle.model}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300">
                        {vehicle.engineSize}
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300 text-xs">
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          {vehicle.fuelType}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-300">
                        {vehicle.avgConsumption}L/100km
                      </td>
                      <td className="py-4 px-4 text-right text-white font-medium">
                        ₺{vehicle.avgMarketPrice?.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
