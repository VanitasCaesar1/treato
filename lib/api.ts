import axios, { AxiosRequestConfig, AxiosError, AxiosProgressEvent } from 'axios';
import { withAuth } from '@workos-inc/authkit-nextjs';

const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';  

/**
 * Determines if code is running on the client side
 */
const isClient = typeof window !== 'undefined';

/**
 * Generate a UUID that works in both browser and Node environments
 */
function generateUUID() {
  // Use crypto.randomUUID() if available (Node.js environments)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Makes an API request to the backend with detailed error handling
 * Enhanced to support FormData for file uploads
 */
export async function makeApiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  options: AxiosRequestConfig = {}
) {
  // Build the full URL for debugging
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`🔍 Making ${method} request to: ${fullUrl}`);

  // Check if data is FormData (for file uploads)
  const isFormData = data instanceof FormData;

  // Request configuration
  const config: AxiosRequestConfig = {
    method,
    url: fullUrl,
    headers: {
      // Don't set Content-Type for FormData - axios will set it with the boundary
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    // Timeouts can help diagnose connection issues
    timeout: 30000, // Increased timeout for file uploads
    ...options
  };

  // Try to get auth data from WorkOS
  try {
    // Get the user ID from withAuth() to use as Bearer token
    const { user, organizationId, role, permissions } = await withAuth();
    
    // Log auth info for debugging (don't log in production)
    console.log('Auth data:', { 
      userId: user?.id ? 'present' : 'missing', 
      organizationId: organizationId || 'missing' 
    });
    
    // Use the user ID as the Bearer token for authentication
    if (user?.id) {
      config.headers!.Authorization = `Bearer ${user.id}`;
    }
    
    // Include organization ID in the headers if available
    if (organizationId) {
      config.headers!['X-Organization-ID'] = organizationId;
    }
    
    if (role) {
      config.headers!['X-Role'] = role;
    }
    
    if (permissions) {
      config.headers!['X-Permissions'] = permissions;
    }
  } catch (error) {
    console.warn('Auth data not available in this context:', error);
  }

  // Add request body for non-GET requests
  if (method !== 'GET' && data) {
    config.data = data;
  }

  // Add query parameters for GET requests
  if (method === 'GET' && data) {
    config.params = data;
  }

  // Log complete request configuration (remove in production)
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    params: config.params || 'none',
    withData: config.data ? (isFormData ? 'FormData' : true) : false
  });

  try {
    // Make the actual request
    const response = await axios(config);
    console.log(`✅ Request succeeded with status: ${response.status}`);
    return response.data;
  } catch (error: any) {
    // Detailed error handling
    console.error('❌ API request failed:', error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
        console.error('Response headers:', axiosError.response.headers);
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error('No response received. Request:', axiosError.request);
        console.error('Is the backend server running at', API_BASE_URL, '?');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', axiosError.message);
      }
      
      if (axiosError.response?.status === 401 && isClient) {
        console.log('Unauthorized. Redirecting to login...');
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
}

/**
 * Convenience methods for different request types
 */
export const api = {
  get: (endpoint: string, params?: any, options?: AxiosRequestConfig) =>
    makeApiRequest(endpoint, 'GET', params, options),
  post: (endpoint: string, data?: any, options?: AxiosRequestConfig) =>
    makeApiRequest(endpoint, 'POST', data, options),
  put: (endpoint: string, data?: any, options?: AxiosRequestConfig) =>
    makeApiRequest(endpoint, 'PUT', data, options),
  delete: (endpoint: string, params?: any, options?: AxiosRequestConfig) =>
    makeApiRequest(endpoint, 'DELETE', params, options),
  
  // Test connection to backend
  testConnection: async () => {
    try {
      // Try to connect to the backend server without authentication
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      console.log('Backend connection test:', response.status === 200 ? 'SUCCESS' : 'FAILED');
      return response.status === 200;
    } catch (error) {
      console.error('Backend connection test FAILED:', error);
      return false;
    }
  },
  
  // Auth specific helper functions
  auth: {
    logout: async () => {
      if (isClient) {
        try {
          await makeApiRequest('/api/auth/logout', 'POST');
        } catch (error) {
          console.error('Logout error:', error);
        }
        // Redirect to login page after logout
        window.location.href = '/login';
      }
    }
  },
  
  // Helper for handling file uploads with progress
  upload: async (
    endpoint: string, 
    formData: FormData, 
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ) => {
    try {
      // Create config with progress tracking
      const uploadConfig: AxiosRequestConfig = {
        onUploadProgress: onProgress,
        // Longer timeout for file uploads
        timeout: 60000,
        headers: {
          // Let axios set the correct multipart/form-data content type with boundary
        }
      };
      
      console.log(`📤 Starting file upload to ${endpoint}`);
      
      // Use the main API request function with the progress-tracking config
      const result = await makeApiRequest(endpoint, 'POST', formData, uploadConfig);
      
      console.log('✅ File upload completed successfully');
      return result;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  },
  
  // Advanced helper for handling larger file uploads with chunking
  uploadLargeFile: async (
    endpoint: string,
    file: File,
    options: {
      chunkSize?: number,
      onChunkProgress?: (chunkIndex: number, totalChunks: number, progress: number) => void,
      onTotalProgress?: (progress: number) => void,
      metadata?: Record<string, string>
    } = {}
  ) => {
    const { 
      chunkSize = 5 * 1024 * 1024, // Default 5MB chunks
      onChunkProgress, 
      onTotalProgress,
      metadata = {}
    } = options;
    
    // Calculate total chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    console.log(`📦 Preparing to upload file "${file.name}" (${file.size} bytes) in ${totalChunks} chunks`);
    
    let uploadedBytes = 0;
    const fileId = generateUUID(); // Use the browser-compatible UUID function
    
    // Upload each chunk
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);
      
      // Create FormData for this chunk
      const chunkFormData = new FormData();
      chunkFormData.append('file', chunk, file.name);
      chunkFormData.append('fileId', fileId);
      chunkFormData.append('chunkIndex', chunkIndex.toString());
      chunkFormData.append('totalChunks', totalChunks.toString());
      
      // Add file metadata
      Object.entries(metadata).forEach(([key, value]) => {
        chunkFormData.append(key, value);
      });
      
      // Track progress for this specific chunk
      const trackChunkProgress = (progressEvent: AxiosProgressEvent) => {
        const chunkProgress = progressEvent.loaded / (progressEvent.total || end - start);
        
        // Update progress for this chunk
        if (onChunkProgress) {
          onChunkProgress(chunkIndex, totalChunks, chunkProgress);
        }
        
        // Update total file upload progress
        if (onTotalProgress) {
          const chunkContribution = (progressEvent.loaded / file.size);
          const totalProgress = (uploadedBytes / file.size) + chunkContribution;
          onTotalProgress(Math.min(totalProgress, 1));
        }
      };
      
      // Upload this chunk
      console.log(`📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${start}-${end} bytes)`);
      await api.upload(`${endpoint}/chunk`, chunkFormData, trackChunkProgress);
      
      uploadedBytes += (end - start);
    }
    
    // Finalize the upload
    console.log('🔄 Finalizing file upload');
    const finalizeFormData = new FormData();
    finalizeFormData.append('fileId', fileId);
    finalizeFormData.append('fileName', file.name);
    finalizeFormData.append('fileSize', file.size.toString());
    finalizeFormData.append('fileType', file.type);
    
    // Add any additional metadata
    Object.entries(metadata).forEach(([key, value]) => {
      finalizeFormData.append(key, value);
    });
    
    // Request the server to assemble the chunks
    const result = await api.post(`${endpoint}/finalize`, finalizeFormData);
    console.log('✅ Large file upload completed successfully');
    return result;
  }
};

// Export the API base URL for other modules to use if needed
export { API_BASE_URL };