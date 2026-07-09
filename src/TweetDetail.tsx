import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { auth } from './firebase';
import MediaRenderer from "./MediaRenderer"
import Lightbox from "./Lightbox";

export default function TweetDetail() {
  //Grab the tweetId from the URL (defined as :tweetId in App.tsx)
  const { tweetId } = useParams<{ tweetId: string }>();

  const [mainTweet, setMainTweet] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightBoxImage, setLightBoxImage] = useState<string | null>(null);

  const user = auth.currentUser;
  const isGuest = !user;

  const fetchThread = async () => {
    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      let headers = {};

      if (user) {
        const token = await user.getIdToken();
        headers = { "Authorization": `Bearer ${token}`};
      }

      const response = await fetch (`${API_URL}/api/v1/tweets/${tweetId}`, {headers});

      if (!response.ok) {
        if (response.status === 404) throw new Error("Tweet not found");
        throw new Error("Failed to load tweet thread");
      }

      const data = await response.json();
      setMainTweet(data.main_tweet);
      setReplies(data.replies || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tweetId) {
      fetchThread();
    }
  }, [tweetId]);

  const handleReplySubmit = async () => {
    if (!replyBody.trim()) return;
    if (isGuest) {
      alert("You msut be logged in to reply!");
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ body: replyBody })
      });

      if (!response.ok) throw new Error("Failed to post reply");

      //Clear the text box and instantly refresh the thread to show the new reply
      setReplyBody("");
      fetchThread();

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p style={{ textAlign: "center", color: "gray", marginTop: "20px" }}>Loading thread...</p>
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: "20px" }}>{error}</p>
  if (!mainTweet) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif'}}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#1DA1F2', fontWeight: 'bold', marginRight: '20px' }}>
          ← Back
        </Link>
        <h2 style={{ margin: 0 }}>Post</h2>
      </div>

      {/* The Main Tweet */}
      <div style={{ paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <Link to= {`/user/${mainTweet.author_id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <strong style={{ fontSize: "18px" }}>{mainTweet.author_screen_name}</strong>
          </Link>
        </div>
        <p style={{ margin: 0, fontSize: "20px", lineHeight: "1.4", marginBottom: "12px "}}>
          {mainTweet.body}
        </p>

        {/* Render Main Tweer Media */}
        {mainTweet.media_url && (
          <div style={{ marginBottom: "15px", margin: "0 -20px" }}>
            <MediaRenderer
              mediaUrl={mainTweet.media_url}
              onImageClick={(url) => setLightBoxImage(url)}
              isDetailView={true}
            />
          </div>
        )}

        <span style={{ fontSize: "14px", color: "gray" }}>
          {new Date(mainTweet.created_at).toLocaleString()}
        </span>
      </div>

      {/* Reply Input Area */}
      {!isGuest && (
        <div style={{ padding: "20px 0", borderBottom: "1px solid #eee" }}>
          <p style={{ margin: "0 0 10px 0", color: "gray", fontSize: "14px" }}>
            Replying to <span style={{ color: "#1DA1F2" }}> @{mainTweet.author_screen_name}</span>
          </p>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Post your reply"
            maxLength={280}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical', fontSize: '16px' }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <button
              onClick={handleReplySubmit}
              disabled={isSubmitting || !replyBody.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: replyBody.trim() ? '#1DA1F2' : '#8ED0F9',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: replyBody.trim() ? 'pointer' : 'default'
              }}
            >
              {isSubmitting ? "Posting..." : "Reply"}
            </button>
          </div>
        </div>
      )}

      {/* Replies Feed */}
      <div>
        {replies.length === 0 ? (
          <p style={{ color: "gray", textAlign: "center", marginTop: "20px" }}>No replies yet.</p>
        ) : (
          replies.map((reply) => (
            <div key={reply.tweet_id} style={{ padding: "15px 0", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <Link to={`/user/${reply.author_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <strong style={{ fontSize: "16px" }}>{reply.author_screen_name}</strong>
                </Link>
                <span style={{ fontSize: "12px", color: "gray" }}>
                  {new Date(reply.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "15px", lineHeight: "1.4" }}>{reply.body}</p>

              {/* Render Reply Media if it  has any */}
              {reply.media_url && (
                <div style={{ marginBottom: "10px"}}>
                  <MediaRenderer
                    mediaUrl={reply.media_url}
                    onImageClick={(url) => setLightBoxImage(url)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* The Lightbox Overlay */}
      {lightBoxImage && (
        <Lightbox
          mediaUrl={lightBoxImage}
          onClose={() => setLightBoxImage(null)}
        />
      )}
    </div>
  );
}