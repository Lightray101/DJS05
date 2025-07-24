import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

/**
 * Maps genre IDs to their titles.
 */
const GENRE_MAP = {
  1: "Personal Growth",
  2: "Investigative Journalism",
  3: "History",
  4: "Comedy",
  5: "Entertainment",
  6: "Business",
  7: "Fiction",
  8: "News",
  9: "Kids and Family",
};

/**
 * Formats a date string into a human-readable format (e.g., "2 days ago").
 * @param {string} dateString - The ISO date string.
 * @returns {string} The formatted, human-readable date.
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

/**
 * Show detail page component.
 * Fetches and displays details for a single show.
 * @returns {JSX.Element}
 */
function ShowDetailPage() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`https://podcast-api.netlify.app/id/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Show not found");
        return res.json();
      })
      .then((data) => {
        setShow(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading show details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!show) return <div>Show not found.</div>;

  return (
    <div>
      <Link to="/">← Back to Homepage</Link>
      <h1>{show.title}</h1>
      <img
        src={show.image}
        alt={show.title}
        style={{ width: "300px", borderRadius: "8px" }}
      />
      <p>{show.description}</p>
      <div>
        {show.genres &&
          show.genres.map((id) => (
            <span
              key={id}
              style={{
                display: "inline-block",
                background: "#eee",
                borderRadius: "4px",
                padding: "0.2rem 0.6rem",
                marginRight: "0.5rem",
                fontSize: "0.9rem",
              }}
            >
              {GENRE_MAP[id] || "Unknown"}
            </span>
          ))}
      </div>
      <p>
        <strong>Last updated:</strong> {formatDate(show.updated)}
      </p>
      {/* Season navigation will be added in the next step */}
    </div>
  );
}

export default ShowDetailPage;