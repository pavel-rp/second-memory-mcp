import fs from 'node:fs';
import path from 'node:path';

function cleanTmpTestFiles() {
  const dir = path.resolve('.');
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return;
  }
  const tmpFiles = entries.filter(e => e.startsWith('tmp-test-') && e.includes('.db'));
  for (const entry of tmpFiles) {
    try {
      fs.unlinkSync(path.join(dir, entry));
    } catch {
      // File may already be removed or locked
    }
  }
}

export default function setup() {
  return cleanTmpTestFiles;
}
