import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { set_notification } from "@/store/main";
import { FaSearch, FaUtensils, FaLeaf, FaMortarPestle, FaPepperHot } from "react-icons/fa";// Define the TypeScript interface for a recipe summary
interface RecipeSummary {
  id: string;
  title: string;
  thumbnail_url: string;
  short_description: string;
}

const UV_Home: React.FC = () => {
  // Local state for featured recipes and inline search input
  const [featured_recipes, setFeaturedRecipes] = useState<RecipeSummary[]>([]);
  const [inline_search_input, setInlineSearchInput] = useState<string>("");

  // Redux dispatch
  const dispatch = useDispatch();

  // Get site_settings from the global state
  const site_settings = useSelector((state: any) => state.global.site_settings);

  // React Router navigation hook
  const navigate = useNavigate();

  // Function to fetch featured recipes from the backend API
  const fetch_featured_recipes = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";
      const response = await axios.get(`${API_BASE_URL}/recipes?is_featured=true`);
      if (response.status === 200 && Array.isArray(response.data)) {
        setFeaturedRecipes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch featured recipes", error);
      dispatch(set_notification({ error: "Failed to load featured recipes" }));
    }
  };

  // Navigate to the Recipe Listing Page on CTA click
  const navigate_to_recipe_listing = () => {
    navigate("/recipes");
  };

  // Handle inline search form submission
  const handle_inline_search_submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inline_search_input.trim() !== "") {
      navigate(`/recipes/search?query=${encodeURIComponent(inline_search_input)}`);
    }
  };

  // Fetch featured recipes on component mount
  useEffect(() => {
    fetch_featured_recipes();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/libya/1200/800"
            alt="Traditional Libyan Cuisine"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-7xl font-extrabold mb-6 text-yellow-400 leading-tight">{site_settings.site_title}</h1>
          <p className="text-3xl mb-10 font-light">{site_settings.tagline}</p>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            onClick={navigate_to_recipe_listing}
          >
            Explore Recipes
          </button>
        </div>
      </div>
      {/* Inline Search Bar */}
      <div className="max-w-4xl mx-auto -mt-12 relative z-20 px-4">
        <form onSubmit={handle_inline_search_submit} className="flex shadow-2xl">
          <input
            type="text"
            value={inline_search_input}
            onChange={(e) => setInlineSearchInput(e.target.value)}
            placeholder="Search for delicious Libyan recipes..."
            className="flex-grow p-5 text-xl border-2 border-yellow-400 rounded-l-full focus:outline-none focus:border-yellow-500 bg-white bg-opacity-90"
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold p-5 rounded-r-full transition duration-300 ease-in-out"
          >
            <FaSearch className="text-3xl" />
          </button>
        </form>
      </div>
      {/* Featured Recipes Section */}
      <div className="max-w-7xl mx-auto mt-24 px-4">
        <h2 className="text-5xl font-bold mb-12 text-center text-gray-800">Featured Recipes</h2>        {featured_recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured_recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <img
                  src={recipe.thumbnail_url}
                  alt={recipe.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{recipe.title}</h3>
                  <p className="text-gray-600">{recipe.short_description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No featured recipes available.</p>
        )}
      </div>

      {/* Call-to-Action Section */}
      <div className="bg-yellow-400 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4 text-gray-800">Ready to start cooking?</h2>
          <p className="text-xl mb-8 text-gray-700">Explore our full collection of authentic Libyan recipes and bring the taste of Libya to your kitchen.</p>
          <button
            onClick={navigate_to_recipe_listing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-xl transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <FaUtensils className="mr-2" /> View All Recipes
          </button>
        </div>
      </div>
    </div>  );
};

export default UV_Home;