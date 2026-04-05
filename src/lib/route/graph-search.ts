/**
 * Dijkstra Shortest Path Algoritması
 * Rota grafı üzerinde en kısa yol bulur.
 * Edge weight olarak distanceKm veya durationMin kullanılabilir.
 */

import { RouteEdge } from './types';

export interface DijkstraResult {
  path: string[];
  totalDistanceKm: number;
  totalDurationMin: number;
  edges: RouteEdge[];
  tollAvoidanceFailed?: boolean;
}

interface QueueItem {
  nodeId: string;
  cost: number;
}

/**
 * Dijkstra shortest path
 * @param startId - Başlangıç anchor node id
 * @param endId - Varış anchor node id
 * @param edges - Tüm edge listesi
 * @param includeTolled - false ise ücretli edge'leri ağırlıklandırır (3x penalty)
 * @param weightBy - 'distance' veya 'duration'
 */
export function dijkstra(
  startId: string,
  endId: string,
  edges: RouteEdge[],
  includeTolled: boolean = true,
  weightBy: 'distance' | 'duration' = 'distance'
): DijkstraResult | null {
  const TOLL_PENALTY_MULTIPLIER = 10;

  // Adjacency list oluştur
  const adjacency = new Map<string, Array<{ neighborId: string; edge: RouteEdge; cost: number }>>();

  for (const edge of edges) {
    const baseCost = weightBy === 'distance' ? edge.distanceKm : edge.durationMin;
    const hasToll = edge.tollSegmentIds.length > 0;
    const cost = !includeTolled && hasToll ? baseCost * TOLL_PENALTY_MULTIPLIER : baseCost;

    // from → to
    if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
    adjacency.get(edge.from)!.push({ neighborId: edge.to, edge, cost });

    // to → from (bidirectional)
    if (edge.bidirectional) {
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
      adjacency.get(edge.to)!.push({ neighborId: edge.from, edge, cost });
    }
  }

  // Dijkstra
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge: RouteEdge } | null>();
  const visited = new Set<string>();

  dist.set(startId, 0);
  prev.set(startId, null);

  // Simple priority queue (array-based — sufficient for ~150 nodes)
  const queue: QueueItem[] = [{ nodeId: startId, cost: 0 }];

  while (queue.length > 0) {
    // Find min cost node
    let minIdx = 0;
    for (let i = 1; i < queue.length; i++) {
      if (queue[i].cost < queue[minIdx].cost) minIdx = i;
    }
    const current = queue.splice(minIdx, 1)[0];

    if (visited.has(current.nodeId)) continue;
    visited.add(current.nodeId);

    if (current.nodeId === endId) break;

    const neighbors = adjacency.get(current.nodeId) || [];
    for (const { neighborId, edge, cost } of neighbors) {
      if (visited.has(neighborId)) continue;

      const newDist = (dist.get(current.nodeId) ?? Infinity) + cost;
      if (newDist < (dist.get(neighborId) ?? Infinity)) {
        dist.set(neighborId, newDist);
        prev.set(neighborId, { nodeId: current.nodeId, edge });
        queue.push({ nodeId: neighborId, cost: newDist });
      }
    }
  }

  // Path bulunamadı
  if (!prev.has(endId)) return null;

  // Path'i geri izle
  const path: string[] = [];
  const pathEdges: RouteEdge[] = [];
  let currentNode: string | undefined = endId;

  while (currentNode) {
    path.unshift(currentNode);
    const prevEntry = prev.get(currentNode);
    if (prevEntry) {
      pathEdges.unshift(prevEntry.edge);
      currentNode = prevEntry.nodeId;
    } else {
      currentNode = undefined;
    }
  }

  // Gerçek mesafe ve süre (penalty'siz)
  let totalDistanceKm = 0;
  let totalDurationMin = 0;
  for (const edge of pathEdges) {
    totalDistanceKm += edge.distanceKm;
    totalDurationMin += edge.durationMin;
  }

  // Ücretli yol kaçınma istendi ama rota hâlâ toll içeriyorsa
  const tollAvoidanceFailed =
    !includeTolled && pathEdges.some((e) => e.tollSegmentIds.length > 0);

  return {
    path,
    totalDistanceKm,
    totalDurationMin,
    edges: pathEdges,
    tollAvoidanceFailed,
  };
}
