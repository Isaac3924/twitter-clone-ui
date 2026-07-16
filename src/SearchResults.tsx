import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { auth } from './firebase';
import MediaRenderer from "./MediaRenderer";
import Lightbox from "./Lightbox";

export default function SearchResults() {
  // Grab the ?q= query from the URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
      let headers = {};

      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers = { "Authorization": `Bearer ${token}` };
      }

      //Hits the PostgreSQL junction search endpoint
      const response = await fetch(`${API_URL}/api/v1/tweets/search?q=${encodeURIComponent(query)}`, {headers});

      if (!response.ok) throw new Error("Failed to fetch search results");

      const data = await response.json();

      setTweets(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  //Re-Run the fetch anytime the URL query parameter changes
  useEffect(() => {
    fetchResults();
  }, [query]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#1DA1F2', fontWeight: 'bold', marginRight: '20px' }}>
          ← Back to Home
        </Link>
        <h2 style={{ margin: 0 }}>Search Results</h2>
      </div>

      <h3 style={{ color: "gray", marginBottom: "20px" }}>
        Showing Results for: <span style={{ color: "#1DA1F2" }}>{query}</span>
      </h3>

      {loading && <p style={{ textAlign: "center", color: "gray" }}>Searching...</p>}
      {error && <p style={{ textAlign: "center", color: "red" }}>{error}</p>}

      {!loading && !error && tweets.length === 0 && (
        <p style={{ textAlign: "center", color: "gray", marginTop: "40px" }}>
          No tweets found matching that query.
        </p>
      )}

      {/* Map thru the results */}
      <div>
        {tweets.map((tweet) => (
          <div key={tweet.feed_id} style={{ padding: "15px 0", borderBottom: "1px solid #eee" }}>

            {/* Retweet Indicator */}
            {tweet.is_retweet && (
              <div style={{ fontSize: "12px", color: "gray", marginBottom: "5px", display: "flex", alignItems: "center", gap: "5px" }}>
                <span>🔄</span> {tweet.retweeter_name} Retweeted
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <Link to={`/user/${tweet.author_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <strong style={{ fontSize: "16px" }}>{tweet.author_screen_name}</strong>
              </Link>
              <span style={{ fontSize: "12px", color: "gray" }}>
                {new Date(tweet.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Clicking the body routes to the detail page */}
            <Link to={`/tweet/${tweet.tweet_id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4", marginBottom: "12px" }}>
                {tweet.body}
              </p>
            </Link>

            {/* Media Renderer */}
            {tweet.media_url && (
              <div style={{ marginBottom: "10px" }}>
                <MediaRenderer
                  mediaUrl={tweet.media_url}
                  onImageClick={(url) => setLightboxImage(url)}
                />
              </div>
            )}

            {/* Likes / Interactions */}
            <div style={{ display: "flex", gap: "20px", marginTop: "10px", color: "gray", fontSize: "14px" }}>
              <span style={{ color: tweet.user_has_liked ? "#e0245e" : "gray" }}>
                {tweet.user_has_liked ? "❤️" : "🤍"} {tweet.like_count}
              </span>
              <Link to={`/tweet/${tweet.tweet_id}`} style={{ textDecoration: "none", color: "gray", }}>
                💬 Reply
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <Lightbox
          mediaUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}