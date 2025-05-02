import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { set_notification } from "@/store/main";
import { Link } from "react-router-dom";

const UV_Contact: React.FC = () => {
  const dispatch = useDispatch();
  const site_settings = useSelector((state: any) => state.global.site_settings);

  const [contact_form_data, set_contact_form_data] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [form_submission_status, set_form_submission_status] = useState("");
  const [form_errors, set_form_errors] = useState({
    name: "",
    email: "",
    message: ""
  });

  // Validate the contact form fields
  const validate_contact_form = () => {
    let errors = { name: "", email: "", message: "" };
    let is_valid = true;

    if (contact_form_data.name.trim() === "") {
      errors.name = "Name is required.";
      is_valid = false;
    }

    if (contact_form_data.email.trim() === "") {
      errors.email = "Email is required.";
      is_valid = false;
    } else if (!/\S+@\S+\.\S+/.test(contact_form_data.email)) {
      errors.email = "Email is invalid.";
      is_valid = false;
    }

    if (contact_form_data.message.trim() === "") {
      errors.message = "Message is required.";
      is_valid = false;
    }

    set_form_errors(errors);
    return is_valid;
  };

  // Submit the contact form data to the backend
  const submit_contact_form = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate_contact_form()) {
      return;
    }
    try {
      const response = await axios.post("http://localhost:1337/contacts", contact_form_data);
      if (response.status === 201) {
        set_form_submission_status("Your message was sent successfully.");
        dispatch(set_notification({ success: "Your message was sent successfully." }));
        set_contact_form_data({ name: "", email: "", message: "" });
        set_form_errors({ name: "", email: "", message: "" });
      } else {
        set_form_submission_status("Unexpected response from server.");
        dispatch(set_notification({ error: "Unexpected response from server." }));
      }
    } catch (error: any) {
      const error_message =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "An error occurred. Please try again.";
      set_form_submission_status(error_message);
      dispatch(set_notification({ error: error_message }));
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="mb-6">
          We would love to hear from you. Please fill out the form below to send us your inquiries or feedback.
        </p>
        <form onSubmit={submit_contact_form} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={contact_form_data.name}
              onChange={(e) =>
                set_contact_form_data({ ...contact_form_data, name: e.target.value })
              }
              onBlur={validate_contact_form}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {form_errors.name && (
              <p className="text-red-500 text-sm mt-1">{form_errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={contact_form_data.email}
              onChange={(e) =>
                set_contact_form_data({ ...contact_form_data, email: e.target.value })
              }
              onBlur={validate_contact_form}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
            {form_errors.email && (
              <p className="text-red-500 text-sm mt-1">{form_errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              value={contact_form_data.message}
              onChange={(e) =>
                set_contact_form_data({ ...contact_form_data, message: e.target.value })
              }
              onBlur={validate_contact_form}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              rows={5}
            ></textarea>
            {form_errors.message && (
              <p className="text-red-500 text-sm mt-1">{form_errors.message}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Submit
            </button>
          </div>
        </form>
        {form_submission_status && (
          <div
            className={`mt-4 p-3 border rounded-md text-center ${
              form_submission_status.includes("successfully")
                ? "border-green-500 text-green-600"
                : "border-red-500 text-red-600"
            }`}
          >
            <p>
              {form_submission_status}
            </p>
          </div>
        )}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Other Ways to Contact Us</h2>
          <p className="mb-2">You can also reach out to us via:</p>
          <ul className="list-disc list-inside">
            <li>
              Email:{" "}
              <a
                href="mailto:contact@libyanfoodrecipes.com"
                className="text-blue-600 hover:underline"
              >
                contact@libyanfoodrecipes.com
              </a>
            </li>
            <li>
              Facebook:{" "}
              <a
                href="https://www.facebook.com/libyanfoodrecipes"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                libyanfoodrecipes
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href="https://www.instagram.com/libyanfoodrecipes"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                libyanfoodrecipes
              </a>
            </li>
          </ul>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Our Location</h3>
            <img
              src="https://picsum.photos/seed/map/400/300"
              alt="Map location"
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Contact;