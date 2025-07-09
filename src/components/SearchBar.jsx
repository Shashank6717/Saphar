import React, { useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import { FaMicrophone } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import "../CSS/SearchBar.css";

export default function SearchBar({ setMapCenter, setSearchedLocation, locations }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [searchText, setSearchText] = useState("");

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let found = locations.find((loc) =>
      loc.name.toLowerCase().includes(searchText.toLowerCase())
    );

    if (found) {
      setMapCenter(found.position);
      setSearchedLocation(null);
      setTimeout(() => setSearchedLocation(found.position), 0);
    } else {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapCenter([lat, lon]);
          setSearchedLocation(null);
          setTimeout(() => setSearchedLocation([lat, lon]), 0);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className={`search-form${searchText ? " active" : ""}`}>
        <div className="dropdown-wrapper">
          <button
            type="button"
            onClick={toggleDropdown}
            className="dropdown-button"
          >
            <span className="dropdown-label">{selectedCategory}</span>
            <FaChevronDown className="dropdown-icon" />
          </button>

          {dropdownOpen && (
            <div className="dropdown-list">
              <ul className="dropdown-items">
                {["All categories", "People", "Places"].map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(item)}
                      className={`dropdown-item ${selectedCategory === item ? "selected" : ""}`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="input-wrapper">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={`Search ${
              selectedCategory !== "All categories"
                ? selectedCategory
                : "People, Places.."
            }`}
            required
            className="search-input"
          />

{searchText && (
  <button
    type="button"
    className="clear-button"
    onClick={() => {
      setSearchText("");
      setSearchedLocation(null);
    }}
    aria-label="Clear search"
  >
    <RxCross1 className="clear-icon" />
  </button>
)}


          <span className="mic-icon-wrapper">
            <FaMicrophone className="mic-icon" />
          </span>

          <button type="submit" className="search-button">
            <span className="search-icon-wrapper">
              <FaSearch className="search-icon" />
            </span>
            <span className="sr-only">Search</span>
          </button>
        </div>
      </form>
    </div>
  );
}
