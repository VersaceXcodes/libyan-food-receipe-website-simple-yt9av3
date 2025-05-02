import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { set_global_search_query } from "@/store/main";

const UV_SearchResults: React.FC = () => {
  // Obtain the query parameter from the URL using useSearchParams
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Extract the "query" parameter; if not provided, default to empty string.
  const initialQuery = searchParams.get("query") || "";
  
  // Local state variables for search query and results.
  const [search_query, set_search_query] = useState<string>(initialQuery);
  const [search_results, set_search_results] = useState<Array<any>>([]);
  const [loading, set_loading] = useState<boolean>(false);
  const [error, set_error] = useState<string | null>(null);

  // Access global search query from the Redux store (for consistency)
  const global_search_query = useSelector((state: any) => state.global.global_search_query);

  // If the query is empty, navigate back to the Recipe Listing page.
  useEffect(() => {
    if (!initialQuery) {
      navigate("/recipes");
    }
  }, [initialQuery, navigate]);

  // Update global search query and trigger fetch when search_query changes.
  useEffect(() => {
    // Update the global store's search query for cross-view consistency
    dispatch(set_global_search_query(search_query));

    // Function to fetch search results from the backend API.
    async function fetch_search_results() {
      set_loading(true);
      set_error(null);
      try {
        const api_base = import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";
        const response = await axios.get(`${api_base}/recipes/search`, {
          params: { query: search_query },
        });
        set_search_results(response.data);
      } catch (err: any) {
        set_error(err.message || "Error fetching search results");
        set_search_results([]);
      }
      set_loading(false);
    }
    if (search_query) {
      fetch_search_results();
    }
  }, [search_query, dispatch]);

  // Clear search action clears global search and navigates back to listing page.
  const handle_clear_search = () => {
    dispatch(set_global_search_query(""));
    navigate("/recipes");
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Search Results for: {search_query}</h1>
        <button
          onClick={handle_clear_search}
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Clear Search
        </button>
        {loading && <p className="text-gray-500">Loading search results...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {(!loading && search_results.length === 0) ? (
          <div className="mt-4">
            <p className="text-gray-700">No recipes found for "{search_query}".</p>
            <p className="text-gray-600">Try a different keyword or clear your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {search_results.map((recipe) => (
              <Link
                to={`/recipes/${recipe.id}`}
                key={recipe.id}
                className="block border border-gray-200 rounded-lg shadow hover:shadow-lg transition"
              >
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">{recipe.title}</h2>
                  <p className="text-gray-600 text-sm">{recipe.short_description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UV_SearchResults;