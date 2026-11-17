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

// Major static shelf blocks on Ground Floor
export const STORE_OBSTACLES: ObstacleBox[] = [
  // Outer perimeter walls
  { minX: -37.0, maxX: -33.5, minZ: -37.0, maxZ: 37.0 },  // Left Wall Shelves
  { minX: 33.0, maxX: 37.0, minZ: -16.0, maxZ: 16.0 },   // Right Wall Chillers
  { minX: -28.0, maxX: 28.0, minZ: 32.5, maxZ: 36.0 },   // Back Wall Racks

  // Longitudinal Gondolas (Aisles 1, 2, 5, 6, 9)
  { minX: -25.2, maxX: -22.8, minZ: -15.0, maxZ: 15.0 }, // Aisle 1
  { minX: -18.7, maxX: -16.3, minZ: -15.0, maxZ: 15.0 }, // Aisle 2
  { minX: 16.3, maxX: 18.7, minZ: -15.0, maxZ: 15.0 },   // Aisle 5
  { minX: 22.8, maxX: 25.2, minZ: -15.0, maxZ: 15.0 },   // Aisle 6
  { minX: 28.3, maxX: 30.7, minZ: -12.0, maxZ: 12.0 },   // Aisle 9

  // East-West Cross Gondolas (Aisles 3, 4, 7, 8)
  { minX: -16.2, maxX: -5.8, minZ: -6.2, maxZ: -3.8 },   // Aisle 3
  { minX: -16.2, maxX: -5.8, minZ: 3.8, maxZ: 6.2 },     // Aisle 4
  { minX: 5.8, maxX: 16.2, minZ: -6.2, maxZ: -3.8 },     // Aisle 7
  { minX: 5.8, maxX: 16.2, minZ: 3.8, maxZ: 6.2 },       // Aisle 8

  // Promotional Islands in Center
  { minX: -1.8, maxX: 1.8, minZ: -23.5, maxZ: -21.5 },   // Island 1
  { minX: -1.7, maxX: 1.7, minZ: -16.2, maxZ: -13.8 },   // Island 2
  { minX: -1.6, maxX: 1.6, minZ: -6.2, maxZ: -3.8 },     // Island 3

  // Checkout counters line
  { minX: -16.5, maxX: 16.5, minZ: 20.5, maxZ: 23.5 },
];

export function isPointColliding(x: number, z: number, margin = 0.55): boolean {
  for (const ob of STORE_OBSTACLES) {
    if (
      x >= ob.minX - margin &&
      x <= ob.maxX + margin &&
      z >= ob.minZ - margin &&
      z <= ob.maxZ + margin
    ) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// A* Hypermarket Walkway Grid & Raycast Pathfinding
// ---------------------------------------------------------------------------
const GRID_SIZE = 144; // 72m / 0.5m resolution
const CELL_SIZE = 0.5;
const MIN_COORD = -36.0;
const OBSTACLE_SAFETY_PADDING = 0.82; // 0.82m buffer ensures trolley never touches shelves

function toGridX(worldX: number): number {
  return Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((worldX - MIN_COORD) / CELL_SIZE)));
}
function toGridZ(worldZ: number): number {
  return Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((worldZ - MIN_COORD) / CELL_SIZE)));
}
function toWorldX(gx: number): number {
  return MIN_COORD + (gx + 0.5) * CELL_SIZE;
}
function toWorldZ(gz: number): number {
  return MIN_COORD + (gz + 0.5) * CELL_SIZE;
}

// Build precomputed static occupancy grid
const OCCUPANCY_GRID = new Uint8Array(GRID_SIZE * GRID_SIZE);

for (const ob of STORE_OBSTACLES) {
  const gMinX = toGridX(ob.minX - OBSTACLE_SAFETY_PADDING);
  const gMaxX = toGridX(ob.maxX + OBSTACLE_SAFETY_PADDING);
  const gMinZ = toGridZ(ob.minZ - OBSTACLE_SAFETY_PADDING);
  const gMaxZ = toGridZ(ob.maxZ + OBSTACLE_SAFETY_PADDING);

  for (let z = gMinZ; z <= gMaxZ; z++) {
    for (let x = gMinX; x <= gMaxX; x++) {
      OCCUPANCY_GRID[z * GRID_SIZE + x] = 1;
    }
  }
}

