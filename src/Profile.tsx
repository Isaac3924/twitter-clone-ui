import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auth } from './firebase';

export default function Profile() {
  // Grab the dynamic param from the URL (definred as :username in App.tsx)
  const { username } = useParams<{ username: string }>();

  const [profileInfo, setProfileInfo] = useState<any>(null);
  const [userTweets, setUserTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState<any>(true);
  const [error, setError] = useState<any>("");
  const [isEditing, setIsEditing] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);


  useEffect(() => {
    const checkFollowStatus = async () => {
      const user = auth.currentUser;
      //Don't check if no one is logged in, or if you're looking at your own profile.
      if (!user || user.uid === username) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const token = await user.getIdToken();

        const response = await fetch(`${API_URL}/api/v1/users/${username}/is_following`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.following);
        }
      } catch (err) {
        console.error("Failed to check follow status", err);
      }
    };

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

    checkFollowStatus();
  }, [username]);

  const handleSaveBio = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to edit your profile.");

      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/v1/users/${username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ bio: draftBio })
      });

      if (!response.ok) {
        throw new Error("Failed to update bio on the server.");
      }

      const data = await response.json();

      //Update the local UI instantly using the returned bio so refresh isn't needed
      setProfileInfo({ ...profileInfo, bio: data.bio });

      //Close the edit textbox
      setIsEditing(false);

    } catch (err: any) {
      alert(err.message); //A quick native alert just for error handling.
    }
  }

  const handleFollowToggle = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to followe users.")

        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const token = await user.getIdToken();

        //If already following, set it to DELETE. If not, set it to POST.
        const method = isFollowing ? "DELETE" : "POST";

        const response = await fetch(`${API_URL}/api/v1/users/${username}/follow`, {
          method: method,
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to update follow status.");

        //Flip the button state visually
        setIsFollowing(!isFollowing);

        //Optimisitcally update the stat on the screen
        setProfileInfo({
          ...profileInfo,
          followers_count: isFollowing
            ? profileInfo.followers_count - 1
            : profileInfo.followers_count + 1
        });
    } catch (err: any) {
      alert(err.message);
    }
  };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ margin: '0 0 5px 0' }}>{profileInfo.name}</h1>
                <p style={{ margin: 0, color: 'gray' }}>@{profileInfo.screen_name}</p>
              </div>

              {/* Conditional Buttons: Edit vs Follow */}
              {auth.currentUser?.uid === username && !isEditing ? (
                <button
                  onClick={() => {
                    setDraftBio(profileInfo.bio || "");
                    setIsEditing(true);
                  }}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    border: '1px solid #1DA1F2', 
                    backgroundColor: 'white', 
                    color: '#1DA1F2', 
                    fontWeight: 'bold', 
                    cursor: 'pointer' }}
                >
                  Edit Profile
                </button>
              ) : auth.currentUser?.uid !== username ? (
                <button
                  onClick={handleFollowToggle}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    border: '1px solid', 
                    borderColor: isFollowing ? '#ccc' : '#1DA1F2',
                    backgroundColor: isFollowing ? 'white' : '#1DA1F2', 
                    color: isFollowing ? 'black' : 'white', 
                    fontWeight: 'bold', 
                    cursor: 'pointer' }}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              ) : null
            }
            </div>

            {/* The Bio Section: Swaps between text & an input box */}
            {isEditing ? (
              <div style={{ marginTop: '15px' }}>
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  maxLength={160}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Write a litte about yourself..."
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {/* Here is where handleSaveBio is used */}
                  <button onClick={handleSaveBio} style={{ padding: '6px 15px', backgroundColor: '#1DA1F2', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setIsEditing(false)} style={{ padding: '6px 15px', backgroundColor: '#eee', color: '#333', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              profileInfo.bio && <p style={{ marginTop: '15px', lineHeight: '1.5' }}>{profileInfo.bio}</p>
            )}

            <p style={{ fontSize: '12px', color: 'gray', marginTop: '15px' }}>
              Joined {new Date(profileInfo.created_at).toLocaleDateString()}
            </p>

            {/* Follower Stats */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '15px' }}>
              <span><strong>{profileInfo.following_count || 0}</strong> <span style={{ color: 'gray' }}>Following</span></span>
              <span><strong>{profileInfo.followers_count || 0}</strong> <span style={{ color: 'gray' }}>Followers</span></span>
            </div>
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