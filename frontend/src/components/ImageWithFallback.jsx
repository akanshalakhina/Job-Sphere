import { useState } from 'react';

const DEFAULT_AVATAR = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#e2e8f0"/><text x="50" y="55" text-anchor="middle" font-size="36" fill="#94a3b8" font-family="Arial">?</text></svg>');
const DEFAULT_LOGO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#e2e8f0"/><text x="50" y="55" text-anchor="middle" font-size="36" fill="#94a3b8" font-family="Arial">C</text></svg>');

export const ImageWithFallback = ({ src, alt, className, type = 'avatar' }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(!src);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(type === 'logo' ? DEFAULT_LOGO : DEFAULT_AVATAR);
      console.warn(`Image failed to load: ${src}`);
    }
  };

  return (
    <img
      src={hasError ? (type === 'logo' ? DEFAULT_LOGO : DEFAULT_AVATAR) : imgSrc}
      alt={alt || ''}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};
