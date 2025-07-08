import React, { useState, useEffect } from "react";
import { IoMdSearch } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";
import "../CSS/SearchBar.css";

const SearchBar = ({ setMapCenter, setSearchedLocation, locations }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query === "") {
      setSearchedLocation(null);
      if (locations && locations.length > 0) {
        setMapCenter(locations[0].position);
      }
    }
    // If no blue pointer exists, do not change map center (it stays at last searched location)
    // eslint-disable-next-line
  }, [query]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setSearchedLocation([parseFloat(lat), parseFloat(lon)]);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      alert("Error searching location");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div className="searchbar-fixed-container">
      <form className="searchbar-premium flex items-center gap-2" onSubmit={handleSearch}>
        <IoMdSearch onClick={handleSearch} style={{ cursor: "pointer" }} />
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search for people / places..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        {query && <RxCross1 onClick={handleClear} style={{ cursor: "pointer" }} />}
      </form>
    </div>
  );
};

export default SearchBar;
