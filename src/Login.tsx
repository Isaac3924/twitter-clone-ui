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
        //Attempt to log them in
        await signInWithEmailAndPassword(auth, dummyEmail, password);
      } else {
        //Attempt to create a new account
        await createUserWithEmailAndPassword(auth, dummyEmail, password)
        //NOTE: Add the connection her to sync this new user to Python backend
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