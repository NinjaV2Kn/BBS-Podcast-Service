import { Client } from 'minio';

// MinIO client configuration
export const minioClient = new Client({
  endPoint: process.env.S3_ENDPOINT?.replace('http://', '') || '',
  port: 9000,
  useSSL: false,
  accessKey: process.env.S3_ACCESS_KEY || '',
  secretKey: process.env.S3_SECRET_KEY || '',
});

/**
 * Generate presigned URL for file upload
 * @param bucketName - MinIO bucket name
 * @param objectName - Object key/path
 * @param expiry - URL expiration in seconds (default: 1 hour)
 */
export const generatePresignedUrl = async (
  bucketName: string,
  objectName: string,
  expiry: number = 3600
): Promise<string> => {
  return await minioClient.presignedPutObject(bucketName, objectName, expiry);
};
