import React from 'react';
import { auth } from './firebase'
import { signOut, type User } from 'firebase/auth';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import TrendingSidebar from './TrendingSidebar';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
}

export default function Layout({ children, user }: LayoutProps) {
  return (
    //App Container: Locked to monitor height, body scrolling disabled
    <div className="dashboard-container" style={{ display: 'flex', maxWidth: '100vw', margin: '0 auto', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      {/* LEFT SIDEBAR: Independent vertical scroll, no sticky needed */}
      <div style={{ 
        width: '250px', 
        borderRight: '1px solid #eee', 
        padding: '20px 50px', 
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto', 
        alignItems: 'flex-start'
      }}>
        <h2 style={{ color: '#1DA1F2', margin: '0 0 20px 0' }}>TwitterClone</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '18px', fontWeight: 'bold' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#1DA1F2' }}>🏠 Home</Link>
          <Link to ={`/user/${user.uid}`} style={{ textDecoration: 'none', color: '#333' }}>👤 Profile</Link>
          <div 
            onClick={() => alert("Settings panel comin in v2.0")}
            style={{ textDecoration: 'none', color: '#333' }}
          >
              ⚙️ Settings</div>
        </nav>

        <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#666', wordBreak: 'break-all' }}>{user.email}</p>
          <button 
            onClick={() => signOut(auth)}
            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '25px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA (Feed) */}
      <div style={{ flex: 1, borderRight: '1px solid #eee', overflowY: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* RIGHT SIDEBAR Trending Topics */}
      <div style={{ width: '300px', padding: '20px 50px 20px 32px', overflowY: 'auto' }}>
        {/* User Search */}
        <SearchBar currentUser={user} />

        <TrendingSidebar />
      </div>
    </div>
  );
}