import { useEffect, useState } from "react";
import { auth } from './firebase';
import { onAuthStateChanged, type User } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from './Login';
import Dashboard from "./Dashboard";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //This sets up the listner. Whenever the user logs in or out, Firebase tells us.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: "center", height: '100vh' }}>Loading...</div>;
  }

  //If they aren't loading, lock them on the Auth screen
  if (!user) {
    return <Login />;
  }

  //If they are logged in, give access to the Router
  return (
    <BrowserRouter>
      <Routes>
        {/* The Home Page */}
        <Route path="/" element={<Dashboard user={user} />} />

        {/* The Dynamic Profile Page (:username acts as a variable) */}
        <Route 
          path="/user/:username"
          element={
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <h2>Profile Page Coming Soon...</h2>
              <a href="/">Go back to Home</a>
            </div>
          }
        />

        {/* Catch-All: If a mistyped URL, redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}