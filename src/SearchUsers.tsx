import { useState } from "react";
import type { User } from "firebase/auth";

interface SearchUserProps {
  currentUser: User;
}

export default function SearchUsers({ currentUser }: SearchUserProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loadingTarget, setLoadingTarget] = useState<string | null>(null);

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
      const response = await fetch(`${API_URL}/api/v1/users/search/query?q=${text}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out current user so they don't attempt following themselves
        const filteredResults = data.results.filter((u: any) => u.user_id !== currentUser.uid);
        setResults(filteredResults)
      }
    } catch (error) {
      console.error("Search failed:", error);
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
    <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>Find Users</h3>
      <input
        type="text"
        placeholder="Search by name or @handle..."
        value={query}
        onChange={handleSearch}
        style={{ width: "100%", padding: "10px", marginBottom: "10px", fontSize: "16px", boxSizing: "border-box" }}
      />

      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: 0}}>
          {results.map((user) => (
            <li key={user.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <div>
                <strong>{user.name}</strong> <br/>
                <span style={{ color: "gray", fontSize: "14px" }}>@{user.screen_name}</span>
              </div>
              <button
                onClick={() => handleFollow(user.user_id)}
                disabled={loadingTarget === user.user_id}
                style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "#1DA1F2", color: "white", border: "none", borderRadius: "20px" }}
              >
                {loadingTarget === user.user_id ? "Following..." : "Follow"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}