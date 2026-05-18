import { useEffect, useState } from "react";
import { auth } from './firebase';
import { onAuthStateChanged, type User } from "firebase/auth";
import Login from './Login';
import './App.css';
import Dashboard from './Dashboard';

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

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading App...</div>;
  }

  //If they are NOT logged in, force them to the Login screen
  if (!currentUser) {
    return <Login />;
  }

  //If they are logged in, show them the app
  return <Dashboard user={currentUser} />;
}

export default App;