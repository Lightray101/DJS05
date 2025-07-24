import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./PodcastGrid.css";

/**
 * PodcastGrid component that displays a responsive grid of podcast cards
 * @param {Object} props - Component props
 * @param {Array} props.podcasts - Array of podcast objects
 * @param {Array} props.genres - Array of genre objects
 * @returns {JSX.Element} The podcast grid component
 */
function PodcastGrid({ podcasts, genres }) {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  /**
   * Get genre names for a podcast
   * @param {Array} genreIds - Array of genre IDs
   * @returns {Array} Array of genre names
   */
  const getGenreNames = (genreIds) => {
    return genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.title)
      .filter(Boolean);
  };

  return (
    <div className="podcast-grid">
      {podcasts.map((podcast) => (
        <Link
          key={podcast.id}
          to={`/show/${podcast.id}${queryString}`}
          className="podcast-card"
        >
          <img src={podcast.image} alt={podcast.title} />
          <h2>{podcast.title}</h2>
        </Link>
      ))}
    </div>
  );
}

export default PodcastGrid;
