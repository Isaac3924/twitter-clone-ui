import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { Link } from "react-router-dom";
import MediaRenderer from "./MediaRenderer";
import Lightbox from "./Lightbox";

export default function Feed() {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //This controls which feed we are viewing
  const [isExplore, setIsExplore] = useState(false);

  //State to track which image is currently clicked
  const [lightboxImage, setLightBoxImage] = useState<string | null>(null);

  const fetchFeed = async () => {
      //Wipe the current tweets and show loading state when switching tabs
      setLoading(true);
      setError("");
      setTweets([]);

      try {
        const user = auth.currentUser;
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        //Dynamic Routing: Decide which endpoint to hit based on the toggle
        let endpoint = "";
        let requestOptions: RequestInit = { method: "Get", headers: {} };

        //1. If a user is logged in, ALWAYS grab their token and attach it to the headers.
        //This ensures the backend knows who they are, even on the public Explore tab.
        if (user) {
          const token = await user.getIdToken();
          requestOptions.headers = { "Authorization": `Bearer ${token}`};
        }

        //2. Set the routing logic
        if (isExplore) {
          endpoint = `${API_URL}/api/v1/tweets/explore`
        } else {
          if (!user) throw new Error("You must be logged in to view the feed.");
          endpoint = `${API_URL}/api/v1/users/${user.uid}/feed`;
        }

        //3. Execute the fetch using the dynamically built URL and headers
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

  //useEffect runs automatically when this component first loads
  useEffect(() => {
    fetchFeed();
  }, [isExplore]); //This is the reactor. It re-runs the fetch whenever isExplore changes

  // --- LIKE OPTIMISTIC UI FUNCTION ---
  const handleLikeToggle = async (tweetId: number, currentlyLiked: boolean) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to like a tweet!");
      return;
    }

    // 1. Instantly update the UI (Optimistic Update)
    setTweets((currentTweets) =>
      currentTweets.map((tweet) => {
        if (tweet.tweet_id === tweetId) {
          return {
            ...tweet,
            user_has_liked: !currentlyLiked,
            like_count: currentlyLiked ? Math.max(0, tweet.like_count - 1): (tweet.like_count || 0) + 1,
          };
        }
        return tweet;
      })
    );

    // 2. Send the request to the backend in the backgorund
    try {
      const token = await user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
      const method = currentlyLiked ? "DELETE" : "POST";

      const response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/like`, {
        method: method,
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Like operation failed on server");

    } catch (err) {
      console.error(err);
      // 3. Rollback the UI if the server request failed
      setTweets((currentTweets) => 
        currentTweets.map((tweet) => {
          if (tweet.tweet_id === tweetId) {
            return {
              ...tweet,
              user_has_liked: currentlyLiked, //Revert back to original state
              like_count: currentlyLiked ? tweet.like_count + 1 : Math.max(0, tweet.like_count - 1),
            };
          }
          return tweet;
        })
      );
    }
  };

  // --- RETWEET FUNCTION ---
  const handleRetweet = async (tweetId: number) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to retweet!");
      return;
    }

    try {
      const token = await user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

      //Try to POST the retweet
      let response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/retweet`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      //If it fails b/c it already exists, ask the user if they want to UN-retweet 
      if (!response.ok) {
        if (response.status === 400) {
          const wantsToUnretweet = window.confirm("You already retweeted this. Do you want to undo your retweet?");
          if (wantsToUnretweet) {
            response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/retweet`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to remove retweet.");
          } else {
            return; //User cancelled the un-retweet
          }
        } else {
          throw new Error("Retweet operation failed on server");
        }
      }

      //If it gets here, the POST or DELETE succeeded.
      //Instead of manual F5, just trigger a state update to reload the feed.
      //Since the logic is already in the function called fetchFeed, call it here
      fetchFeed();

    } catch (err: any) {
      alert(err.message);
    }
  }

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
        <div key={tweet.feed_id} style={{ padding: "15px 20px", borderBottom: "1px solid #eee" }}>

          {/* THE RETWEET HEADER */}
          {tweet.is_retweet && (
            <div style={{ fontSize: "13px", color: "gray", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
              <span>🔁</span> {tweet.retweeter_name} Retweeted
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px"}}>
            <Link
              to={`/user/${tweet.author_id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <strong style={{ fontSize: "16px"}}>{tweet.author_screen_name}</strong>
            </Link>
            <span style={{ fontSize: "12px", color: "gray" }}>
              {new Date(tweet.created_at).toLocaleString()}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4", marginBottom: "12px" }}>{tweet.body}</p>

          {/* DYNAMIC TIMELINE RENDERER */}
          {tweet.media_url && (
            <div style={{ marginBottom: "15px" }}>
              <MediaRenderer
                mediaUrl={tweet.media_url}
                onImageClick={(url) => setLightBoxImage(url)}
              />
            </div>
          )}

          {/* THE ACTION BUTTONS */}
          <div style={{ display: "flex", alignItems: "center", gap: "25px"}}>

            {/* The Like Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px"}}>
              <button
                onClick={() => handleLikeToggle(tweet.tweet_id, tweet.user_has_liked)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: tweet.user_has_liked ? "red" : "gray",
                  fontSize: "16px",
                  padding: "5px",
                  transition: "transform 0.1s ease-in-out"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.8)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {tweet.user_has_liked ? "❤️" : "♡"}
              </button>
              <span style={{ fontSize: "14px", color: tweet.user_has_liked ? "red" : "gray" }}>
                {tweet.like_count || 0}
              </span>
            </div>

             {/* The Retweet Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px"}}>
              <button
                onClick={() => handleRetweet(tweet.tweet_id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "gray", fontSize: "16px", padding: "5px",
                  transition: "transform 0.1s ease-in-out"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.8)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                title="Retweet"
              >
                🔁
              </button>

            </div>
          </div>
        </div>
      ))}
      {/* THE LIGHTBOX OVERLAY */}
      {lightboxImage && (
        <Lightbox
          imageUrl={lightboxImage}
          onClose={() => setLightBoxImage(null)}
        />
      )}
    </div>
  );
}