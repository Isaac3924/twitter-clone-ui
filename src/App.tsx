import { useEffect, useState } from "react";
import { auth } from './firebase';
import { onAuthStateChanged, signOut, type User } from "firebase/auth";;
import Login from './Login';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //This sets up the listner. Whenever the user logs in or out, Firebase tells us.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading App...</div>;
  }

  //If they are NOT logged in, force them to the Login screen
  if (!currentUser) {
    return <Login />;
  }

  //If they are logged in, show them the app
  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h1>Welcome to the Feed!</h1>
      <p>You are secretly logged in as: <strong>{currentUser.email}</strong></p>
      <p>Your permanent VIP Firebase ID is: <strong>{currentUser.uid}</strong></p>

      <button onClick={handleLogout} style={{ padding: "10px", marginTop: "20px", cursor: "pointer" }}>
        Log Out
      </button>
    </div>
  );
}

export default App;