"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEpisodeForYouTube = exports.generateVideoFromAudio = exports.uploadToYouTube = exports.exchangeCodeForToken = exports.getYouTubeAuthUrl = exports.createOAuth2Client = void 0;
const googleapis_1 = require("googleapis");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_2 = require("fs");
const promises_1 = require("stream/promises");
// Set ffmpeg path
if (ffmpeg_static_1.default) {
    fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
}
const youtube = googleapis_1.google.youtube('v3');
/**
 * Create OAuth2 client for YouTube
 */
const createOAuth2Client = (accessToken, refreshToken) => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID || '', process.env.YOUTUBE_CLIENT_SECRET || '', process.env.YOUTUBE_REDIRECT_URL || 'http://localhost:8080/api/youtube/callback');
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    return oauth2Client;
};
exports.createOAuth2Client = createOAuth2Client;
/**
 * Get authorization URL for YouTube OAuth2
 */
const getYouTubeAuthUrl = () => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID || '', process.env.YOUTUBE_CLIENT_SECRET || '', process.env.YOUTUBE_REDIRECT_URL || 'http://localhost:8080/api/youtube/callback');
    const scopes = ['https://www.googleapis.com/auth/youtube.upload'];
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
    });
};
exports.getYouTubeAuthUrl = getYouTubeAuthUrl;
/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForToken = async (code) => {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID || '', process.env.YOUTUBE_CLIENT_SECRET || '', process.env.YOUTUBE_REDIRECT_URL || 'http://localhost:8080/api/youtube/callback');
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};
exports.exchangeCodeForToken = exchangeCodeForToken;
/**
 * Upload video to YouTube
 */
const uploadToYouTube = async (accessToken, videoFile, title, description, tags = []) => {
    const oauth2Client = (0, exports.createOAuth2Client)(accessToken);
    try {
        const response = await youtube.videos.insert({
            auth: oauth2Client,
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
                body: fs_1.default.createReadStream(videoFile),
            },
        }, {
            onUploadProgress: (evt) => {
                const progress = Math.round((evt.bytesProcessed / 1000000000) * 100);
                console.log(`YouTube upload progress: ${progress}%`);
            },
        });
        return response.data.id || '';
    }
    catch (error) {
        console.error('YouTube upload error:', error);
        throw new Error(`Failed to upload to YouTube: ${error}`);
    }
};
exports.uploadToYouTube = uploadToYouTube;
/**
 * Download file from URL to disk
 */
const downloadFile = (fileUrl, destPath) => {
    return new Promise((resolve, reject) => {
        const protocol = fileUrl.startsWith('https') ? https_1.default : http_1.default;
        const file = (0, fs_2.createWriteStream)(destPath);
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
            (0, promises_1.pipeline)(response, file)
                .then(() => resolve())
                .catch(reject);
        })
            .on('error', (err) => {
            fs_1.default.unlink(destPath, () => { }); // Delete on error
            reject(err);
        });
    });
};
/**
 * Create a simple video from audio file with static cover image
 */
const generateVideoFromAudio = async (audioFile, coverImage, title, outputFile) => {
    return new Promise((resolve, reject) => {
        try {
            const command = (0, fluent_ffmpeg_1.default)();
            // If we have a cover image, use it as background
            if (coverImage && fs_1.default.existsSync(coverImage)) {
                command
                    .input(coverImage)
                    .loop(null) // Loop the image for the duration of audio
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
                    resolve();
                })
                    .on('error', (err) => {
                    console.error(`❌ FFmpeg error: ${err.message}`);
                    reject(new Error(`Failed to create video: ${err.message}`));
                })
                    .run();
            }
            else {
                // Fallback: just create a video with black background
                command
                    .input(`color=c=black:s=1280x720:d=${0}`) // Placeholder duration
                    .input(audioFile)
                    .outputOptions('-c:v', 'libx264')
                    .outputOptions('-c:a', 'aac')
                    .outputOptions('-b:a', '128k')
                    .outputOptions('-pix_fmt', 'yuv420p')
                    .outputOptions('-shortest')
                    .output(outputFile)
                    .on('end', () => {
                    console.log(`✅ Video created with black background: ${outputFile}`);
                    resolve();
                })
                    .on('error', (err) => {
                    console.error(`❌ FFmpeg error: ${err.message}`);
                    reject(new Error(`Failed to create video: ${err.message}`));
                })
                    .run();
            }
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateVideoFromAudio = generateVideoFromAudio;
/**
 * Process episode for YouTube: download audio, cover image, convert to MP4, and upload
 */
const processEpisodeForYouTube = async (accessToken, audioUrl, coverUrl, episodeTitle, episodeDescription, podcastTitle, tags) => {
    const tmpDir = path_1.default.join(process.cwd(), '.tmp-youtube');
    // Create temp directory
    if (!fs_1.default.existsSync(tmpDir)) {
        fs_1.default.mkdirSync(tmpDir, { recursive: true });
    }
    const audioFile = path_1.default.join(tmpDir, 'audio.mp3');
    const coverFile = path_1.default.join(tmpDir, 'cover.jpg');
    const videoFile = path_1.default.join(tmpDir, 'video.mp4');
    try {
        console.log('📥 Downloading audio file...');
        await downloadFile(audioUrl, audioFile);
        console.log('✅ Audio downloaded');
        if (coverUrl) {
            console.log('📥 Downloading cover image...');
            try {
                await downloadFile(coverUrl, coverFile);
                console.log('✅ Cover image downloaded');
            }
            catch (error) {
                console.warn('⚠️ Failed to download cover image, using black background');
                fs_1.default.unlink(coverFile, () => { }); // Clean up if partial
            }
        }
        console.log('🎥 Converting audio to video...');
        const coverToUse = fs_1.default.existsSync(coverFile) ? coverFile : null;
        await (0, exports.generateVideoFromAudio)(audioFile, coverToUse, episodeTitle, videoFile);
        console.log('✅ Video conversion complete');
        console.log('⬆️ Uploading to YouTube...');
        const youtubeId = await (0, exports.uploadToYouTube)(accessToken, videoFile, episodeTitle, `${episodeDescription}\n\n🎙️ ${podcastTitle}`, tags);
        console.log(`✅ Uploaded to YouTube: ${youtubeId}`);
        return youtubeId;
    }
    finally {
        // Cleanup temp files
        console.log('🧹 Cleaning up temporary files...');
        [audioFile, coverFile, videoFile].forEach((file) => {
            if (fs_1.default.existsSync(file)) {
                fs_1.default.unlinkSync(file);
            }
        });
        // Try to remove tmp dir if empty
        try {
            if (fs_1.default.readdirSync(tmpDir).length === 0) {
                fs_1.default.rmdirSync(tmpDir);
            }
        }
        catch (error) {
            // Ignore cleanup errors
        }
    }
};
exports.processEpisodeForYouTube = processEpisodeForYouTube;
