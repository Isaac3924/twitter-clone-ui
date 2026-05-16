import { auth } from './firebase'
import { signOut, type User } from 'firebase/auth';
import ComposeTweet from './ComposeTweet';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: '250px', borderRight: '1px solid #eee', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: '#1DA1F2', margin: '0 0 20px 0' }}>TwitterClone</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '18px', fontWeight: 'bold' }}>
          <a href="#" style={{ textDecoration: 'none', color: '#1DA1F2' }}>🏠 Home</a>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>👤 Profile</a>
          <a href="#" style={{ textDecoration: 'none', color: '#333' }}>⚙️ Settings</a>
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
      <div style={{ flex: 1, borderRight: '1px solid #eee'}}>

        {/* Sticky Header */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)' }}>
          <h3 style={{ margin: 0 }}>Home</h3>
        </div>

        {/* Compose Tweet Placeholder */}
        <ComposeTweet />

        {/* Feed Placeholder */}
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#888', fontStyle: 'italic' }}>[ Tweet Feed will go here ]</p>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Optional) */}
      <div style={{ width: '300px', padding: '20px', display: 'none' }}>
        {/* Hiding this on smaller screens for now, but the structure is here. */}
      </div>
    </div>
  );
}