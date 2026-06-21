import { useState, useEffect } from 'react';

const generateFallback = (type, fallbackText) => {
  if (type === 'logo') {
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#e2e8f0"/><text x="50" y="55" text-anchor="middle" font-size="36" fill="#94a3b8" font-family="Arial">C</text></svg>');
  }
  
  let text = '?';
  if (fallbackText) {
    const parts = fallbackText.split(' ');
    text = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  }

  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#indigo-100" style="fill: #e0e7ff;"/><text x="50" y="55" text-anchor="middle" font-size="36" fill="#4f46e5" font-family="Arial" font-weight="bold">${text}</text></svg>`);
};

export const ImageWithFallback = ({ src, alt, className, type = 'avatar', fallbackText }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setImgSrc(src);
    setHasError(!src);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(generateFallback(type, fallbackText || alt));
      console.warn(`Image failed to load: ${src}`);
    }
  };

  return (
    <img
      src={hasError ? generateFallback(type, fallbackText || alt) : imgSrc}
      alt={alt || ''}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};
