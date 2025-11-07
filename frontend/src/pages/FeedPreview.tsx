import { useParams } from 'react-router-dom';

export default function FeedPreview() {
  const { slug } = useParams();
  const feedUrl = `http://localhost:8080/feeds/${slug}.xml`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-4">RSS Feed: {slug}</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">Your RSS feed is available at:</p>
        <a
          href={feedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {feedUrl}
        </a>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            You can add this URL to podcast apps like Spotify, Apple Podcasts, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