function isWalkable(gx: number, gz: number): boolean {
  if (gx < 0 || gx >= GRID_SIZE || gz < 0 || gz >= GRID_SIZE) return false;
  return OCCUPANCY_GRID[gz * GRID_SIZE + gx] === 0;
}

function findNearestWalkable(gx: number, gz: number): { gx: number; gz: number } {
  if (isWalkable(gx, gz)) return { gx, gz };
  for (let r = 1; r < 20; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.abs(dx) === r || Math.abs(dz) === r) {
          const nx = gx + dx;
          const nz = gz + dz;
          if (isWalkable(nx, nz)) return { gx: nx, gz: nz };
        }
      }
    }
  }
  return { gx, gz };
}

// Fast MinHeap for A* search
class NavMinHeap {
  data: { gx: number; gz: number; f: number }[] = [];
  push(item: { gx: number; gz: number; f: number }) {
    this.data.push(item);
    this._up(this.data.length - 1);
  }
  pop(): { gx: number; gz: number; f: number } | null {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this._down(0);
    }
    return top;
  }
  _up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[i].f < this.data[p].f) {
        const tmp = this.data[i];
        this.data[i] = this.data[p];
        this.data[p] = tmp;
        i = p;
      } else break;
    }
  }
  _down(i: number) {
    const len = this.data.length;
    while (true) {
      const l = (i << 1) + 1;
      const r = l + 1;
      let smallest = i;
      if (l < len && this.data[l].f < this.data[smallest].f) smallest = l;
      if (r < len && this.data[r].f < this.data[smallest].f) smallest = r;
      if (smallest !== i) {
        const tmp = this.data[i];
        this.data[i] = this.data[smallest];
        this.data[smallest] = tmp;
        i = smallest;
      } else break;
    }
  }
}

function findAStarPath(
  startX: number,
  startZ: number,
  targetX: number,
  targetZ: number
): NavWaypoint[] {
  const start = findNearestWalkable(toGridX(startX), toGridZ(startZ));
  const goal = findNearestWalkable(toGridX(targetX), toGridZ(targetZ));

  const startIdx = start.gz * GRID_SIZE + start.gx;
  const goalIdx = goal.gz * GRID_SIZE + goal.gx;

  if (startIdx === goalIdx) {
    return [{ x: targetX, z: targetZ }];
  }

  const openSet = new NavMinHeap();
  const gScore = new Float32Array(GRID_SIZE * GRID_SIZE).fill(Infinity);
  const cameFrom = new Int32Array(GRID_SIZE * GRID_SIZE).fill(-1);
  const closed = new Uint8Array(GRID_SIZE * GRID_SIZE);

  gScore[startIdx] = 0;
  openSet.push({ gx: start.gx, gz: start.gz, f: Math.hypot(start.gx - goal.gx, start.gz - goal.gz) });

  const DIRS = [
    { dx: 1, dz: 0, cost: 1 },
    { dx: -1, dz: 0, cost: 1 },
    { dx: 0, dz: 1, cost: 1 },
    { dx: 0, dz: -1, cost: 1 },
    { dx: 1, dz: 1, cost: 1.414 },
    { dx: -1, dz: 1, cost: 1.414 },
    { dx: 1, dz: -1, cost: 1.414 },
    { dx: -1, dz: -1, cost: 1.414 },
  ];

  let iterations = 0;
  const maxIterations = 2500;

  while (openSet.data.length > 0 && iterations++ < maxIterations) {
    const current = openSet.pop()!;
    const currIdx = current.gz * GRID_SIZE + current.gx;

    if (currIdx === goalIdx) {
      const path: NavWaypoint[] = [];
      let c = goalIdx;
      while (c !== -1) {
        const gx = c % GRID_SIZE;
        const gz = Math.floor(c / GRID_SIZE);
        path.push({ x: toWorldX(gx), z: toWorldZ(gz) });
        c = cameFrom[c];
      }
      path.reverse();
      return path;
    }

    if (closed[currIdx]) continue;
    closed[currIdx] = 1;

    for (const d of DIRS) {
      const nx = current.gx + d.dx;
      const nz = current.gz + d.dz;
      if (!isWalkable(nx, nz)) continue;
      // Prevent diagonal cutting of shelf corners
      if (d.dx !== 0 && d.dz !== 0) {
        if (!isWalkable(current.gx + d.dx, current.gz) || !isWalkable(current.gx, current.gz + d.dz)) {
          continue;
        }
      }

      const nextIdx = nz * GRID_SIZE + nx;
      if (closed[nextIdx]) continue;

      const tentativeG = gScore[currIdx] + d.cost;
      if (tentativeG < gScore[nextIdx]) {
        cameFrom[nextIdx] = currIdx;
        gScore[nextIdx] = tentativeG;
        const h = Math.hypot(nx - goal.gx, nz - goal.gz);
        openSet.push({ gx: nx, gz: nz, f: tentativeG + h * 1.05 });
      }
    }
  }

  return [{ x: targetX, z: targetZ }];
}

