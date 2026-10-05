import crypto from 'crypto';
import path from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpError } from '@/lib/http';

// Private document storage. KYC files are NEVER written under /public.
//  - S3 (recommended, required for serverless): set S3_BUCKET + AWS_REGION (+ AWS keys).
//    Objects are SSE-encrypted and downloads use 60-second presigned URLs.
//  - Local disk (dev / single VPS): files live in PRIVATE_STORAGE_DIR (default ./storage/private)
//    and are streamed only through the authenticated download route.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED: { mime: string; ext: string; magic: number[] }[] = [
  { mime: 'application/pdf', ext: 'pdf', magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/png', ext: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', ext: 'jpg', magic: [0xff, 0xd8, 0xff] },
];

/** Detects the real file type from its bytes — the browser-supplied MIME type is not trusted. */
export function sniffFileType(buffer: Buffer) {
  return ALLOWED.find((t) => t.magic.every((byte, i) => buffer[i] === byte)) || null;
}

const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
const s3 = bucket ? new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' }) : null;
const localRoot = path.resolve(process.env.PRIVATE_STORAGE_DIR || path.join(process.cwd(), 'storage', 'private'));

export function newStorageKey(ownerId: string, ext: string) {
  return `vault/${ownerId}/${crypto.randomUUID()}.${ext}`;
}

function localPath(key: string) {
  const full = path.resolve(localRoot, key);
  if (!full.startsWith(localRoot + path.sep)) throw new HttpError(400, 'Invalid storage key.');
  return full;
}

export async function putObject(key: string, body: Buffer, mimeType: string) {
  if (s3) {
    await s3.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: mimeType, ServerSideEncryption: 'AES256' })
    );
    return;
  }
  const full = localPath(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body, { mode: 0o600 });
}

export type Download = { kind: 'redirect'; url: string } | { kind: 'inline'; body: Buffer };

export async function getDownload(key: string, filename: string, mimeType: string): Promise<Download> {
  if (s3) {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentType: mimeType,
        ResponseContentDisposition: `inline; filename="${filename.replace(/"/g, '')}"`,
      }),
      { expiresIn: 60 }
    );
    return { kind: 'redirect', url };
  }
  return { kind: 'inline', body: await readFile(localPath(key)) };
}

export function sha256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
