import React, { useState } from 'react';
import { auth } from './firebase';

export default function ComposeTweet() {
  const [tweetBody, setTweeetBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    //Prevent empty tweets from being sent
    if (!tweetBody.trim()) return;

    setLoading(true);
    setError('');

    try {
      //Grab currently logged-in user and their pass.
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to tweet.");
      const token = await user.getIdToken();

      //Send data to FastAPI backend
      const response = await fetch('http://127.0.0.1:8000/api/v1/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ body: tweetBody })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to post tweet');
      }

      //If successful, clear the text box
      setTweeetBody('');

      //Temporary alert to inform us it worked prior to building the feed
      alert("Tweet posted successfully!");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* The Input Box */}
        <textarea
          placeholder="What's happening?"
          value={tweetBody}
          onChange={(e) => setTweeetBody(e.target.value)}
          maxLength={280}
          style={{ width: '100%', minHeight: '80px', padding: '10px', fontSize: '18px', border: 'none', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>

          {/* Character Counter */}
          <span style={{ fontSize: '14px', color: tweetBody.length >= 280 ? '#dc3545' : '#888' }}>
            {tweetBody.length}/280
          </span>

          {error && <span style={{ color: '#dc3545', fontSize: '14px' }}>{error}</span>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !tweetBody.trim()}
            style={{
              backgroundColor: '#1DA1F2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: (loading || !tweetBody.trim()) ? 'not-allowed' : 'pointer',
              opacity: (loading || !tweetBody.trim()) ? 0.5 : 1
            }}
          >
            {loading ? 'Posting...' : 'Tweet'}
          </button>
        </div>

      </form>
    </div>
  );
}
