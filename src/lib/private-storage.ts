import path from 'path';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { createHash } from 'crypto';

const PRIVATE_SCHEME = 'private://';

type StorageObject = {
  uri: string;
  storageKey: string;
  checksum: string;
  size: number;
};

function localRoot() {
  return path.resolve(process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), '.private-data', 'uploads'));
}

function assertSafeStorageKey(storageKey: string) {
  if (!storageKey || path.isAbsolute(storageKey) || storageKey.includes('\\') || storageKey.split('/').some((part) => part === '..' || part === '.')) {
    throw new Error('Unsafe private storage key.');
  }
}

function localPath(storageKey: string) {
  assertSafeStorageKey(storageKey);
  const root = localRoot();
  const candidate = path.resolve(root, storageKey);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    throw new Error('Private storage path escapes the configured root.');
  }
  return candidate;
}

function assertSupportedDriver() {
  const driver = process.env.PRIVATE_STORAGE_DRIVER || 'local';
  if (driver !== 'local') {
    throw new Error(`Private storage driver "${driver}" is not configured.`);
  }
}

export async function putPrivateObject(storageKey: string, bytes: Buffer): Promise<StorageObject> {
  assertSupportedDriver();
  const filePath = localPath(storageKey);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes, { flag: 'wx' });
  return {
    uri: `${PRIVATE_SCHEME}${storageKey}`,
    storageKey,
    checksum: createHash('sha256').update(bytes).digest('hex'),
    size: bytes.length,
  };
}

export async function getPrivateObject(uri: string) {
  assertSupportedDriver();
  if (!uri.startsWith(PRIVATE_SCHEME)) {
    throw new Error('Unsupported private storage URI.');
  }
  const storageKey = uri.slice(PRIVATE_SCHEME.length);
  return { bytes: await readFile(localPath(storageKey)), storageKey };
}

export async function removePrivateObject(uri: string) {
  assertSupportedDriver();
  if (!uri.startsWith(PRIVATE_SCHEME)) return;
  const storageKey = uri.slice(PRIVATE_SCHEME.length);
  await unlink(localPath(storageKey));
}
