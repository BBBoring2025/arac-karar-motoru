'use client';

/**
 * RouteTimeline — Güzergah adım adım gösterimi
 * Path nodeId'lerinden anchor isimlerini çekerek timeline oluşturur.
 */

import React from 'react';
import { MapPin, Circle } from 'lucide-react';
import { RouteResult } from '@/lib/route/types';
import { findAnchor } from '@/data/locations/anchors';
import { formatDistance, formatCurrency } from '@/lib/route/formatters';

interface RouteTimelineProps {
  result: RouteResult;
}

export default function RouteTimeline({ result }: RouteTimelineProps) {
  const { path, tollBreakdown, startDistrict, endDistrict } = result;

  // Edge'lerdeki toll bilgilerini segment id'ye göre indeksle
  const tollMap = new Map(tollBreakdown.map((t) => [t.segmentId, t]));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Güzergah</h3>

      <div className="space-y-0">
        {/* Başlangıç ilçesi */}
        <TimelineNode
          icon="start"
          label={`${startDistrict.ilce}, ${startDistrict.il}`}
          sublabel="Başlangıç"
          isLast={false}
        />

        {/* Path edge'leri */}
        {path.edges.map((edge, idx) => {
          const toAnchor = findAnchor(edge.to);
          const tolls = edge.tollSegmentIds
            .map((sid) => tollMap.get(sid))
            .filter(Boolean);

          return (
            <React.Fragment key={edge.id}>
              {/* Edge bağlantı çizgisi */}
              <TimelineEdge
                distanceKm={edge.distanceKm}
                tolls={tolls.map((t) => ({
                  name: t!.name,
                  amount: t!.amount,
                }))}
              />
              {/* Varış node */}
              <TimelineNode
                icon={idx === path.edges.length - 1 ? 'mid' : 'mid'}
                label={toAnchor?.name ?? edge.to}
                sublabel={toAnchor?.il}
                isLast={idx === path.edges.length - 1}
              />
            </React.Fragment>
          );
        })}

        {/* Varış ilçesi */}
        {path.edges.length > 0 && (
          <TimelineEdge distanceKm={0} tolls={[]} sublabel="İlçe bağlantısı" />
        )}
        <TimelineNode
          icon="end"
          label={`${endDistrict.ilce}, ${endDistrict.il}`}
          sublabel="Varış"
          isLast={true}
        />
      </div>
    </div>
  );
}

function TimelineNode({
  icon,
  label,
  sublabel,
  isLast,
}: {
  icon: 'start' | 'mid' | 'end';
  label: string;
  sublabel?: string;
  isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        {icon === 'start' || icon === 'end' ? (
          <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0 mt-0.5" />
        )}
        {!isLast && <div className="w-px h-4 bg-gray-300" />}
      </div>
      <div className="pb-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>
    </div>
  );
}

function TimelineEdge({
  distanceKm,
  tolls,
  sublabel,
}: {
  distanceKm: number;
  tolls: Array<{ name: string; amount: number }>;
  sublabel?: string;
}) {
  return (
    <div className="flex items-start gap-3 ml-[2px]">
      <div className="flex flex-col items-center">
        <div className="w-px h-full min-h-[24px] bg-gray-300" />
      </div>
      <div className="py-1 text-xs text-slate-500">
        {distanceKm > 0 && <span>{formatDistance(distanceKm)}</span>}
        {sublabel && <span>{sublabel}</span>}
        {tolls.map((t, i) => (
          <span key={i} className="ml-2 text-orange-600 font-medium">
            💰 {t.name} {formatCurrency(t.amount)}
          </span>
        ))}
      </div>
    </div>
  );
}
