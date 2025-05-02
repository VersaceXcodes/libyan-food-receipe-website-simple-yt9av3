import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { set_notification } from "@/store/main";

const UV_RecipeListing: React.FC = () => {
  // Use the API_BASE_URL from the environment variables (must be prefixed with VITE_)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";
  
  // Local state definitions
  const [recipes_list, setRecipesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selected_category, setSelectedCategory] = useState<string>("");
  const [page_number, setPageNumber] = useState<number>(1);
  const [page_limit, setPageLimit] = useState<number>(10);

  // useSearchParams hook to get and set query parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  // Sync local state with URL query parameters on mount and when searchParams change
  useEffect(() => {
    const categoryParam = searchParams.get("category_id") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);
    setSelectedCategory(categoryParam);
    setPageNumber(pageParam);
    setPageLimit(limitParam);
  }, [searchParams]);

  // Fetch recipes when filter or pagination parameters change
  useEffect(() => {
    fetchRecipesList();
  }, [selected_category, page_number, page_limit]);

  // Fetch the list of recipe categories on component mount
  useEffect(() => {
    fetchCategoriesList();
  }, []);

  // Function to fetch the recipes list from the backend
  const fetchRecipesList = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {
        page: page_number,
        limit: page_limit,
      };
      if (selected_category) {
        params.category_id = selected_category;
      }
      const response = await axios.get(`${API_BASE_URL}/recipes`, { params });
      setRecipesList(response.data);
    } catch (err) {
      setError("Failed to fetch recipes.");
      dispatch(set_notification({ error: "Failed to fetch recipes." }));
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch recipe categories for filter options
  const fetchCategoriesList = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recipe_categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories.", err);
    }
  };

  // Handle filtering changes and update URL query parameters accordingly
  const handleFilterChange = (category: string) => {
    setSelectedCategory(category);
    setPageNumber(1); // Reset to first page when filter changes
    const params: any = { page: 1, limit: page_limit };
    if (category) {
      params.category_id = category;
    }
    setSearchParams(params);
  };

  // Handle pagination button clicks and update query parameters
  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    const params: any = { page: newPage, limit: page_limit };
    if (selected_category) {
      params.category_id = selected_category;
    }
    setSearchParams(params);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        {/* Filter Options */}
        <div className="mb-4">
          <span className="font-bold mr-2">Filter by Category:</span>
          <button
            className={`px-3 py-1 mr-2 mb-2 border rounded ${selected_category === "" ? "bg-blue-500 text-white" : "bg-white text-black"}`}
            onClick={() => handleFilterChange("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`px-3 py-1 mr-2 mb-2 border rounded ${selected_category === cat.id ? "bg-blue-500 text-white" : "bg-white text-black"}`}
              onClick={() => handleFilterChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Recipe Listing */}
        {loading ? (
          <div className="text-center text-lg">Loading recipes...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : recipes_list.length === 0 ? (
          <div className="text-center text-gray-500">No recipes found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes_list.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="border rounded hover:shadow-lg transition-shadow"
              >
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-t"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">{recipe.title}</h2>
                  <p className="text-gray-600 text-sm">{recipe.short_description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={page_number <= 1}
            onClick={() => handlePageChange(page_number - 1)}
          >
            Previous
          </button>
          <span className="font-semibold">Page {page_number}</span>
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => handlePageChange(page_number + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default UV_RecipeListing;