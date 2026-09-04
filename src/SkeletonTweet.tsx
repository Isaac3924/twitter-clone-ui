export default function SkeletonTweet() {
  return (
    <div style={{ display: 'flex', padding: '20px', borderBottom: '1px solid #eee', gap: '15px'}}>

      {/* 1. The Profile Picture Placeholder */}
      <div
        className="skeleton"
        style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }}
      ></div>

      {/* 2. The Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
        {/* Name and Handle Placeholder */}
        <div className="skeleton" style={{ width: '150px', height: '16px' }}></div>

        {/* Tweet Body Placeholders (Three lines of varying lengths to look natural) */}
        <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton" style={{ width: '100%', height: '16px' }}></div>
          <div className="skeleton" style={{ width: '85%', height: '16px' }}></div>
          <div className="skeleton" style={{ width: '60%', height: '16px' }}></div>
        </div>
      </div>
    </div>
  );
}