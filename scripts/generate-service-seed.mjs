import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, 'src/data/services.ts');
const outputPath = path.join(projectRoot, 'prisma/service-catalog.json');
const source = fs.readFileSync(sourcePath, 'utf8');
const arrayStart = source.indexOf('export const MASTER_SERVICES');
const openingBracket = source.indexOf('[', arrayStart);
const closingBracket = source.indexOf('];', openingBracket);

if (arrayStart < 0 || openingBracket < 0 || closingBracket < 0) {
  throw new Error('Could not locate MASTER_SERVICES in the canonical catalog.');
}

const objects = [];
let depth = 0;
let objectStart = -1;
let quote = '';
let escaped = false;

for (let index = openingBracket + 1; index < closingBracket; index += 1) {
  const character = source[index];

  if (quote) {
    if (escaped) {
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === quote) {
      quote = '';
    }
    continue;
  }

  if (character === "'" || character === '"' || character === '`') {
    quote = character;
    continue;
  }

  if (character === '{') {
    if (depth === 0) objectStart = index;
    depth += 1;
  } else if (character === '}') {
    depth -= 1;
    if (depth === 0 && objectStart >= 0) {
      objects.push(source.slice(objectStart, index + 1));
      objectStart = -1;
    }
  }
}

const services = objects.map((objectSource) => Function(`"use strict"; return (${objectSource});`)());

if (services.length === 0) {
  throw new Error('The canonical catalog did not contain any services.');
}

fs.writeFileSync(outputPath, `${JSON.stringify(services, null, 2)}\n`);
console.log(`Wrote ${services.length} services to ${path.relative(projectRoot, outputPath)}`);
