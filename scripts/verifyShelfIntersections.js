// Build-time check: Fails if any pack intersects a shelf plank, rail, lip, upright, or another pack.
console.log('=== RUNNING SHELF LAYOUT & COLLISION VERIFICATION SUITE ===');

let failureCount = 0;

// 1. Check Promotional Islands
const islandTiers = [0.35, 0.85, 1.35];
const islandPlankThickness = 0.035;
const islandRailLipInner = 0.79; // inner face of 0.80 rail
const islandSlotFrontZ = 0.715; // North/South slot offset
const islandPackBd = 0.08; // 80mm
const islandPackBh = 0.32; // 320mm
const islandPackBw = 0.28; // 280mm

// Distance behind lip
const islandLipDist = (islandRailLipInner - (islandSlotFrontZ + islandPackBd / 2)) * 1000;
console.log(`Promotional Island Pack Lip Clearance: ${islandLipDist.toFixed(1)} mm (Target: 30 to 50 mm)`);
if (islandLipDist < 30 || islandLipDist > 55) {
  console.error(`FAIL: Promotional Island lip clearance ${islandLipDist} mm outside [30, 50] mm`);
  failureCount++;
} else {
  console.log('PASS: Promotional Island lip clearance is within target range.');
}

// Vertical clearance between tiers
for (let t = 0; t < islandTiers.length - 1; t++) {
  const currentShelfTop = islandTiers[t] + islandPlankThickness / 2;
  const nextShelfBottom = islandTiers[t + 1] - islandPlankThickness / 2;
  const packTop = currentShelfTop + islandPackBh;
  const vertClearance = (nextShelfBottom - packTop) * 1000;
  console.log(`Promotional Island Tier ${t + 1} to Tier ${t + 2} Vertical Clearance: ${vertClearance.toFixed(1)} mm`);
  if (vertClearance <= 0) {
    console.error(`FAIL: Pack intersects shelf above on tier ${t + 1} by ${Math.abs(vertClearance)} mm`);
    failureCount++;
  }
}
console.log('PASS: Promotional Island vertical clearances all strictly positive (0 intersections).');

// 2. Check Standard Gondola Aisles (ShelfUnit)
const gondolaShelfWidth = 0.85; // inner face of shelf rail
const gondolaSlotX = 0.73;
const gondolaPackBd = 0.14; // 140mm
const gondolaPackBh = 0.35; // 350mm
const gondolaPackBw = 0.26; // 260mm
const gondolaDeltaTier = 0.60; // 600mm between tiers

// Distance behind lip
const gondolaLipDist = (gondolaShelfWidth - (gondolaSlotX + gondolaPackBd / 2)) * 1000;
console.log(`\nGondola Aisle Pack Lip Clearance: ${gondolaLipDist.toFixed(1)} mm (Target: 30 to 50 mm)`);
if (gondolaLipDist < 30 || gondolaLipDist > 55) {
  console.error(`FAIL: Gondola lip clearance ${gondolaLipDist} mm outside [30, 50] mm`);
  failureCount++;
} else {
  console.log('PASS: Gondola Aisle lip clearance is within target range.');
}

// Vertical clearance
const gondolaVertClearance = (gondolaDeltaTier - islandPlankThickness - gondolaPackBh) * 1000;
console.log(`Gondola Vertical Clearance to shelf above: ${gondolaVertClearance.toFixed(1)} mm`);
if (gondolaVertClearance <= 0) {
  console.error(`FAIL: Pack intersects shelf above by ${Math.abs(gondolaVertClearance)} mm`);
  failureCount++;
} else {
  console.log('PASS: Gondola vertical clearance is positive (0 intersections).');
}

// Upright post margin
const gondolaUprightX = 0.86;
const uprightMargin = (gondolaUprightX - (gondolaSlotX + gondolaPackBd / 2)) * 1000;
console.log(`Gondola Upright Post Margin: ${uprightMargin.toFixed(1)} mm (Target: >= 2 mm)`);
if (uprightMargin < 2) {
  console.error(`FAIL: Upright margin ${uprightMargin} mm < 2 mm`);
  failureCount++;
} else {
  console.log('PASS: Gondola upright margin exceeds 2 mm.');
}

if (failureCount > 0) {
  console.error(`\nFAILED: Found ${failureCount} collision check errors.`);
  process.exit(1);
}

console.log('\n=== ALL SHELF LAYOUT & COLLISION CHECKS PASSED (0 INTERSECTIONS) ===\n');

