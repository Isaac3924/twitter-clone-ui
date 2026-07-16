import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { auth } from './firebase';
import MediaRenderer from "./MediaRenderer"
import Lightbox from "./Lightbox";
import TweetBody from "./TweetBody";

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
  const [media, setMedia] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  const handleReplySubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!replyBody.trim() && !media) return;
    if (isGuest) {
      alert("You msut be logged in to reply!");
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const token = await user.getIdToken();

      //Initialize FormData
      const formData = new FormData();
      if (replyBody.trim()) formData.append('body', replyBody);
      if (media) formData.append('media', media);

      const response = await fetch(`${API_URL}/api/v1/tweets/${tweetId}/reply`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error("Failed to post reply");

      //Clear the text box, file input and instantly refresh the thread
      setReplyBody("");
      setMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <TweetBody text={mainTweet.body} fontSize="20px" />

        {/* Render Main Tweet Media */}
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

          <form onSubmit={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Post your reply"
              maxLength={280}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical', fontSize: '16px' }}
            />

            {/* Image Preview/File Name Indicator */}
            {media && (
              <div style={{ fontSize: '14px', color: '#1DA1f2', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>📷 {media.name}</span>
                <button
                  type="button"
                  onClick={() => {setMedia(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold'}}
                >
                  X
                </button>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* The HTML file input (hidden) */}
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp, video/mp4"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                {/* The trigger button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1DA1F2'}}
                  title="Add media"
                >
                  🖼️
                </button>

                {/* Character Counter */}
                <span style={{ fontSize: '14px', color: replyBody.length >= 280 ? '#dc3545' : '#888'}}>
                  {replyBody.length}/280
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!replyBody.trim() && !media)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: (replyBody.trim() || media) ? '#1DA1F2' : '#8ED0F9',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: (replyBody.trim() || media) ? 'pointer' : 'default',
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {isSubmitting ? "Posting..." : "Reply"}
              </button>
            </div>
          </form>
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