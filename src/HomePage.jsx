import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import Search from "./components/Search.jsx";
import Filters from "./components/Filters.jsx";
import PodcastGrid from "./components/PodcastGrid.jsx";
import Pagination from "./components/Pagination.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import { genres } from "./data/genres.js";
const API_URL = "https://podcast-api.netlify.app/";
import "./App.css";

function HomePage() {
  const [podcasts, setPodcasts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

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

        setPodcasts(data || []);

        const seasonsData = data.map((podcast) => ({
          id: podcast.id,
          seasonDetails: podcast.seasons
            ? Array.from({ length: podcast.seasons }, (_, i) => ({
                title: `Season ${i + 1}`,
                episodes: Math.floor(Math.random() * 10) + 5,
              }))
            : [],
        }));

        setSeasons(seasonsData);
      } catch (err) {
        setError(
          "Failed to fetch podcasts from the API. Please check your internet connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  const getFilteredAndSortedPodcasts = () => {
    let filteredPodcasts = [...podcasts];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredPodcasts = filteredPodcasts.filter((podcast) =>
        podcast.title.toLowerCase().includes(searchLower)
      );
    }

    if (selectedGenre !== "all") {
      const genreId = parseInt(selectedGenre.replace("genre-", ""));
      filteredPodcasts = filteredPodcasts.filter((podcast) =>
        podcast.genres.includes(genreId)
      );
    }

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

  const getPaginatedPodcasts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPodcasts.slice(startIndex, endIndex);
  };

  const paginatedPodcasts = getPaginatedPodcasts();
  const totalPages = Math.ceil(filteredPodcasts.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

        <div className="filters-center">
          <Filters
            genres={genres}
            selectedGenre={selectedGenre}
            sortBy={sortBy}
            onGenreChange={setSelectedGenre}
            onSortChange={setSortBy}
          />
        </div>

        {filteredPodcasts.length === 0 ? (
          <ErrorMessage message="No podcasts found with the selected filters." />
        ) : (
          <>
            <PodcastGrid
              podcasts={paginatedPodcasts}
              genres={genres}
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
    </div>
  );
}

export default HomePage;
