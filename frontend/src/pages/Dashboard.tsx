import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardData {
  totalPlays: number;
  topEpisodes: Array<{ id: string; title: string; plays: number }>;
  playsPerDay: Array<{ date: string; plays: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/dashboard/overview', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Plays</h3>
          <p className="text-3xl font-bold text-gray-900">{data?.totalPlays || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Plays Last 30 Days</h3>
        {data?.playsPerDay && data.playsPerDay.length > 0 ? (
          <LineChart width={800} height={300} data={data.playsPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="plays" stroke="#3b82f6" />
          </LineChart>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Episodes</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left text-gray-500">Title</th>
              <th className="text-right text-gray-500">Plays</th>
            </tr>
          </thead>
          <tbody>
            {data?.topEpisodes?.map((episode) => (
              <tr key={episode.id} className="border-t">
                <td className="py-2">{episode.title}</td>
                <td className="text-right py-2">{episode.plays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
