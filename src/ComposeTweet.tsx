import React, { useState, useRef } from 'react';
import { auth } from './firebase';

export default function ComposeTweet() {
  const [tweetBody, setTweetBody] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //A reference to hide the default HTML file input and trigger it via a cleaner button
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    //Prevent empty tweets from being sent
    if (!tweetBody.trim() && !media) return;

    setLoading(true);
    setError('');

    try {
      //Grab currently logged-in user and their pass.
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to tweet.");
      const token = await user.getIdToken();

      //Initialize FormData
      const formData = new FormData();

      //Append data only if it exists
      if (tweetBody.trim()) {
        formData.append('body', tweetBody);
      }
      if (media) {
        formData.append('media', media);
      }

      //Send data to FastAPI backend
      
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
      const response = await fetch(`${API_URL}/api/v1/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to post tweet');
      }

      //If successful, clear everything
      setTweetBody('');
      setMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      //Temporary alert to inform us it worked prior to building the feed
      alert("Tweet posted successfully!");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  return (
    <div style={{ padding: '20px', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* The Input Box */}
        <textarea
          placeholder="What's happening?"
          value={tweetBody}
          onChange={(e) => setTweetBody(e.target.value)}
          maxLength={280}
          style={{ width: '100%', minHeight: '80px', padding: '10px', fontSize: '18px', border: 'none', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
        />

        {/* Image Preview/File Name Indicator */}
        {media && (
          <div style={{ fontSize: '14px', color: '#1DA1F2', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>📷 {media.name}</span>
            <button
              type="button"
              onClick={() => {setMedia(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}
            >
              X
            </button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>

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
            <span style={{ fontSize: '14px', color: tweetBody.length >= 280 ? '#dc3545' : '#888' }}>
              {tweetBody.length}/280
            </span>
          </div>

          {error && <span style={{ color: '#dc3545', fontSize: '14px' }}>{error}</span>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (!tweetBody.trim() && !media)}
            style={{
              backgroundColor: '#1DA1F2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: (loading || (!tweetBody.trim() && !media)) ? 'not-allowed' : 'pointer',
              opacity: (loading || (!tweetBody.trim() && !media)) ? 0.5 : 1
            }}
          >
            {loading ? 'Posting...' : 'Tweet'}
          </button>
        </div>

      </form>
    </div>
  );
}
