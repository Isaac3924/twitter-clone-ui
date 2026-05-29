import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Profile() {
  // Grab the dynamic param from the URL (definred as :username in App.tsx)
  const { username } = useParams<{ username: string }>();

  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [userTweets, setUserTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<any>("");

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError("");

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

        //Run BOTH backend calls at the exact same time using Promise.all
        //It will make the page load twice as fast.
        const [profileRes, tweetsRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/users/${username}`),
          fetch(`${API_URL}/api/v1/users/${username}/tweets`)
        ]);

        if (!profileRes.ok) throw new Error("Could not load user profile");
        if (!tweetsRes.ok) throw new Error("Could not load user tweets");

        const profileData = await profileRes.json()
        const tweetsData = await tweetsRes.json()

        setProfileInfo(profileData);
        setUserTweets(tweetsData.tweets || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username]);

  return (
    <div style={{maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif'}}>

      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#1DA1F2', fontWeight: 'bold', marginRight: '20px' }}>
          ← Back to Home
        </Link>
        <h2 style={{ margin: 0 }}>Profile</h2>
      </div>

      {loading && <p style={{ textAlign: "center", color: "gray" }}>Loading Profile...</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {!loading && !error && profileInfo && (
        <>
          {/* User Info Header */}
          <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
            <h1 style={{ margin: '0 0 5px 0' }}>{profileInfo.name}</h1>
            <p style={{ margin: 0, color: 'gray' }}>@{profileInfo.screen_name}</p>
            {profileInfo.bio && <p style={{ marginTop: '10px' }}>{profileInfo.bio}</p>}

            <p style={{ fontSize: '12px', color: 'gray', marginTop: '15px' }}>
              Joined {new Date(profileInfo.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* User's Tweets. Feed */}
          <div>
            <h3 style={{ borderBottom: '2px solid #1DA1F2', display: 'inline-block', paddingBottom: '5px' }}>
              Tweets
            </h3>

            {userTweets.length === 0 ? (
              <p style={{ color: 'gray', marginTop: '20px' }}>This user hasn't tweeted anything yet.</p>
            ) : (
              userTweets.map((tweet) => (
                <div key={tweet.tweet_id} style={{ padding: "15px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ fontSize: "16px" }}>{tweet.author_screen_name}</strong>
                    <span style={{ fontSize: "12px", color: "gray"}}>
                      {new Date(tweet.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4" }}>{tweet.body}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}