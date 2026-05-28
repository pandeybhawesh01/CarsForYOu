/**
 * Presigned URL Service
 * 
 * Manages presigned S3 upload URLs with section-level caching.
 * - Fetches URLs for entire section at once
 * - Caches with 55-minute TTL
 * - Refetches entire section when any URL expires
 */

import { ENDPOINTS } from './endpoints';
import { httpPost } from './httpClient';
import { useCatalogViewModel } from '../../viewmodels/catalogViewModel';

interface PresignedUrlResponse {
  success: boolean;
  message: string;
  data: {
    files: Array<{
      key: string;
      uploadUrl: string;
      fileUrl: string | null;
      expiresAt: number; // Backend provides expiry timestamp
    }>;
  };
}

interface CachedUrl {
  uploadUrl: string;
  fileUrl: string;
  expiresAt: number; // Use backend's expiry timestamp
}

interface SectionCache {
  urls: Record<string, CachedUrl>;
  fetchedAt: number;
}

class PresignedUrlService {
  private cache: Record<string, SectionCache> = {};

  /**
   * Get presigned URLs for an entire section.
   * Uses cache if valid, otherwise fetches fresh URLs.
   */
  async getUrlsForSection(
    sectionKey: string,
    uploadPaths: string[],
    appointmentId: string,
  ): Promise<Record<string, CachedUrl>> {
    console.log('[PresignedUrlService] 🔍 Getting URLs for section:', sectionKey);
    console.log('[PresignedUrlService] 📋 Upload paths:', uploadPaths);

    // Check cache
    const cached = this.cache[sectionKey];
    const now = Date.now();

    if (cached) {
      // Check if any URL is expired (all expire together)
      const anyExpired = uploadPaths.some((path) => {
        const url = cached.urls[path];
        if (!url) return true; // Missing URL counts as expired
        
        const isExpired = now >= url.expiresAt;
        if (isExpired) {
          console.log('[PresignedUrlService] ⏰ URL expired for path:', path);
          console.log('[PresignedUrlService] ⚠️ All URLs in section expired (same expiresAt)');
        }
        return isExpired;
      });

      if (!anyExpired) {
        console.log('[PresignedUrlService] ✅ Cache hit! All URLs valid');
        return cached.urls;
      }

      console.log('[PresignedUrlService] ⚠️ Refetching entire section (URLs expired)');
    } else {
      console.log('[PresignedUrlService] 🆕 No cache found, fetching...');
    }

    // Fetch fresh URLs for entire section
    return await this.fetchPresignedUrls(sectionKey, uploadPaths, appointmentId);
  }

  /**
   * Get presigned URL for a single upload path.
   * Checks expiry and refetches entire section if expired.
   */
  async getUrlForPath(
    sectionKey: string,
    uploadPath: string,
    appointmentId: string,
  ): Promise<CachedUrl> {
    console.log('[PresignedUrlService] 🔍 Getting URL for path:', uploadPath);

    // Check cache first
    const cached = this.cache[sectionKey];
    const now = Date.now();

    if (cached && cached.urls[uploadPath]) {
      const url = cached.urls[uploadPath];
      const isExpired = now >= url.expiresAt;
      
      if (!isExpired) {
        console.log('[PresignedUrlService] ✅ Cache hit for path:', uploadPath);
        return url;
      }
      
      console.log('[PresignedUrlService] ⏰ Cached URL expired for path:', uploadPath);
      console.log('[PresignedUrlService] ⚠️ All URLs in section expired (same expiresAt)');
      
      // Get all paths for this section from catalog
      const catalog = useCatalogViewModel.getState().catalog;
      const allPathsInSection = catalog?.uploadPathsBySection?.[sectionKey];
      
      if (allPathsInSection && allPathsInSection.length > 0) {
        console.log('[PresignedUrlService] 🔄 Refetching entire section:', allPathsInSection.length, 'paths');
        const urls = await this.fetchPresignedUrls(sectionKey, allPathsInSection, appointmentId);
        return urls[uploadPath];
      } else {
        // Fallback: fetch just this path if catalog not available
        console.log('[PresignedUrlService] ⚠️ Catalog uploadPathsBySection not available, fetching single path as fallback');
        const urls = await this.fetchPresignedUrls(sectionKey, [uploadPath], appointmentId);
        return urls[uploadPath];
      }
    }

    // If not cached, fetch just this path
    console.log('[PresignedUrlService] 🆕 Fetching URL for single path');
    const urls = await this.fetchPresignedUrls(sectionKey, [uploadPath], appointmentId);
    return urls[uploadPath];
  }

  /**
   * Fetch presigned URLs from backend.
   */
  private async fetchPresignedUrls(
    sectionKey: string,
    uploadPaths: string[],
    appointmentId: string,
  ): Promise<Record<string, CachedUrl>> {
    console.log('[PresignedUrlService] 📡 Fetching presigned URLs from API');
    console.log('[PresignedUrlService] 📋 Paths:', uploadPaths);

    // Build file list for API
    const files = uploadPaths.map((path) => {
      const isVideo = path.toLowerCase().includes('video');
      const extension = isVideo ? 'mp4' : 'jpg';
      const contentType = isVideo ? 'video/mp4' : 'image/jpeg';

      return {
        fileName: `${path.replace(/\//g, '_')}.${extension}`,
        contentType,
        visibility: 'public',
        folder: 'car-images',
      };
    });

    console.log('[PresignedUrlService] 📤 Request payload:', {
      appointmentId,
      filesCount: files.length,
    });

    // Call API
    const response = await httpPost<PresignedUrlResponse>(ENDPOINTS.PRESIGNED_UPLOAD, {
      appointmentId,
      files,
    });

    if (!response.success) {
      console.error('[PresignedUrlService] ❌ API error:', response.message);
      throw new Error(response.message || 'Failed to fetch presigned URLs');
    }

    console.log('[PresignedUrlService] ✅ Received URLs:', response.data.files.length);

    // Build cache using backend's expiresAt
    const urls: Record<string, CachedUrl> = {};

    response.data.files.forEach((file, index) => {
      const uploadPath = uploadPaths[index];
      urls[uploadPath] = {
        uploadUrl: file.uploadUrl,
        fileUrl: file.fileUrl || file.uploadUrl, // Fallback to uploadUrl if fileUrl is null
        expiresAt: file.expiresAt, // Use backend's expiry timestamp
      };
      
      console.log('[PresignedUrlService] 📅 URL expires at:', new Date(file.expiresAt).toISOString());
    });

    // Update cache
    this.cache[sectionKey] = {
      urls,
      fetchedAt: Date.now(),
    };

    console.log('[PresignedUrlService] 💾 Cached URLs for section:', sectionKey);

    return urls;
  }

  /**
   * Clear cache for a specific section.
   */
  clearSection(sectionKey: string): void {
    console.log('[PresignedUrlService] 🗑️ Clearing cache for section:', sectionKey);
    delete this.cache[sectionKey];
  }

  /**
   * Clear entire cache.
   */
  clearAll(): void {
    console.log('[PresignedUrlService] 🗑️ Clearing entire cache');
    this.cache = {};
  }
}

// Export singleton instance
export const presignedUrlService = new PresignedUrlService();
