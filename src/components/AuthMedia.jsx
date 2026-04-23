import { memo } from 'react';
import useFileUrl from '../hooks/useFileUrl';

/**
 * Component to display authenticated media (images/audio)
 * Automatically handles loading states and blob URL management
 */
const AuthMedia = memo(({ fileId, type = 'IMAGE', alt = '', className = '', onClick }) => {
  const { url, loading, error } = useFileUrl(fileId);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className={`${className} bg-red-50 flex items-center justify-center`}>
        <div className="text-center p-4">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-500 text-sm">Failed to load</span>
        </div>
      </div>
    );
  }

  if (type === 'IMAGE') {
    return (
      <img 
        src={url} 
        alt={alt} 
        className={className} 
        onClick={onClick}
        loading="lazy"
      />
    );
  }

  if (type === 'AUDIO') {
    return (
      <audio 
        controls 
        className={className} 
        src={url}
        preload="metadata"
      />
    );
  }

  return null;
});

AuthMedia.displayName = 'AuthMedia';

export default AuthMedia;
