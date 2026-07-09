import React from 'react'

interface MediaRendererProps {
  mediaUrl: string;
  onImageClick: (url: string) => void;
  isDetailView?: boolean;
}

export default function MediaRenderer({ mediaUrl, onImageClick, isDetailView = false }: MediaRendererProps) {
  if (!mediaUrl) return null;

  //Use Regex to check if the URL ends with a standard video extension
  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl);

  //Dynamic styles to keep the feed uniform and prevent cropping, or to change it as needed.
  //Right now, only Detail View applies a different style, governed by isDetailView
  const timelineStyles: React.CSSProperties = {
    width: "100%",
    maxHeight: isDetailView ? "700px" : "500px",
    objectFit: "cover", //Keeps the timeline neat and uniform
    borderRadius: isDetailView ? "0px" : "15px",
    border: isDetailView ? "none" : "1px solid #eee",
    marginTop: isDetailView ? "10px" : "0px",
    marginBottom: isDetailView ? "10px" : "0px"
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