import ComposeTweet from './ComposeTweet';
import Feed from './Feed';

export default function Dashboard() {
  return (
    <>
      {/* Sticky Header */}
      <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(5px)', zIndex: 10 }}>
        <h3 style={{ margin: 0 }}>Home</h3>
      </div>

      {/* Compose Tweet */}
      <ComposeTweet />

      {/* Tweet Feed */}
      <Feed />
    </>
  );
}