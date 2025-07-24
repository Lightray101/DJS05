import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Search from "./components/Search.jsx";
import Filters from "./components/Filters.jsx";
import PodcastGrid from "./components/PodcastGrid.jsx";
import Pagination from "./components/Pagination.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ErrorMessage from "./components/ErrorMessage.jsx";
import { genres } from "./data/genres.js";

const API_URL = "https://podcast-api.netlify.app/";
const ITEMS_PER_PAGE = 12;

function HomePage() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use query params for state
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const selectedGenre = searchParams.get("genre") || "all";
  const sortBy = searchParams.get("sort") || "updated-desc";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPodcasts(data || []);
      } catch (err) {
        setError("Failed to fetch podcasts from the API. Please check your internet connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  // Filter and sort podcasts
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

  // Pagination
  const totalPages = Math.ceil(filteredPodcasts.length / ITEMS_PER_PAGE);
  const paginatedPodcasts = filteredPodcasts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers update query params
  const handleSearchChange = (term) => {
    setSearchParams({ search: term, genre: selectedGenre, sort: sortBy, page: 1 });
  };
  const handleGenreChange = (genre) => {
    setSearchParams({ search: searchTerm, genre, sort: sortBy, page: 1 });
  };
  const handleSortChange = (sort) => {
    setSearchParams({ search: searchTerm, genre: selectedGenre, sort, page: 1 });
  };
  const handlePageChange = (page) => {
    setSearchParams({ search: searchTerm, genre: selectedGenre, sort: sortBy, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <Header />
      <main className="main-content">
        <Search searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Filters
          genres={genres}
          selectedGenre={selectedGenre}
          sortBy={sortBy}
          onGenreChange={handleGenreChange}
          onSortChange={handleSortChange}
        />
        {filteredPodcasts.length === 0 ? (
          <ErrorMessage message="No podcasts found with the selected filters." />
        ) : (
          <>
            <PodcastGrid
              podcasts={paginatedPodcasts}
              genres={genres}
              // Use Link in PodcastGrid to /show/:id with current searchParams
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