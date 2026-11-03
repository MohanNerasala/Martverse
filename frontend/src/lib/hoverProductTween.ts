import * as THREE from 'three';

// EaseOutCubic function for realistic smooth deceleration
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Check for user accessibility reduced-motion setting
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Pre-allocated static math structures to prevent garbage collection allocations in useFrame
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _tiltQuat = new THREE.Quaternion();
const _rotYQuat = new THREE.Quaternion();

export interface HoverTransformParams {
  restX: number;
  restY: number; // Center Y of the pack (slot.relY + bh / 2)
  restZ: number;
  rotY: number;
  bw: number;
  bh: number;
  bd: number;
  progress: number; // 0.0 to 1.0 (eased)
  reducedMotion?: boolean;
}

/**
 * Computes the transformed Matrix4 for a product pack during pull-out hover.
 * Moves 18mm toward the aisle and tilts 3.5 deg forward around its bottom front edge.
 * Neighboring packs remain static. Zero allocations per frame.
 */
export function computeHoverMatrix(
  outMatrix: THREE.Matrix4,
  params: HoverTransformParams
): THREE.Matrix4 {
  const { restX, restY, restZ, rotY, bw, bh, bd, progress, reducedMotion = false } = params;

  if (progress <= 0.0001 || reducedMotion) {
    // Static rest matrix
    _pos.set(restX, restY, restZ);
    _euler.set(0, rotY, 0, 'YXZ');
    _quat.setFromEuler(_euler);
    _scale.set(bw, bh, bd);
    outMatrix.compose(_pos, _quat, _scale);
    return outMatrix;
  }

  // Forward unit vector in the shelf's coordinate space
  const fwdX = Math.sin(rotY);
  const fwdZ = Math.cos(rotY);

  // 1. Pull-out forward translation toward aisle: 18mm * progress
  const pullDist = 0.018 * progress;

  // 2. Tilt angle around bottom front edge: 3.5 deg (0.061 rad) * progress
  const tiltRad = (3.5 * (Math.PI / 180)) * progress;

  // 3. Shift from bottom front edge pivot:
  // Center is bh/2 above bottom and bd/2 behind front face.
  // Tilting forward rotates the pack center around the pivot.
  const deltaY = (bh / 2) * (Math.cos(tiltRad) - 1);
  const deltaForward = (bh / 2) * Math.sin(tiltRad);

  const totalForward = pullDist + deltaForward;

  _pos.set(
    restX + fwdX * totalForward,
    restY + deltaY,
    restZ + fwdZ * totalForward
  );

  // Rotation: combine base rotY with forward tilt around local horizontal axis
  _rotYQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  _tiltQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), tiltRad);
  _quat.multiplyQuaternions(_rotYQuat, _tiltQuat);

  _scale.set(bw, bh, bd);

  outMatrix.compose(_pos, _quat, _scale);
  return outMatrix;
}

/**
 * Computes the label faceplate transform matching the hovered product body.
 */
export function computeHoverLabelMatrix(
  outMatrix: THREE.Matrix4,
  params: HoverTransformParams & { lw: number; lh: number }
): THREE.Matrix4 {
  const { restX, restY, restZ, rotY, lw, lh, bd, progress, reducedMotion = false } = params;

  // Compute product body matrix first
  computeHoverMatrix(_mat4, params);
  _mat4.decompose(_pos, _quat, _scale);

  // Offset label slightly in front of the front face (0.003m)
  const fwdX = Math.sin(rotY);
  const fwdZ = Math.cos(rotY);
  const labelDist = bd / 2 + 0.003;

  _pos.x += fwdX * labelDist;
  _pos.z += fwdZ * labelDist;

  _scale.set(lw, lh, 1);
  outMatrix.compose(_pos, _quat, _scale);
  return outMatrix;
}

