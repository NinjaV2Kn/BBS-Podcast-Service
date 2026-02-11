import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import https from 'https';
import http from 'http';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const youtube = google.youtube('v3');

/**
 * Create YouTube API client with API key (for direct uploads without user auth)
 */
export const createYouTubeClient = () => {
  return google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY || '',
  });
};

/**
 * Get authorization URL for YouTube OAuth2
 */
export const getYouTubeAuthUrl = (): string => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID || '',
    process.env.YOUTUBE_CLIENT_SECRET || '',
    process.env.YOUTUBE_REDIRECT_URL || 'http://localhost:8080/api/youtube/callback'
  );

  const scopes = ['https://www.googleapis.com/auth/youtube.upload'];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeCodeForToken = async (code: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID || '',
    process.env.YOUTUBE_CLIENT_SECRET || '',
    process.env.YOUTUBE_REDIRECT_URL || 'http://localhost:8080/api/youtube/callback'
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Upload video to YouTube using API Key
 */
export const uploadToYouTube = async (
  videoFile: string,
  title: string,
  description: string,
  tags: string[] = []
): Promise<string> => {
  try {
    const response = await youtube.videos.insert(
      {
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags: tags.slice(0, 50), // YouTube limit
            categoryId: '21', // Podcast category
            language: 'de',
          },
          status: {
            privacyStatus: 'public',
            publishAt: new Date().toISOString(),
          },
        },
        media: {
          body: fs.createReadStream(videoFile),
        },
      },
      {
        onUploadProgress: (evt) => {
          const progress = Math.round((evt.bytesProcessed / 1000000000) * 100);
          console.log(`YouTube upload progress: ${progress}%`);
        },
      }
    );

    return response.data.id || '';
  } catch (error) {
    console.error('YouTube upload error:', error);
    throw new Error(`Failed to upload to YouTube: ${error}`);
  }
};

/**
 * Download file from URL to disk
 */
const downloadFile = (fileUrl: string, destPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const protocol = fileUrl.startsWith('https') ? https : http;
    const file = createWriteStream(destPath);

    protocol
      .get(fileUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
            return;
          }
        }
        pipeline(response, file)
          .then(() => resolve())
          .catch(reject);
      })
      .on('error', (err) => {
        fs.unlink(destPath, () => {}); // Delete on error
        reject(err);
      });
  });
};

/**
 * Create a simple black placeholder image
 */
const createBlackImage = (imagePath: string, width: number = 1280, height: number = 720): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .inputFormat('lavfi')
      .input(`color=c=black:s=${width}x${height}:d=1`)
      .outputOptions('-frames:v', '1')
      .output(imagePath)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });
};

/**
 * Create a simple video from audio file with static cover image
 */
export const generateVideoFromAudio = async (
  audioFile: string,
  coverImage: string | null,
  title: string,
  outputFile: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      (async () => {
        try {
          let imageToUse = coverImage;

          // If we don't have a cover image, create a black placeholder
          if (!imageToUse || !fs.existsSync(imageToUse)) {
            const tmpBlackImage = path.join(path.dirname(outputFile), 'black.png');
            console.log('Creating black placeholder image...');
            await createBlackImage(tmpBlackImage);
            imageToUse = tmpBlackImage;
          }

          // Create video from image + audio
          const command = ffmpeg();
          command
            .input(imageToUse)
            .inputOptions('-loop', '1')
            .input(audioFile)
            .outputOptions('-c:v', 'libx264')
            .outputOptions('-c:a', 'aac')
            .outputOptions('-b:a', '128k')
            .outputOptions('-pix_fmt', 'yuv420p')
            .outputOptions('-vf', 'scale=1280:720')
            .outputOptions('-shortest')
            .output(outputFile)
            .on('end', () => {
              console.log(`✅ Video created: ${outputFile}`);
              // Clean up black image if we created it
              if (!coverImage || !fs.existsSync(coverImage)) {
                try {
                  fs.unlinkSync(path.join(path.dirname(outputFile), 'black.png'));
                } catch (e) {}
              }
              resolve();
            })
            .on('error', (err) => {
              console.error(`❌ FFmpeg error: ${err.message}`);
              reject(new Error(`Failed to create video: ${err.message}`));
            })
            .run();
        } catch (error) {
          reject(error);
        }
      })();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Process episode for YouTube: download audio, cover image, convert to MP4, and upload
 */
export const processEpisodeForYouTube = async (
  audioUrl: string,
  coverUrl: string | null,
  episodeTitle: string,
  episodeDescription: string,
  podcastTitle: string,
  tags: string[]
): Promise<string> => {
  const tmpDir = path.join(process.cwd(), '.tmp-youtube');
  
  // Create temp directory
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const audioFile = path.join(tmpDir, 'audio.mp3');
  const coverFile = path.join(tmpDir, 'cover.jpg');
  const videoFile = path.join(tmpDir, 'video.mp4');

  try {
    console.log('📥 Downloading audio file...');
    await downloadFile(audioUrl, audioFile);
    console.log('✅ Audio downloaded');

    if (coverUrl) {
      console.log('📥 Downloading cover image...');
      try {
        await downloadFile(coverUrl, coverFile);
        console.log('✅ Cover image downloaded');
      } catch (error) {
        console.warn('⚠️ Failed to download cover image, using black background');
        fs.unlink(coverFile, () => {}); // Clean up if partial
      }
    }

    console.log('🎥 Converting audio to video...');
    const coverToUse = fs.existsSync(coverFile) ? coverFile : null;
    await generateVideoFromAudio(audioFile, coverToUse, episodeTitle, videoFile);
    console.log('✅ Video conversion complete');

    console.log('⬆️ Uploading to YouTube...');
    const youtubeId = await uploadToYouTube(
      videoFile,
      episodeTitle,
      `${episodeDescription}\n\n🎙️ ${podcastTitle}`,
      tags
    );
    console.log(`✅ Uploaded to YouTube: ${youtubeId}`);

    return youtubeId;
  } finally {
    // Cleanup temp files
    console.log('🧹 Cleaning up temporary files...');
    [audioFile, coverFile, videoFile].forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    // Try to remove tmp dir if empty
    try {
      if (fs.readdirSync(tmpDir).length === 0) {
        fs.rmdirSync(tmpDir);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }
};
