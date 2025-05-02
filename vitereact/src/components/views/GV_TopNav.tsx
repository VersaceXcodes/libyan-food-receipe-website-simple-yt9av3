import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { set_global_search_query } from "@/store/main";

const GV_TopNav: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Access global state from Redux store
  const site_settings = useSelector((state: any) => state.global.site_settings);
  const global_search_query = useSelector((state: any) => state.global.global_search_query);

  // Local state for active navigation link and search input
  const [activeNavLink, setActiveNavLink] = useState<string>("home");
  const [searchInput, setSearchInput] = useState<string>(global_search_query || "");

  // Action: handle navigation via logo or nav link click
  const handleNavLinkClick = (link: string, path: string) => {
    setActiveNavLink(link);
    navigate(path);
  };

  // Action: update search input state as user types
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Action: submit the search ensuring global state is updated and navigation to search results view
  const submitSearch = () => {
    if (searchInput.trim() !== "") {
      dispatch(set_global_search_query(searchInput));
      navigate(`/recipes/search?query=${encodeURIComponent(searchInput)}`);
    }
  };

  // Handle Enter key in the search field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitSearch();
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left side: Logo and Navigation Links */}
          <div className="flex items-center space-x-4">
            <div
              className="text-xl font-bold cursor-pointer"
              onClick={() => handleNavLinkClick("home", "/")}
            >
              {site_settings.site_title}
            </div>
            <nav className="hidden md:flex space-x-4">
              <span
                className={`cursor-pointer ${
                  activeNavLink === "home" ? "text-blue-500" : "text-gray-700"
                } hover:text-blue-500`}
                onClick={() => handleNavLinkClick("home", "/")}
              >
                Home
              </span>
              <span
                className={`cursor-pointer ${
                  activeNavLink === "recipes" ? "text-blue-500" : "text-gray-700"
                } hover:text-blue-500`}
                onClick={() => handleNavLinkClick("recipes", "/recipes")}
              >
                Recipes
              </span>
              <span
                className={`cursor-pointer ${
                  activeNavLink === "about" ? "text-blue-500" : "text-gray-700"
                } hover:text-blue-500`}
                onClick={() => handleNavLinkClick("about", "/about")}
              >
                About
              </span>
              <span
                className={`cursor-pointer ${
                  activeNavLink === "contact" ? "text-blue-500" : "text-gray-700"
                } hover:text-blue-500`}
                onClick={() => handleNavLinkClick("contact", "/contact")}
              >
                Contact
              </span>
            </nav>
          </div>
          {/* Right side: Search Field */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search recipes..."
              className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={submitSearch}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      {/* Spacer to prevent content from being hidden under the fixed nav bar */}
      <div className="pt-16"></div>
    </>
  );
};

export default GV_TopNav;