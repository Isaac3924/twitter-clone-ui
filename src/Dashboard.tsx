import { auth } from './firebase'
import { signOut, type User } from 'firebase/auth';
import ComposeTweet from './ComposeTweet';
import Feed from './Feed';
import SearchUsers from './SearchUsers';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    // APP CONTAINER: Locked to monitor height, body scrolling disabled 
    <div className="dashboard-container" style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', height: '100vh', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      {/* LEFT SIDEBAR: Independent vertical scroll, no sticky needed */}
      <div style={{ 
        width: '250px', 
        borderRight: '1px solid #eee', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        overflowY: 'auto' 
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

        {/* Sticky Header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)' }}>
          <h3 style={{ margin: 0 }}>Home</h3>
        </div>

        {/* User Search */}
        <SearchUsers currentUser={user} />

        {/* Compose Tweet */}
        <ComposeTweet />

        {/* Tweet Feed */}
        <Feed />
      </div>

      {/* RIGHT SIDEBAR (Optional) */}
      <div style={{ width: '300px', padding: '20px', display: 'none' }}>
        {/* Hiding this on smaller screens for now, but the structure is here. */}
      </div>
    </div>
  );
}