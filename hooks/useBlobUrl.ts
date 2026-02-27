import { useState, useEffect } from 'react';

/**
 * Creates a blob URL for a File/Blob and guarantees cleanup on change and unmount.
 * Replaces the leaky useMemo + useEffect pattern.
 */
export function useBlobUrl(file: File | Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setUrl(blobUrl);
      return () => URL.revokeObjectURL(blobUrl);
    } else {
      setUrl(null);
    }
  }, [file]);

  return url;
}

/**
 * Creates blob URLs for an array of Files and guarantees cleanup on change and unmount.
 */
export function useBlobUrls(files: File[]): string[] {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const blobUrls = files.map(f => URL.createObjectURL(f));
    setUrls(blobUrls);
    return () => blobUrls.forEach(u => URL.revokeObjectURL(u));
  }, [files]);

  return urls;
}
