import React from "react";
import PodcastCard from "./PodcastCard.jsx";
import "./PodcastGrid.css";

/**
 * PodcastGrid component that displays a responsive grid of podcast cards
 * @param {Object} props - Component props
 * @param {Array} props.podcasts - Array of podcast objects
 * @param {Array} props.genres - Array of genre objects
 * @param {Function} props.onPodcastClick - Callback for podcast card click
 * @returns {JSX.Element} The podcast grid component
 */
function PodcastGrid({ podcasts, genres, onPodcastClick }) {
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
    <section className="podcast-grid">
      {podcasts.map((podcast) => (
        <PodcastCard
          key={podcast.id}
          podcast={podcast}
          genreNames={getGenreNames(podcast.genres)}
          onClick={() => onPodcastClick(podcast)}
        />
      ))}
    </section>
  );
}

export default PodcastGrid;
