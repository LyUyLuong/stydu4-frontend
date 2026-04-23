import { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api';

/**
 * Custom hook to fetch and cache file URLs with authentication
 * Automatically handles blob URL cleanup
 */
export const useFileUrl = (fileId) => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const urlRef = useRef(null);

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchUrl = async () => {
      try {
        const response = await apiClient.get(`/files/${fileId}`, {
          responseType: 'blob'
        });
        const blob = response.data;
        const blobUrl = URL.createObjectURL(blob);
        
        if (mounted) {
          urlRef.current = blobUrl;
          setUrl(blobUrl);
          setLoading(false);
        } else {
          // Cleanup if component unmounted during fetch
          URL.revokeObjectURL(blobUrl);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching file:', err);
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchUrl();

    // Cleanup blob URL on unmount or fileId change
    return () => {
      mounted = false;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [fileId]);

  return { url, loading, error };
};

/**
 * Custom hook to manage multiple file URLs with caching
 */
export const useFileUrlCache = () => {
  const cacheRef = useRef({});

  useEffect(() => {
    // Cleanup all cached URLs on unmount
    return () => {
      Object.values(cacheRef.current).forEach(url => {
        if (url?.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      cacheRef.current = {};
    };
  }, []);

  const fetchFileUrl = async (fileId) => {
    // Return cached URL if exists
    if (cacheRef.current[fileId]) {
      return cacheRef.current[fileId];
    }

    try {
      const response = await apiClient.get(`/files/${fileId}`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      cacheRef.current[fileId] = url;
      return url;
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  };

  const revokeFileUrl = (fileId) => {
    const url = cacheRef.current[fileId];
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      delete cacheRef.current[fileId];
    }
  };

  const clearCache = () => {
    Object.values(cacheRef.current).forEach(url => {
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    cacheRef.current = {};
  };

  return { fetchFileUrl, revokeFileUrl, clearCache };
};

export default useFileUrl;
