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

  const user = auth.currentUser;
  const isGuest = !user
  const isOwner = user?.uid === username;
  const isLoggedInVisitor = user && !isOwner;

  //Lifted Fetch Function
  const fetchProfileData = async () => {
    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      //Prepare headers dynamically based on Guest vs Logged-In
      let headers = {};
      if (user) {
        const token = await user.getIdToken();
        headers = { "Authorization": `Bearer ${token}` };
      }

      //Run BOTH backend calls at the exact same time using Promise.all
      //It will make the page load twice as fast.
      const [profileRes, tweetsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/users/${username}`, { headers }),
        fetch(`${API_URL}/api/v1/users/${username}/tweets`, { headers })
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

  const handleLikeToggle = async (tweetId: number, currentlyLiked: boolean) => {
    if (isGuest) {
      alert("Please log in or sign up to llike tweets!");
      return;
    }

    //1. Optomistic UI update
    setUserTweets((currentTweets) => 
      currentTweets.map((tweet) => {
        if (tweet.tweet_id === tweetId) {
          return {
            ...tweet,
            user_has_liked: !currentlyLiked,
            like_count: currentlyLiked ? Math.max(0, tweet.like_count -1) : (tweet.like_count || 0) + 1,
          };
        }
        return tweet;
      })
    );

    //2. Network Request
    try {
      const token = await user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const method = currentlyLiked ? "DELETE" : "POST";

      const response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/like`, {
        method: method,
        headers: { "Authorization": `Bearer ${token}`},
      });

      if (!response.ok) throw new Error("Like operation failed");

    } catch (err) {
      console.error(err);
      //3. Rollback on failure
      setUserTweets((currentTweets) => 
        currentTweets.map((tweet) => {
          if (tweet.tweet_id === tweetId) {
            return {
              ...tweet,
              user_has_liked: currentlyLiked,
              like_count: currentlyLiked ? tweet.like_count + 1 : Math.max(0, tweet.like_count - 1),
            };
          }
          return tweet;
        })
      );
    }
  };

  const handleRetweet = async (tweetId: number) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to retweet!");
      return;
    }

    try {
      const token = await user.getIdToken();
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

      let response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/retweet`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`},
      });

      if (!response.ok) {
        if (response.status === 400) {
          const wantsToUnretweet = window.confirm("You already retweeted this. Do you want to undo your retweet?");
          if (wantsToUnretweet) {
            response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/retweet`, {
              method: "DELETE",
              headers: { "Authorization": `Bearer ${token}`},
            });
            if (!response.ok) throw new Error("Failed to remove retweet.");
          } else {
            return;
          }
        } else {
          throw new Error("Retweet operation failed on server.")
        }
      }

      //Automatically re-fetches the profile feed
      fetchProfileData();

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
              {isOwner && !isEditing && (
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
              )}
              
              {isLoggedInVisitor && (
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
              )}
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
                //Use feed_id as the key to prevent duplicates crashing Reaact
                <div key={tweet.feed_id} style={{ padding: "15px 0", borderBottom: "1px solid #eee" }}>

                  {/* THE RETWEET HEADER */}
                  {tweet.is_retweet && (
                    <div style={{ fontSize: "13px", color: "gray", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>🔁</span> {tweet.retweeter_name} Retweeted
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <Link
                      to={`/user/${tweet.author_id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <strong style={{ fontSize: "16px" }}>{tweet.author_screen_name}</strong>
                    </Link>
                    <span style={{ fontSize: "12px", color: "gray"}}>
                      {new Date(tweet.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4", marginBottom: "12px" }}>{tweet.body}</p>

                  {/* The Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>

                    {/* The Like Button */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <button
                        onClick={() => handleLikeToggle(tweet.tweet_id, tweet.user_has_liked)}
                        style={{ 
                          background: "none", border: "none", cursor: "pointer", 
                          color: tweet.user_has_liked ? "red" : "gray", fontSize: "16px", padding: "5px",
                          transition: "transform 0.1s ease-in-out"
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.8)"}
                        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        {tweet.user_has_liked ? "❤️" : "♡" }
                      </button>
                      <span style={{fontSize: "14px", color: tweet.user_has_liked ? "red" : "gray" }}>
                        {tweet.like_count || 0}
                      </span>
                    </div>

                    {/* The Retweet Button */}
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
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}