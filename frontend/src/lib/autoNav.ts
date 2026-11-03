import { Product } from '@/types';

export interface NavWaypoint {
  x: number;
  z: number;
}

export interface AutoNavState {
  targetX: number;
  targetZ: number;
  targetYaw: number;
  product: Product;
  autoAddToCart: boolean;
  waypoints: NavWaypoint[];
  currentWaypointIndex: number;
  startTime: number;
  startPos: [number, number, number];
}

interface ObstacleBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Major static shelf blocks on Ground Floor with safety buffer
const STORE_OBSTACLES: ObstacleBox[] = [
  // Outer perimeter walls
  { minX: -37.0, maxX: -33.5, minZ: -37.0, maxZ: 37.0 },  // Left Wall Shelves
  { minX: 33.0, maxX: 37.0, minZ: -16.0, maxZ: 16.0 },   // Right Wall Chillers
  { minX: -28.0, maxX: 28.0, minZ: 32.5, maxZ: 36.0 },   // Back Wall Racks

  // Longitudinal Gondolas
  { minX: -25.2, maxX: -22.8, minZ: -15.0, maxZ: 15.0 }, // Aisle 1
  { minX: -18.7, maxX: -16.3, minZ: -15.0, maxZ: 15.0 }, // Aisle 2
  { minX: 16.3, maxX: 18.7, minZ: -15.0, maxZ: 15.0 },   // Aisle 5
  { minX: 22.8, maxX: 25.2, minZ: -15.0, maxZ: 15.0 },   // Aisle 6
  { minX: 28.3, maxX: 30.7, minZ: -12.0, maxZ: 12.0 },   // Aisle 9

  // East-West Cross Gondolas
  { minX: -16.2, maxX: -5.8, minZ: -6.2, maxZ: -3.8 },   // Aisle 3
  { minX: -16.2, maxX: -5.8, minZ: 3.8, maxZ: 6.2 },     // Aisle 4
  { minX: 5.8, maxX: 16.2, minZ: -6.2, maxZ: -3.8 },     // Aisle 7
  { minX: 5.8, maxX: 16.2, minZ: 3.8, maxZ: 6.2 },       // Aisle 8

  // Checkout counters line
  { minX: -17.0, maxX: 17.0, minZ: 20.5, maxZ: 23.5 },
];

function isLineClear(x1: number, z1: number, x2: number, z2: number, padding = 0.45): boolean {
  const steps = 14;
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const px = x1 + (x2 - x1) * t;
    const pz = z1 + (z2 - z1) * t;
    for (const ob of STORE_OBSTACLES) {
      if (
        px >= ob.minX - padding &&
        px <= ob.maxX + padding &&
        pz >= ob.minZ - padding &&
        pz <= ob.maxZ + padding
      ) {
        return false;
      }
    }
  }
  return true;
}

export function buildNavWaypoints(
  startX: number,
  startZ: number,
  targetX: number,
  targetZ: number
): NavWaypoint[] {
  // If unobstructed line of sight, travel directly
  if (isLineClear(startX, startZ, targetX, targetZ)) {
    return [{ x: targetX, z: targetZ }];
  }

  // Select the closest open grand concourse (North at Z = -18.0 or South at Z = +17.5)
  const distToNorth = Math.abs(startZ - (-18.0)) + Math.abs(targetZ - (-18.0));
  const distToSouth = Math.abs(startZ - 17.5) + Math.abs(targetZ - 17.5);
  const concourseZ = distToNorth <= distToSouth ? -18.0 : 17.5;

  const waypoints: NavWaypoint[] = [];

  // 1. Move out of current aisle/position to the open concourse
  if (Math.abs(startZ - concourseZ) > 0.8) {
    waypoints.push({ x: startX, z: concourseZ });
  }

  // 2. Cruise across the concourse to the target aisle line
  if (Math.abs(startX - targetX) > 0.5) {
    waypoints.push({ x: targetX, z: concourseZ });
  }

  // 3. Move along the target aisle directly in front of the product
  waypoints.push({ x: targetX, z: targetZ });

  return waypoints;
}

export function resolveProductStandingPosition(product: Product): {
  standX: number;
  standZ: number;
  standYaw: number;
} {
  const plc = product.placement;
  if (plc?.standX !== undefined && plc?.standZ !== undefined && plc?.standYaw !== undefined) {
    return {
      standX: plc.standX,
      standZ: plc.standZ,
      standYaw: plc.standYaw,
    };
  }

  // Fallback if placement coords missing
  const wx = plc?.worldX ?? 0;
  const wz = plc?.worldZ ?? 0;
  const side = plc?.shelfSide ?? 'RIGHT';
  const aisleNum = plc?.aisleNumber ?? 1;

  // Cross-aisles (East-West)
  if (aisleNum === 3 || aisleNum === 4 || aisleNum === 7 || aisleNum === 8) {
    const isNorth = side === 'LEFT';
    return {
      standX: wx,
      standZ: isNorth ? wz - 1.25 : wz + 1.25,
      standYaw: isNorth ? 0 : Math.PI,
    };
  }

  // Longitudinal aisles (North-South)
  const isLeft = side === 'LEFT';
  return {
    standX: isLeft ? wx - 1.25 : wx + 1.25,
    standZ: wz,
    standYaw: isLeft ? Math.PI / 2 : -Math.PI / 2,
  };
}

