export default function SkeletonProfile() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* The Banner */}
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '0' }}></div>

      {/* The Profile Info Section */}
      <div style={{ padding: '0 20px 20px 20px', position: 'relative' }}>

        {/* The Overlapping Profile Picture */}
        <div
          className="skeleton"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid white',
            marginTop: '-60px',
            marginBottom: '15px'
          }}
        ></div>

        {/* Name and Handle */}
        <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '5px' }}></div>
        <div className="skeleton" style={{ width: '100px', height: '16px', marginBottom: '20px' }}></div>

        {/* Bio Placeholders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <div className="skeleton" style={{ width: '100%', height: '16px'}}></div>
          <div className="skeleton" style={{ width: '90%', height: '16px'}}></div>
          <div className="skeleton" style={{ width: '60%', height: '16px'}}></div>
        </div>

        {/* Follower Counts */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="skeleton" style={{ width: '80px', height: '16px'}}></div>
          <div className="skeleton" style={{ width: '80px', height: '16px'}}></div>
        </div>
      </div>
    </div>
    );
}