import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";

const GV_Footer: React.FC = () => {
  const { site_title, tagline } = useSelector((state: any) => state.global.site_settings);
  const current_year = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Newsletter subscription for:", email);
    // Implement newsletter subscription logic here
    setEmail("");
  };

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="hover:text-gray-300">Home</Link>
              <Link to="/recipes" className="hover:text-gray-300">Recipes</Link>
              <Link to="/about" className="hover:text-gray-300">About</Link>
              <Link to="/contact" className="hover:text-gray-300">Contact</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-gray-300">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-gray-300">
                <FontAwesomeIcon icon={faTwitter} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-gray-300">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="p-2 text-gray-800"
                required
              />
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 p-2">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="font-semibold text-xl">{site_title}</p>
          <p className="mt-2">{tagline}</p>
          <p className="mt-4 text-sm text-gray-400">&copy; {current_year} {site_title}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default GV_Footer;