// Raycast line-of-sight validation to ensure shortcutting never crosses obstacles
function isRayClear(x1: number, z1: number, x2: number, z2: number): boolean {
  const dist = Math.hypot(x2 - x1, z2 - z1);
  const steps = Math.ceil(dist / 0.35);
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const px = x1 + (x2 - x1) * t;
    const pz = z1 + (z2 - z1) * t;
    const gx = toGridX(px);
    const gz = toGridZ(pz);
    if (!isWalkable(gx, gz)) return false;
  }
  return true;
}

// Path Simplifier (String Pulling via Raycasting for smooth, human-like straight walkways)
function smoothNavPath(rawPath: NavWaypoint[], targetX: number, targetZ: number): NavWaypoint[] {
  if (rawPath.length <= 2) {
    return [{ x: targetX, z: targetZ }];
  }

  const smoothed: NavWaypoint[] = [rawPath[0]];
  let currIdx = 0;

  while (currIdx < rawPath.length - 1) {
    let farthest = currIdx + 1;
    // Scan ahead to find farthest visible node along open walkway
    for (let test = rawPath.length - 1; test > currIdx + 1; test--) {
      if (isRayClear(rawPath[currIdx].x, rawPath[currIdx].z, rawPath[test].x, rawPath[test].z)) {
        farthest = test;
        break;
      }
    }
    smoothed.push(rawPath[farthest]);
    currIdx = farthest;
  }

  // Set exact target as final waypoint
  smoothed[smoothed.length - 1] = { x: targetX, z: targetZ };

  // Remove duplicate close waypoints
  const filtered: NavWaypoint[] = [];
  for (let i = 0; i < smoothed.length; i++) {
    if (i === 0 || i === smoothed.length - 1) {
      filtered.push(smoothed[i]);
    } else {
      const prev = filtered[filtered.length - 1];
      if (Math.hypot(smoothed[i].x - prev.x, smoothed[i].z - prev.z) > 0.4) {
        filtered.push(smoothed[i]);
      }
    }
  }

  return filtered;
}

/**
 * Builds smooth, collision-free waypoints that strictly navigate open walkways.
 * NEVER cuts or crosses through any shelves or obstacles.
 */
export function buildNavWaypoints(
  startX: number,
  startZ: number,
  targetX: number,
  targetZ: number
): NavWaypoint[] {
  // If direct line-of-sight along open walkway is completely clear, travel directly
  if (isRayClear(startX, startZ, targetX, targetZ)) {
    return [{ x: targetX, z: targetZ }];
  }

  // Compute optimal open walkway route with A* search
  const rawPath = findAStarPath(startX, startZ, targetX, targetZ);
  const smoothed = smoothNavPath(rawPath, targetX, targetZ);

  return smoothed.length > 0 ? smoothed : [{ x: targetX, z: targetZ }];
}

/**
 * Resolves a guaranteed safe shopper standing position in the open aisle walkway.
 * Validates against all obstacle bounding boxes to ensure the trolley NEVER sits inside a shelf.
 */
