import { useState } from "react";
import type { User } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";


interface SearchBarProps {
  currentUser: User;
}

export default function SearchBar({ currentUser }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);

    // Only hit the database if they've typed at least 2 characters
    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      //Branch the fetch logic based on the first character
      if (text.startsWith('#')) {
        const cleanQuery = encodeURIComponent(text.replace('#', ''));
        const response = await fetch(`${API_URL}/api/v1/hashtags/suggest?q=${cleanQuery}`);

        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
        }
      } else {
        //Original User Search Logic
        const response = await fetch(`${API_URL}/api/v1/users/search/query?q=${text}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out current user so they don't attempt following themselves
          const filteredResults = data.results.filter((u: any) => u.user_id !== currentUser.uid);
          setResults(filteredResults)
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.startsWith('#') && query.length > 1) {
      navigate(`/search?q=${encodeURIComponent(query)}`);

      setQuery("");
      setResults([]);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    setLoadingTarget(targetUserId);
    try {
      //Need the firebase token to prove to the Python backend who's clicking follow
      const token = await currentUser.getIdToken();

      const response = await fetch(`${API_URL}/api/v1/users/${targetUserId}/follow`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        //Temporarily change the button text or remove them from the list
        setResults(results.filter(u => u.user_id !== targetUserId));
        alert("Followed successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to follow: ${errorData.detail}`);
      }
    } catch (error) {
      console.error("Follow error:", error);
    } finally {
      setLoadingTarget(null);
    }
  };

  return (
    <div style={{ marginBottom: "20px", position: "relative" }}>
      <input
        type="text"
        placeholder="Search TwitterClone..."
        value={query}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        style={{ width: "100%", padding: "12px 20px", borderRadius: '9999px', border: 'none', backgroundColor: '#e7ecf0', outline: 'none', fontSize: '15px', boxSizing: "border-box" }}
      />

      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0}}>
          {results.map((item, index) => (
            <li key={item.user_id || index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>

              {/*If it's a hashtag, render a clickable tag */}
              {item.type === "hashtag" ? (
                <div
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent('#' + item.text)}`);
                    setQuery("");
                    setResults([]);
                  }}
                  style={{ cursor: "pointer", width: "100%", padding: "5px 0", color: "#1DA1F2", fontWeight: "bold", fontSize: "16px" }}
                >
                  #{item.text}
                </div>
              ) : (
                /* Otherwise, render the User UI */
                <>
                  <div>
                    <Link
                      to={`/user/${item.user_id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <strong>{item.name}</strong> 
                    </Link>
                    <br/>
                    <span style={{ color: "gray", fontSize: "14px" }}>@{item.screen_name}</span>
                  </div>
                  <button
                    onClick={() => handleFollow(item.user_id)}
                    disabled={loadingTarget === item.user_id}
                    style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "#1DA1F2", color: "white", border: "none", borderRadius: "20px" }}
                  >
                    {loadingTarget === item.user_id ? "Following..." : "Follow"}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}