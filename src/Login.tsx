import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    //Workaround: Format the username into a dummy email
    const dummyEmail = `${username.toLowerCase()}@twitterclone.local`;

    try{
      if (isLoginView) {
        //Logging in an existing user
        await signInWithEmailAndPassword(auth, dummyEmail, password);
      } else {
        //Create new user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password)

        //Grab new JWT token
        const token = await userCredential.user.getIdToken();

        //Send token and username to Python backend
        //Ensure that the FastAPI server is running on port 8000
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
        const response = await fetch(`${API_URL}/api/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            screen_name: username,
            name: username
          })
        });

        if (!response.ok) {
          //If backend fails, deleting the Firebase user would be best, but for now we'll just throw an error.
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to create user in database");
        }
      }
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>{isLoginView ? "Sign In" : "Create Account"}</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px"}}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", fontSize: "16px" }}
        />

        {error && <p style={{ color: "red", fontSize: "14px"}}>{error}</p>}

        <button type="submit" disabled={loading} style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
          {loading ? "Loading..." : (isLoginView ? "Login" : "Sign Up")}
        </button>
      </form>

      <p style={{ marginTop: "20px", cursor: "pointer", color: "blue"}} onClick={() => setIsLoginView(!isLoginView)}>
        {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </p>
    </div>
  );
}