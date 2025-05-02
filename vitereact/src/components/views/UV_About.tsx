import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { set_notification } from "@/store/main";

// Define TypeScript interface for about_content's state
interface AboutContent {
  mission: string;
  history: string;
  images?: string[];
}

const UV_About: React.FC = () => {
  const dispatch = useDispatch();
  // Retrieve site_settings from global store
  const site_settings = useSelector((state: any) => state.global.site_settings);

  // Local state for the about content and subscription form
  const [about_content, set_about_content] = useState<AboutContent>({
    mission: "",
    history: "",
    images: []
  });
  const [subscription_email, set_subscription_email] = useState<string>("");
  const [subscription_loading, set_subscription_loading] = useState<boolean>(false);

  // API base URL from environment variables (must be prefixed with VITE_)
  const api_base_url = import.meta.env.VITE_API_BASE_URL || "http://localhost:1337";

  // load_about_content function to simulate fetching static/dynamic content for the About page
  useEffect(() => {
    const load_about_content = async () => {
      try {
        // Here we simulate fetching content; you could replace this with an actual API call if available.
        const content_data: AboutContent = {
          mission:
            "Our mission is to showcase the rich culinary traditions of Libya by providing authentic recipes along with the cultural narratives behind them.",
          history:
            "Libyan cuisine has evolved over centuries, blending Mediterranean flavors with indigenous ingredients. Our platform honors this heritage by presenting recipes steeped in history and tradition.",
          images: [
            "https://picsum.photos/seed/libya1/800/600",
            "https://picsum.photos/seed/libya2/800/600"
          ]
        };
        set_about_content(content_data);
      } catch (error) {
        console.error("Error loading about content:", error);
      }
    };
    load_about_content();
  }, []);

  // subscribeForUpdates function to handle the subscription form submission
  const handle_subscription_submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subscription_email) return;
    set_subscription_loading(true);
    try {
      await axios.post(`${api_base_url}/subscriptions`, { email: subscription_email });
      dispatch(set_notification({ success: "Subscription successful!" }));
      set_subscription_email("");
    } catch (error: any) {
      dispatch(set_notification({ error: error.response?.data?.message || "Subscription failed." }));
    } finally {
      set_subscription_loading(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">{site_settings.site_title}</h1>
          <p className="text-lg text-gray-600">{site_settings.tagline}</p>
        </header>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700">{about_content.mission}</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our History</h2>
          <p className="text-gray-700 mb-4">{about_content.history}</p>
          {about_content.images && about_content.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {about_content.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Libyan tradition ${index + 1}`}
                  className="w-full h-auto rounded"
                />
              ))}
            </div>
          )}
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscribe for Updates</h2>
          <form
            onSubmit={handle_subscription_submit}
            className="flex flex-col sm:flex-row items-center"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={subscription_email}
              onChange={(e) => set_subscription_email(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded mb-4 sm:mb-0 sm:mr-4"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={subscription_loading}
            >
              {subscription_loading ? "Submitting..." : "Subscribe"}
            </button>
          </form>
        </section>
        <section className="text-center">
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </section>
      </div>
    </>
  );
};

export default UV_About;