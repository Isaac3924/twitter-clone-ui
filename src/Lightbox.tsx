import React from 'react';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
}

export default function Lightbox({ imageUrl, onClose }: LightboxProps) {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'zoom-out'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '30px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '30px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        X
      </button>

      <img
        src={imageUrl}
        alt="Full screen media"
        onClick={(e) => e.stopPropagation()} //Prevents clicking the image itself from closing the modal
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '10px',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          cursor: 'default'
        }}
      />
    </div>
  );
}