import { useEffect, useState } from "react";
import { auth } from "./firebase";

//Tell the Frontend what the Backend is sending to it
interface Tweet {
  tweet_id: number;
  body: string;
  created_at: string;
  author_id: string;
  author_screen_name: string;
}

export default function Feed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //useEffect runs automatically when this component first loads
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to view the feed.");

        const token = await user.getIdToken();

        //Reaching out to the custom Feed endpoint using the user's Firebase UID
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
        const response = await fetch(`${API_URL}/api/v1/users/${user.uid}/feed`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch feed from server');
        }

        const data = await response.json();
        setTweets(data.feed); //Store array of tweets in React state

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []); //Empty array means "Only run this when the component mounts"

  if (loading) return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>Loading feed...</div>;
  if (error) return <div style={{ padding: '20px', color: '#dc3545', textAlign: 'center' }}>{error}</div>;

  return (
    <div>
      {tweets.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontStyle: 'italic'}}>
          No tweets to show. Post something to get started!
        </div>
      ) : (
        tweets.map((tweet) => (
          //Use tweet_id as the unique key for React's rendering engine
          <div key={tweet.tweet_id} style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{tweet.author_screen_name}</span>
              <span style={{ color: '#888', fontSize: '12px'}}>
                {/* Converting the raw Postgres timestamp into a readable local date/time */}
                {new Date(tweet.created_at).toLocaleString()}
              </span>
            </div>

            <p style={{ margin:0, fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word'}}>
              {tweet.body}
            </p>

          </div>
        ))
      )}
    </div>
  );
}