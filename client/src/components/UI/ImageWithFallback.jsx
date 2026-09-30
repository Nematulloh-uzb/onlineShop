import { useState } from 'react';
import { Image } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallbackClassName = '',
  loading = 'lazy',
  fetchPriority,
}) {
  const [failedSrc, setFailedSrc] = useState('');

  if (!src || failedSrc === src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[#F0EDED] text-[#9A9A8A] ${fallbackClassName} ${className}`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      >
        <Image size={38} strokeWidth={1.25} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
}
