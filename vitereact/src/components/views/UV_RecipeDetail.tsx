import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { set_notification } from "@/store/main";

interface Ingredient {
  name: string;
  measurement: string;
}

interface Instruction {
  step_number: number;
  instruction: string;
}

interface RecipeDetails {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  image_url: string;
  thumbnail_url: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  cooking_time_minutes: number;
  prep_time_minutes: number;
  serving_size?: string;
  difficulty: string;
}

const UV_RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [recipeDetails, setRecipeDetails] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Retrieve previous and next recipe IDs from location state if available.
  const prev_recipe_id: string | undefined = (location.state as any)?.prev_recipe_id;
  const next_recipe_id: string | undefined = (location.state as any)?.next_recipe_id;

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";
        const response = await axios.get(`${apiBaseUrl}/recipes/${id}`);
        setRecipeDetails(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching recipe details.");
        setLoading(false);
        // Optionally dispatch a global notification error
        dispatch(set_notification({ error: "Unable to load recipe details. Please try again later." }));
      }
    };

    fetchRecipeDetails();
  }, [id, dispatch]);

  const handlePreviousClick = () => {
    if (prev_recipe_id) {
      navigate(`/recipes/${prev_recipe_id}`, { state: { ...location.state } });
    }
  };

  const handleNextClick = () => {
    if (next_recipe_id) {
      navigate(`/recipes/${next_recipe_id}`, { state: { ...location.state } });
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <span className="text-xl">Loading...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-screen">
          <span className="text-red-500 text-xl">{error}</span>
        </div>
      ) : recipeDetails && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Recipe Header */}
          <div className="mb-8">
            <img
              src={recipeDetails.image_url}
              alt={recipeDetails.title}
              className="w-full h-64 object-cover rounded-md"
            />
            <h1 className="text-3xl font-bold mt-4">{recipeDetails.title}</h1>
            <p className="text-gray-600 mt-2">{recipeDetails.short_description}</p>
          </div>
          {/* Ingredients Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
            <ul className="list-disc list-inside">
              {recipeDetails.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.name} - {ingredient.measurement}
                </li>
              ))}
            </ul>
          </div>
          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal list-inside">
              {recipeDetails.instructions
                .sort((a, b) => a.step_number - b.step_number)
                .map((instr, index) => (
                  <li key={index} className="mb-2">
                    <span className="font-medium">Step {instr.step_number}:</span> {instr.instruction}
                  </li>
                ))}
            </ol>
          </div>
          {/* Additional Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Additional Details</h2>
            <p>
              <strong>Cooking Time:</strong> {recipeDetails.cooking_time_minutes} minutes
            </p>
            <p>
              <strong>Preparation Time:</strong> {recipeDetails.prep_time_minutes} minutes
            </p>
            {recipeDetails.serving_size && (
              <p>
                <strong>Serving Size:</strong> {recipeDetails.serving_size}
              </p>
            )}
            <p>
              <strong>Difficulty:</strong> {recipeDetails.difficulty}
            </p>
          </div>
          {/* Background / Full Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Background</h2>
            <p className="text-gray-700">{recipeDetails.full_description}</p>
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Link to="/recipes" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Back to Recipes
            </Link>
            <div>
              <button
                onClick={handlePreviousClick}
                disabled={!prev_recipe_id}
                className={`bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
                  !prev_recipe_id ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextClick}
                disabled={!next_recipe_id}
                className={`ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ${
                  !next_recipe_id ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_RecipeDetail;