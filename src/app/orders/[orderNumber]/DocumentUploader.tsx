'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentUploaderProps {
  orderId: string;
  documentName: string;
  documentId?: string | null;
  existingFileName?: string | null;
}

export default function DocumentUploader({
  orderId,
  documentName,
  documentId,
  existingFileName,
}: DocumentUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are accepted.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be 10 MB or less.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      formData.append('documentName', documentName);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'An error occurred during file upload.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {documentId && (
        <a
          href={`/api/documents/${documentId}/download`}
          className="max-w-[190px] truncate text-xs font-semibold text-[#0E7490] underline"
        >
          📄 {existingFileName || 'Download file'}
        </a>
      )}
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800">
        {uploading ? 'Uploading…' : documentId ? 'Replace file' : 'Upload file'}
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          disabled={uploading}
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>
      {error && <p role="alert" className="basis-full text-xs text-rose-700">{error}</p>}
    </div>
  );
}
