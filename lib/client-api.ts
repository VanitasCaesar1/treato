import axios, { AxiosRequestConfig, AxiosError, AxiosProgressEvent } from 'axios';

// Generate UUID function compatible with browser
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Makes a request to the Next.js API route which then communicates with the backend
 */
export async function makeClientApiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  options: AxiosRequestConfig = {}
) {
  // Always prepend with /api to ensure we're hitting our Next.js API routes
  const fullUrl = `/api${endpoint}`;
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
    timeout: 30000, // 30 seconds
    ...options
  };

  // Add request body for non-GET requests
  if (method !== 'GET' && data) {
    config.data = data;
  }

  // Add query parameters for GET requests
  if (method === 'GET' && data) {
    config.params = data;
  }

  try {
    // Make the actual request
    const response = await axios(config);
    console.log(`✅ Request succeeded with status: ${response.status}`);
    return response.data;
  } catch (error: any) {
    // Error handling
    console.error('❌ API request failed:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('Response error data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      } else if (axiosError.request) {
        console.error('No response received. Request:', axiosError.request);
      } else {
        console.error('Error setting up request:', axiosError.message);
      }

      // Handle auth errors
      if (axiosError.response?.status === 401) {
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
export const clientApi = {
  get: (endpoint: string, params?: any, options?: AxiosRequestConfig) =>
    makeClientApiRequest(endpoint, 'GET', params, options),
  post: (endpoint: string, data?: any, options?: AxiosRequestConfig) =>
    makeClientApiRequest(endpoint, 'POST', data, options),
  put: (endpoint: string, data?: any, options?: AxiosRequestConfig) =>
    makeClientApiRequest(endpoint, 'PUT', data, options),
  delete: (endpoint: string, params?: any, options?: AxiosRequestConfig) =>
    makeClientApiRequest(endpoint, 'DELETE', params, options),
  
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
      };
      console.log(`📤 Starting file upload to ${endpoint}`);
      // Use the main API request function with the progress-tracking config
      const result = await makeClientApiRequest(endpoint, 'POST', formData, uploadConfig);
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
    const fileId = generateUUID();
    
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
      await clientApi.upload(`${endpoint}/chunk`, chunkFormData, trackChunkProgress);
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
    const result = await clientApi.post(`${endpoint}/finalize`, finalizeFormData);
    console.log('✅ Large file upload completed successfully');
    return result;
  }
};