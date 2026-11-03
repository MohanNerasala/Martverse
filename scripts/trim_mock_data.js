const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/lib/mockData.ts');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const floorsEndIdx = lines.findIndex((l) => l.startsWith('export const MOCK_PRODUCTS'));

let newContent = lines.slice(0, floorsEndIdx).join('\n');
newContent = newContent.replace(
  "import { REFRIGERATOR_PRODUCTS } from './refrigeratorData';",
  "import { REFRIGERATOR_PRODUCTS } from './refrigeratorData';\nimport { CANONICAL_BACKEND_PRODUCTS } from './productsCatalog';"
);

newContent += '\nexport const MOCK_PRODUCTS: Product[] = CANONICAL_BACKEND_PRODUCTS;\n';
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully trimmed mockData.ts, new line count:', newContent.split('\n').length);

