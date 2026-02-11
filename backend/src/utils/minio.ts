import { Client } from 'minio';

// MinIO client - lazy loaded
let minioClient: Client | null | undefined = undefined;

function initMinIOClient() {
  if (minioClient !== undefined) {
    return minioClient;
  }
  
  minioClient = null; // Mark as attempted
  
  try {
    // Only initialize MinIO if endpoint is properly configured
    const endpoint = process.env.S3_ENDPOINT?.replace(/^https?:\/\//, '').split(':')[0];
    
    if (!endpoint || !process.env.S3_ACCESS_KEY) {
      console.warn('⚠️  MinIO not configured, using local file uploads');
      return null;
    }
    
    minioClient = new Client({
      endPoint: endpoint,
      port: parseInt(process.env.S3_ENDPOINT?.split(':')[2] || '9000'),
      useSSL: process.env.S3_ENDPOINT?.startsWith('https'),
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY || '',
    });
    
    console.log('✅ MinIO client initialized');
    return minioClient;
  } catch (error) {
    console.warn('⚠️  MinIO initialization failed, using local file uploads:', error);
    return null;
  }
}

/**
 * Generate presigned URL for file upload
 * For local development without MinIO, returns a mock URL
 * @param bucketName - MinIO bucket name
 * @param objectName - Object key/path
 * @param expiry - URL expiration in seconds (default: 1 hour)
 */
export const generatePresignedUrl = async (
  bucketName: string,
  objectName: string,
  expiry: number = 3600
): Promise<string> => {
  const client = initMinIOClient();
  
  if (client) {
    try {
      return await client.presignedPutObject(bucketName, objectName, expiry);
    } catch (error) {
      console.warn('⚠️  MinIO presigned URL failed, using mock URL');
    }
  }
  
  // Mock URL for local development (backend will handle the upload)
  return `http://localhost:8080/uploads/file/${objectName}`;
};
