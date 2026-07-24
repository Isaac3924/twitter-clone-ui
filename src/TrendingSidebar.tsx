import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

//Define the shape of the data expected from the FastAPI endpoint
interface TrendingTag {
  name: string;
  tag_count: number;
}

export default function TrendingSidebar() {
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        const response = await fetch (`${API_URL}/api/v1/hashtags/trending`);

        if (!response.ok) {
          throw new Error('Failed to fetch trending topics');
        }

        const data = await response.json();
        setTrendingTags(data.top_hashtags);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading trends...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{
      backgroundColor: '#f7f9f9',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '16px'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0}}>
        What's Happening
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {trendingTags.length === 0 ? (
          <p style={{ color: '#536471', margin: 0}}>No trending topics yet.</p>
        ) : (
          trendingTags.map((tag) =>(
            <Link
              key={tag.name}
              to={`/search?q=${encodeURIComponent('#' + tag.name)}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#536471', fontSize: '13px' }}>Trending</span>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f1419'}}>
                  #{tag.name}
                </span>
                <span style={{ color: '#536471', fontSize: '13px' }}>
                  {tag.tag_count} {tag.tag_count === 1 ? 'Tweet': 'Tweets'}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}