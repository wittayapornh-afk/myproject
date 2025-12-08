import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

// 👇 ใส่บรรทัดนี้เพื่อปิด Error สีแดง
// eslint-disable-next-line react-refresh/only-export-components
export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");

  const value = {
    searchQuery,
    setSearchQuery,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}