'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  LogOut,
  BarChart3,
  FileText,
  Wrench,
  Road,
  Car,
  Save,
  Edit2,
  X,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { vehicleDatabase } from '@/data/araclar';

type Tab = 'dashboard' | 'mtv' | 'muayene' | 'otoyol' | 'araclar';

interface DashboardStats {
  toplam_kullanici: number;
  toplam_rapor: number;
  aylik_rapor: number;
  toplam_gelir: number;
  aylik_gelir: number;
  aktif_b2b: number;
  aylik_pv: number;
}

interface TarifeRow {
  id: number;
  [key: string]: unknown;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [lastUpdate, setLastUpdate] = useState(new Date().toISOString());

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Tarife data from Supabase
  const [mtvData, setMtvData] = useState<TarifeRow[]>([]);
  const [muayeneData, setMuayeneData] = useState<TarifeRow[]>([]);
  const [otoyolData, setOtoyolData] = useState<TarifeRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [editingMtvIdx, setEditingMtvIdx] = useState<number | null>(null);
  const [editingMuayeneIdx, setEditingMuayeneIdx] = useState<number | null>(null);
  const [editingOtoyolIdx, setEditingOtoyolIdx] = useState<number | null>(null);

  // Auth state check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

  // Tarife data fetch
  const fetchTarifeData = useCallback(async (tablo: string) => {
    const res = await fetch(`/api/admin/tarifeleri?tablo=${tablo}`);
    const json = await res.json();
    return json.data || [];
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      fetchTarifeData('mtv_tarifeleri').then(setMtvData);
      fetchTarifeData('muayene_ucretleri').then(setMuayeneData);
      fetchTarifeData('otoyol_ucretleri').then(setOtoyolData);
    }
  }, [isAuthenticated, fetchDashboard, fetchTarifeData]);

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

  const handleSaveTarife = async (tablo: string, id: number, updates: Record<string, unknown>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/tarifeleri', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tablo, id, updates }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert('Kaydetme hatası: ' + json.error);
        return;
      }

      setLastUpdate(new Date().toISOString());
      // Refresh data
      const data = await fetchTarifeData(tablo);
      if (tablo === 'mtv_tarifeleri') setMtvData(data);
      if (tablo === 'muayene_ucretleri') setMuayeneData(data);
      if (tablo === 'otoyol_ucretleri') setOtoyolData(data);
    } finally {
      setSaving(false);
    }
  };

  const handleLocalUpdateMtv = (index: number, updates: Partial<TarifeRow>) => {
    const newData = [...mtvData];
    newData[index] = { ...newData[index], ...updates };
    setMtvData(newData);
  };

  const handleLocalUpdateMuayene = (index: number, updates: Partial<TarifeRow>) => {
    const newData = [...muayeneData];
    newData[index] = { ...newData[index], ...updates };
    setMuayeneData(newData);
  };

  const handleLocalUpdateOtoyol = (index: number, updates: Partial<TarifeRow>) => {
    const newData = [...otoyolData];
    newData[index] = { ...newData[index], ...updates };
    setOtoyolData(newData);
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
          <h1 className="text-3xl font-bold text-white">
            Yönetim Paneli
          </h1>
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
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700 pb-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'mtv', label: 'MTV Tarifeleri', icon: FileText },
            { id: 'muayene', label: 'Muayene Ücretleri', icon: Wrench },
            { id: 'otoyol', label: 'Otoyol Tarifeleri', icon: Road },
            { id: 'araclar', label: 'Araç Veritabanı', icon: Car },
          ].map(tab => {
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

        {/* Last Update Timestamp */}
        <div className="mb-6 text-xs text-gray-400">
          Son güncelleme: {new Date(lastUpdate).toLocaleString('tr-TR')}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">Toplam Rapor</p>
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
                <p className="text-gray-400 text-sm font-medium">Toplam Kullanıcı</p>
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
                <p className="text-gray-400 text-sm font-medium">Aylık Gelir</p>
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-4xl font-bold text-white">
                {stats?.aylik_gelir ? `₺${Number(stats.aylik_gelir).toLocaleString('tr-TR')}` : '—'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Toplam: {stats?.toplam_gelir ? `₺${Number(stats.toplam_gelir).toLocaleString('tr-TR')}` : '₺0'}
              </p>
            </div>
          </div>
        )}

        {/* MTV Tarifeleri Tab */}
        {activeTab === 'mtv' && (
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              MTV (Motorlu Taşıt Vergisi) Tarifeleri
            </h2>

            {mtvData.length === 0 ? (
              <p className="text-gray-400">
                Henüz veri yok. Supabase&apos;e MTV tarife verilerini yükleyin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-white font-semibold">Motor Hacmi</th>
                      <th className="text-left py-4 px-4 text-white font-semibold">Yaş Aralığı</th>
                      <th className="text-left py-4 px-4 text-white font-semibold">Yakıt</th>
                      <th className="text-right py-4 px-4 text-white font-semibold">Yıllık (₺)</th>
                      <th className="text-center py-4 px-4 text-white font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mtvData.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        {editingMtvIdx === idx ? (
                          <>
                            <td className="py-4 px-4 text-gray-300">
                              {String(row.motor_hacmi_alt)}-{String(row.motor_hacmi_ust)}cc
                            </td>
                            <td className="py-4 px-4 text-gray-300">
                              {String(row.yas_alt)}-{String(row.yas_ust)} yaş
                            </td>
                            <td className="py-4 px-4 text-gray-300">{String(row.yakit_tipi)}</td>
                            <td className="py-4 px-4 text-right">
                              <input
                                type="number"
                                value={Number(row.yillik_tutar)}
                                onChange={(e) => handleLocalUpdateMtv(idx, { yillik_tutar: Number(e.target.value) })}
                                className="w-32 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-right"
                              />
                            </td>
                            <td className="py-4 px-4 text-center flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  handleSaveTarife('mtv_tarifeleri', row.id, { yillik_tutar: row.yillik_tutar });
                                  setEditingMtvIdx(null);
                                }}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white p-1 rounded disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingMtvIdx(null)}
                                className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4 text-gray-300">
                              {String(row.motor_hacmi_alt)}-{String(row.motor_hacmi_ust)}cc
                            </td>
                            <td className="py-4 px-4 text-gray-300">
                              {String(row.yas_alt)}-{String(row.yas_ust)} yaş
                            </td>
                            <td className="py-4 px-4 text-gray-300">{String(row.yakit_tipi)}</td>
                            <td className="py-4 px-4 text-right text-white font-medium">
                              ₺{Number(row.yillik_tutar).toLocaleString('tr-TR')}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => setEditingMtvIdx(idx)}
                                className="bg-orange-600 hover:bg-orange-700 text-white p-1 rounded inline-flex"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Muayene Ücretleri Tab */}
        {activeTab === 'muayene' && (
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Muayene Ücretleri
            </h2>

            {muayeneData.length === 0 ? (
              <p className="text-gray-400">
                Henüz veri yok. Supabase&apos;e muayene verilerini yükleyin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-white font-semibold">Araç Tipi</th>
                      <th className="text-left py-4 px-4 text-white font-semibold">Muayene Türü</th>
                      <th className="text-right py-4 px-4 text-white font-semibold">Ücret (₺)</th>
                      <th className="text-center py-4 px-4 text-white font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {muayeneData.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        {editingMuayeneIdx === idx ? (
                          <>
                            <td className="py-4 px-4 text-gray-300">{String(row.arac_tipi)}</td>
                            <td className="py-4 px-4 text-gray-300">{String(row.muayene_turu)}</td>
                            <td className="py-4 px-4 text-right">
                              <input
                                type="number"
                                value={Number(row.ucret)}
                                onChange={(e) => handleLocalUpdateMuayene(idx, { ucret: Number(e.target.value) })}
                                className="w-32 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-right"
                              />
                            </td>
                            <td className="py-4 px-4 text-center flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  handleSaveTarife('muayene_ucretleri', row.id, { ucret: row.ucret });
                                  setEditingMuayeneIdx(null);
                                }}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white p-1 rounded disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingMuayeneIdx(null)}
                                className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4 text-gray-300">{String(row.arac_tipi)}</td>
                            <td className="py-4 px-4 text-gray-300">{String(row.muayene_turu)}</td>
                            <td className="py-4 px-4 text-right text-white font-medium">
                              ₺{Number(row.ucret).toLocaleString('tr-TR')}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => setEditingMuayeneIdx(idx)}
                                className="bg-orange-600 hover:bg-orange-700 text-white p-1 rounded inline-flex"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Otoyol Tarifeleri Tab */}
        {activeTab === 'otoyol' && (
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Otoyol Tarifeleri
            </h2>

            {otoyolData.length === 0 ? (
              <p className="text-gray-400">
                Henüz veri yok. Supabase&apos;e otoyol verilerini yükleyin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-white font-semibold">Güzergah</th>
                      <th className="text-center py-4 px-4 text-white font-semibold">Araç Sınıfı</th>
                      <th className="text-right py-4 px-4 text-white font-semibold">HGS (₺)</th>
                      <th className="text-right py-4 px-4 text-white font-semibold">OGS (₺)</th>
                      <th className="text-center py-4 px-4 text-white font-semibold">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otoyolData.map((row, idx) => (
                      <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        {editingOtoyolIdx === idx ? (
                          <>
                            <td className="py-4 px-4 text-gray-300">{String(row.guzergah_adi)}</td>
                            <td className="py-4 px-4 text-center text-gray-300">{String(row.arac_sinifi)}</td>
                            <td className="py-4 px-4 text-right">
                              <input
                                type="number"
                                step="0.1"
                                value={Number(row.hgs_ucret)}
                                onChange={(e) => handleLocalUpdateOtoyol(idx, { hgs_ucret: Number(e.target.value) })}
                                className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-right"
                              />
                            </td>
                            <td className="py-4 px-4 text-right">
                              <input
                                type="number"
                                step="0.1"
                                value={Number(row.ogs_ucret)}
                                onChange={(e) => handleLocalUpdateOtoyol(idx, { ogs_ucret: Number(e.target.value) })}
                                className="w-24 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-right"
                              />
                            </td>
                            <td className="py-4 px-4 text-center flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  handleSaveTarife('otoyol_ucretleri', row.id, {
                                    hgs_ucret: row.hgs_ucret,
                                    ogs_ucret: row.ogs_ucret,
                                  });
                                  setEditingOtoyolIdx(null);
                                }}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white p-1 rounded disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingOtoyolIdx(null)}
                                className="bg-gray-600 hover:bg-gray-700 text-white p-1 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4 text-gray-300">{String(row.guzergah_adi)}</td>
                            <td className="py-4 px-4 text-center text-gray-300">{String(row.arac_sinifi)}</td>
                            <td className="py-4 px-4 text-right text-white font-medium">
                              ₺{Number(row.hgs_ucret).toLocaleString('tr-TR')}
                            </td>
                            <td className="py-4 px-4 text-right text-white font-medium">
                              ₺{Number(row.ogs_ucret).toLocaleString('tr-TR')}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => setEditingOtoyolIdx(idx)}
                                className="bg-orange-600 hover:bg-orange-700 text-white p-1 rounded inline-flex"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Araç Veritabanı Tab */}
        {activeTab === 'araclar' && (
          <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Araç Veritabanı ({vehicleDatabase.vehicles.length} araç)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-white font-semibold">Marka</th>
                    <th className="text-left py-4 px-4 text-white font-semibold">Model</th>
                    <th className="text-center py-4 px-4 text-white font-semibold">Motor (cc)</th>
                    <th className="text-center py-4 px-4 text-white font-semibold">Yakıt</th>
                    <th className="text-center py-4 px-4 text-white font-semibold">Tüketim</th>
                    <th className="text-right py-4 px-4 text-white font-semibold">Fiyat (₺)</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleDatabase.vehicles.map((vehicle, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-4 px-4 text-gray-300">{vehicle.brand}</td>
                      <td className="py-4 px-4 text-gray-300">{vehicle.model}</td>
                      <td className="py-4 px-4 text-center text-gray-300">{vehicle.engineSize}</td>
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
