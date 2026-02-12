import { useState, useEffect } from 'react';

interface YouTubeStatusResponse {
  connected: boolean;
  authUrl?: string;
  channelId?: string;
  channelTitle?: string;
  connectedAt?: string;
}

export default function YouTubeSettings() {
  const [status, setStatus] = useState<YouTubeStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkYouTubeStatus();
  }, []);

  const checkYouTubeStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/youtube/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err: any) {
      setError('Failed to check YouTube status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (status?.authUrl) {
      window.location.href = status.authUrl;
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/youtube/disconnect', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setStatus(null);
        checkYouTubeStatus();
      }
    } catch (err: any) {
      setError('Failed to disconnect YouTube');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <h2 className="text-3xl font-bold mb-8">YouTube Integration</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {status?.connected ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">✅ Connected</h3>
          <div className="space-y-2 text-green-700 mb-6">
            <p>
              <strong>Channel:</strong> {status.channelTitle}
            </p>
            <p>
              <strong>Channel ID:</strong> {status.channelId}
            </p>
            <p>
              <strong>Connected:</strong> {new Date(status.connectedAt!).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Disconnect YouTube
          </button>
          <p className="text-sm text-green-600 mt-4">
            Episodes will be automatically uploaded to your YouTube channel when marked for upload.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-800 mb-4">Connect YouTube Channel</h3>
          <p className="text-blue-700 mb-6">
            Authorize this app to upload episodes to your YouTube channel. You'll be redirected to
            Google's authorization page.
          </p>
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Connect with Google
          </button>
          <p className="text-sm text-blue-600 mt-4">
            After connecting, you can set individual episodes to auto-upload to YouTube with a
            single still image and audio.
          </p>
        </div>
      )}
    </div>
  );
}
