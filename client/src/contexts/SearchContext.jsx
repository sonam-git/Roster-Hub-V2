// src/contexts/SearchContext.jsx
import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState(null);

  const openSearchModal = () => setShowSearchModal(true);
  const closeSearchModal = () => setShowSearchModal(false);
  
  const applySearchFilters = (filters) => {
    setSearchFilters(filters);
  };

  const resetSearchFilters = () => {
    setSearchFilters(null);
  };

  return (
    <SearchContext.Provider
      value={{
        showSearchModal,
        searchFilters,
        openSearchModal,
        closeSearchModal,
        applySearchFilters,
        resetSearchFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
