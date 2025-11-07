import { useParams } from 'react-router-dom';

export default function EpisodeDetail() {
  const { id } = useParams();

  // TODO: Fetch episode details from API

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-4">Episode {id}</h2>
      <p className="text-gray-600 mb-8">Episode details will be displayed here.</p>
      
      {/* TODO: Add audio player, description, play count, etc. */}
    </div>
  );
}
