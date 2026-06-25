import React from 'react'

interface MediaRendererProps {
  mediaUrl: string;
  onImageClick: (url: string) => void;
}

export default function MediaRenderer({ mediaUrl, onImageClick }: MediaRendererProps) {
  if (!mediaUrl) return null;

  //Use Regex to check if the URL ends with a standard video extension
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl);

  //Shared styles to keep the feed uniform and prevent cropping
  const timelineStyles: React.CSSProperties = {
    width: "100%",
    maxHeight: "500px",
    objectFit: "cover", //Keeps the timeline neat and uniform
    borderRadius: "15px",
    border: "1px solid #eee"
  };

  if (isVideo) {
    return (
      <video
        src={mediaUrl}
        controls
        style={timelineStyles}
      />
    );
  }

  return (
    <img
      src={mediaUrl}
      alt="Tweet Media"
      onClick={() => onImageClick(mediaUrl)}
      style={{
        ...timelineStyles,
        cursor: "zoom-in"
      }}
    />
  )
}