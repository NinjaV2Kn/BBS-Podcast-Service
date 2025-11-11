import { useAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to RSS-Cast
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Self-hosted podcast management with automatic RSS feed generation
        </p>
        
        {isAuthenticated ? (
          <div className="space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-300"
            >
              Upload Episode
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <a
              href="/signup"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Get Started
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