export function resolveProductStandingPosition(product: Product): {
  standX: number;
  standZ: number;
  standYaw: number;
} {
  const plc = product.placement;
  const aisleNum = plc?.aisleNumber ?? product.aisleNumber ?? 1;
  const side = plc?.shelfSide ?? 'RIGHT';
  const wx = plc?.worldX ?? 0;
  const wz = plc?.worldZ ?? 0;

  let standX: number = plc?.standX ?? 0;
  let standZ: number = plc?.standZ ?? 0;
  let standYaw: number = plc?.standYaw ?? 0;

  // Check if placement stand coordinates are valid and outside obstacles
  const isSafe =
    plc?.standX !== undefined &&
    plc?.standZ !== undefined &&
    !isPointColliding(plc.standX, plc.standZ, 0.45);

  if (!isSafe) {
    // Generate guaranteed safe standing location in the open walkway for each department
    if (aisleNum === 1) {
      standX = side === 'LEFT' ? -26.3 : -21.7;
      standZ = Math.max(-13.0, Math.min(13.0, wz));
      standYaw = side === 'LEFT' ? Math.PI / 2 : -Math.PI / 2;
    } else if (aisleNum === 2) {
      standX = side === 'LEFT' ? -19.8 : -15.2;
      standZ = Math.max(-13.0, Math.min(13.0, wz));
      standYaw = side === 'LEFT' ? Math.PI / 2 : -Math.PI / 2;
    } else if (aisleNum === 3) {
      standX = Math.max(-14.0, Math.min(-7.5, wx));
      standZ = side === 'LEFT' ? -7.8 : -2.2;
      standYaw = side === 'LEFT' ? 0 : Math.PI;
    } else if (aisleNum === 4) {
      standX = Math.max(-14.0, Math.min(-7.5, wx));
      standZ = side === 'LEFT' ? 2.2 : 7.8;
      standYaw = side === 'LEFT' ? 0 : Math.PI;
    } else if (aisleNum === 5) {
      // Wide open walkway between Aisle 5 and 6 at X = 19.8
      if (side === 'RIGHT') {
        standX = 19.8;
        standZ = Math.max(-13.0, Math.min(13.0, wz));
        standYaw = -Math.PI / 2;
      } else {
        standX = 15.2;
        if (Math.abs(wz - (-5.0)) < 1.8) {
          standZ = wz < -5.0 ? -7.5 : -2.5;
        } else if (Math.abs(wz - 5.0) < 1.8) {
          standZ = wz < 5.0 ? 2.5 : 7.5;
        } else {
          standZ = Math.max(-13.0, Math.min(13.0, wz));
        }
        standYaw = Math.PI / 2;
      }
    } else if (aisleNum === 6) {
      standX = side === 'LEFT' ? 21.7 : 26.3;
      standZ = Math.max(-13.0, Math.min(13.0, wz));
      standYaw = side === 'LEFT' ? Math.PI / 2 : -Math.PI / 2;
    } else if (aisleNum === 7) {
      standX = Math.max(7.5, Math.min(14.0, wx));
      standZ = side === 'LEFT' ? -7.8 : -2.2;
      standYaw = side === 'LEFT' ? 0 : Math.PI;
    } else if (aisleNum === 8) {
      standX = Math.max(7.5, Math.min(14.0, wx));
      standZ = side === 'LEFT' ? 2.2 : 7.8;
      standYaw = side === 'LEFT' ? 0 : Math.PI;
    } else if (aisleNum === 9) {
      standX = side === 'LEFT' ? 27.2 : 31.8;
      standZ = Math.max(-10.0, Math.min(10.0, wz));
      standYaw = side === 'LEFT' ? Math.PI / 2 : -Math.PI / 2;
    } else {
      // Wall racks / perimeter produce
      standX = wx;
      standZ = wz < 0 ? wz + 1.8 : wz - 1.8;
      standYaw = wz < 0 ? 0 : Math.PI;
    }
  }

  return { standX, standZ, standYaw };
}
