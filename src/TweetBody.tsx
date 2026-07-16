import { Link } from 'react-router-dom';

interface TweetBodyProps {
  text: string;
  fontSize?: string; //Optional prop to make the tweet bigger on the detail page
}

export default function TweetBody({ text, fontSize = "15px" }: TweetBodyProps) {
  if (!text) return null;

  //Split the text by hashtags.
  //The parentheses ( ) in the Regex ensure the hashtag itself is kept in the resulting array
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);

  return (
    <p style={{ margin: 0, fontSize: fontSize, lineHeight: "1.4", marginBottom: "12px", whiteSpace: "pre-wrap" }}>
      {parts.map((part, index) => {
        //If the chunk of text perfectly matches the shape of a hashtag
        if (part.match(/^#[a-zA-Z0-9]+$/)) {
          return (
            <Link
              key={index}
              to={`/search?q=${encodeURIComponent(part)}`}
              style={{ color: '#1DA1F2', textDecoration: 'none' }}
              //Stop propagataion prevents clicking the hashtag from accidentally clicking the whole tweet card
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        }
        //Otherwise, just return the normal plain text chunk
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}