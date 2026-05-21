import { useEffect, useState } from "react";
import { auth } from "./firebase";

export default function Feed() {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //This controls which feed we are viewing
  const [isExplore, setIsExplore] = useState(false);


  //useEffect runs automatically when this component first loads
  useEffect(() => {
    const fetchFeed = async () => {
      //Wipe the current tweets and show loading state when switching tabs
      setLoading(true);
      setError("");
      setTweets([]);

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to view the feed.");

        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        //Dynamic Routing: Decide which endpoint to hit based on the toggle
        let endpoint = "";
        let requestOptions: RequestInit = { method: "GET" };

        if (isExplore) {
          //The Explore Feed (Global, no auth required by the Python backend)
          endpoint = `${API_URL}/api/v1/tweets/explore`
        } else {
          //The Personal Feed (Requires auth token to verify identity)
          const token = await user.getIdToken();
          endpoint = `${API_URL}/api/v1/users/${user.uid}/feed`;
          requestOptions = {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          };
        }

        // Execute the fetch using the dynamically built URL and options
        const response = await fetch(endpoint, requestOptions);

        if (!response.ok) {
          throw new Error('Failed to fetch feed from server');
        }

        const data = await response.json();
        setTweets(data.feed || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [isExplore]); //This is the reactor. It re-runs the fetch whenever isExplore changes

  return (
    <div style={{ marginTop: "20px" }}>
      
      {/* THE TOGGLE UI */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "20px" }}>
        <button
          onClick={() => setIsExplore(false)}
          style={{
            flex: 1,
            padding: "15px",
            background: "none",
            border: "none",
            borderBottom: !isExplore ? "3px solid #1DA1f2" : "3px solid transparent",
            fontWeight: !isExplore ? "bold": "normal",
            color: !isExplore ? "#000" : "#666",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Following
        </button>
        <button
          onClick={() => setIsExplore(true)}
          style={{
            flex: 1,
            padding: "15px",
            background: "none",
            border: "none",
            borderBottom: isExplore ? "3px solid #1DA1f2" : "3px solid transparent",
            fontWeight: isExplore ? "bold": "normal",
            color: isExplore ? "#000" : "#666",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Explore
        </button>
      </div>

      {/* THE FEED CONTENT*/}
      {loading && <p style={{ textAlign: "center", color: "gray" }}>Loading tweets...</p>}

      {error && <p style={{ color: "red", textAlign: "center"}}>{error}</p>}

      {!loading && !error && tweets.length === 0 && (
        <p style={{ textAlign: "center", color: "gray", marginTop: "40px" }}>
          {isExplore ? "No tweets found. Be the first to post!" : "You aren't following any active tweets. Try the explore tab!"}
        </p>
      )}

      {!loading && tweets.map((tweet) => (
        <div key={tweet.tweet_id} style={{ padding: "15px 20px", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px"}}>
            <strong style={{ fontSize: "16px"}}>{tweet.author_screen_name}</strong>
            <span style={{ fontSize: "12px", color: "gray" }}>
              {new Date(tweet.created_at).toLocaleString()}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4" }}>{tweet.body}</p>
        </div>
      ))}
    </div>
  );
}