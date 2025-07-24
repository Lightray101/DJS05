import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Search from "./components/Search.jsx";
import Filters from "./components/Filters.jsx";
import PodcastGrid from "./components/PodcastGrid.jsx";
import Pagination from "./components/Pagination.jsx";
import Modal from "./components/Modal.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import HomePage from "./HomePage";
import ShowDetailPage from "./ShowDetailPage";
import { genres } from "./data/genres.js";
// API endpoint for podcast data
const API_URL = "https://podcast-api.netlify.app/";
import "./App.css";

/**
 * Main App component that manages the podcast discovery application
 * @returns {JSX.Element} The main app component
 */
function App() {
  const [podcasts, setPodcasts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;

  /**
   * Fetch podcast data from external API
   */
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // The API returns an array of podcasts directly
        setPodcasts(data || []);

        // Create seasons data from podcasts
        const seasonsData = data.map((podcast) => ({
          id: podcast.id,
          seasonDetails: podcast.seasons
            ? Array.from({ length: podcast.seasons }, (_, i) => ({
                title: `Season ${i + 1}`,
                episodes: Math.floor(Math.random() * 10) + 5, // Random episode count
              }))
            : [],
        }));

        setSeasons(seasonsData);
      } catch (err) {
        console.error("Error fetching podcasts:", err);
        setError(
          "Failed to fetch podcasts from the API. Please check your internet connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  /**
   * Handle podcast card click to open modal
   * @param {Object} podcast - The podcast object
   */
  const handlePodcastClick = (podcast) => {
    setSelectedPodcast(podcast);
    setIsModalOpen(true);
  };

  /**
   * Close the modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPodcast(null);
  };

  /**
   * Filter and sort podcasts based on current filters and search
   * @returns {Array} Filtered and sorted podcasts
   */
  const getFilteredAndSortedPodcasts = () => {
    let filteredPodcasts = [...podcasts];

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredPodcasts = filteredPodcasts.filter((podcast) =>
        podcast.title.toLowerCase().includes(searchLower)
      );
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      const genreId = parseInt(selectedGenre.replace("genre-", ""));
      filteredPodcasts = filteredPodcasts.filter((podcast) =>
        podcast.genres.includes(genreId)
      );
    }

    // Sort podcasts
    filteredPodcasts.sort((a, b) => {
      switch (sortBy) {
        case "updated-desc":
          return new Date(b.updated) - new Date(a.updated);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "popular-desc":
          return b.seasons - a.seasons;
        default:
          return 0;
      }
    });

    return filteredPodcasts;
  };

  const filteredPodcasts = getFilteredAndSortedPodcasts();

  /**
   * Get paginated podcasts for current page
   * @returns {Array} Podcasts for the current page
   */
  const getPaginatedPodcasts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPodcasts.slice(startIndex, endIndex);
  };

  const paginatedPodcasts = getPaginatedPodcasts();
  const totalPages = Math.ceil(filteredPodcasts.length / ITEMS_PER_PAGE);

  /**
   * Handle page change
   * @param {number} pageNumber - The page number to navigate to
   */
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Reset to first page when filters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, sortBy]);

  if (loading) {
    return (
      <div className="app">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <Search searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <Filters
          genres={genres}
          selectedGenre={selectedGenre}
          sortBy={sortBy}
          onGenreChange={setSelectedGenre}
          onSortChange={setSortBy}
        />

        {filteredPodcasts.length === 0 ? (
          <ErrorMessage message="No podcasts found with the selected filters." />
        ) : (
          <>
            <PodcastGrid
              podcasts={paginatedPodcasts}
              genres={genres}
              onPodcastClick={handlePodcastClick}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {isModalOpen && selectedPodcast && (
        <Modal
          podcast={selectedPodcast}
          genres={genres}
          seasons={seasons}
          onClose={handleCloseModal}
        />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/show/:id" element={<ShowDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
