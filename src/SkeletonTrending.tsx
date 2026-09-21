export default function SkeletonTrending() {
  return (
    <div style={{ padding: '15px 0', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '8px'}}>
      {/* Category/Tag Placeholder */}
      <div className="skeleton" style={{ width: '40%', height: '12px'}}></div>
      {/* Headline Placeholder */}
      <div className="skeleton" style={{ width: '85%', height: '16px' }}></div>
      {/* Tweet Count Placeholder */}
      <div className="skeleton" style={{ width: '43%', height: '12px'}}></div>
    </div>
  );
}