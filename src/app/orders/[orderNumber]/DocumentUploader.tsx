'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentUploaderProps {
  orderId: string;
  documentRequirementId?: string | null;
  documentName: string;
  existingFileUrl?: string | null;
  existingFileName?: string | null;
}

export default function DocumentUploader({
  orderId,
  documentRequirementId,
  documentName,
  existingFileUrl,
  existingFileName,
}: DocumentUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      if (documentRequirementId) {
        formData.append('documentRequirementId', documentRequirementId);
      }
      formData.append('documentName', documentName);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  if (existingFileUrl) {
    return (
      <div className="flex items-center gap-3">
        <a
          href={existingFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline truncate max-w-[160px]"
        >
          📄 {existingFileName || 'View File'}
        </a>
        <label className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-800 underline">
          {uploading ? 'Replacing...' : 'Replace'}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            disabled={uploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  return (
    <label className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block">
      {uploading ? 'Uploading...' : 'Upload File'}
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        disabled={uploading}
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
}